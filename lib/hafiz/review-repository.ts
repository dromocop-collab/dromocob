import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import type { AssignmentSnapshotInput } from "@/lib/hafiz/assignment-schema";
import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import {
  applyTeacherReview,
  mayReadProtectedAudio,
  NOTE_VISIBILITIES,
  REVIEW_DECISIONS,
  type NoteVisibility,
  type ReviewDecision,
} from "@/lib/hafiz/review-policy";
import type { StepProgressRecord } from "@/lib/hafiz/workflow-policy";
import {
  createFollowingRevisionSchedule,
  createInitialRevisionSchedule,
  resolveEffectiveRevisionTemplate,
} from "@/lib/hafiz/mastery-repository";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { enqueueHafizNotification } from "@/lib/hafiz/notification-repository";

const FEEDBACK_SHORTCUTS = [
  "Tekrar gerekli", "Eksik ezber", "Tekrar artırılmalı", "Yeniden oku", "Çok iyi",
] as const;

export async function listTeacherReviewQueue(context: HafizContext) {
  requireTeacher(context);
  const roots = await adminDb.collection("hafiz_assignments")
    .where("institutionId", "==", context.institutionID)
    .where("ownerTeacherMembershipId", "==", context.membershipID)
    .limit(500).get();
  const owned = new Set(roots.docs.map(doc => doc.id));
  const recipients = await adminDb.collection("hafiz_assignment_recipients")
    .where("institutionId", "==", context.institutionID)
    .where("status", "==", "STUDENT_WORK_COMPLETE")
    .limit(500).get();
  const candidates = recipients.docs.filter(doc => owned.has(String(doc.data().assignmentId)))
    .sort((a, b) => timestampText(b.data().studentWorkCompletedAt || b.data().lastActivityAt)
      .localeCompare(timestampText(a.data().studentWorkCompletedAt || a.data().lastActivityAt)))
    .slice(0, 100);
  const studentIDs = [...new Set(candidates.map(doc => String(doc.data().studentMembershipId)))];
  const revisionIDs = [...new Set(candidates.map(doc => `${doc.data().assignmentId}_${doc.data().assignedRevisionNumber}`))];
  const [students, revisions] = await Promise.all([
    studentIDs.length ? adminDb.getAll(...studentIDs.map(id => adminDb.collection("hafiz_student_profiles").doc(id))) : [],
    revisionIDs.length ? adminDb.getAll(...revisionIDs.map(id => adminDb.collection("hafiz_assignment_revisions").doc(id))) : [],
  ]);
  const studentByID = new Map(students.filter(doc => doc.exists && doc.data()?.institutionId === context.institutionID)
    .map(doc => [doc.id, doc.data()!]));
  const revisionByID = new Map(revisions.filter(doc => doc.exists && doc.data()?.institutionId === context.institutionID)
    .map(doc => [doc.id, doc.data()!]));
  const items = candidates.map(doc => queueItem(doc.id, doc.data(), studentByID, revisionByID));
  return { items, nextCursor: null };
}

