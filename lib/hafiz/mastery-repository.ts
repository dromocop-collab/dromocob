import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import {
  assignmentPreset,
  validateAssignmentSnapshot,
  type AssignmentSnapshotInput,
  type QuranScopeSnapshot,
} from "@/lib/hafiz/assignment-schema";
import {
  calculateNextRevision,
  masteryStateForRecipient,
  strongerMasteryState,
  validateRevisionTemplate,
  type MasteryState,
  type RevisionTemplate,
} from "@/lib/hafiz/mastery-policy";
import { adminDb } from "@/lib/firebase-admin";

const DEFAULT_TEMPLATE: RevisionTemplate = {
  name: "Dengeli Tekrar",
  intervalDays: [1, 3, 7, 14, 30],
};

export async function getStudentProgressMap(context: HafizContext) {
  requireRole(context, "STUDENT");
  return buildProgressMap(context, context.membershipID, false);
}

export async function getTeacherStudentProgressMap(
  context: HafizContext,
  studentMembershipID: string,
) {
  requireRole(context, "TEACHER");
  await requireTeacherStudentAccess(context, studentMembershipID);
  return buildProgressMap(context, studentMembershipID, true);
}

export async function getParentMasterySummary(
  context: HafizContext,
  studentMembershipID: string,
) {
  requireRole(context, "PARENT");
  const link = await adminDb.collection("hafiz_parent_student_links")
    .doc(`${context.membershipID}_${studentMembershipID}`).get();
  const data = link.data();
  if (!link.exists || data?.status !== "ACTIVE"
    || data.institutionId !== context.institutionID
    || data.parentMembershipId !== context.membershipID
    || data.studentMembershipId !== studentMembershipID) throw notFound();
  const map = await buildProgressMap(context, studentMembershipID, false);
  return { summary: map.summary, updatedAt: map.updatedAt };
}

export async function getRevisionTemplate(context: HafizContext, scope: "TEACHER" | "INSTITUTION") {
  requireTemplateScope(context, scope);
  const own = await templateReference(context, scope).get();
  if (own.exists) return publicTemplate(own.id, own.data()!);
  if (scope === "TEACHER") {
    const institution = await adminDb.collection("hafiz_revision_templates")
      .doc(`institution_${context.institutionID}`).get();
    if (institution.exists) return { ...publicTemplate(institution.id, institution.data()!), inherited: true };
  }
  return { id: "default", scope: "DEFAULT", ...DEFAULT_TEMPLATE, inherited: true };
}

export async function updateRevisionTemplate(
  context: HafizContext,
  scope: "TEACHER" | "INSTITUTION",
  body: unknown,
) {
  requireTemplateScope(context, scope);
  const input = asObject(body);
  let template: RevisionTemplate;
  try {
    template = validateRevisionTemplate({
      name: requiredString(input.name),
      intervalDays: numberArray(input.intervalDays),
    });
  } catch {
    throw invalid("Tekrar şablonu geçersiz. Aralıklar artan pozitif günlerden oluşmalıdır.");
  }
  const reference = templateReference(context, scope);
  const now = new Date().toISOString();
  await reference.set({
    institutionId: context.institutionID,
    ownerTeacherMembershipId: scope === "TEACHER" ? context.membershipID : null,
    scope,
    ...template,
    updatedAt: now,
    updatedBy: context.membershipID,
  }, { merge: true });
  return { id: reference.id, scope, ...template, inherited: false };
}

export async function resolveEffectiveRevisionTemplate(
  institutionID: string,
  teacherMembershipID: string,
): Promise<RevisionTemplate & { source: string }> {
  const [teacher, institution] = await Promise.all([
    adminDb.collection("hafiz_revision_templates").doc(`teacher_${teacherMembershipID}`).get(),
    adminDb.collection("hafiz_revision_templates").doc(`institution_${institutionID}`).get(),
  ]);
  for (const snapshot of [teacher, institution]) {
    if (!snapshot.exists || snapshot.data()?.institutionId !== institutionID) continue;
    try {
      const validated = validateRevisionTemplate({
        name: String(snapshot.data()?.name || ""),
        intervalDays: numberArray(snapshot.data()?.intervalDays),
      });
      return { ...validated, source: snapshot.id };
    } catch { /* Invalid stored configuration falls through safely. */ }
  }
  return { ...DEFAULT_TEMPLATE, source: "default" };
}

