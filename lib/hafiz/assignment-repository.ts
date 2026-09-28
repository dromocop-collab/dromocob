import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import {
  ASSIGNMENT_TYPES,
  type AssignmentSnapshotInput,
  type AssignmentTarget,
  type AssignmentType,
  type AssignmentWorkflowStep,
  type QuranScopeSnapshot,
  validateAssignmentSnapshot,
} from "@/lib/hafiz/assignment-schema";
import {
  findAuthorizedTeacherClassAssignment,
  mayTransitionAssignmentStatus,
  recipientKeepsPublishedRevision,
  targetContainsOnlyAuthorizedStudents,
  teacherMayTargetClass,
} from "@/lib/hafiz/assignment-policy";
import {
  previewQuranSelection,
  validateQuranHighlightsForScope,
} from "@/lib/hafiz/quran-repository";
import { initializeWorkflow } from "@/lib/hafiz/workflow-policy";
import { adminDb } from "@/lib/firebase-admin";
import { enqueueHafizNotification } from "@/lib/hafiz/notification-repository";

type AssignmentStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED" | "ARCHIVED" | "CANCELLED";

export async function listTeacherAssignments(context: HafizContext) {
  requireTeacher(context);
  const snapshot = await adminDb.collection("hafiz_assignments")
    .where("institutionId", "==", context.institutionID).get();
  const roots = snapshot.docs
    .filter(document => document.data().ownerTeacherMembershipId === context.membershipID)
    .sort((left, right) => String(right.data().updatedAt).localeCompare(String(left.data().updatedAt)))
    .slice(0, 100);
  const items = await Promise.all(roots.map(async root => {
    const data = root.data();
    const revisionNumber = Number(data.currentDraftRevisionNumber || data.publishedRevisionNumber || 1);
    const revision = await revisionReference(root.id, revisionNumber).get();
    return publicAssignment(root.id, data, revision.data());
  }));
  return { items, nextCursor: null };
}

export async function getTeacherAssignment(context: HafizContext, assignmentID: string) {
  const root = await requireOwnedAssignment(context, assignmentID);
  const data = root.data() || {};
  const revisionNumber = Number(data.currentDraftRevisionNumber || data.publishedRevisionNumber || 1);
  const revision = await revisionReference(assignmentID, revisionNumber).get();
  if (!revision.exists) throw notFound();
  return publicAssignment(assignmentID, data, revision.data());
}

export async function createAssignmentDraft(context: HafizContext, body: unknown) {
  requireTeacher(context);
  const snapshot = await resolveAndValidateSnapshot(context, body);
  const assignmentReference = adminDb.collection("hafiz_assignments").doc();
  const revisionNumber = 1;
  const now = new Date().toISOString();
  await adminDb.runTransaction(async transaction => {
    transaction.create(assignmentReference, {
      institutionId: context.institutionID,
      ownerTeacherMembershipId: context.membershipID,
      status: "DRAFT",
      currentDraftRevisionNumber: revisionNumber,
      publishedRevisionNumber: null,
      latestRevisionNumber: revisionNumber,
      createdAt: now,
      createdBy: context.membershipID,
      updatedAt: now,
      updatedBy: context.membershipID,
    });
    transaction.create(revisionReference(assignmentReference.id, revisionNumber), {
      ...snapshot,
      assignmentId: assignmentReference.id,
      institutionId: context.institutionID,
      ownerTeacherMembershipId: context.membershipID,
      revisionNumber,
      status: "DRAFT",
      createdAt: now,
      createdBy: context.membershipID,
      updatedAt: now,
    });
    writeAudit(transaction, context, "ASSIGNMENT_DRAFT_CREATED", assignmentReference.id, revisionNumber);
  });
  return getTeacherAssignment(context, assignmentReference.id);
}

