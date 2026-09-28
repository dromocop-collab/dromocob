import type { AssignmentWorkflowStep } from "./assignment-schema";
import type { StepProgressRecord } from "./workflow-policy";

export const REVIEW_DECISIONS = ["APPROVED", "REVISION_REQUIRED", "INCOMPLETE"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];
export const NOTE_VISIBILITIES = ["PRIVATE_TEACHER", "STUDENT_VISIBLE", "PARENT_VISIBLE"] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];

export type ReviewMutation = {
  status: "APPROVED" | "IN_PROGRESS";
  progress: StepProgressRecord[];
  lastActiveStepId: string | null;
  completionPercent: number;
  approvalGranted: boolean;
};

export function applyTeacherReview(
  decision: ReviewDecision,
  steps: AssignmentWorkflowStep[],
  progress: StepProgressRecord[],
): ReviewMutation {
  const enabled = steps.filter(step => step.enabled).sort((a, b) => a.order - b.order);
  const byID = new Map(progress.map(item => [item.stepId, { ...item }]));
  const records = enabled.map(step => byID.get(step.id) || emptyProgress(step.id));

  if (decision === "APPROVED") {
    for (const step of enabled) {
      if (isTeacherControlled(step)) byIDRecord(records, step.id).state = "COMPLETED";
    }
    return {
      status: "APPROVED",
      progress: records,
      lastActiveStepId: null,
      completionPercent: 100,
      approvalGranted: true,
    };
  }

  const retry = [...enabled].reverse().find(step =>
    !isTeacherControlled(step) && step.type === "AUDIO_SUBMISSION"
  ) || [...enabled].reverse().find(step => !isTeacherControlled(step));
  if (!retry) throw new Error("REVIEW_RETRY_STEP_NOT_FOUND");

  for (const step of enabled) {
    const record = byIDRecord(records, step.id);
    if (step.id === retry.id) record.state = "AVAILABLE";
    else if (isTeacherControlled(step)) record.state = "LOCKED";
  }
  const studentSteps = enabled.filter(step => !isTeacherControlled(step));
  const completed = studentSteps.filter(step => {
    const state = byIDRecord(records, step.id).state;
    return state === "COMPLETED" || state === "SKIPPED";
  }).length;
  return {
    status: "IN_PROGRESS",
    progress: records,
    lastActiveStepId: retry.id,
    completionPercent: studentSteps.length ? Math.round((completed / studentSteps.length) * 100) : 0,
    approvalGranted: false,
  };
}

export function noteVisibleTo(role: "TEACHER" | "STUDENT" | "PARENT", visibility: NoteVisibility) {
  if (role === "TEACHER") return true;
  if (role === "STUDENT") return visibility === "STUDENT_VISIBLE";
  return visibility === "PARENT_VISIBLE";
}

export function mayReadProtectedAudio(input: {
  requesterRole: string;
  requesterInstitutionID: string;
  requesterMembershipID: string;
  assetInstitutionID: string;
  assetStudentMembershipID: string;
  assignmentOwnerMembershipID: string;
}) {
  if (input.requesterInstitutionID !== input.assetInstitutionID) return false;
  if (input.requesterRole === "STUDENT") {
    return input.requesterMembershipID === input.assetStudentMembershipID;
  }
  return input.requesterRole === "TEACHER"
    && input.requesterMembershipID === input.assignmentOwnerMembershipID;
}

function isTeacherControlled(step: AssignmentWorkflowStep) {
  return step.completionPolicy === "TEACHER_APPROVAL"
    || step.type === "TEACHER_REVIEW"
    || step.type === "RECITE_TO_TEACHER";
}

function emptyProgress(stepId: string): StepProgressRecord {
  return { stepId, state: "LOCKED", studySeconds: 0, repetitionCount: 0, completionCount: 0 };
}

function byIDRecord(records: StepProgressRecord[], stepID: string) {
  const record = records.find(item => item.stepId === stepID);
  if (!record) throw new Error("REVIEW_STEP_NOT_FOUND");
  return record;
}