export async function listRevisionSuggestions(context: HafizContext, horizonDays = 1) {
  requireRole(context, "TEACHER");
  const safeHorizon = Number.isSafeInteger(horizonDays) ? Math.min(Math.max(horizonDays, 0), 30) : 1;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() + safeHorizon);
  const schedules = await adminDb.collection("hafiz_revision_schedules")
    .where("institutionId", "==", context.institutionID)
    .where("teacherMembershipId", "==", context.membershipID).get();
  const due = schedules.docs
    .filter(doc => !["DRAFT_CREATED", "DISMISSED"].includes(String(doc.data().suggestionState)))
    .filter(doc => new Date(String(doc.data().dueAt)).getTime() <= cutoff.getTime())
    .sort((a, b) => String(a.data().dueAt).localeCompare(String(b.data().dueAt)))
    .slice(0, 100);
  const studentIDs = [...new Set(due.map(doc => String(doc.data().studentMembershipId)))];
  const students = studentIDs.length ? await adminDb.getAll(...studentIDs.map(id =>
    adminDb.collection("hafiz_student_profiles").doc(id))) : [];
  const names = new Map(students.map(student => [student.id, String(student.data()?.displayName || "Öğrenci")]));
  return {
    headline: `Önümüzdeki ${safeHorizon || 0} gün için ${due.length} tekrar önerisi hazır.`,
    items: due.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        studentMembershipId: data.studentMembershipId,
        studentName: names.get(String(data.studentMembershipId)) || "Öğrenci",
        dueAt: data.dueAt,
        intervalDays: data.intervalDays,
        reason: data.reason,
        suggestionState: data.suggestionState || "SUGGESTED",
        repetitionTarget: Number(data.repetitionTarget || 10),
        teacherNote: data.teacherNote || "",
        quranScope: minimalScope(data.quranScope),
      };
    }),
  };
}