export async function updateAssignmentDraft(
  context: HafizContext,
  assignmentID: string,
  body: unknown,
) {
  const root = await requireOwnedAssignment(context, assignmentID);
  const rootData = root.data() || {};
  if (["ARCHIVED", "CANCELLED"].includes(String(rootData.status))) {
    throw invalidInput("Arşivlenmiş veya iptal edilmiş görev düzenlenemez.");
  }
  const revisionNumber = Number(rootData.currentDraftRevisionNumber);
  if (!Number.isSafeInteger(revisionNumber) || revisionNumber < 1) {
    throw invalidInput("Düzenlenebilir taslak revizyon bulunamadı.");
  }
  const reference = revisionReference(assignmentID, revisionNumber);
  const current = await reference.get();
  if (!current.exists || current.data()?.status !== "DRAFT") {
    throw invalidInput("Yayınlanan revizyon değiştirilemez; yeni revizyon oluşturun.");
  }
  const snapshot = await resolveAndValidateSnapshot(context, body);
  const now = new Date().toISOString();
  await adminDb.runTransaction(async transaction => {
    transaction.update(reference, { ...snapshot, updatedAt: now, updatedBy: context.membershipID });
    transaction.update(root.ref, { updatedAt: now, updatedBy: context.membershipID });
    writeAudit(transaction, context, "ASSIGNMENT_DRAFT_UPDATED", assignmentID, revisionNumber);
  });
  return getTeacherAssignment(context, assignmentID);
}

export async function createAssignmentRevision(context: HafizContext, assignmentID: string) {
  const root = await requireOwnedAssignment(context, assignmentID);
  const data = root.data() || {};
  if (!["PUBLISHED", "ACTIVE"].includes(String(data.status))) {
    throw invalidInput("Bu görev için yeni revizyon oluşturulamaz.");
  }
  if (data.currentDraftRevisionNumber) throw invalidInput("Önce mevcut taslak revizyonu yayınlayın.");
  const publishedRevisionNumber = Number(data.publishedRevisionNumber);
  if (!Number.isSafeInteger(publishedRevisionNumber) || publishedRevisionNumber < 1) throw notFound();
  const published = await revisionReference(assignmentID, publishedRevisionNumber).get();
  if (!published.exists || published.data()?.status !== "PUBLISHED") throw notFound();
  const revisionNumber = Number(data.latestRevisionNumber || publishedRevisionNumber) + 1;
  const source = published.data() || {};
  const now = new Date().toISOString();
  const snapshot = pickSnapshot(source);
  await adminDb.runTransaction(async transaction => {
    transaction.create(revisionReference(assignmentID, revisionNumber), {
      ...snapshot,
      assignmentId: assignmentID,
      institutionId: context.institutionID,
      ownerTeacherMembershipId: context.membershipID,
      revisionNumber,
      status: "DRAFT",
      basedOnRevisionNumber: publishedRevisionNumber,
      createdAt: now,
      createdBy: context.membershipID,
      updatedAt: now,
    });
    transaction.update(root.ref, {
      currentDraftRevisionNumber: revisionNumber,
      latestRevisionNumber: revisionNumber,
      updatedAt: now,
      updatedBy: context.membershipID,
    });
    writeAudit(transaction, context, "ASSIGNMENT_REVISION_CREATED", assignmentID, revisionNumber);
  });
  return getTeacherAssignment(context, assignmentID);
}

