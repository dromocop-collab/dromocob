export const MASTERY_STATES = [
  "NOT_STARTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "AWAITING_REVIEW",
  "APPROVED",
  "REVISION_REQUIRED",
] as const;

export type MasteryState = (typeof MASTERY_STATES)[number];
export type RevisionOutcome = "APPROVED" | "REVISION_REQUIRED" | "INCOMPLETE" | null;
export type Difficulty = "EASY" | "DIFFICULT" | "VERY_DIFFICULT" | null;

export type RevisionTemplate = {
  name: string;
  intervalDays: number[];
};

export type RevisionScheduleInput = {
  approvedAt: string;
  lastRevisionAt?: string | null;
  lastRevisionOutcome?: RevisionOutcome;
  difficulty?: Difficulty;
  teacherRevisionRequested?: boolean;
  completedIntervalCount: number;
  intervalDays: number[];
};

export function validateRevisionTemplate(value: RevisionTemplate): RevisionTemplate {
  const name = value.name.trim();
  const intervalDays = [...value.intervalDays];
  if (!name || name.length > 80) throw new Error("INVALID_REVISION_TEMPLATE_NAME");
  if (intervalDays.length < 1 || intervalDays.length > 20) {
    throw new Error("INVALID_REVISION_INTERVALS");
  }
  if (intervalDays.some((day, index) => !Number.isSafeInteger(day)
    || day < 1 || day > 3650 || (index > 0 && day <= intervalDays[index - 1]))) {
    throw new Error("INVALID_REVISION_INTERVALS");
  }
  return { name, intervalDays };
}

export function calculateNextRevision(input: RevisionScheduleInput) {
  const template = validateRevisionTemplate({ name: "schedule", intervalDays: input.intervalDays });
  const approvedAt = validDate(input.approvedAt);
  const anchor = input.lastRevisionAt ? validDate(input.lastRevisionAt) : approvedAt;
  if (!Number.isSafeInteger(input.completedIntervalCount) || input.completedIntervalCount < 0) {
    throw new Error("INVALID_COMPLETED_INTERVAL_COUNT");
  }

  let intervalIndex = Math.min(input.completedIntervalCount, template.intervalDays.length - 1);
  let reason = "TEMPLATE_INTERVAL";
  if (input.teacherRevisionRequested
    || input.lastRevisionOutcome === "REVISION_REQUIRED"
    || input.lastRevisionOutcome === "INCOMPLETE") {
    intervalIndex = 0;
    reason = "TEACHER_REVISION_REQUEST";
  } else if (input.difficulty === "VERY_DIFFICULT") {
    intervalIndex = Math.max(0, intervalIndex - 2);
    reason = "VERY_DIFFICULT_FEEDBACK";
  } else if (input.difficulty === "DIFFICULT") {
    intervalIndex = Math.max(0, intervalIndex - 1);
    reason = "DIFFICULT_FEEDBACK";
  }

  const intervalDays = template.intervalDays[intervalIndex];
  return {
    dueAt: addUTCDays(anchor, intervalDays).toISOString(),
    intervalDays,
    intervalIndex,
    reason,
  };
}

export function masteryStateForRecipient(input: {
  recipientStatus: string | null;
  lastReviewDecision?: string | null;
  hasActivity?: boolean;
  approved?: boolean;
}): MasteryState {
  if (input.approved || input.recipientStatus === "APPROVED") return "APPROVED";
  if (input.recipientStatus === "STUDENT_WORK_COMPLETE") return "AWAITING_REVIEW";
  if (input.recipientStatus === "IN_PROGRESS"
    && ["REVISION_REQUIRED", "INCOMPLETE"].includes(input.lastReviewDecision || "")) {
    return "REVISION_REQUIRED";
  }
  if (input.recipientStatus === "IN_PROGRESS") {
    return input.hasActivity ? "IN_PROGRESS" : "ASSIGNED";
  }
  return input.recipientStatus ? "ASSIGNED" : "NOT_STARTED";
}

export function strongerMasteryState(left: MasteryState, right: MasteryState): MasteryState {
  const priority: Record<MasteryState, number> = {
    NOT_STARTED: 0,
    ASSIGNED: 1,
    IN_PROGRESS: 2,
    REVISION_REQUIRED: 3,
    AWAITING_REVIEW: 4,
    APPROVED: 5,
  };
  return priority[right] > priority[left] ? right : left;
}

function validDate(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error("INVALID_REVISION_DATE");
  return date;
}

function addUTCDays(value: Date, days: number) {
  const result = new Date(value.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
