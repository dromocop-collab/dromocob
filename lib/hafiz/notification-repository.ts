import "server-only";

import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { apnsConfigurationStatus, sendAPNS } from "@/lib/apns";
import { adminDb } from "@/lib/firebase-admin";
import { HafizAuthorizationError, type HafizContext, type HafizRole } from "@/lib/hafiz/authorization";
import {
  isValidTimezone,
  mayReceiveNotification,
  notificationDocumentID,
  parseNotificationPreferences,
  summaryLines,
  timezoneDateKey,
  timezoneDayBounds,
  timezoneHour,
  timezoneWeekday,
  type NotificationEventType,
  type NotificationPreferences,
} from "@/lib/hafiz/notification-policy";
import { lockScreenSafeBody } from "@/lib/hafiz/production-policy";

const MAX_DAILY_NOTIFICATIONS = 8;
const HAFIZ_PUSH_TOPIC = "com.cihat.Hafiz";

export type NotificationInput = {
  institutionID: string;
  targetMembershipID: string;
  event: NotificationEventType;
  sourceID: string;
  title: string;
  body: string;
  deepLink?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function enqueueHafizNotification(input: NotificationInput) {
  const membership = await adminDb.collection("hafiz_memberships").doc(input.targetMembershipID).get();
  const membershipData = membership.data();
  if (!membership.exists || membershipData?.status !== "ACTIVE"
    || membershipData?.institutionId !== input.institutionID) return { created: false, reason: "TARGET_INACTIVE" };
  const role = String(membershipData.role) as HafizRole;
  if (!(["STUDENT", "TEACHER", "PARENT", "ADMIN"] as string[]).includes(role)) {
    return { created: false, reason: "ROLE_INVALID" };
  }
  const preferenceReference = adminDb.collection("hafiz_notification_preferences").doc(input.targetMembershipID);
  const notificationID = notificationDocumentID({
    institutionID: input.institutionID, targetMembershipID: input.targetMembershipID,
    event: input.event, sourceID: input.sourceID,
  });
  const notificationReference = adminDb.collection("hafiz_notifications").doc(notificationID);
  let result: { created: boolean; reason?: string } = { created: false, reason: "DUPLICATE" };
  await adminDb.runTransaction(async transaction => {
    const [existing, storedPreferences] = await Promise.all([
      transaction.get(notificationReference), transaction.get(preferenceReference),
    ]);
    if (existing.exists) return;
    const preferences = parseNotificationPreferences(role, storedPreferences.data());
    if (!mayReceiveNotification(role, input.event, preferences)) {
      result = { created: false, reason: "PREFERENCE_DISABLED" }; return;
    }
    const localDate = timezoneDateKey(new Date(), preferences.timezone);
    const bucketReference = adminDb.collection("hafiz_notification_rate_buckets")
      .doc(`${input.targetMembershipID}_${localDate}`);
    const bucket = await transaction.get(bucketReference);
    const count = Number(bucket.data()?.count || 0);
    if (count >= MAX_DAILY_NOTIFICATIONS) {
      result = { created: false, reason: "DAILY_LIMIT" }; return;
    }
    transaction.create(notificationReference, {
      institutionId: input.institutionID,
      targetMembershipId: input.targetMembershipID,
      targetUserId: String(membershipData.userId || ""),
      targetRole: role,
      eventType: input.event,
      sourceId: input.sourceID,
      title: input.title.slice(0, 120),
      body: input.body.slice(0, 800),
      deepLink: input.deepLink || null,
      metadata: input.metadata || {},
      localDate,
      readAt: null,
      deliveryStatus: preferences.pushEnabled ? "QUEUED" : "IN_APP_ONLY",
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.set(bucketReference, {
      institutionId: input.institutionID, targetMembershipId: input.targetMembershipID,
      localDate, count: count + 1, updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    result = { created: true };
  });
  return { ...result, id: notificationID };
}

export async function listHafizNotifications(context: HafizContext) {
  const snapshot = await adminDb.collection("hafiz_notifications")
    .where("institutionId", "==", context.institutionID)
    .where("targetMembershipId", "==", context.membershipID)
    .orderBy("createdAt", "desc").limit(100).get();
  return {
    items: snapshot.docs.map(document => {
      const data = document.data();
      return { id: document.id, eventType: data.eventType, title: data.title, body: data.body,
        deepLink: data.deepLink || null, metadata: data.metadata || {},
        isRead: Boolean(data.readAt), readAt: timestampText(data.readAt), createdAt: timestampText(data.createdAt) };
    }),
  };
}

export async function markHafizNotificationRead(context: HafizContext, notificationID: string) {
  const reference = adminDb.collection("hafiz_notifications").doc(notificationID);
  await adminDb.runTransaction(async transaction => {
    const document = await transaction.get(reference);
    if (!document.exists || document.data()?.institutionId !== context.institutionID
      || document.data()?.targetMembershipId !== context.membershipID) throw notFound();
    if (!document.data()?.readAt) transaction.update(reference, { readAt: FieldValue.serverTimestamp() });
  });
  return { ok: true };
}

export async function getNotificationPreferences(context: HafizContext) {
  const document = await adminDb.collection("hafiz_notification_preferences").doc(context.membershipID).get();
  return parseNotificationPreferences(context.role, document.data());
}

export async function updateNotificationPreferences(context: HafizContext, body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw invalid("Tercihler geçersiz.");
  const value = body as Record<string, unknown>;
  if (typeof value.timezone === "string" && !isValidTimezone(value.timezone)) throw invalid("Saat dilimi geçersiz.");
  const current = await getNotificationPreferences(context);
  const preferences = parseNotificationPreferences(context.role, { ...current, ...value });
  await adminDb.collection("hafiz_notification_preferences").doc(context.membershipID).set({
    ...preferences, institutionId: context.institutionID, membershipId: context.membershipID,
    userId: context.userID, role: context.role, updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return preferences;
}

export async function registerHafizPushToken(context: HafizContext, body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw invalid("Push kaydı geçersiz.");
  const value = body as Record<string, unknown>;
  const token = String(value.token || "").trim().toLowerCase();
  const environment = value.environment === "sandbox" ? "sandbox" : "production";
  if (!/^[a-f0-9]{64,200}$/.test(token)) throw invalid("Push token geçersiz.");
  const id = createHash("sha256").update(`${context.membershipID}:${token}`).digest("hex");
  await adminDb.collection("hafiz_push_tokens").doc(id).set({
    institutionId: context.institutionID, membershipId: context.membershipID,
    userId: context.userID, role: context.role, token, environment,
    topic: HAFIZ_PUSH_TOPIC, active: true, updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

export async function createTeacherMessage(context: HafizContext, body: unknown) {
  if (context.role !== "TEACHER") throw notFound();
  if (!body || typeof body !== "object" || Array.isArray(body)) throw invalid("Mesaj geçersiz.");
  const value = body as Record<string, unknown>;
  const assignmentID = requiredString(value.assignmentId);
  const studentMembershipID = requiredString(value.studentMembershipId);
  const message = requiredString(value.message).slice(0, 500);
  const clientEventID = requiredString(value.clientEventId).slice(0, 100);
  const [root, recipient] = await Promise.all([
    adminDb.collection("hafiz_assignments").doc(assignmentID).get(),
    adminDb.collection("hafiz_assignment_recipients").doc(`${assignmentID}_${studentMembershipID}`).get(),
  ]);
  if (!root.exists || root.data()?.institutionId !== context.institutionID
    || root.data()?.ownerTeacherMembershipId !== context.membershipID
    || !recipient.exists || recipient.data()?.institutionId !== context.institutionID) throw notFound();
  const id = notificationDocumentID({ institutionID: context.institutionID,
    targetMembershipID: studentMembershipID, event: "TEACHER_SENT_MESSAGE", sourceID: clientEventID });
  await adminDb.collection("hafiz_teacher_messages").doc(id).create({
    institutionId: context.institutionID, teacherMembershipId: context.membershipID,
    studentMembershipId: studentMembershipID, assignmentId: assignmentID,
    message, clientEventId: clientEventID, createdAt: FieldValue.serverTimestamp(),
  }).catch(error => { if ((error as { code?: number }).code !== 6) throw error; });
  return enqueueHafizNotification({ institutionID: context.institutionID,
    targetMembershipID: studentMembershipID, event: "TEACHER_SENT_MESSAGE", sourceID: clientEventID,
    title: "Öğretmeninden mesaj", body: message, deepLink: `hafiz://assignment/${assignmentID}`,
    metadata: { assignmentId: assignmentID } });
}

export async function runNotificationCycle(now = new Date()) {
  const memberships = await adminDb.collection("hafiz_memberships")
    .where("status", "==", "ACTIVE").limit(2000).get();
  const preferenceSnapshots = (await Promise.all(chunks(memberships.docs, 500).map(documents =>
    adminDb.getAll(...documents.map(document =>
      adminDb.collection("hafiz_notification_preferences").doc(document.id)))))).flat();
  const preferenceByMembershipID = new Map(preferenceSnapshots
    .filter(document => document.exists).map(document => [document.id, document.data()]));
  const results = { evaluated: memberships.size, generated: 0, duplicateOrSkipped: 0 };
  for (const membership of memberships.docs) {
    const data = membership.data();
    const role = String(data.role) as HafizRole;
    if (!(["STUDENT", "TEACHER", "PARENT"] as string[]).includes(role)) continue;
    const preferences = parseNotificationPreferences(role, preferenceByMembershipID.get(membership.id));
    const hour = timezoneHour(now, preferences.timezone);
    const institutionID = String(data.institutionId || "");
    const generated = role === "STUDENT" && hour === preferences.dailySummaryHour
      ? await generateStudentDailyNotifications(institutionID, membership.id, preferences, now)
      : role === "TEACHER" && preferences.dailySummary && hour === preferences.dailySummaryHour
        ? await generateTeacherQueueSummary(institutionID, membership.id, preferences, now)
        : role === "PARENT" ? await generateParentSummaries(institutionID, membership.id, preferences, now)
          : [];
    results.generated += generated.filter(item => item.created).length;
    results.duplicateOrSkipped += generated.filter(item => !item.created).length;
  }
  const delivery = await dispatchQueuedNotifications();
  return { ...results, delivery };
}

async function generateStudentDailyNotifications(institutionID: string, studentID: string,
  preferences: NotificationPreferences, now: Date) {
  const bounds = timezoneDayBounds(now, preferences.timezone);
  const [events, recipients, assets] = await Promise.all([
    adminDb.collection("hafiz_progress_events").where("institutionId", "==", institutionID)
      .where("studentMembershipId", "==", studentID)
      .where("receivedAt", ">=", Timestamp.fromDate(new Date(bounds.startAt)))
      .where("receivedAt", "<", Timestamp.fromDate(new Date(bounds.endAtExclusive))).get(),
    adminDb.collection("hafiz_assignment_recipients").where("institutionId", "==", institutionID)
      .where("studentMembershipId", "==", studentID).limit(200).get(),
    adminDb.collection("hafiz_audio_assets").where("institutionId", "==", institutionID)
      .where("studentMembershipId", "==", studentID)
      .where("createdAt", ">=", Timestamp.fromDate(new Date(bounds.startAt)))
      .where("createdAt", "<", Timestamp.fromDate(new Date(bounds.endAtExclusive))).get(),
  ]);
  const eventData = events.docs.map(document => document.data());
  const recipientData = recipients.docs.map(document => document.data()).filter(data => data.status !== "CANCELLED");
  const progress = recipientData.flatMap(data => Array.isArray(data.stepProgress) ? data.stepProgress : []);
  const metrics = {
    newAssignments: recipientData.filter(data => inBounds(data.createdAt, bounds)).length,
    repetitions: eventData.filter(data => data.type === "INCREMENT_REPETITION").length,
    listeningSeconds: eventData.filter(data => data.type === "ADD_LISTEN_SECONDS")
      .reduce((sum, data) => sum + positiveNumber(data.value), 0),
    studySeconds: eventData.filter(data => data.type === "ADD_STUDY_SECONDS")
      .reduce((sum, data) => sum + positiveNumber(data.value), 0),
    submissions: assets.docs.filter(document => document.data().submissionStatus === "SUBMITTED").length,
    completedTasks: progress.filter(item => ["COMPLETED", "SKIPPED"].includes(String(item?.state))).length,
    totalTasks: progress.length,
    awaitingReview: recipientData.filter(data => data.status === "STUDENT_WORK_COMPLETE").length,
  };
  const lines = summaryLines(metrics);
  const results: Array<{ created: boolean }> = [];
  if (preferences.dailySummary && lines.length) {
    results.push(await enqueueHafizNotification({ institutionID, targetMembershipID: studentID,
      event: "STUDENT_DAILY_SUMMARY", sourceID: bounds.dateKey,
      title: metrics.totalTasks > 0 && metrics.completedTasks === metrics.totalTasks
        ? "Bugünü tamamladın" : "Bugünkü çalışman",
      body: lines.join(" • "), deepLink: "hafiz://today", metadata: metrics }));
  }
  const remaining = Math.max(metrics.totalTasks - metrics.completedTasks, 0);
  if (remaining > 0) results.push(await enqueueHafizNotification({ institutionID,
    targetMembershipID: studentID, event: "REMAINING_TASK_REMINDER", sourceID: bounds.dateKey,
    title: "Bugünkü çalışman devam ediyor", body: `${remaining} adımın kaldı.`, deepLink: "hafiz://today" }));
  const urgent = await urgentDeadlineCount(institutionID, recipients.docs, now, preferences.timezone);
  if (urgent > 0) results.push(await enqueueHafizNotification({ institutionID,
    targetMembershipID: studentID, event: "DEADLINE_REMINDER", sourceID: bounds.dateKey,
    title: "Yaklaşan görev süresi", body: `${urgent} görevinin son tarihi yaklaşıyor.`, deepLink: "hafiz://assignments" }));
  return results;
}

async function generateTeacherQueueSummary(institutionID: string, teacherID: string,
  preferences: NotificationPreferences, now: Date) {
  const bounds = timezoneDayBounds(now, preferences.timezone);
  const roots = await adminDb.collection("hafiz_assignments").where("institutionId", "==", institutionID)
    .where("ownerTeacherMembershipId", "==", teacherID).limit(500).get();
  const assignmentIDs = roots.docs.map(document => document.id);
  const recipientSnapshots = await Promise.all(chunks(assignmentIDs, 30).map(ids =>
    adminDb.collection("hafiz_assignment_recipients").where("institutionId", "==", institutionID)
      .where("assignmentId", "in", ids).get()));
  const waiting = recipientSnapshots.flatMap(snapshot => snapshot.docs)
    .filter(document => document.data().status === "STUDENT_WORK_COMPLETE").length;
  if (!waiting) return [];
  return [await enqueueHafizNotification({ institutionID, targetMembershipID: teacherID,
    event: "REVIEW_QUEUE_SUMMARY", sourceID: bounds.dateKey, title: "Kontrol özeti",
    body: `${waiting} çalışma değerlendirmeni bekliyor.`, deepLink: "hafiz://teacher/reviews" })];
}

async function generateParentSummaries(institutionID: string, parentID: string,
  preferences: NotificationPreferences, now: Date) {
  const results: Array<{ created: boolean }> = [];
  const hour = timezoneHour(now, preferences.timezone);
  const links = await adminDb.collection("hafiz_parent_student_links")
    .where("institutionId", "==", institutionID).where("parentMembershipId", "==", parentID)
    .where("status", "==", "ACTIVE").get();
  const studentIDs = links.docs.map(document => String(document.data().studentMembershipId));
  if (!studentIDs.length) return results;
  if (preferences.dailySummary && hour === preferences.dailySummaryHour) {
    const bounds = timezoneDayBounds(now, preferences.timezone);
    const events = await studentEventDocuments(institutionID, studentIDs, bounds.startAt, bounds.endAtExclusive);
    results.push(await enqueueHafizNotification({ institutionID, targetMembershipID: parentID,
      event: "PARENT_DAILY_SUMMARY", sourceID: bounds.dateKey, title: "Çocuklarının günlük özeti",
      body: `${new Set(events.map(event => String(event.studentMembershipId))).size} çocuk bugün çalışma yaptı.`,
      deepLink: "hafiz://parent/children" }));
  }
  if (preferences.weeklySummary && hour === preferences.weeklySummaryHour
    && timezoneWeekday(now, preferences.timezone) === preferences.weeklySummaryWeekday) {
    const today = timezoneDayBounds(now, preferences.timezone);
    const start = timezoneDayBounds(now, preferences.timezone, -6);
    const events = await studentEventDocuments(institutionID, studentIDs, start.startAt, today.endAtExclusive);
    const reviews = await studentReviewDocuments(institutionID, studentIDs, start.startAt, today.endAtExclusive);
    const activeDays = new Set(events.map(event =>
      timezoneDateKey(toDate(event.receivedAt), preferences.timezone))).size;
    const approvals = reviews.filter(review => review.decision === "APPROVED").length;
    const revisions = reviews.filter(review => ["REVISION_REQUIRED", "INCOMPLETE"].includes(String(review.decision))).length;
    results.push(await enqueueHafizNotification({ institutionID, targetMembershipID: parentID,
      event: "PARENT_WEEKLY_SUMMARY", sourceID: start.dateKey,
      title: "Haftalık çalışma özeti",
      body: `${activeDays} aktif çalışma günü • ${approvals} öğretmen onayı • ${revisions} tekrar isteği`,
      deepLink: "hafiz://parent/progress" }));
  }
  return results;
}

async function dispatchQueuedNotifications() {
  if (!apnsConfigurationStatus().ready) return { attempted: 0, sent: 0, providerReady: false };
  const queued = await adminDb.collection("hafiz_notifications")
    .where("deliveryStatus", "==", "QUEUED").orderBy("createdAt", "asc").limit(100).get();
  let sent = 0;
  for (const notification of queued.docs) {
    let claimed = false;
    await adminDb.runTransaction(async transaction => {
      const fresh = await transaction.get(notification.ref);
      if (!fresh.exists || fresh.data()?.deliveryStatus !== "QUEUED") return;
      transaction.update(notification.ref, {
        deliveryStatus: "SENDING",
        deliveryAttemptCount: Number(fresh.data()?.deliveryAttemptCount || 0) + 1,
        deliveryAttemptedAt: FieldValue.serverTimestamp(),
      });
      claimed = true;
    });
    if (!claimed) continue;
    const data = notification.data();
    const tokens = await adminDb.collection("hafiz_push_tokens")
      .where("membershipId", "==", data.targetMembershipId).where("active", "==", true).limit(10).get();
    if (tokens.empty) { await notification.ref.update({ deliveryStatus: "NO_DEVICE", updatedAt: FieldValue.serverTimestamp() }); continue; }
    const results = await Promise.allSettled(tokens.docs.map(async tokenDocument => {
      const token = tokenDocument.data();
      const result = await sendAPNS({ token: String(token.token), topic: HAFIZ_PUSH_TOPIC,
        environment: token.environment === "sandbox" ? "sandbox" : "production",
        title: String(data.title), body: lockScreenSafeBody(String(data.eventType || ""), String(data.body)),
        deepLink: data.deepLink || undefined,
        idempotencyId: digestUUID(notification.id), collapseId: notification.id });
      if (!result.ok && ["BadDeviceToken", "Unregistered", "DeviceTokenNotForTopic"].includes(result.reason || "")) {
        await tokenDocument.ref.update({ active: false, invalidReason: result.reason,
          invalidatedAt: FieldValue.serverTimestamp() });
      }
      return result;
    }));
    const delivered = results.some(result => result.status === "fulfilled" && result.value.ok);
    await notification.ref.update({ deliveryStatus: delivered ? "SENT" : "FAILED",
      deliveredAt: delivered ? FieldValue.serverTimestamp() : null, updatedAt: FieldValue.serverTimestamp() });
    if (delivered) sent += 1;
  }
  return { attempted: queued.size, sent, providerReady: true };
}

async function urgentDeadlineCount(institutionID: string,
  recipients: FirebaseFirestore.QueryDocumentSnapshot[], now: Date, timezone: string) {
  const active = recipients.filter(document => !["APPROVED", "STUDENT_WORK_COMPLETE", "CANCELLED"]
    .includes(String(document.data().status)));
  if (!active.length) return 0;
  const revisions = await adminDb.getAll(...active.map(document => {
    const data = document.data();
    return adminDb.collection("hafiz_assignment_revisions").doc(`${data.assignmentId}_${data.assignedRevisionNumber}`);
  }));
  const tomorrow = timezoneDayBounds(now, timezone, 1);
  return revisions.filter(document => document.exists
    && document.data()?.institutionId === institutionID
    && new Date(String(document.data()?.deadlineAt || "")).getTime() < new Date(tomorrow.endAtExclusive).getTime()).length;
}

async function studentEventDocuments(institutionID: string, studentIDs: string[], start: string, end: string) {
  const snapshots = await Promise.all(chunks(studentIDs, 30).map(ids => adminDb.collection("hafiz_progress_events")
    .where("institutionId", "==", institutionID).where("studentMembershipId", "in", ids)
    .where("receivedAt", ">=", Timestamp.fromDate(new Date(start)))
    .where("receivedAt", "<", Timestamp.fromDate(new Date(end))).get()));
  return snapshots.flatMap(snapshot => snapshot.docs.map(document => document.data()));
}

async function studentReviewDocuments(institutionID: string, studentIDs: string[], start: string, end: string) {
  const snapshots = await Promise.all(chunks(studentIDs, 30).map(ids => adminDb.collection("hafiz_assignment_reviews")
    .where("institutionId", "==", institutionID).where("studentMembershipId", "in", ids)
    .where("createdAt", ">=", Timestamp.fromDate(new Date(start)))
    .where("createdAt", "<", Timestamp.fromDate(new Date(end))).get()));
  return snapshots.flatMap(snapshot => snapshot.docs.map(document => document.data()));
}

function inBounds(value: unknown, bounds: { startAt: string; endAtExclusive: string }) {
  const time = toDate(value).getTime();
  return time >= new Date(bounds.startAt).getTime() && time < new Date(bounds.endAtExclusive).getTime();
}
function timestampText(value: unknown) { const date = toDate(value); return Number.isNaN(date.getTime()) ? "" : date.toISOString(); }
function toDate(value: unknown) { if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (value && typeof value === "object" && "toDate" in value) return (value as { toDate(): Date }).toDate();
  return new Date(Number.NaN); }
function positiveNumber(value: unknown) { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : 0; }
function chunks<T>(values: T[], size: number) { return Array.from({ length: Math.ceil(values.length / size) },
  (_, index) => values.slice(index * size, (index + 1) * size)); }
function requiredString(value: unknown) { if (typeof value !== "string" || !value.trim()) throw invalid("Zorunlu alan eksik."); return value.trim(); }
function digestUUID(value: string) { const hex = createHash("sha256").update(value).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`; }
function invalid(message: string) { return new HafizAuthorizationError(403, "INVALID_NOTIFICATION_REQUEST", message); }
function notFound() { return new HafizAuthorizationError(403, "NOTIFICATION_NOT_FOUND", "Bildirim bulunamadı."); }
