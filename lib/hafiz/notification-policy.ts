import { createHash } from "node:crypto";

import type { HafizRole } from "./authorization";

export const NOTIFICATION_EVENTS = [
  "NEW_ASSIGNMENT", "DEADLINE_REMINDER", "REMAINING_TASK_REMINDER",
  "TEACHER_REQUESTED_REVISION", "TEACHER_APPROVED_WORK", "TEACHER_SENT_MESSAGE",
  "SUBMISSION_RECEIVED", "HELP_REQUEST", "REVIEW_QUEUE_SUMMARY", "ASSIGNMENT_STATE_CHANGED",
  "STUDENT_DAILY_SUMMARY", "PARENT_DAILY_SUMMARY", "PARENT_WEEKLY_SUMMARY",
  "PARENT_VISIBLE_TEACHER_NOTE", "SYSTEM_OPERATIONAL",
] as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENTS)[number];

export const ROLE_NOTIFICATION_EVENTS: Record<HafizRole, readonly NotificationEventType[]> = {
  STUDENT: ["NEW_ASSIGNMENT", "DEADLINE_REMINDER", "REMAINING_TASK_REMINDER",
    "TEACHER_REQUESTED_REVISION", "TEACHER_APPROVED_WORK", "TEACHER_SENT_MESSAGE",
    "STUDENT_DAILY_SUMMARY"],
  TEACHER: ["SUBMISSION_RECEIVED", "HELP_REQUEST", "REVIEW_QUEUE_SUMMARY", "ASSIGNMENT_STATE_CHANGED"],
  PARENT: ["PARENT_DAILY_SUMMARY", "PARENT_WEEKLY_SUMMARY", "PARENT_VISIBLE_TEACHER_NOTE"],
  ADMIN: ["SYSTEM_OPERATIONAL"],
};

export type NotificationPreferences = {
  timezone: string;
  pushEnabled: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
  dailySummaryHour: number;
  weeklySummaryWeekday: number;
  weeklySummaryHour: number;
  disabledEvents: NotificationEventType[];
};

export function defaultNotificationPreferences(role: HafizRole): NotificationPreferences {
  return {
    timezone: "Europe/Istanbul",
    pushEnabled: true,
    dailySummary: role === "STUDENT" || role === "TEACHER",
    weeklySummary: false,
    dailySummaryHour: 20,
    weeklySummaryWeekday: 0,
    weeklySummaryHour: 19,
    disabledEvents: [],
  };
}

export function parseNotificationPreferences(role: HafizRole, input: unknown): NotificationPreferences {
  const defaults = defaultNotificationPreferences(role);
  if (!input || typeof input !== "object" || Array.isArray(input)) return defaults;
  const value = input as Record<string, unknown>;
  const timezone = typeof value.timezone === "string" && isValidTimezone(value.timezone)
    ? value.timezone : defaults.timezone;
  const disabledEvents = Array.isArray(value.disabledEvents)
    ? [...new Set(value.disabledEvents.map(String).filter((event): event is NotificationEventType =>
      ROLE_NOTIFICATION_EVENTS[role].includes(event as NotificationEventType)))] : [];
  return {
    timezone,
    pushEnabled: typeof value.pushEnabled === "boolean" ? value.pushEnabled : defaults.pushEnabled,
    dailySummary: typeof value.dailySummary === "boolean" ? value.dailySummary : defaults.dailySummary,
    weeklySummary: typeof value.weeklySummary === "boolean" ? value.weeklySummary : defaults.weeklySummary,
    dailySummaryHour: boundedInteger(value.dailySummaryHour, 0, 23, defaults.dailySummaryHour),
    weeklySummaryWeekday: boundedInteger(value.weeklySummaryWeekday, 0, 6, defaults.weeklySummaryWeekday),
    weeklySummaryHour: boundedInteger(value.weeklySummaryHour, 0, 23, defaults.weeklySummaryHour),
    disabledEvents,
  };
}