export async function publishAssignment(
  context: HafizContext,
  assignmentID: string,
  activate: boolean,
) {
  const root = await requireOwnedAssignment(context, assignmentID);
  const rootData = root.data() || {};
  if (["COMPLETED", "ARCHIVED", "CANCELLED"].includes(String(rootData.status))) {
    throw invalidInput("Bu görev yayınlanamaz.");
  }
  const revisionNumber = Number(rootData.currentDraftRevisionNumber);
  const revision = await revisionReference(assignmentID, revisionNumber).get();
  if (!revision.exists || revision.data()?.status !== "DRAFT") throw invalidInput("Yayınlanabilir taslak bulunamadı.");
  const snapshot = pickSnapshot(revision.data() || {});
  const validation = validateAssignmentSnapshot(snapshot);
  if (!validation.valid) throw invalidInput(validation.errors.join(" "));
  const studentIDs = snapshot.target.studentMembershipIds;
  if (studentIDs.length > 200) throw invalidInput("Bir görev en fazla 200 öğrenciye gönderilebilir.");
  const recipientReferences = studentIDs.map(studentID =>
    adminDb.collection("hafiz_assignment_recipients").doc(`${assignmentID}_${studentID}`)
  );
  const existingRecipients = recipientReferences.length > 0
    ? await adminDb.getAll(...recipientReferences)
    : [];
  const now = new Date().toISOString();
  await adminDb.runTransaction(async transaction => {
    const freshRoot = await transaction.get(root.ref);
    const freshRevision = await transaction.get(revision.ref);
    if (freshRoot.data()?.currentDraftRevisionNumber !== revisionNumber
      || freshRevision.data()?.status !== "DRAFT") {
      throw invalidInput("Taslak başka bir işlem tarafından değiştirildi.");
    }
    transaction.update(revision.ref, {
      status: "PUBLISHED",
      publishedAt: now,
      publishedBy: context.membershipID,
      updatedAt: now,
    });
    transaction.update(root.ref, {
      status: activate ? "ACTIVE" : "PUBLISHED",
      publishedRevisionNumber: revisionNumber,
      currentDraftRevisionNumber: null,
      updatedAt: now,
      updatedBy: context.membershipID,
    });
    existingRecipients.forEach((existing, index) => {
      const studentID = studentIDs[index];
      const existingRevision = existing.exists
        ? Number(existing.data()?.assignedRevisionNumber)
        : null;
      const assignedRevisionNumber = recipientKeepsPublishedRevision(
        Number.isSafeInteger(existingRevision) ? existingRevision : null,
        revisionNumber,
      );
      if (!existing.exists) {
        const initialWorkflow = initializeWorkflow(snapshot.workflowSteps, snapshot.sequentialSteps);
        transaction.create(recipientReferences[index], {
          assignmentId: assignmentID,
          institutionId: context.institutionID,
          studentMembershipId: studentID,
          assignedRevisionNumber,
          status: initialWorkflow.recipientStatus,
          stepProgress: initialWorkflow.progress,
          lastActiveStepId: initialWorkflow.activeStepId,
          completionPercent: initialWorkflow.completionPercent,
          totalStudySeconds: 0,
          lastActivityAt: null,
          createdAt: now,
          createdBy: context.membershipID,
        });
        transaction.create(
          adminDb.collection("hafiz_assignment_quran_grants")
            .doc(`${assignmentID}_${assignedRevisionNumber}_${studentID}`),
          {
            assignmentId: assignmentID,
            revisionNumber: assignedRevisionNumber,
            studentMembershipId: studentID,
            institutionId: context.institutionID,
            editionId: snapshot.quranScope.editionId,
            editionChecksum: snapshot.quranScope.editionChecksum,
            pageNumbers: snapshot.quranScope.pageNumbers,
            ayahIds: snapshot.quranScope.ayahIds,
            status: "ACTIVE",
            createdAt: now,
          },
        );
      }
    });
    writeAudit(transaction, context, "ASSIGNMENT_PUBLISHED", assignmentID, revisionNumber);
  });
  await Promise.allSettled(studentIDs.map(studentID => enqueueHafizNotification({
    institutionID: context.institutionID,
    targetMembershipID: studentID,
    event: "NEW_ASSIGNMENT",
    sourceID: `${assignmentID}:${revisionNumber}`,
    title: "Yeni görevin hazır",
    body: snapshot.teacherNote.trim() || "Öğretmenin yeni bir çalışma gönderdi.",
    deepLink: `hafiz://assignment/${assignmentID}`,
    metadata: { assignmentId: assignmentID, revisionNumber },
  })));
  return getTeacherAssignment(context, assignmentID);
}

export async function updateAssignmentStatus(
  context: HafizContext,
  assignmentID: string,
  requestedStatus: unknown,
) {
  const root = await requireOwnedAssignment(context, assignmentID);
  const next = String(requestedStatus) as AssignmentStatus;
  const current = String(root.data()?.status);
  if (current === "DRAFT" && next === "PUBLISHED") {
    throw invalidInput("Taslak yalnızca yayınlama işlemiyle yayınlanabilir.");
  }
  if (!["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED", "CANCELLED"].includes(next)
    || !mayTransitionAssignmentStatus(current, next)) {
    throw invalidInput("Görev durum geçişi geçersiz.");
  }
  const now = new Date().toISOString();
  await adminDb.runTransaction(async transaction => {
    transaction.update(root.ref, { status: next, updatedAt: now, updatedBy: context.membershipID });
    writeAudit(transaction, context, `ASSIGNMENT_${next}`, assignmentID, Number(root.data()?.publishedRevisionNumber || 0));
  });
  if (next === "CANCELLED" || next === "ARCHIVED") {
    await revokeAssignmentFromStudents(context, assignmentID, now);
  }
  return { ok: true, status: next };
}

