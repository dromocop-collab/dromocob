import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { type AssignmentSnapshotInput } from "@/lib/hafiz/assignment-schema";
import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import {
  initializeWorkflow,
  maySubmitDifficulty,
  normalizeStoredWorkflow,
  type StepProgressRecord,
  type StudentWorkflowAction,
  transitionWorkflow,
  WorkflowTransitionError,
} from "@/lib/hafiz/workflow-policy";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { noteVisibleTo, type NoteVisibility } from "@/lib/hafiz/review-policy";
import { enqueueHafizNotification } from "@/lib/hafiz/notification-repository";

const ACTIONS: StudentWorkflowAction[] = [
  "START", "COMPLETE", "SKIP", "ADD_STUDY_SECONDS", "INCREMENT_REPETITION",
  "INCREMENT_STEP_COUNT",
  "VIDEO_LESSON_COMPLETE", "AUDIO_SUBMITTED",
];

export async function getStudentToday(context: HafizContext) {
  requireStudent(context);
  const snapshot = await adminDb.collection("hafiz_assignment_recipients")
    .where("institutionId", "==", context.institutionID)
    .where("studentMembershipId", "==", context.membershipID).get();
  const assignments = (await Promise.all(snapshot.docs.map(document =>
    loadStudentAssignment(context, document.id)
  ))).filter(item => item !== null)
    .sort((left, right) => left!.revision.deadlineAt.localeCompare(right!.revision.deadlineAt))
    .map(item => item!);
  const active = assignments.find(item => !["STUDENT_WORK_COMPLETE", "APPROVED"].includes(item.recipientStatus))
    || assignments.find(item => item.recipientStatus === "STUDENT_WORK_COMPLETE")
    || null;
  const teacher = await resolveAssignedTeacher(context, active?.id || null);
  return {
    completionPercent: assignments.length === 0
      ? 0
      : Math.round(assignments.reduce((sum, item) => sum + item.completionPercent, 0) / assignments.length),
    activeAssignment: active,
    remainingTasks: assignments.filter(item => item.recipientStatus !== "STUDENT_WORK_COMPLETE").length,
    teacherMessages: assignments
      .filter(item => item.revision.teacherNote.trim())
      .map(item => ({ assignmentId: item.id, message: item.revision.teacherNote })),
    teacher,
    assignments,
  };
}

async function resolveAssignedTeacher(context: HafizContext, assignmentID: string | null) {
  if (!assignmentID) return null;
  const assignment = await adminDb.collection("hafiz_assignments").doc(assignmentID).get();
  const assignmentData = assignment.data();
  const teacherMembershipID = String(assignmentData?.ownerTeacherMembershipId || "");
  if (!assignment.exists
    || assignmentData?.institutionId !== context.institutionID
    || !teacherMembershipID) return null;

  const profile = await adminDb.collection("hafiz_teacher_profiles").doc(teacherMembershipID).get();
  const profileData = profile.data();
  if (!profile.exists
    || profileData?.institutionId !== context.institutionID
    || profileData?.status !== "ACTIVE") return null;

  const displayName = String(profileData?.displayName || "").trim();
  return displayName ? { displayName } : null;
}

export async function getStudentAssignment(context: HafizContext, assignmentID: string) {
  const assignment = await loadStudentAssignment(context, `${assignmentID}_${context.membershipID}`);
  if (!assignment) throw notFound();
  const recipientID = `${assignmentID}_${context.membershipID}`;
  const [reviews, helpRequests] = await Promise.all([
    adminDb.collection("hafiz_assignment_reviews")
      .where("assignmentRecipientId", "==", recipientID).get(),
    adminDb.collection("hafiz_help_requests")
      .where("assignmentRecipientId", "==", recipientID).get(),
  ]);
  return {
    ...assignment,
    teacherFeedback: reviews.docs.map(document => document.data())
      .filter(data => noteVisibleTo("STUDENT", data.visibility as NoteVisibility))
      .map(data => ({
        decision: data.decision,
        shortcut: data.shortcut || null,
        note: data.note || null,
        createdAt: data.createdAt?.toDate?.().toISOString?.() || "",
      })),
    helpReplies: helpRequests.docs.map(document => {
      const data = document.data();
      return {
        id: document.id,
        state: String(data.state || "OPEN"),
        stepId: String(data.stepId || ""),
        question: String(data.message || ""),
        reply: typeof data.teacherReply === "string" ? data.teacherReply : "",
        repliedAt: data.repliedAt?.toDate?.().toISOString?.() || "",
      };
    })
      .filter(data => data.state === "ANSWERED" && data.reply)
      .map(({ id, stepId, question, reply, repliedAt }) => ({
        id, stepId, question, reply, repliedAt,
      }))
      .sort((left, right) => right.repliedAt.localeCompare(left.repliedAt)),
  };
}

