import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  calculateNextRevision,
  masteryStateForRecipient,
  strongerMasteryState,
  validateRevisionTemplate,
} from "../lib/hafiz/mastery-policy.ts";

test("revision schedule uses configurable intervals deterministically", () => {
  const result = calculateNextRevision({
    approvedAt: "2026-01-10T08:00:00.000Z",
    completedIntervalCount: 2,
    intervalDays: [1, 3, 7, 14, 30],
  });
  assert.deepEqual(result, {
    dueAt: "2026-01-17T08:00:00.000Z",
    intervalDays: 7,
    intervalIndex: 2,
    reason: "TEMPLATE_INTERVAL",
  });
});

test("last revision is the next schedule anchor", () => {
  const result = calculateNextRevision({
    approvedAt: "2026-01-10T08:00:00.000Z",
    lastRevisionAt: "2026-02-01T15:30:00.000Z",
    lastRevisionOutcome: "APPROVED",
    completedIntervalCount: 3,
    intervalDays: [2, 5, 10, 20],
  });
  assert.equal(result.dueAt, "2026-02-21T15:30:00.000Z");
  assert.equal(result.intervalDays, 20);
});

test("teacher revision request selects earliest configured interval", () => {
  const result = calculateNextRevision({
    approvedAt: "2026-01-10T08:00:00.000Z",
    lastRevisionAt: "2026-03-01T08:00:00.000Z",
    lastRevisionOutcome: "REVISION_REQUIRED",
    teacherRevisionRequested: true,
    completedIntervalCount: 4,
    intervalDays: [2, 4, 9, 18, 40],
  });
  assert.equal(result.dueAt, "2026-03-03T08:00:00.000Z");
  assert.equal(result.reason, "TEACHER_REVISION_REQUEST");
});

test("difficulty can suggest an earlier configured interval without inventing one", () => {
  const difficult = calculateNextRevision({
    approvedAt: "2026-01-01T00:00:00.000Z",
    difficulty: "DIFFICULT",
    completedIntervalCount: 3,
    intervalDays: [1, 3, 7, 14, 30],
  });
  const veryDifficult = calculateNextRevision({
    approvedAt: "2026-01-01T00:00:00.000Z",
    difficulty: "VERY_DIFFICULT",
    completedIntervalCount: 3,
    intervalDays: [1, 3, 7, 14, 30],
  });
  assert.equal(difficult.intervalDays, 7);
  assert.equal(veryDifficult.intervalDays, 3);
});

test("templates are teacher configurable but strictly validated", () => {
  assert.deepEqual(validateRevisionTemplate({ name: "Standart", intervalDays: [1, 3, 7] }), {
    name: "Standart", intervalDays: [1, 3, 7],
  });
  assert.throws(() => validateRevisionTemplate({ name: "Hatalı", intervalDays: [3, 3, 1] }));
});

test("self completion never becomes approved mastery", () => {
  assert.equal(masteryStateForRecipient({ recipientStatus: "STUDENT_WORK_COMPLETE" }), "AWAITING_REVIEW");
  assert.equal(masteryStateForRecipient({ recipientStatus: "IN_PROGRESS", hasActivity: true }), "IN_PROGRESS");
  assert.equal(masteryStateForRecipient({ recipientStatus: "APPROVED", approved: true }), "APPROVED");
});

test("revision required remains visible unless a trusted approval supersedes it", () => {
  const state = masteryStateForRecipient({
    recipientStatus: "IN_PROGRESS", lastReviewDecision: "REVISION_REQUIRED", hasActivity: true,
  });
  assert.equal(state, "REVISION_REQUIRED");
  assert.equal(strongerMasteryState(state, "APPROVED"), "APPROVED");
});

test("progress and revision APIs keep role separation and suggestions cannot publish", () => {
  const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const student = source("app/api/hafiz/student/progress-map/route.ts");
  const teacher = source("app/api/hafiz/teacher/students/[studentMembershipId]/progress-map/route.ts");
  const suggestions = source("app/api/hafiz/teacher/revision-suggestions/[suggestionId]/route.ts");
  const draft = source("app/api/hafiz/teacher/revision-suggestions/[suggestionId]/create-draft/route.ts");
  const review = source("lib/hafiz/review-repository.ts");
  assert.match(student, /requireHafizContext\(request, \["STUDENT"\]\)/);
  assert.match(teacher, /requireHafizContext\(request, \["TEACHER"\]\)/);
  assert.match(suggestions, /requireHafizContext\(request, \["TEACHER"\]\)/);
  assert.doesNotMatch(suggestions, /publishAssignment/);
  assert.match(draft, /requireHafizContext\(request, \["TEACHER"\]\)/);
  assert.doesNotMatch(draft, /publishAssignment/);
  assert.match(review, /if \(mutation\.approvalGranted\)/);
  assert.match(review, /hafiz_mastery_events/);
  assert.match(review, /hafiz_revision_schedules/);
});