async function revokeAssignmentFromStudents(
  context: HafizContext,
  assignmentID: string,
  now: string,
) {
  const [recipients, grants] = await Promise.all([
    adminDb.collection("hafiz_assignment_recipients")
      .where("assignmentId", "==", assignmentID).get(),
    adminDb.collection("hafiz_assignment_quran_grants")
      .where("assignmentId", "==", assignmentID).get(),
  ]);
  const writes = [
    ...recipients.docs.map(document => ({
      reference: document.ref,
      data: { status: "CANCELLED", cancelledAt: now, cancelledBy: context.membershipID },
    })),
    ...grants.docs.map(document => ({
      reference: document.ref,
      data: { status: "REVOKED", revokedAt: now, revokedBy: context.membershipID },
    })),
  ];
  for (let offset = 0; offset < writes.length; offset += 400) {
    const batch = adminDb.batch();
    writes.slice(offset, offset + 400).forEach(write => batch.set(write.reference, write.data, { merge: true }));
    await batch.commit();
  }
}

async function resolveAndValidateSnapshot(
  context: HafizContext,
  body: unknown,
): Promise<AssignmentSnapshotInput> {
  const payload = asObject(body);
  const assignmentType = String(payload.assignmentType) as AssignmentType;
  if (!ASSIGNMENT_TYPES.includes(assignmentType)) throw invalidInput("Çalışma türü geçersiz.");
  const target = await resolveTarget(context, payload.target);
  const quranScope = await previewQuranSelection(context, payload.quranSelection) as QuranScopeSnapshot;
  const quranHighlights = await validateQuranHighlightsForScope(quranScope, payload.quranHighlights);
  const workflowSteps = parseWorkflowSteps(payload.workflowSteps);
  const value: AssignmentSnapshotInput = {
    assignmentType,
    sequentialSteps: payload.sequentialSteps !== false,
    repetitionTarget: Number(payload.repetitionTarget),
    deadlineAt: requiredString(payload.deadlineAt),
    teacherNote: optionalString(payload.teacherNote).slice(0, 2000),
    quranScope,
    quranHighlights,
    workflowSteps,
    target,
  };
  const validation = validateAssignmentSnapshot(value);
  if (!validation.valid) throw invalidInput(validation.errors.join(" "));
  return validation.value;
}

async function resolveTarget(context: HafizContext, input: unknown): Promise<AssignmentTarget> {
  const target = asObject(input);
  if (target.type === "CLASS") {
    const classID = requiredString(target.classId);
    // Authorize from trusted fields rather than a synthesized document id.
    // Older/admin-created assignments may use a different id convention.
    const assignmentSnapshot = await adminDb.collection("hafiz_teacher_class_assignments")
      .where("institutionId", "==", context.institutionID)
      .where("teacherMembershipId", "==", context.membershipID)
      .where("status", "==", "ACTIVE").get();
    const assignment = findAuthorizedTeacherClassAssignment(
      context,
      assignmentSnapshot.docs.map(document => document.data() as never),
      classID,
    );
    if (!teacherMayTargetClass(context, assignment, classID)) throw forbiddenTarget();
    const memberships = await adminDb.collection("hafiz_class_memberships")
      .where("institutionId", "==", context.institutionID)
      .where("classId", "==", classID)
      .where("status", "==", "ACTIVE").get();
    const studentIDs = [...new Set(memberships.docs.map(document => requiredString(document.data().studentMembershipId)))];
    await requireActiveStudents(context, studentIDs);
    return { type: "CLASS", classId: classID, studentMembershipIds: studentIDs };
  }
  if (target.type !== "STUDENTS") throw forbiddenTarget();
  const requested = stringArray(target.studentMembershipIds);
  const authorized = await authorizedStudentIDs(context);
  const resolved: AssignmentTarget = { type: "STUDENTS", classId: null, studentMembershipIds: [...new Set(requested)] };
  if (!targetContainsOnlyAuthorizedStudents(resolved, authorized)) throw forbiddenTarget();
  await requireActiveStudents(context, resolved.studentMembershipIds);
  return resolved;
}

async function authorizedStudentIDs(context: HafizContext): Promise<Set<string>> {
  const assignments = await adminDb.collection("hafiz_teacher_class_assignments")
    .where("institutionId", "==", context.institutionID)
    .where("teacherMembershipId", "==", context.membershipID)
    .where("status", "==", "ACTIVE").get();
  const membershipSnapshots = await Promise.all(assignments.docs.map(document =>
    adminDb.collection("hafiz_class_memberships")
      .where("institutionId", "==", context.institutionID)
      .where("classId", "==", requiredString(document.data().classId))
      .where("status", "==", "ACTIVE").get()
  ));
  return new Set(membershipSnapshots.flatMap(snapshot => snapshot.docs.map(document =>
    requiredString(document.data().studentMembershipId)
  )));
}