export async function transitionStudentAssignment(
  context: HafizContext,
  assignmentID: string,
  body: unknown,
) {
  requireStudent(context);
  const payload = asObject(body);
  const stepID = requiredString(payload.stepId);
  const action = String(payload.action) as StudentWorkflowAction;
  const clientEventID = requiredEventID(payload.clientEventId);
  if (!ACTIONS.includes(action)) throw invalidTransition("İşlem türü geçersiz.");
  const recipientReference = recipientRef(assignmentID, context.membershipID);
  const eventReference = adminDb.collection("hafiz_progress_events")
    .doc(`${recipientReference.id}_${clientEventID}`);
  let response: Awaited<ReturnType<typeof publicStudentAssignment>> | null = null;
  const teacherNotification = { teacherID: "" };

  await adminDb.runTransaction(async transaction => {
    const recipient = await transaction.get(recipientReference);
    const recipientData = requireRecipient(context, assignmentID, recipient);
    const revisionNumber = positiveInteger(recipientData.assignedRevisionNumber);
    const [root, revision, existingEvent] = await Promise.all([
      transaction.get(adminDb.collection("hafiz_assignments").doc(assignmentID)),
      transaction.get(revisionRef(assignmentID, revisionNumber)),
      transaction.get(eventReference),
    ]);
    const revisionData = requireActiveAssignment(context, root, revision);
    if (existingEvent.exists) {
      response = publicStudentAssignment(assignmentID, recipientData, revisionData);
      return;
    }
    const pageNumber = optionalPositiveInteger(payload.pageNumber);
    if (pageNumber !== null && !revisionData.quranScope.pageNumbers.includes(pageNumber)) {
      throw new HafizAuthorizationError(403, "QURAN_SCOPE_FORBIDDEN", "Atama dışı sayfaya erişilemez.");
    }
    let result;
    try {
      result = transitionWorkflow({
        steps: revisionData.workflowSteps,
        progress: readProgress(recipientData.stepProgress),
        sequential: revisionData.sequentialSteps,
        repetitionTarget: revisionData.repetitionTarget,
        stepId: stepID,
        action,
        value: payload.value == null ? undefined : Number(payload.value),
      });
    } catch (error) {
      if (error instanceof WorkflowTransitionError) {
        throw new HafizAuthorizationError(403, error.code, error.message);
      }
      throw error;
    }
    const now = new Date().toISOString();
    const studyDelta = action === "ADD_STUDY_SECONDS" ? Number(payload.value) : 0;
    const recipientUpdate = {
      status: result.recipientStatus,
      stepProgress: result.progress.map(item => item.stepId === stepID ? { ...item, updatedAt: now } : item),
      lastActiveStepId: result.activeStepId,
      completionPercent: result.completionPercent,
      totalStudySeconds: Number(recipientData.totalStudySeconds || 0) + studyDelta,
      lastActivityAt: now,
      studentWorkCompletedAt: result.eventType === "STUDENT_WORK_COMPLETE"
        ? now : recipientData.studentWorkCompletedAt || null,
    };
    // Update only server-owned progress fields. Re-writing the complete recipient document
    // can carry legacy/unknown values into a transaction and make an otherwise valid step
    // transition fail Firestore serialization.
    transaction.update(recipientReference, recipientUpdate);
    transaction.create(eventReference, {
      institutionId: context.institutionID,
      assignmentId: assignmentID,
      assignmentRecipientId: recipientReference.id,
      revisionNumber,
      studentMembershipId: context.membershipID,
      actorMembershipId: context.membershipID,
      clientEventId: clientEventID,
      type: result.eventType,
      stepId: stepID,
      pageNumber,
      value: payload.value == null ? null : Number(payload.value),
      occurredAt: optionalString(payload.occurredAt) || now,
      receivedAt: FieldValue.serverTimestamp(),
    });
    if (result.eventType === "STUDENT_WORK_COMPLETE" && action !== "AUDIO_SUBMITTED") {
      teacherNotification.teacherID = String(root.data()?.ownerTeacherMembershipId || "");
    }
    response = publicStudentAssignment(
      assignmentID,
      { ...recipientData, ...recipientUpdate },
      revisionData,
    );
  });
  if (!response) throw notFound();
  if (teacherNotification?.teacherID) {
    await enqueueHafizNotification({ institutionID: context.institutionID,
      targetMembershipID: teacherNotification.teacherID, event: "ASSIGNMENT_STATE_CHANGED",
      sourceID: `${assignmentID}:${clientEventID}`, title: "Çalışma tamamlandı",
      body: "Bir öğrenci çalışmasını tamamladı ve kontrolünü bekliyor.",
      deepLink: `hafiz://teacher/review/${assignmentID}_${context.membershipID}`,
      metadata: { assignmentId: assignmentID, studentMembershipId: context.membershipID } })
      .catch(error => console.error("[HAFIZ STUDENT PROGRESS NOTIFICATION]", error));
  }
  return response;
}

