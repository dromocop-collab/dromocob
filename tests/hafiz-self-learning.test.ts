import assert from "node:assert/strict";
import test from "node:test";

import {
  mergeSelfLearningProgress,
  normalizeSelfLearningProgress,
} from "../lib/hafiz/self-learning-schema.ts";

const base = {
  curriculumVersion: 1,
  mode: "STANDARD",
  ageBand: "ADULT_18_PLUS",
  startingLevel: "BEGINNER",
  completedLessonIDs: ["elifba-1-1"],
  rewardUnlockedLessonIDs: [],
  updatedAt: "2026-09-28T10:00:00.000Z",
};

test("self-learning sync preserves progress from both device and account", () => {
  const merged = mergeSelfLearningProgress(base, {
    ...base,
    completedLessonIDs: ["elifba-1-2"],
    updatedAt: "2026-09-28T11:00:00.000Z",
  }, new Date("2026-09-28T12:00:00.000Z"));
  assert.deepEqual(merged.completedLessonIDs, ["elifba-1-1", "elifba-1-2"]);
  assert.equal(merged.updatedAt, "2026-09-28T12:00:00.000Z");
});

test("empty fresh client cannot erase saved age and placement", () => {
  const merged = mergeSelfLearningProgress(base, {
    ...base,
    ageBand: null,
    startingLevel: null,
    completedLessonIDs: [],
    updatedAt: "2026-09-28T13:00:00.000Z",
  }, new Date("2026-09-28T14:00:00.000Z"));

  assert.equal(merged.ageBand, "ADULT_18_PLUS");
  assert.equal(merged.startingLevel, "BEGINNER");
  assert.deepEqual(merged.completedLessonIDs, ["elifba-1-1"]);
});

test("unknown lesson identifiers are rejected", () => {
  assert.throws(() => normalizeSelfLearningProgress({
    ...base,
    completedLessonIDs: ["another-users-lesson"],
  }));
});

test("minor profile cannot forge an advanced adult placement", () => {
  assert.throws(() => normalizeSelfLearningProgress({
    ...base,
    ageBand: "CHILD_6_8",
    startingLevel: "READS_QURAN",
  }));
});