async function requireActiveStudents(context: HafizContext, studentIDs: string[]) {
  if (studentIDs.length === 0) {
    throw invalidInput("Seçilen sınıfta aktif öğrenci bulunmuyor. Önce sınıfa en az bir aktif öğrenci ekleyin.");
  }
  if (studentIDs.length > 200) {
    throw invalidInput("Bir görev en fazla 200 öğrenciye gönderilebilir.");
  }
  const profiles = await adminDb.getAll(...studentIDs.map(id =>
    adminDb.collection("hafiz_student_profiles").doc(id)
  ));
  if (profiles.some(profile => !profile.exists
    || profile.data()?.status !== "ACTIVE"
    || profile.data()?.institutionId !== context.institutionID)) throw forbiddenTarget();
}

async function requireOwnedAssignment(context: HafizContext, assignmentID: string) {
  requireTeacher(context);
  const snapshot = await adminDb.collection("hafiz_assignments").doc(assignmentID).get();
  if (!snapshot.exists
    || snapshot.data()?.institutionId !== context.institutionID
    || snapshot.data()?.ownerTeacherMembershipId !== context.membershipID) throw notFound();
  return snapshot;
}

function parseWorkflowSteps(value: unknown): AssignmentWorkflowStep[] {
  if (!Array.isArray(value) || value.length > 20) throw invalidInput("Çalışma akışı geçersiz.");
  return value.map(item => {
    const step = asObject(item);
    return {
      id: requiredString(step.id),
      type: String(step.type) as AssignmentWorkflowStep["type"],
      order: Number(step.order),
      required: step.required === true,
      enabled: step.enabled !== false,
      configuration: step.configuration && typeof step.configuration === "object" && !Array.isArray(step.configuration)
        ? step.configuration as Record<string, unknown> : {},
      completionPolicy: String(step.completionPolicy) as AssignmentWorkflowStep["completionPolicy"],
    };
  });
}

function pickSnapshot(data: FirebaseFirestore.DocumentData): AssignmentSnapshotInput {
  return {
    assignmentType: data.assignmentType,
    sequentialSteps: data.sequentialSteps,
    repetitionTarget: data.repetitionTarget,
    deadlineAt: data.deadlineAt,
    teacherNote: data.teacherNote,
    quranScope: data.quranScope,
    quranHighlights: Array.isArray(data.quranHighlights) ? data.quranHighlights : [],
    workflowSteps: data.workflowSteps,
    target: data.target,
  };
}

function publicAssignment(id: string, root: FirebaseFirestore.DocumentData, revision?: FirebaseFirestore.DocumentData) {
  return {
    id,
    institutionId: root.institutionId,
    status: root.status,
    publishedRevisionNumber: root.publishedRevisionNumber || null,
    currentDraftRevisionNumber: root.currentDraftRevisionNumber || null,
    latestRevisionNumber: root.latestRevisionNumber,
    createdAt: root.createdAt,
    updatedAt: root.updatedAt,
    revision: revision ? {
      revisionNumber: revision.revisionNumber,
      status: revision.status,
      ...pickSnapshot(revision),
    } : null,
  };
}

function revisionReference(assignmentID: string, revisionNumber: number) {
  return adminDb.collection("hafiz_assignment_revisions").doc(`${assignmentID}_${revisionNumber}`);
}

function writeAudit(
  transaction: FirebaseFirestore.Transaction,
  context: HafizContext,
  action: string,
  assignmentID: string,
  revisionNumber: number,
) {
  transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
    institutionId: context.institutionID,
    actorMembershipId: context.membershipID,
    actorUserId: context.userID,
    action,
    resourceType: "assignment",
    resourceId: assignmentID,
    revisionNumber,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function requireTeacher(context: HafizContext) {
  if (context.role !== "TEACHER") throw forbiddenTarget();
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidInput("Geçersiz istek.");
  return value as Record<string, unknown>;
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw invalidInput("Zorunlu alan eksik.");
  return value.trim();
}

function optionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === "string" && item.trim())) {
    throw forbiddenTarget();
  }
  return value.map(item => item.trim());
}

function invalidInput(message: string) {
  return new HafizAuthorizationError(400, "INVALID_ASSIGNMENT", message);
}

function forbiddenTarget() {
  return new HafizAuthorizationError(403, "ASSIGNMENT_TARGET_FORBIDDEN", "Görev hedefi için yetkiniz yok.");
}

function notFound() {
  return new HafizAuthorizationError(403, "ASSIGNMENT_NOT_FOUND", "Görev bulunamadı.");
}