export async function createStudentHelpRequest(
  context: HafizContext,
  assignmentID: string,
  body: unknown,
) {
  const payload = asObject(body);
  const assignment = await getStudentAssignment(context, assignmentID);
  const stepID = requiredString(payload.stepId);
  if (!assignment.revision.workflowSteps.some(step => step.enabled && step.id === stepID)) {
    throw invalidTransition("Çalışma adımı bulunamadı.");
  }
  const pageNumber = optionalPositiveInteger(payload.pageNumber);
  if (pageNumber !== null && !assignment.revision.quranScope.pageNumbers.includes(pageNumber)) {
    throw new HafizAuthorizationError(403, "QURAN_SCOPE_FORBIDDEN", "Atama dışı sayfaya erişilemez.");
  }
  const reference = adminDb.collection("hafiz_help_requests").doc();
  await reference.create({
    institutionId: context.institutionID,
    assignmentId: assignmentID,
    assignmentRecipientId: `${assignmentID}_${context.membershipID}`,
    revisionNumber: assignment.assignedRevisionNumber,
    studentMembershipId: context.membershipID,
    stepId: stepID,
    pageNumber,
    message: optionalString(payload.message).slice(0, 500),
    state: "OPEN",
    createdAt: FieldValue.serverTimestamp(),
  });
  const root = await adminDb.collection("hafiz_assignments").doc(assignmentID).get();
  const teacherID = String(root.data()?.ownerTeacherMembershipId || "");
  if (root.data()?.institutionId === context.institutionID && teacherID) {
    await enqueueHafizNotification({ institutionID: context.institutionID,
      targetMembershipID: teacherID, event: "HELP_REQUEST", sourceID: reference.id,
      title: "Öğrencin yardım istiyor", body: optionalString(payload.message).slice(0, 500) || "Bir öğrenci Hocama Sor işaretledi.",
      deepLink: `hafiz://teacher/review/${assignmentID}_${context.membershipID}`,
      metadata: { assignmentId: assignmentID, studentMembershipId: context.membershipID } });
  }
  return { id: reference.id, state: "OPEN" };
}