export function mayReceiveNotification(role: HafizRole, event: NotificationEventType,
  preferences: NotificationPreferences) {
  if (!ROLE_NOTIFICATION_EVENTS[role].includes(event)) return false;
  if (preferences.disabledEvents.includes(event)) return false;
  if (event === "STUDENT_DAILY_SUMMARY" || event === "PARENT_DAILY_SUMMARY") return preferences.dailySummary;
  if (event === "PARENT_WEEKLY_SUMMARY") return preferences.weeklySummary;
  return true;
}

export function notificationDocumentID(input: {
  institutionID: string; targetMembershipID: string; event: NotificationEventType; sourceID: string;
}) {
  return createHash("sha256").update([
    input.institutionID, input.targetMembershipID, input.event, input.sourceID,
  ].join(":"), "utf8").digest("hex");
}

export function timezoneDateKey(date: Date, timezone: string) {
  const parts = dateParts(date, timezone);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function timezoneHour(date: Date, timezone: string) {
  return dateParts(date, timezone).hour;
}

export function timezoneWeekday(date: Date, timezone: string) {
  const key = timezoneDateKey(date, timezone);
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function timezoneDayBounds(date: Date, timezone: string, dayOffset = 0) {
  if (!isValidTimezone(timezone)) throw new Error("INVALID_TIMEZONE");
  const key = timezoneDateKey(date, timezone);
  const [year, month, day] = key.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1, day + dayOffset));
  const next = new Date(Date.UTC(year, month - 1, day + dayOffset + 1));
  return {
    dateKey: `${target.getUTCFullYear()}-${pad(target.getUTCMonth() + 1)}-${pad(target.getUTCDate())}`,
    startAt: zonedMidnight(target, timezone).toISOString(),
    endAtExclusive: zonedMidnight(next, timezone).toISOString(),
  };
}

export function isValidTimezone(value: string) {
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(); return true; }
  catch { return false; }
}

export function summaryLines(metrics: {
  newAssignments: number; repetitions: number; listeningSeconds: number;
  studySeconds: number; submissions: number; completedTasks: number;
  totalTasks: number; awaitingReview: number;
}) {
  const lines: string[] = [];
  if (metrics.newAssignments) lines.push(`${metrics.newAssignments} yeni çalışma`);
  if (metrics.repetitions) lines.push(`${metrics.repetitions} tekrar`);
  if (metrics.listeningSeconds) lines.push(`${Math.floor(metrics.listeningSeconds / 60)} dk dinleme`);
  if (metrics.studySeconds) lines.push(`${Math.floor(metrics.studySeconds / 60)} dk çalışma`);
  if (metrics.submissions) lines.push(`${metrics.submissions} teslim`);
  if (metrics.totalTasks) lines.push(`${metrics.completedTasks}/${metrics.totalTasks} görev`);
  if (metrics.awaitingReview) lines.push(`${metrics.awaitingReview} çalışma öğretmen kontrolünde`);
  return lines;
}

function dateParts(date: Date, timezone: string) {
  if (!isValidTimezone(timezone)) throw new Error("INVALID_TIMEZONE");
  const values = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", hourCycle: "h23",
  }).formatToParts(date).reduce<Record<string, number>>((result, part) => {
    if (["year", "month", "day", "hour"].includes(part.type)) result[part.type] = Number(part.value);
    return result;
  }, {});
  return { year: values.year, month: values.month, day: values.day, hour: values.hour };
}

function zonedMidnight(localDate: Date, timezone: string) {
  const desired = Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate());
  let guess = desired;
  for (let index = 0; index < 3; index += 1) {
    const parts = dateParts(new Date(guess), timezone);
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour);
    guess -= represented - desired;
  }
  return new Date(guess);
}

function boundedInteger(value: unknown, minimum: number, maximum: number, fallback: number) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= minimum && number <= maximum ? number : fallback;
}

function pad(value: number) { return String(value).padStart(2, "0"); }
