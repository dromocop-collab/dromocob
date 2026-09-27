import "server-only";

import type { HafizContext } from "@/lib/hafiz/authorization";
import { HafizAuthorizationError } from "@/lib/hafiz/authorization";
import {
  minimalParentQuranScope,
  parentMayReadDashboard,
  parentVisibleNotes,
  type ParentNoteRecord,
} from "@/lib/hafiz/parent-dashboard-policy";
import { adminDb } from "@/lib/firebase-admin";
import { getParentMasterySummary } from "@/lib/hafiz/mastery-repository";

const TIME_ZONE = "Europe/Istanbul";
const COMPLETE_STATES = new Set(["COMPLETED", "SKIPPED"]);

export async function getParentStudentDashboard(
  context: HafizContext,
  studentMembershipID: string,
) {
  requireParent(context);
  const linkReference = adminDb.collection("hafiz_parent_student_links")
    .doc(`${context.membershipID}_${studentMembershipID}`);
  const [link, profile] = await Promise.all([
    linkReference.get(),
    adminDb.collection("hafiz_student_profiles").doc(studentMembershipID).get(),
  ]);
  if (!parentMayReadDashboard(
    context,
    link.exists ? link.data() as never : null,
    studentMembershipID,
  )) throw notFound();
  if (!profile.exists || profile.data()?.status !== "ACTIVE"
    || profile.data()?.institutionId !== context.institutionID) throw notFound();

  const [recipientSnapshot, reviewSnapshot, eventSnapshot, audioSnapshot] = await Promise.all([
    adminDb.collection("hafiz_assignment_recipients")
      .where("studentMembershipId", "==", studentMembershipID)
      .orderBy("lastActivityAt", "desc").limit(200).get(),
    adminDb.collection("hafiz_assignment_reviews")
      .where("studentMembershipId", "==", studentMembershipID)
      .orderBy("createdAt", "desc").limit(500).get(),
    adminDb.collection("hafiz_progress_events")
      .where("studentMembershipId", "==", studentMembershipID)
      .orderBy("receivedAt", "desc").limit(500).get(),
    adminDb.collection("hafiz_audio_assets")
      .where("studentMembershipId", "==", studentMembershipID)
      .orderBy("createdAt", "desc").limit(500).get(),
  ]);
  const recipients = recipientSnapshot.docs.filter(document =>
    document.data().institutionId === context.institutionID
    && document.data().status !== "CANCELLED"
  );
  const roots = recipients.length
    ? await adminDb.getAll(...recipients.map(document =>
      adminDb.collection("hafiz_assignments").doc(String(document.data().assignmentId))))
    : [];
  const rootByID = new Map(roots.map(root => [root.id, root]));
  const currentRecipients = recipients.filter(document => {
    const root = rootByID.get(String(document.data().assignmentId));
    return root?.exists && root.data()?.institutionId === context.institutionID
      && ["ACTIVE", "COMPLETED"].includes(String(root.data()?.status));
  });
  const revisions = currentRecipients.length
    ? await adminDb.getAll(...currentRecipients.map(document => {
      const data = document.data();
      return adminDb.collection("hafiz_assignment_revisions")
        .doc(`${data.assignmentId}_${data.assignedRevisionNumber}`);
    })) : [];
  const revisionByID = new Map(revisions.map(revision => [revision.id, revision]));
  const audioByRecipient = new Map<string, FirebaseFirestore.DocumentData[]>();
  for (const asset of audioSnapshot.docs) {
    const data = asset.data();
    if (data.institutionId !== context.institutionID) continue;
    const id = String(data.assignmentRecipientId || "");
    audioByRecipient.set(id, [...(audioByRecipient.get(id) || []), data]);
  }

  const assignments = currentRecipients.flatMap(document => {
    const data = document.data();
    const revision = revisionByID.get(`${data.assignmentId}_${data.assignedRevisionNumber}`);
    if (!revision?.exists || revision.data()?.institutionId !== context.institutionID) return [];
    const revisionData = revision.data()!;
    const steps = Array.isArray(revisionData.workflowSteps)
      ? revisionData.workflowSteps.filter((step: Record<string, unknown>) => step.enabled !== false)
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) => Number(a.order) - Number(b.order))
      : [];
    const progress = readProgress(data.stepProgress);
    const assets = audioByRecipient.get(document.id) || [];
    const activeAudio = assets.sort((a, b) => Number(b.attemptNumber || 0) - Number(a.attemptNumber || 0))[0];
    return [{
      id: String(data.assignmentId),
      recipientStatus: String(data.status),
      completionPercent: Number(data.completionPercent || 0),
      quranScope: minimalParentQuranScope(revisionData.quranScope),
      steps: steps.map((step: Record<string, unknown>) => ({
        id: String(step.id),
        type: String(step.type),
        order: Number(step.order),
        state: progress.get(String(step.id)) || "LOCKED",
      })),
      submittedWorkState: activeAudio
        && activeAudio.submissionStatus !== "SUPERSEDED"
        && typeof activeAudio.privateObjectKey === "string" ? "SUBMITTED"
        : data.status === "STUDENT_WORK_COMPLETE" || data.status === "APPROVED" ? "COMPLETED_WITHOUT_AUDIO"
          : "NOT_SUBMITTED",
      teacherReviewState: data.status === "APPROVED" ? "APPROVED"
        : data.status === "STUDENT_WORK_COMPLETE" ? "PENDING"
          : data.lastReviewDecision === "REVISION_REQUIRED" || data.lastReviewDecision === "INCOMPLETE"
          ? String(data.lastReviewDecision)
          : "NOT_READY",
      submittedAt: textTimestamp(data.studentWorkCompletedAt || data.lastActivityAt),
    }];
  });

  const totalTasks = assignments.reduce((sum, assignment) => sum + assignment.steps.length, 0);
  const completedTasks = assignments.reduce((sum, assignment) => sum
    + assignment.steps.filter(step => COMPLETE_STATES.has(step.state)).length, 0);
  const todayCompletionPercent = assignments.length
    ? Math.round(assignments.reduce((sum, item) => sum + item.completionPercent, 0) / assignments.length)
    : 0;
  const week = lastSevenDayKeys();
  const events = eventSnapshot.docs.map(document => document.data()).filter(data =>
    data.institutionId === context.institutionID && week.includes(dayKey(data.occurredAt || data.receivedAt))
  );
  const reviews = reviewSnapshot.docs.map(document => document.data()).filter(data =>
    data.institutionId === context.institutionID
  );
  const weeklyReviews = reviews.filter(data => week.includes(dayKey(data.createdAt)));
  const weeklyCompletedSteps = recipients.flatMap(document => {
    const value = document.data().stepProgress;
    return Array.isArray(value) ? value : [];
  }).filter(item => item && typeof item === "object"
    && COMPLETE_STATES.has(String((item as Record<string, unknown>).state))
    && week.includes(dayKey((item as Record<string, unknown>).updatedAt)));
  const trend = week.map(date => ({
    date,
    active: events.some(event => dayKey(event.occurredAt || event.receivedAt) === date),
    completedTasks: weeklyCompletedSteps.filter(item =>
      dayKey((item as Record<string, unknown>).updatedAt) === date).length,
    teacherApprovals: weeklyReviews.filter(review =>
      dayKey(review.createdAt) === date && review.decision === "APPROVED").length,
    revisionRequests: weeklyReviews.filter(review =>
      dayKey(review.createdAt) === date
      && ["REVISION_REQUIRED", "INCOMPLETE"].includes(String(review.decision))).length,
  }));
  const notes = parentVisibleNotes(reviews as ParentNoteRecord[], context.institutionID, studentMembershipID)
    .map(note => ({
      assignmentId: note.assignmentId,
      decision: note.decision,
      shortcut: note.shortcut || null,
      note: note.note || null,
      createdAt: textTimestamp(note.createdAt),
    }));
  const mastery = await getParentMasterySummary(context, studentMembershipID);

  return {
    student: { membershipId: studentMembershipID, displayName: String(profile.data()?.displayName || "Öğrenci") },
    today: {
      completionPercent: todayCompletionPercent,
      completedTasks,
      remainingTasks: Math.max(totalTasks - completedTasks, 0),
      assignments,
    },
    weekly: {
      activeStudyDays: trend.filter(day => day.active).length,
      completedTasks: weeklyCompletedSteps.length,
      teacherApprovals: weeklyReviews.filter(review => review.decision === "APPROVED").length,
      revisionRequests: weeklyReviews.filter(review =>
        ["REVISION_REQUIRED", "INCOMPLETE"].includes(String(review.decision))).length,
      trend,
    },
    masterySummary: mastery.summary,
    parentVisibleTeacherNotes: notes,
  };
}

function readProgress(value: unknown) {
  const map = new Map<string, string>();
  if (!Array.isArray(value)) return map;
  value.forEach(item => {
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      map.set(String(record.stepId || ""), String(record.state || "LOCKED"));
    }
  });
  return map;
}

function lastSevenDayKeys() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - index));
    return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  });
}

function dayKey(value: unknown) {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date) : "";
}

function textTimestamp(value: unknown) { return toDate(value)?.toISOString() || (typeof value === "string" ? value : ""); }
function toDate(value: unknown): Date | null {
  if (typeof value === "string") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value) return (value as { toDate(): Date }).toDate();
  return null;
}
function requireParent(context: HafizContext) { if (context.role !== "PARENT") throw notFound(); }
function notFound() { return new HafizAuthorizationError(403, "PARENT_STUDENT_NOT_FOUND", "Öğrenci bulunamadı."); }