export async function submitStudentDifficulty(
  context: HafizContext,
  assignmentID: string,
  body: unknown,
) {
  const payload = asObject(body);
  const difficulty = String(payload.difficulty);
  if (!["EASY", "DIFFICULT", "VERY_DIFFICULT"].includes(difficulty)) {
    throw invalidTransition("Zorluk seçimi geçersiz.");
  }
  const recipientReference = recipientRef(assignmentID, context.membershipID);
  await adminDb.runTransaction(async transaction => {
    const recipient = await transaction.get(recipientReference);
    const data = requireRecipient(context, assignmentID, recipient);
    if (!maySubmitDifficulty(data.status)) throw invalidTransition("Çalışma tamamlanmadan zorluk seçilemez.");
    const now = new Date().toISOString();
    transaction.update(recipientReference, { difficulty, difficultyRecordedAt: now });
    transaction.create(adminDb.collection("hafiz_difficulty_feedback").doc(), {
      institutionId: context.institutionID,
      assignmentId: assignmentID,
      assignmentRecipientId: recipientReference.id,
      studentMembershipId: context.membershipID,
      difficulty,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, difficulty };
}

export async function uploadStudentAudioSubmission(
  context: HafizContext,
  assignmentID: string,
  stepID: string,
  clientEventID: string,
  mimeType: string,
  bytes: Buffer,
) {
  if (!/^audio\/(m4a|mp4|mpeg|aac|wav|x-m4a)$/i.test(mimeType)) {
    throw invalidTransition("Ses dosyası biçimi desteklenmiyor.");
  }
  if (bytes.length < 1 || bytes.length > 15 * 1024 * 1024) {
    throw invalidTransition("Ses kaydı 15 MB sınırını aşamaz.");
  }
  const assignment = await getStudentAssignment(context, assignmentID);
  const definition = assignment.revision.workflowSteps.find(step =>
    step.id === stepID && step.enabled && step.type === "AUDIO_SUBMISSION"
  );
  const progress = assignment.progress.find(step => step.stepId === stepID);
  if (!definition || !progress || !["AVAILABLE", "IN_PROGRESS"].includes(progress.state)) {
    throw invalidTransition("Ses gönderimi adımı aktif değil.");
  }
  const safeEventID = requiredEventID(clientEventID);
  const assetReference = adminDb.collection("hafiz_audio_assets")
    .doc(`${assignmentID}_${context.membershipID}_${safeEventID}`);
  if ((await assetReference.get()).exists) return getStudentAssignment(context, assignmentID);
  const previousAssets = await adminDb.collection("hafiz_audio_assets")
    .where("assignmentRecipientId", "==", `${assignmentID}_${context.membershipID}`).get();
  const attemptNumber = previousAssets.size + 1;
  const extension = mimeType.includes("wav") ? "wav" : mimeType.includes("mpeg") ? "mp3" : "m4a";
  const objectKey = [
    "hafiz-private-audio",
    context.institutionID,
    assignmentID,
    context.membershipID,
    `${safeEventID}.${extension}`,
  ].join("/");
  const file = adminStorage.bucket().file(objectKey);
  await file.save(bytes, {
    resumable: false,
    contentType: mimeType,
    metadata: { cacheControl: "private, no-store", metadata: {
      assignmentId: assignmentID,
      studentMembershipId: context.membershipID,
      stepId: stepID,
    } },
  });
  try {
    const updated = await transitionStudentAssignment(context, assignmentID, {
      stepId: stepID,
      action: "AUDIO_SUBMITTED",
      clientEventId: safeEventID,
      occurredAt: new Date().toISOString(),
    });
    await adminDb.runTransaction(async transaction => {
      const existing = await transaction.get(assetReference);
      if (existing.exists) return;
      previousAssets.docs.forEach(previous => {
        if (previous.data().submissionStatus === "SUBMITTED") {
          transaction.update(previous.ref, { submissionStatus: "SUPERSEDED" });
        }
      });
      transaction.create(assetReference, {
        institutionId: context.institutionID,
        assignmentId: assignmentID,
        assignmentRecipientId: `${assignmentID}_${context.membershipID}`,
        revisionNumber: assignment.assignedRevisionNumber,
        studentMembershipId: context.membershipID,
        stepId: stepID,
        privateObjectKey: objectKey,
        mimeType,
        byteSize: bytes.length,
        attemptNumber,
        submissionStatus: "SUBMITTED",
        submittedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
        institutionId: context.institutionID,
        actorMembershipId: context.membershipID,
        actorUserId: context.userID,
        action: attemptNumber === 1 ? "AUDIO_SUBMITTED" : "AUDIO_RESUBMITTED",
        resourceType: "audioSubmission",
        resourceId: assetReference.id,
        assignmentId: assignmentID,
        revisionNumber: assignment.assignedRevisionNumber,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    const root = await adminDb.collection("hafiz_assignments").doc(assignmentID).get();
    const teacherID = String(root.data()?.ownerTeacherMembershipId || "");
    if (root.data()?.institutionId === context.institutionID && teacherID) {
      await enqueueHafizNotification({ institutionID: context.institutionID,
        targetMembershipID: teacherID, event: "SUBMISSION_RECEIVED", sourceID: assetReference.id,
        title: attemptNumber === 1 ? "Yeni sesli teslim" : "Yeniden sesli teslim",
        body: "Bir öğrencinin sesli çalışması kontrol için hazır.",
        deepLink: `hafiz://teacher/review/${assignmentID}_${context.membershipID}`,
        metadata: { assignmentId: assignmentID, studentMembershipId: context.membershipID } });
    }
    return updated;
  } catch (error) {
    await file.delete({ ignoreNotFound: true }).catch(() => undefined);
    throw error;
  }
}

async function loadStudentAssignment(context: HafizContext, recipientID: string) {
  requireStudent(context);
  const recipient = await adminDb.collection("hafiz_assignment_recipients").doc(recipientID).get();
  if (!recipient.exists) return null;
  const data = recipient.data() || {};
  const assignmentID = requiredString(data.assignmentId);
  if (data.studentMembershipId !== context.membershipID || data.institutionId !== context.institutionID) return null;
  const revisionNumber = positiveInteger(data.assignedRevisionNumber);
  const [root, revision] = await Promise.all([
    adminDb.collection("hafiz_assignments").doc(assignmentID).get(),
    revisionRef(assignmentID, revisionNumber).get(),
  ]);
  let revisionData: AssignmentSnapshotInput;
  try { revisionData = requireActiveAssignment(context, root, revision); } catch { return null; }
  if (!Array.isArray(data.stepProgress)) {
    const initial = initializeWorkflow(revisionData.workflowSteps, revisionData.sequentialSteps);
    const now = new Date().toISOString();
    await recipient.ref.update({
      status: initial.recipientStatus,
      stepProgress: initial.progress,
      lastActiveStepId: initial.activeStepId,
      completionPercent: initial.completionPercent,
      totalStudySeconds: 0,
      lastActivityAt: now,
    });
    return publicStudentAssignment(assignmentID, {
      ...data,
      status: initial.recipientStatus,
      stepProgress: initial.progress,
      lastActiveStepId: initial.activeStepId,
      completionPercent: initial.completionPercent,
      totalStudySeconds: 0,
      lastActivityAt: now,
    }, revisionData);
  }
  if (data.status === "APPROVED") {
    return publicStudentAssignment(assignmentID, data, revisionData);
  }
  const normalized = normalizeStoredWorkflow(
    revisionData.workflowSteps,
    readProgress(data.stepProgress),
    revisionData.sequentialSteps,
  );
  const normalizedRecipient = {
    ...data,
    status: normalized.recipientStatus,
    stepProgress: normalized.progress,
    lastActiveStepId: normalized.activeStepId,
    completionPercent: normalized.completionPercent,
  };
  if (workflowNeedsRepair(data, normalized)) {
    await recipient.ref.update({
      status: normalized.recipientStatus,
      stepProgress: normalized.progress,
      lastActiveStepId: normalized.activeStepId,
      completionPercent: normalized.completionPercent,
    });
  }
  return publicStudentAssignment(assignmentID, normalizedRecipient, revisionData);
}

function publicStudentAssignment(
  assignmentID: string,
  recipient: FirebaseFirestore.DocumentData,
  revision: AssignmentSnapshotInput,
) {
  return {
    id: assignmentID,
    assignedRevisionNumber: Number(recipient.assignedRevisionNumber),
    recipientStatus: recipient.status,
    completionPercent: Number(recipient.completionPercent || 0),
    lastActiveStepId: recipient.lastActiveStepId || null,
    totalStudySeconds: Number(recipient.totalStudySeconds || 0),
    lastActivityAt: recipient.lastActivityAt || null,
    difficulty: recipient.difficulty || null,
    progress: readProgress(recipient.stepProgress),
    revision,
  };
}

function requireRecipient(
  context: HafizContext,
  assignmentID: string,
  snapshot: FirebaseFirestore.DocumentSnapshot,
) {
  const data = snapshot.data();
  if (!snapshot.exists || !data
    || data.assignmentId !== assignmentID
    || data.studentMembershipId !== context.membershipID
    || data.institutionId !== context.institutionID
    || data.status === "CANCELLED") throw notFound();
  return data;
}

function requireActiveAssignment(
  context: HafizContext,
  root: FirebaseFirestore.DocumentSnapshot,
  revision: FirebaseFirestore.DocumentSnapshot,
): AssignmentSnapshotInput {
  if (!root.exists || !revision.exists
    || root.data()?.institutionId !== context.institutionID
    || !["PUBLISHED", "ACTIVE", "COMPLETED"].includes(String(root.data()?.status))
    || revision.data()?.status !== "PUBLISHED") throw notFound();
  return revision.data() as AssignmentSnapshotInput;
}

function recipientRef(assignmentID: string, studentMembershipID: string) {
  return adminDb.collection("hafiz_assignment_recipients").doc(`${assignmentID}_${studentMembershipID}`);
}

function revisionRef(assignmentID: string, revisionNumber: number) {
  return adminDb.collection("hafiz_assignment_revisions").doc(`${assignmentID}_${revisionNumber}`);
}

function readProgress(value: unknown): StepProgressRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === "object").map(item => {
    const record = item as Record<string, unknown>;
    const updatedAt = optionalString(record.updatedAt);
    return {
      stepId: String(record.stepId || ""),
      state: String(record.state || "LOCKED") as StepProgressRecord["state"],
      studySeconds: Number(record.studySeconds || 0),
      repetitionCount: Number(record.repetitionCount || 0),
      completionCount: Number(record.completionCount || 0),
      ...(updatedAt ? { updatedAt } : {}),
    };
  });
}

function workflowNeedsRepair(
  recipient: FirebaseFirestore.DocumentData,
  normalized: ReturnType<typeof normalizeStoredWorkflow>,
) {
  return recipient.status !== normalized.recipientStatus
    || recipient.lastActiveStepId !== normalized.activeStepId
    || Number(recipient.completionPercent || 0) !== normalized.completionPercent
    || JSON.stringify(readProgress(recipient.stepProgress)) !== JSON.stringify(normalized.progress);
}

function requireStudent(context: HafizContext) {
  if (context.role !== "STUDENT") throw notFound();
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidTransition("Geçersiz istek.");
  return value as Record<string, unknown>;
}

function requiredString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) throw invalidTransition("Zorunlu alan eksik.");
  return value.trim();
}

function requiredEventID(value: unknown) {
  const id = requiredString(value);
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(id)) throw invalidTransition("İşlem kimliği geçersiz.");
  return id;
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw invalidTransition("Pozitif tam sayı gerekli.");
  return number;
}

function optionalPositiveInteger(value: unknown): number | null {
  if (value == null) return null;
  return positiveInteger(value);
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function invalidTransition(message: string) {
  return new HafizAuthorizationError(400, "INVALID_WORKFLOW_TRANSITION", message);
}

function notFound() {
  return new HafizAuthorizationError(403, "ASSIGNMENT_NOT_FOUND", "Görev bulunamadı.");
}
