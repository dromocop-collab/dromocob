export const DASHBOARD_LIMITS = {
  recipients: 5000,
  reviews: 5000,
  events: 10000,
  helpRequests: 2000,
  audioAssets: 2000,
  historyPerStudent: 20,
} as const;

export type OperationalStatus = "COMPLETED" | "WORKING" | "AWAITING_REVIEW" | "NOT_STARTED";

export type ReviewQueuePriority = {
  id: string;
  explicitPriority: "HIGH" | "NORMAL";
  waitingSince: string;
  deadlineAt: string;
  submissionState: "SUBMITTED" | "NO_SUBMISSION";
};

export function classifyOperationalStatus(input: {
  recipientStatus?: string | null;
  completionPercent?: number;
  lastActivityAt?: string | null;
}): OperationalStatus {
  if (input.recipientStatus === "APPROVED") return "COMPLETED";
  if (input.recipientStatus === "STUDENT_WORK_COMPLETE") return "AWAITING_REVIEW";
  if (input.recipientStatus === "IN_PROGRESS"
    && ((input.completionPercent || 0) > 0 || Boolean(input.lastActivityAt))) return "WORKING";
  return "NOT_STARTED";
}

export function compareReviewQueuePriority(left: ReviewQueuePriority, right: ReviewQueuePriority) {
  const priorityDifference = priorityRank(right.explicitPriority) - priorityRank(left.explicitPriority);
  if (priorityDifference) return priorityDifference;
  const waitingDifference = dateValue(left.waitingSince) - dateValue(right.waitingSince);
  if (waitingDifference) return waitingDifference;
  const deadlineDifference = dateValue(left.deadlineAt) - dateValue(right.deadlineAt);
  if (deadlineDifference) return deadlineDifference;
  const submissionDifference = submissionRank(right.submissionState) - submissionRank(left.submissionState);
  if (submissionDifference) return submissionDifference;
  return left.id.localeCompare(right.id);
}

export function reviewPriorityReasons(item: ReviewQueuePriority, now = new Date()) {
  const reasons: string[] = [];
  if (item.explicitPriority === "HIGH") reasons.push("Öğretmen önceliği yüksek olarak işaretledi.");
  const waitingHours = Math.max(0, Math.floor((now.getTime() - dateValue(item.waitingSince)) / 3_600_000));
  reasons.push(waitingHours < 24
    ? `${waitingHours} saattir kontrol bekliyor.`
    : `${Math.floor(waitingHours / 24)} gündür kontrol bekliyor.`);
  if (dateValue(item.deadlineAt) < now.getTime()) reasons.push("Görev son tarihi geçti.");
  else if (dateValue(item.deadlineAt) - now.getTime() <= 86_400_000) reasons.push("Görev son tarihi 24 saat içinde.");
  reasons.push(item.submissionState === "SUBMITTED" ? "Teslim kaydı hazır." : "Sesli teslim bulunmuyor.");
  return reasons;
}

export function attentionReasons(input: {
  recentTaskCount: number;
  recentIncompleteCount: number;
  recentRevisionRequestCount: number;
  difficulty?: string | null;
  hasOpenHelpRequest: boolean;
}) {
  const reasons: string[] = [];
  if (input.recentIncompleteCount > 0) {
    reasons.push(`Son ${input.recentTaskCount} görevden ${input.recentIncompleteCount}'si tamamlanmadı.`);
  }
  if (input.recentRevisionRequestCount > 0) {
    reasons.push(`Son ${input.recentTaskCount} görevde ${input.recentRevisionRequestCount} tekrar isteği var.`);
  }
  if (input.difficulty === "VERY_DIFFICULT") reasons.push("Öğrenci son çalışmayı çok zor olarak bildirdi.");
  if (input.hasOpenHelpRequest) reasons.push("Öğrencinin açık yardım isteği var.");
  return reasons;
}

export function validateDashboardRange(startValue: string | null, endValue: string | null, now = new Date()) {
  const end = endValue ? startOfUTCDay(endValue) : startOfUTCDay(now.toISOString());
  const start = startValue ? startOfUTCDay(startValue) : addUTCDays(end, -6);
  if (start.getTime() > end.getTime()) throw new Error("INVALID_DASHBOARD_DATE_RANGE");
  const dayCount = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (dayCount > 366) throw new Error("DASHBOARD_DATE_RANGE_TOO_LARGE");
  return {
    startAt: start.toISOString(),
    endAtExclusive: addUTCDays(end, 1).toISOString(),
    dayKeys: Array.from({ length: dayCount }, (_, index) =>
      addUTCDays(start, index).toISOString().slice(0, 10)),
  };
}

export function boundedOperationalWindow<T>(items: T[], limit: number) {
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error("INVALID_DASHBOARD_LIMIT");
  return items.slice(0, limit);
}

export function chunkDashboardIDs(values: string[], size = 30) {
  if (!Number.isSafeInteger(size) || size < 1 || size > 30) throw new Error("INVALID_DASHBOARD_CHUNK_SIZE");
  const unique = [...new Set(values.filter(Boolean))];
  return Array.from({ length: Math.ceil(unique.length / size) }, (_, index) =>
    unique.slice(index * size, (index + 1) * size));
}

function priorityRank(value: ReviewQueuePriority["explicitPriority"]) { return value === "HIGH" ? 1 : 0; }
function submissionRank(value: ReviewQueuePriority["submissionState"]) { return value === "SUBMITTED" ? 1 : 0; }
function dateValue(value: string) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}
function startOfUTCDay(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error("INVALID_DASHBOARD_DATE");
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
function addUTCDays(value: Date, days: number) {
  const result = new Date(value.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