export async function getTeacherReview(context: HafizContext, recipientID: string) {
  const { recipient, root, revision } = await requireOwnedRecipient(context, recipientID);
  const data = recipient.data()!;
  const assignmentID = String(data.assignmentId);
  const [student, audio, help, reviews] = await Promise.all([
    adminDb.collection("hafiz_student_profiles").doc(String(data.studentMembershipId)).get(),
    adminDb.collection("hafiz_audio_assets").where("assignmentRecipientId", "==", recipientID).get(),
    adminDb.collection("hafiz_help_requests").where("assignmentRecipientId", "==", recipientID).get(),
    adminDb.collection("hafiz_assignment_reviews").where("assignmentRecipientId", "==", recipientID).get(),
  ]);
  const revisionData = revision.data() as AssignmentSnapshotInput;
  return {
    id: recipientID,
    assignmentId: assignmentID,
    revisionNumber: Number(data.assignedRevisionNumber),
    reviewVersion: Number(data.reviewVersion || 0),
    status: String(data.status),
    student: {
      membershipId: String(data.studentMembershipId),
      displayName: String(student.data()?.displayName || "Öğrenci"),
    },
    quranScope: revisionData.quranScope,
    submittedAt: timestampText(data.studentWorkCompletedAt || data.lastActivityAt),
    workflowSteps: revisionData.workflowSteps,
    workflowProgress: readProgress(data.stepProgress),
    difficulty: data.difficulty || null,
    helpRequests: help.docs.map(doc => ({
      id: doc.id,
      stepId: doc.data().stepId,
      pageNumber: doc.data().pageNumber || null,
      message: doc.data().message || "",
      state: doc.data().state,
      createdAt: timestampText(doc.data().createdAt),
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    audioSubmissions: audio.docs.map(doc => ({
      id: doc.id,
      stepId: doc.data().stepId,
      status: doc.data().submissionStatus || "SUBMITTED",
      attemptNumber: Number(doc.data().attemptNumber || 1),
      byteSize: Number(doc.data().byteSize || 0),
      mimeType: doc.data().mimeType,
      submittedAt: timestampText(doc.data().submittedAt || doc.data().createdAt),
    })).sort((a, b) => b.attemptNumber - a.attemptNumber),
    previousReviews: reviews.docs.map(doc => publicReview(doc.id, doc.data()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    assignmentOwnerMembershipId: root.data()?.ownerTeacherMembershipId,
  };
}

export async function submitTeacherReview(
  context: HafizContext,
  recipientID: string,
  body: unknown,
) {
  requireTeacher(context);
  const payload = asObject(body);
  const decision = String(payload.decision) as ReviewDecision;
  const visibility = String(payload.visibility) as NoteVisibility;
  if (!REVIEW_DECISIONS.includes(decision)) throw invalidReview("Karar geçersiz.");
  if (!NOTE_VISIBILITIES.includes(visibility)) throw invalidReview("Not görünürlüğü geçersiz.");
  const shortcut = optionalString(payload.shortcut);
  if (shortcut && !FEEDBACK_SHORTCUTS.includes(shortcut as typeof FEEDBACK_SHORTCUTS[number])) {
    throw invalidReview("Hazır geri bildirim geçersiz.");
  }
  const note = optionalString(payload.note).slice(0, 2000);
  if (!shortcut && !note && decision !== "APPROVED") {
    throw invalidReview("Revizyon veya eksik kararı için geri bildirim gerekli.");
  }
  const expectedVersion = nonNegativeInteger(payload.expectedReviewVersion);
  const clientEventID = requiredEventID(payload.clientEventId);
  const recipientReference = adminDb.collection("hafiz_assignment_recipients").doc(recipientID);
  const reviewReference = adminDb.collection("hafiz_assignment_reviews").doc(`${recipientID}_${clientEventID}`);
  const reviewID = reviewReference.id;
  const reviewedAt = new Date().toISOString();
  let reviewedStudentID = "";
  let reviewedAssignmentID = "";
  const revisionTemplate = await resolveEffectiveRevisionTemplate(
    context.institutionID, context.membershipID,
  );

  await adminDb.runTransaction(async transaction => {
    const recipient = await transaction.get(recipientReference);
    const recipientData = recipient.data();
    if (!recipient.exists || !recipientData) throw notFound();
    const assignmentID = String(recipientData.assignmentId || "");
    reviewedAssignmentID = assignmentID;
    reviewedStudentID = String(recipientData.studentMembershipId || "");
    const revisionNumber = Number(recipientData.assignedRevisionNumber);
    const rootReference = adminDb.collection("hafiz_assignments").doc(assignmentID);
    const revisionReference = adminDb.collection("hafiz_assignment_revisions")
      .doc(`${assignmentID}_${revisionNumber}`);
    const approvalReference = adminDb.collection("hafiz_memorization_approvals")
      .doc(`${recipientID}_${revisionNumber}`);
    const [root, revision, existingReview, existingApproval] = await Promise.all([
      transaction.get(rootReference), transaction.get(revisionReference), transaction.get(reviewReference),
      transaction.get(approvalReference),
    ]);
    if (existingReview.exists) return;
    if (recipientData.institutionId !== context.institutionID
      || root.data()?.institutionId !== context.institutionID
      || root.data()?.ownerTeacherMembershipId !== context.membershipID
      || !revision.exists) throw notFound();
    if (recipientData.status !== "STUDENT_WORK_COMPLETE") {
      throw invalidReview("Öğrenci çalışması henüz incelemeye hazır değil.");
    }
    const currentVersion = Number(recipientData.reviewVersion || 0);
    if (currentVersion !== expectedVersion) {
      throw new HafizAuthorizationError(403, "STALE_REVIEW", "İnceleme başka bir işlemle güncellendi.");
    }
    const revisionData = revision.data() as AssignmentSnapshotInput;
    const sourceScheduleID = typeof root.data()?.sourceRevisionScheduleId === "string"
      ? String(root.data()?.sourceRevisionScheduleId) : null;
    const sourceSchedule = sourceScheduleID
      ? await transaction.get(adminDb.collection("hafiz_revision_schedules").doc(sourceScheduleID))
      : null;
    const mutation = applyTeacherReview(
      decision, revisionData.workflowSteps, readProgress(recipientData.stepProgress),
    );
    const now = reviewedAt;
    transaction.update(recipientReference, {
      status: mutation.status,
      stepProgress: mutation.progress.map(item => ({ ...item, updatedAt: now })),
      lastActiveStepId: mutation.lastActiveStepId,
      completionPercent: mutation.completionPercent,
      reviewVersion: currentVersion + 1,
      lastReviewDecision: decision,
      lastReviewAt: now,
      approvedAt: decision === "APPROVED" ? now : recipientData.approvedAt || null,
      approvedBy: decision === "APPROVED" ? context.membershipID : recipientData.approvedBy || null,
    });
    transaction.create(reviewReference, {
      institutionId: context.institutionID,
      assignmentId: assignmentID,
      assignmentRecipientId: recipientID,
      revisionNumber,
      studentMembershipId: recipientData.studentMembershipId,
      teacherMembershipId: context.membershipID,
      decision, shortcut: shortcut || null, note: note || null, visibility,
      reviewVersion: currentVersion + 1,
      clientEventId: clientEventID,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(adminDb.collection("hafiz_mastery_events").doc(`${reviewID}_mastery`), {
      institutionId: context.institutionID,
      studentMembershipId: recipientData.studentMembershipId,
      teacherMembershipId: context.membershipID,
      assignmentId: assignmentID,
      assignmentRecipientId: recipientID,
      revisionNumber,
      reviewId: reviewID,
      decision,
      state: decision === "APPROVED" ? "APPROVED" : "REVISION_REQUIRED",
      difficulty: recipientData.difficulty || null,
      quranScope: revisionData.quranScope,
      createdAt: FieldValue.serverTimestamp(),
    });
    audit(transaction, context, "ASSIGNMENT_REVIEWED", recipientID, { decision, revisionNumber });
    audit(transaction, context, decision === "APPROVED" ? "ASSIGNMENT_APPROVED" : "ASSIGNMENT_REVISION_REQUESTED", recipientID, { decision, revisionNumber });
    if (mutation.approvalGranted) {
      if (!existingApproval.exists) {
        const sourceData = sourceSchedule?.data();
        const sourceIntervals = Array.isArray(sourceData?.templateSnapshot?.intervalDays)
          ? sourceData.templateSnapshot.intervalDays.map(Number) : null;
        const scheduleTemplate = sourceIntervals?.length
          ? { name: String(sourceData?.templateSnapshot?.name || revisionTemplate.name), intervalDays: sourceIntervals }
          : revisionTemplate;
        const completedIntervalCount = sourceData
          ? Number(sourceData.completedIntervalCount || 0) + 1 : 0;
        const schedule = sourceData
          ? createFollowingRevisionSchedule({
            revisedAt: now,
            difficulty: typeof recipientData.difficulty === "string" ? recipientData.difficulty : null,
            completedIntervalCount,
            template: scheduleTemplate,
          })
          : createInitialRevisionSchedule({
            approvedAt: now,
            difficulty: typeof recipientData.difficulty === "string" ? recipientData.difficulty : null,
            template: scheduleTemplate,
          });
        transaction.create(approvalReference, {
          institutionId: context.institutionID,
          studentMembershipId: recipientData.studentMembershipId,
          assignmentId: assignmentID,
          assignmentRecipientId: recipientID,
          revisionNumber,
          editionId: revisionData.quranScope.editionId,
          pageNumbers: revisionData.quranScope.pageNumbers,
          ayahIds: revisionData.quranScope.ayahIds || [],
          approvedBy: context.membershipID,
          approvedAt: FieldValue.serverTimestamp(),
        });
        transaction.create(
          adminDb.collection("hafiz_revision_schedules").doc(approvalReference.id),
          {
            institutionId: context.institutionID,
            studentMembershipId: recipientData.studentMembershipId,
            teacherMembershipId: context.membershipID,
            assignmentId: assignmentID,
            assignmentRecipientId: recipientID,
            approvalId: approvalReference.id,
            editionId: revisionData.quranScope.editionId,
            quranScope: revisionData.quranScope,
            templateSnapshot: {
              name: scheduleTemplate.name,
              intervalDays: scheduleTemplate.intervalDays,
              source: sourceData?.templateSnapshot?.source || revisionTemplate.source,
            },
            completedIntervalCount,
            lastRevisionAt: sourceData ? now : null,
            lastRevisionOutcome: sourceData ? "APPROVED" : null,
            dueAt: schedule.dueAt,
            intervalDays: schedule.intervalDays,
            intervalIndex: schedule.intervalIndex,
            reason: schedule.reason,
            suggestionState: "SUGGESTED",
            repetitionTarget: Number(revisionData.repetitionTarget || 10),
            teacherNote: "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
        );
        const progressReference = adminDb.collection("hafiz_memorization_progress")
          .doc(`${context.institutionID}_${recipientData.studentMembershipId}_${revisionData.quranScope.editionId}`);
        transaction.set(progressReference, {
          institutionId: context.institutionID,
          studentMembershipId: recipientData.studentMembershipId,
          editionId: revisionData.quranScope.editionId,
          approvedPageNumbers: FieldValue.arrayUnion(...revisionData.quranScope.pageNumbers),
          approvedAyahIds: FieldValue.arrayUnion(...(revisionData.quranScope.ayahIds || [])),
          approvedAssignmentIds: FieldValue.arrayUnion(assignmentID),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    }
  });
  if (reviewedStudentID) {
    const studentEvent = decision === "APPROVED" ? "TEACHER_APPROVED_WORK" : "TEACHER_REQUESTED_REVISION";
    await enqueueHafizNotification({
      institutionID: context.institutionID, targetMembershipID: reviewedStudentID,
      event: studentEvent, sourceID: reviewID,
      title: decision === "APPROVED" ? "Çalışman onaylandı" : "Öğretmenin tekrar istedi",
      body: note || shortcut || (decision === "APPROVED" ? "Eline sağlık, çalışman onaylandı." : "Çalışmanı yeniden gözden geçir."),
      deepLink: `hafiz://assignment/${reviewedAssignmentID}`,
      metadata: { reviewId: reviewID, decision },
    });
    if (visibility === "PARENT_VISIBLE" && (note || shortcut)) {
      const links = await adminDb.collection("hafiz_parent_student_links")
        .where("institutionId", "==", context.institutionID)
        .where("studentMembershipId", "==", reviewedStudentID)
        .where("status", "==", "ACTIVE").get();
      await Promise.allSettled(links.docs.map(link => enqueueHafizNotification({
        institutionID: context.institutionID,
        targetMembershipID: String(link.data().parentMembershipId),
        event: "PARENT_VISIBLE_TEACHER_NOTE", sourceID: reviewID,
        title: "Öğretmen notu", body: note || shortcut,
        deepLink: `hafiz://parent/student/${reviewedStudentID}`,
        metadata: { studentMembershipId: reviewedStudentID, reviewId: reviewID },
      })));
    }
  }
  return { ok: true, reviewId: reviewID, decision };
}

export async function readProtectedAudio(context: HafizContext, assetID: string) {
  const asset = await adminDb.collection("hafiz_audio_assets").doc(assetID).get();
  const data = asset.data();
  if (!asset.exists || !data) throw audioNotFound();
  const root = await adminDb.collection("hafiz_assignments").doc(String(data.assignmentId)).get();
  if (!root.exists || !mayReadProtectedAudio({
    requesterRole: context.role,
    requesterInstitutionID: context.institutionID,
    requesterMembershipID: context.membershipID,
    assetInstitutionID: String(data.institutionId),
    assetStudentMembershipID: String(data.studentMembershipId),
    assignmentOwnerMembershipID: String(root.data()?.ownerTeacherMembershipId || ""),
  })) throw audioNotFound();
  const [bytes] = await adminStorage.bucket().file(String(data.privateObjectKey)).download();
  return { bytes, mimeType: String(data.mimeType || "audio/m4a") };
}

async function requireOwnedRecipient(context: HafizContext, recipientID: string) {
  requireTeacher(context);
  const recipient = await adminDb.collection("hafiz_assignment_recipients").doc(recipientID).get();
  const data = recipient.data();
  if (!recipient.exists || !data || data.institutionId !== context.institutionID) throw notFound();
  const assignmentID = String(data.assignmentId);
  const root = await adminDb.collection("hafiz_assignments").doc(assignmentID).get();
  if (!root.exists || root.data()?.institutionId !== context.institutionID
    || root.data()?.ownerTeacherMembershipId !== context.membershipID) throw notFound();
  const revision = await adminDb.collection("hafiz_assignment_revisions")
    .doc(`${assignmentID}_${Number(data.assignedRevisionNumber)}`).get();
  if (!revision.exists) throw notFound();
  return { recipient, root, revision };
}

function queueItem(id: string, data: FirebaseFirestore.DocumentData,
  students: Map<string, FirebaseFirestore.DocumentData>,
  revisions: Map<string, FirebaseFirestore.DocumentData>) {
  const student = students.get(String(data.studentMembershipId));
  const revision = revisions.get(`${data.assignmentId}_${data.assignedRevisionNumber}`);
  const scope = revision?.quranScope;
  return {
    id,
    assignmentId: data.assignmentId,
    studentName: student?.displayName || "Öğrenci",
    status: data.status,
    reviewVersion: Number(data.reviewVersion || 0),
    submittedAt: timestampText(data.studentWorkCompletedAt || data.lastActivityAt),
    quranScope: scope ? { startPage: scope.startPage, endPage: scope.endPage } : null,
    difficulty: data.difficulty || null,
  };
}

function publicReview(id: string, data: FirebaseFirestore.DocumentData) {
  return { id, decision: data.decision, shortcut: data.shortcut || null, note: data.note || null,
    visibility: data.visibility, reviewVersion: Number(data.reviewVersion || 0),
    createdAt: timestampText(data.createdAt) };
}

function readProgress(value: unknown): StepProgressRecord[] {
  if (!Array.isArray(value)) return [];
  return value.map(raw => {
    const item = raw as Record<string, unknown>;
    return { stepId: String(item.stepId || ""), state: String(item.state || "LOCKED") as StepProgressRecord["state"],
      studySeconds: Number(item.studySeconds || 0), repetitionCount: Number(item.repetitionCount || 0),
      completionCount: Number(item.completionCount || 0),
      updatedAt: optionalString(item.updatedAt) || undefined };
  });
}

function audit(transaction: FirebaseFirestore.Transaction, context: HafizContext, action: string,
  resourceID: string, metadata: Record<string, unknown>) {
  transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
    institutionId: context.institutionID, actorMembershipId: context.membershipID,
    actorUserId: context.userID, action, resourceType: "assignmentRecipient", resourceId: resourceID,
    metadata, createdAt: FieldValue.serverTimestamp(),
  });
}

function timestampText(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate(): Date }).toDate().toISOString();
  }
  return "";
}
function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidReview("Geçersiz istek.");
  return value as Record<string, unknown>;
}
function optionalString(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function nonNegativeInteger(value: unknown) {
  const number = Number(value); if (!Number.isSafeInteger(number) || number < 0) throw invalidReview("İnceleme sürümü geçersiz."); return number;
}
function requiredEventID(value: unknown) {
  const id = optionalString(value); if (!/^[A-Za-z0-9_-]{8,100}$/.test(id)) throw invalidReview("İşlem kimliği geçersiz."); return id;
}
function requireTeacher(context: HafizContext) { if (context.role !== "TEACHER") throw notFound(); }
function invalidReview(message: string) { return new HafizAuthorizationError(403, "INVALID_REVIEW", message); }
function notFound() { return new HafizAuthorizationError(403, "REVIEW_NOT_FOUND", "İnceleme bulunamadı."); }
function audioNotFound() { return new HafizAuthorizationError(403, "AUDIO_NOT_FOUND", "Ses kaydı bulunamadı."); }