export async function updateRevisionSuggestion(
  context: HafizContext,
  suggestionID: string,
  body: unknown,
) {
  requireRole(context, "TEACHER");
  const input = asObject(body);
  const action = String(input.action || "");
  if (!["EDIT", "APPROVE_FOR_DRAFT", "DISMISS"].includes(action)) throw invalid("Öneri işlemi geçersiz.");
  const reference = adminDb.collection("hafiz_revision_schedules").doc(suggestionID);
  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data();
    if (!snapshot.exists || data?.institutionId !== context.institutionID
      || data.teacherMembershipId !== context.membershipID) throw notFound();
    const update: Record<string, unknown> = {
      suggestionState: action === "DISMISS" ? "DISMISSED"
        : action === "APPROVE_FOR_DRAFT" ? "APPROVED_FOR_DRAFT" : "SUGGESTED",
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    };
    if (action === "EDIT") {
      const repetitionTarget = Number(input.repetitionTarget);
      if (!Number.isSafeInteger(repetitionTarget) || repetitionTarget < 1 || repetitionTarget > 1000) {
        throw invalid("Tekrar hedefi geçersiz.");
      }
      update.repetitionTarget = repetitionTarget;
      update.teacherNote = optionalString(input.teacherNote).slice(0, 2000);
    }
    transaction.update(reference, update);
    transaction.create(adminDb.collection("hafiz_revision_history").doc(), {
      institutionId: context.institutionID,
      studentMembershipId: data.studentMembershipId,
      scheduleId: suggestionID,
      action,
      actorMembershipId: context.membershipID,
      snapshot: { repetitionTarget: update.repetitionTarget ?? data.repetitionTarget,
        teacherNote: update.teacherNote ?? data.teacherNote, dueAt: data.dueAt },
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, action };
}

export async function createRevisionDraft(context: HafizContext, suggestionID: string) {
  requireRole(context, "TEACHER");
  const scheduleReference = adminDb.collection("hafiz_revision_schedules").doc(suggestionID);
  const schedule = await scheduleReference.get();
  const data = schedule.data();
  if (!schedule.exists || data?.institutionId !== context.institutionID
    || data.teacherMembershipId !== context.membershipID
    || data.suggestionState !== "APPROVED_FOR_DRAFT"
    || data.draftAssignmentId) throw notFound();
  const studentMembershipID = String(data.studentMembershipId || "");
  await requireTeacherStudentAccess(context, studentMembershipID);
  const student = await adminDb.collection("hafiz_student_profiles").doc(studentMembershipID).get();
  if (!student.exists || student.data()?.status !== "ACTIVE"
    || student.data()?.institutionId !== context.institutionID) throw notFound();

  const deadline = new Date();
  deadline.setUTCDate(deadline.getUTCDate() + 2);
  const snapshot: AssignmentSnapshotInput = {
    assignmentType: "RECENT_REVISION",
    sequentialSteps: true,
    repetitionTarget: Number(data.repetitionTarget || 10),
    deadlineAt: deadline.toISOString(),
    teacherNote: optionalString(data.teacherNote).slice(0, 2000),
    quranScope: data.quranScope as QuranScopeSnapshot,
    workflowSteps: assignmentPreset("RECENT_REVISION"),
    target: { type: "STUDENTS", classId: null, studentMembershipIds: [studentMembershipID] },
  };
  const validation = validateAssignmentSnapshot(snapshot);
  if (!validation.valid) throw invalid(validation.errors.join(" "));
  const assignmentReference = adminDb.collection("hafiz_assignments").doc();
  const revisionReference = adminDb.collection("hafiz_assignment_revisions")
    .doc(`${assignmentReference.id}_1`);
  const now = new Date().toISOString();
  await adminDb.runTransaction(async transaction => {
    const fresh = await transaction.get(scheduleReference);
    if (fresh.data()?.suggestionState !== "APPROVED_FOR_DRAFT" || fresh.data()?.draftAssignmentId) {
      throw invalid("Öneri başka bir işlemde değiştirildi.");
    }
    transaction.create(assignmentReference, {
      institutionId: context.institutionID,
      ownerTeacherMembershipId: context.membershipID,
      status: "DRAFT",
      currentDraftRevisionNumber: 1,
      publishedRevisionNumber: null,
      latestRevisionNumber: 1,
      sourceRevisionScheduleId: suggestionID,
      createdAt: now,
      createdBy: context.membershipID,
      updatedAt: now,
      updatedBy: context.membershipID,
    });
    transaction.create(revisionReference, {
      ...validation.value,
      assignmentId: assignmentReference.id,
      institutionId: context.institutionID,
      ownerTeacherMembershipId: context.membershipID,
      revisionNumber: 1,
      status: "DRAFT",
      sourceRevisionScheduleId: suggestionID,
      createdAt: now,
      createdBy: context.membershipID,
      updatedAt: now,
    });
    transaction.update(scheduleReference, {
      suggestionState: "DRAFT_CREATED",
      draftAssignmentId: assignmentReference.id,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    transaction.create(adminDb.collection("hafiz_revision_history").doc(), {
      institutionId: context.institutionID,
      studentMembershipId: studentMembershipID,
      scheduleId: suggestionID,
      assignmentId: assignmentReference.id,
      action: "DRAFT_CREATED",
      actorMembershipId: context.membershipID,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
      institutionId: context.institutionID,
      actorMembershipId: context.membershipID,
      actorUserId: context.userID,
      action: "REVISION_SUGGESTION_DRAFT_CREATED",
      resourceType: "assignment",
      resourceId: assignmentReference.id,
      metadata: { scheduleId: suggestionID },
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, assignmentId: assignmentReference.id, status: "DRAFT" };
}

async function buildProgressMap(context: HafizContext, studentMembershipID: string, includeHistory: boolean) {
  const [student, recipients, approvals, history] = await Promise.all([
    adminDb.collection("hafiz_student_profiles").doc(studentMembershipID).get(),
    adminDb.collection("hafiz_assignment_recipients")
      .where("studentMembershipId", "==", studentMembershipID).get(),
    adminDb.collection("hafiz_memorization_approvals")
      .where("studentMembershipId", "==", studentMembershipID).get(),
    includeHistory ? adminDb.collection("hafiz_mastery_events")
      .where("studentMembershipId", "==", studentMembershipID).get() : Promise.resolve(null),
  ]);
  if (!student.exists || student.data()?.status !== "ACTIVE"
    || student.data()?.institutionId !== context.institutionID) throw notFound();
  const scopedRecipients = recipients.docs.filter(doc => doc.data().institutionId === context.institutionID);
  const revisionRefs = scopedRecipients.map(doc => adminDb.collection("hafiz_assignment_revisions")
    .doc(`${doc.data().assignmentId}_${doc.data().assignedRevisionNumber}`));
  const revisions = revisionRefs.length ? await adminDb.getAll(...revisionRefs) : [];
  const revisionByID = new Map(revisions.map(doc => [doc.id, doc.data()]));
  const states = new Map<string, { editionId: string; pageNumber: number; state: MasteryState;
    assignmentId: string | null; updatedAt: string | null }>();

  for (const recipient of scopedRecipients) {
    const data = recipient.data();
    const revision = revisionByID.get(`${data.assignmentId}_${data.assignedRevisionNumber}`);
    const scope = revision?.quranScope as Record<string, unknown> | undefined;
    const pages = integerArray(scope?.pageNumbers);
    const state = masteryStateForRecipient({
      recipientStatus: String(data.status || ""),
      lastReviewDecision: typeof data.lastReviewDecision === "string" ? data.lastReviewDecision : null,
      hasActivity: Boolean(data.lastActivityAt) || Number(data.totalStudySeconds || 0) > 0,
    });
    for (const pageNumber of pages) mergeState(states, {
      editionId: String(scope?.editionId || ""), pageNumber, state,
      assignmentId: String(data.assignmentId), updatedAt: timestampText(data.lastReviewAt || data.lastActivityAt),
    });
  }
  for (const approval of approvals.docs.filter(doc => doc.data().institutionId === context.institutionID)) {
    const data = approval.data();
    for (const pageNumber of integerArray(data.pageNumbers)) mergeState(states, {
      editionId: String(data.editionId || ""), pageNumber, state: "APPROVED",
      assignmentId: String(data.assignmentId || ""), updatedAt: timestampText(data.approvedAt),
    });
  }
  const entries = [...states.values()].sort((a, b) =>
    a.editionId.localeCompare(b.editionId) || a.pageNumber - b.pageNumber);
  const summary = Object.fromEntries(["NOT_STARTED", "ASSIGNED", "IN_PROGRESS", "AWAITING_REVIEW",
    "APPROVED", "REVISION_REQUIRED"].map(state => [camelState(state), entries.filter(item => item.state === state).length]));
  return {
    student: { membershipId: studentMembershipID, displayName: student.data()?.displayName || "Öğrenci" },
    summary,
    entries,
    history: includeHistory && history ? history.docs
      .filter(doc => doc.data().institutionId === context.institutionID)
      .sort((a, b) => timestampText(b.data().createdAt).localeCompare(timestampText(a.data().createdAt)))
      .slice(0, 100).map(doc => ({ id: doc.id, decision: doc.data().decision,
        state: doc.data().state, assignmentId: doc.data().assignmentId,
        pageRange: minimalScope(doc.data().quranScope), createdAt: timestampText(doc.data().createdAt) })) : [],
    updatedAt: new Date().toISOString(),
  };
}

async function requireTeacherStudentAccess(context: HafizContext, studentMembershipID: string) {
  const classMemberships = await adminDb.collection("hafiz_class_memberships")
    .where("institutionId", "==", context.institutionID)
    .where("studentMembershipId", "==", studentMembershipID)
    .where("status", "==", "ACTIVE").get();
  if (classMemberships.empty) throw notFound();
  const assignments = await adminDb.getAll(...classMemberships.docs.map(doc =>
    adminDb.collection("hafiz_teacher_class_assignments")
      .doc(`${String(doc.data().classId)}_${context.membershipID}`)));
  if (!assignments.some(doc => doc.exists && doc.data()?.status === "ACTIVE"
    && doc.data()?.institutionId === context.institutionID
    && doc.data()?.teacherMembershipId === context.membershipID)) throw notFound();
}

function mergeState(target: Map<string, { editionId: string; pageNumber: number; state: MasteryState;
  assignmentId: string | null; updatedAt: string | null }>, value: {
  editionId: string; pageNumber: number; state: MasteryState; assignmentId: string | null; updatedAt: string | null;
}) {
  if (!value.editionId || value.pageNumber < 1) return;
  const key = `${value.editionId}:${value.pageNumber}`;
  const current = target.get(key);
  if (!current) target.set(key, value);
  else if (strongerMasteryState(current.state, value.state) === value.state) target.set(key, value);
}

function templateReference(context: HafizContext, scope: "TEACHER" | "INSTITUTION") {
  return adminDb.collection("hafiz_revision_templates").doc(
    scope === "TEACHER" ? `teacher_${context.membershipID}` : `institution_${context.institutionID}`);
}
function requireTemplateScope(context: HafizContext, scope: "TEACHER" | "INSTITUTION") {
  if ((scope === "TEACHER" && context.role !== "TEACHER")
    || (scope === "INSTITUTION" && context.role !== "ADMIN")) throw notFound();
}
function publicTemplate(id: string, data: FirebaseFirestore.DocumentData) {
  return { id, scope: data.scope, name: data.name, intervalDays: data.intervalDays, inherited: false };
}
function minimalScope(value: unknown) {
  const scope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return { startPage: Number(scope.startPage || 0), endPage: Number(scope.endPage || 0) };
}
function numberArray(value: unknown) {
  if (!Array.isArray(value)) throw new Error("INVALID_NUMBER_ARRAY");
  return value.map(Number);
}
function integerArray(value: unknown) {
  return Array.isArray(value) ? value.map(Number).filter(item => Number.isSafeInteger(item) && item > 0) : [];
}
function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid("Geçersiz istek.");
  return value as Record<string, unknown>;
}
function requiredString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) throw invalid("Zorunlu alan eksik.");
  return value.trim();
}
function optionalString(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function timestampText(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value) return (value as { toDate(): Date }).toDate().toISOString();
  return "";
}
function camelState(value: string) {
  const parts = value.toLowerCase().split("_");
  return parts[0] + parts.slice(1).map(part => part[0].toUpperCase() + part.slice(1)).join("");
}
function requireRole(context: HafizContext, role: HafizContext["role"]) {
  if (context.role !== role) throw notFound();
}
function invalid(message: string) { return new HafizAuthorizationError(403, "INVALID_MASTERY_REQUEST", message); }
function notFound() { return new HafizAuthorizationError(403, "MASTERY_NOT_FOUND", "İlerleme kaydı bulunamadı."); }

export function createInitialRevisionSchedule(input: {
  approvedAt: string;
  difficulty: string | null;
  template: RevisionTemplate;
}) {
  return calculateNextRevision({
    approvedAt: input.approvedAt,
    difficulty: ["EASY", "DIFFICULT", "VERY_DIFFICULT"].includes(input.difficulty || "")
      ? input.difficulty as "EASY" | "DIFFICULT" | "VERY_DIFFICULT" : null,
    completedIntervalCount: 0,
    intervalDays: input.template.intervalDays,
  });
}

export function createFollowingRevisionSchedule(input: {
  revisedAt: string;
  difficulty: string | null;
  completedIntervalCount: number;
  template: RevisionTemplate;
}) {
  return calculateNextRevision({
    approvedAt: input.revisedAt,
    lastRevisionAt: input.revisedAt,
    lastRevisionOutcome: "APPROVED",
    difficulty: ["EASY", "DIFFICULT", "VERY_DIFFICULT"].includes(input.difficulty || "")
      ? input.difficulty as "EASY" | "DIFFICULT" | "VERY_DIFFICULT" : null,
    completedIntervalCount: input.completedIntervalCount,
    intervalDays: input.template.intervalDays,
  });
}
