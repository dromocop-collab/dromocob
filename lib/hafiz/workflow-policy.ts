import type { AssignmentWorkflowStep, WorkflowStepType } from "./assignment-schema";

export type StepState = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "AWAITING_REVIEW";
export type RecipientWorkflowStatus = "NOT_STARTED" | "IN_PROGRESS" | "STUDENT_WORK_COMPLETE" | "AWAITING_REVIEW";
export type StudentWorkflowAction =
  | "START"
  | "COMPLETE"
  | "SKIP"
  | "ADD_STUDY_SECONDS"
  | "INCREMENT_REPETITION"
  | "VIDEO_LESSON_COMPLETE"
  | "AUDIO_SUBMITTED";

export type StepProgressRecord = {
  stepId: string;
  state: StepState;
  studySeconds: number;
  repetitionCount: number;
  updatedAt?: string;
};

export type WorkflowTransitionInput = {
  steps: AssignmentWorkflowStep[];
  progress: StepProgressRecord[];
  sequential: boolean;
  repetitionTarget: number;
  stepId: string;
  action: StudentWorkflowAction;
  value?: number;
};

export type WorkflowTransitionResult = {
  progress: StepProgressRecord[];
  recipientStatus: RecipientWorkflowStatus;
  activeStepId: string | null;
  completionPercent: number;
  eventType: string;
};

export class WorkflowTransitionError extends Error {
  readonly code: "STEP_LOCKED" | "INVALID_TRANSITION" | "STEP_NOT_FOUND";

  constructor(code: "STEP_LOCKED" | "INVALID_TRANSITION" | "STEP_NOT_FOUND", message: string) {
    super(message);
    this.code = code;
  }
}

export function initializeWorkflow(
  steps: AssignmentWorkflowStep[],
  sequential: boolean,
): WorkflowTransitionResult {
  const enabled = orderedEnabledSteps(steps);
  const initial = enabled.map(step => emptyProgress(step.id));
  return normalizeWorkflow(enabled, initial, sequential);
}

export function transitionWorkflow(input: WorkflowTransitionInput): WorkflowTransitionResult {
  const steps = orderedEnabledSteps(input.steps);
  const definition = steps.find(step => step.id === input.stepId);
  if (!definition) throw new WorkflowTransitionError("STEP_NOT_FOUND", "Çalışma adımı bulunamadı.");
  let current = normalizeWorkflow(steps, mergeProgress(steps, input.progress), input.sequential);
  const target = current.progress.find(step => step.stepId === input.stepId);
  if (!target) throw new WorkflowTransitionError("STEP_NOT_FOUND", "Çalışma adımı bulunamadı.");
  if (target.state === "LOCKED" || target.state === "AWAITING_REVIEW") {
    throw new WorkflowTransitionError("STEP_LOCKED", "Bu adım henüz açılamaz.");
  }
  if (target.state === "COMPLETED" || target.state === "SKIPPED") {
    throw new WorkflowTransitionError("INVALID_TRANSITION", "Tamamlanan adım yeniden değiştirilemez.");
  }

  const next = current.progress.map(item => ({ ...item }));
  const mutable = next.find(step => step.stepId === input.stepId)!;
  let eventType: string = input.action;
  switch (input.action) {
  case "START":
    requireState(target, ["AVAILABLE"]);
    mutable.state = "IN_PROGRESS";
    break;
  case "COMPLETE":
    requireState(target, ["AVAILABLE", "IN_PROGRESS"]);
    if (!["STUDENT_CONFIRM", "AUTOMATIC"].includes(definition.completionPolicy)) invalidTransition();
    mutable.state = "COMPLETED";
    break;
  case "SKIP":
    requireState(target, ["AVAILABLE", "IN_PROGRESS"]);
    if (definition.required) invalidTransition();
    mutable.state = "SKIPPED";
    break;
  case "ADD_STUDY_SECONDS": {
    requireType(definition.type, "MEMORIZE");
    requireState(target, ["AVAILABLE", "IN_PROGRESS"]);
    const seconds = positiveInteger(input.value, 3600);
    mutable.state = "IN_PROGRESS";
    mutable.studySeconds += seconds;
    break;
  }
  case "INCREMENT_REPETITION":
    requireType(definition.type, "REPEAT");
    requireState(target, ["AVAILABLE", "IN_PROGRESS"]);
    mutable.repetitionCount += 1;
    mutable.state = mutable.repetitionCount >= input.repetitionTarget ? "COMPLETED" : "IN_PROGRESS";
    break;
  case "VIDEO_LESSON_COMPLETE":
    requireType(definition.type, "VIDEO_LESSON");
    requireState(target, ["AVAILABLE", "IN_PROGRESS"]);
    mutable.state = definition.configuration.teacherConfirmationRequired === true
      || definition.configuration.teacherConfirmationRequired === "true"
      ? "AWAITING_REVIEW" : "COMPLETED";
    eventType = "EXTERNAL_VIDEO_LESSON_COMPLETED";
    break;
  case "AUDIO_SUBMITTED":
    requireType(definition.type, "AUDIO_SUBMISSION");
    requireState(target, ["AVAILABLE", "IN_PROGRESS"]);
    mutable.state = "COMPLETED";
    break;
  }
  const wasComplete = current.recipientStatus === "STUDENT_WORK_COMPLETE";
  current = normalizeWorkflow(steps, next, input.sequential);
  if (!wasComplete && current.recipientStatus === "STUDENT_WORK_COMPLETE") {
    eventType = "STUDENT_WORK_COMPLETE";
  }
  return { ...current, eventType };
}

