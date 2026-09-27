import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  attentionReasons,
  boundedOperationalWindow,
  chunkDashboardIDs,
  classifyOperationalStatus,
  compareReviewQueuePriority,
  reviewPriorityReasons,
  validateDashboardRange,
} from "../lib/hafiz/teacher-dashboard-policy.ts";

test("class summary statuses are mutually exclusive and objective", () => {
  assert.equal(classifyOperationalStatus({ recipientStatus: "APPROVED" }), "COMPLETED");
  assert.equal(classifyOperationalStatus({ recipientStatus: "STUDENT_WORK_COMPLETE" }), "AWAITING_REVIEW");
  assert.equal(classifyOperationalStatus({ recipientStatus: "IN_PROGRESS", completionPercent: 45 }), "WORKING");
  assert.equal(classifyOperationalStatus({ recipientStatus: "IN_PROGRESS", completionPercent: 0 }), "NOT_STARTED");
  assert.equal(classifyOperationalStatus({}), "NOT_STARTED");
});

test("review queue priority uses explicit priority, waiting, deadline and submission only", () => {
  const items = [
    { id: "b", explicitPriority: "NORMAL" as const, waitingSince: "2026-01-02T00:00:00Z",
      deadlineAt: "2026-01-04T00:00:00Z", submissionState: "SUBMITTED" as const },
    { id: "a", explicitPriority: "HIGH" as const, waitingSince: "2026-01-03T00:00:00Z",
      deadlineAt: "2026-01-05T00:00:00Z", submissionState: "NO_SUBMISSION" as const },
    { id: "c", explicitPriority: "NORMAL" as const, waitingSince: "2026-01-01T00:00:00Z",
      deadlineAt: "2026-01-06T00:00:00Z", submissionState: "NO_SUBMISSION" as const },
  ];
  assert.deepEqual(items.sort(compareReviewQueuePriority).map(item => item.id), ["a", "c", "b"]);
  assert.equal("score" in items[0], false);
});

test("review priority explains every operational reason", () => {
  const reasons = reviewPriorityReasons({
    id: "a", explicitPriority: "HIGH", waitingSince: "2026-01-01T00:00:00Z",
    deadlineAt: "2026-01-02T00:00:00Z", submissionState: "SUBMITTED",
  }, new Date("2026-01-03T00:00:00Z"));
  assert.deepEqual(reasons, [
    "Öğretmen önceliği yüksek olarak işaretledi.",
    "2 gündür kontrol bekliyor.",
    "Görev son tarihi geçti.",
    "Teslim kaydı hazır.",
  ]);
});

test("attention signals state why without subjective labels", () => {
  const reasons = attentionReasons({
    recentTaskCount: 3, recentIncompleteCount: 2, recentRevisionRequestCount: 1,
    difficulty: "VERY_DIFFICULT", hasOpenHelpRequest: true,
  });
  assert.equal(reasons.length, 4);
  assert.match(reasons[0], /Son 3 görevden 2'si tamamlanmadı/);
  assert.doesNotMatch(reasons.join(" ").toLowerCase(), /tembel|zayıf|başarısız/);
});

test("date ranges are deterministic and limited to one year", () => {
  const range = validateDashboardRange("2026-02-01", "2026-02-03");
  assert.deepEqual(range.dayKeys, ["2026-02-01", "2026-02-02", "2026-02-03"]);
  assert.throws(() => validateDashboardRange("2025-01-01", "2026-02-01"));
});

test("operational projections enforce a bounded query window", () => {
  const values = Array.from({ length: 20_000 }, (_, index) => index);
  const result = boundedOperationalWindow(values, 5_000);
  assert.equal(result.length, 5_000);
  assert.equal(result.at(-1), 4_999);
});

test("student-scoped Firestore queries are split at the in-query limit", () => {
  const values = Array.from({ length: 65 }, (_, index) => `student-${index}`);
  const chunks = chunkDashboardIDs([...values, values[0]]);
  assert.deepEqual(chunks.map(chunk => chunk.length), [30, 30, 5]);
  assert.equal(new Set(chunks.flat()).size, 65);
});

test("teacher dashboard routes remain teacher-only and bulk preparation cannot publish", () => {
  const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const dashboard = source("app/api/hafiz/teacher/dashboard/route.ts");
  const bulk = source("app/api/hafiz/teacher/dashboard/bulk-suggestions/prepare/route.ts");
  assert.match(dashboard, /requireHafizContext\(request, \["TEACHER"\]\)/);
  assert.match(bulk, /requireHafizContext\(request, \["TEACHER"\]\)/);
  assert.doesNotMatch(bulk, /publishAssignment/);
});