export function maySubmitDifficulty(status: RecipientWorkflowStatus): boolean {
  return status === "STUDENT_WORK_COMPLETE" || status === "AWAITING_REVIEW";
}

function normalizeWorkflow(
  steps: AssignmentWorkflowStep[],
  progress: StepProgressRecord[],
  sequential: boolean,
): WorkflowTransitionResult {
  const next = progress.map(item => ({ ...item }));
  const studentSteps = steps.filter(step => !isTeacherControlled(step));
  const blockingStudentSteps = studentSteps.filter(step => step.required);
  const workComplete = blockingStudentSteps.every(step => {
    const state = next.find(item => item.stepId === step.id)?.state;
    return state === "COMPLETED" || state === "SKIPPED" || state === "AWAITING_REVIEW";
  });

  if (workComplete) {
    for (const step of steps) {
      const item = next.find(candidate => candidate.stepId === step.id)!;
      if (isTeacherControlled(step)) item.state = "AWAITING_REVIEW";
      else if (!step.required && !["COMPLETED", "SKIPPED"].includes(item.state)) item.state = "SKIPPED";
    }
  } else if (sequential) {
    let foundCurrent = false;
    for (const step of steps) {
      const item = next.find(candidate => candidate.stepId === step.id)!;
      if (["COMPLETED", "SKIPPED"].includes(item.state)) continue;
      if (item.state === "AWAITING_REVIEW") {
        foundCurrent = true;
        continue;
      }
      if (isTeacherControlled(step)) {
        item.state = "LOCKED";
      } else if (!foundCurrent) {
        foundCurrent = true;
        if (item.state !== "IN_PROGRESS") item.state = "AVAILABLE";
      } else {
        item.state = "LOCKED";
      }
    }
  } else {
    for (const step of steps) {
      const item = next.find(candidate => candidate.stepId === step.id)!;
      if (["COMPLETED", "SKIPPED", "IN_PROGRESS", "AWAITING_REVIEW"].includes(item.state)) continue;
      item.state = isTeacherControlled(step) ? "LOCKED" : "AVAILABLE";
    }
  }

  const completed = studentSteps.filter(step => {
    const state = next.find(item => item.stepId === step.id)?.state;
    return state === "COMPLETED" || state === "SKIPPED" || state === "AWAITING_REVIEW";
  }).length;
  const active = next.find(item => item.state === "IN_PROGRESS")
    || next.find(item => item.state === "AVAILABLE");
  const started = next.some(item => item.state === "IN_PROGRESS" || item.state === "COMPLETED" || item.state === "SKIPPED");
  return {
    progress: next,
    recipientStatus: workComplete
      ? "STUDENT_WORK_COMPLETE"
      : (started ? "IN_PROGRESS" : "NOT_STARTED"),
    activeStepId: active?.stepId || null,
    completionPercent: studentSteps.length === 0 ? 100 : Math.round((completed / studentSteps.length) * 100),
    eventType: "WORKFLOW_INITIALIZED",
  };
}

function mergeProgress(steps: AssignmentWorkflowStep[], records: StepProgressRecord[]) {
  const byID = new Map(records.map(record => [record.stepId, record]));
  return steps.map(step => {
    const record = byID.get(step.id);
    return record ? {
      stepId: step.id,
      state: record.state,
      studySeconds: Math.max(0, Number(record.studySeconds) || 0),
      repetitionCount: Math.max(0, Number(record.repetitionCount) || 0),
      updatedAt: record.updatedAt,
    } : emptyProgress(step.id);
  });
}

function emptyProgress(stepId: string): StepProgressRecord {
  return { stepId, state: "LOCKED", studySeconds: 0, repetitionCount: 0 };
}

function orderedEnabledSteps(steps: AssignmentWorkflowStep[]) {
  return steps.filter(step => step.enabled).sort((left, right) => left.order - right.order);
}

function isTeacherControlled(step: AssignmentWorkflowStep) {
  return step.completionPolicy === "TEACHER_APPROVAL"
    || step.type === "TEACHER_REVIEW"
    || step.type === "RECITE_TO_TEACHER";
}

function requireState(progress: StepProgressRecord, states: StepState[]) {
  if (!states.includes(progress.state)) invalidTransition();
}

function requireType(actual: WorkflowStepType, expected: WorkflowStepType) {
  if (actual !== expected) invalidTransition();
}

function positiveInteger(value: unknown, maximum: number) {
  if (!Number.isSafeInteger(value) || Number(value) < 1 || Number(value) > maximum) invalidTransition();
  return Number(value);
}

function invalidTransition(): never {
  throw new WorkflowTransitionError("INVALID_TRANSITION", "Bu adım geçişine izin verilmiyor.");
}
