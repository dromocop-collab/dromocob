import assert from "node:assert/strict";
import test from "node:test";

import { buildFirstStepPlan } from "../lib/hafiz/weekly-assignment-plan.ts";
import { initializeWorkflow, transitionWorkflow, WorkflowTransitionError } from "../lib/hafiz/workflow-policy.ts";

const start = "2026-10-05T06:00:00.000Z";
const preview = buildFirstStepPlan({
  editionId: "edition-1",
  startJuz: 1,
  pageCount: 5,
  startAt: start,
  timeZone: "Europe/Istanbul",
  skipWeekends: true,
  deliveryMode: "TEACHER_RECITATION",
  teacherNote: "",
}, new Map([[1, 21], [2, 41], [3, 61], [4, 81], [5, 101]]));

test("first-step plan creates the triangular five-day preview", () => {
  assert.equal(preview.assignmentCount, 5);
  assert.equal(preview.firstWeekTaskCount, 15);
  assert.deepEqual(preview.days.map(day => day.items.length), [1, 2, 3, 4, 5]);
  assert.deepEqual(preview.days[4].items.map(item => item.stage), [
    "DELIVERY", "FULL_PAGE", "HALF_PAGE", "AYAH_BY_AYAH", "PREPARE",
  ]);
  assert.equal(preview.days[4].items[0].pageNumber, 21);
  assert.equal(preview.days[4].items[4].pageNumber, 101);
});

test("plan workflow keeps 3/33 on the same day and stages on following study days", () => {
  const steps = preview.tracks[0].workflowSteps;
  assert.equal(steps[0].configuration.targetCount, "3");
  assert.equal(steps[1].configuration.targetCount, "33");
  assert.equal(steps[0].configuration.availableAt, steps[1].configuration.availableAt);
  assert.notEqual(steps[1].configuration.availableAt, steps[2].configuration.availableAt);
  assert.equal(steps.at(-1)?.type, "RECITE_TO_TEACHER");
});

test("scheduled workflow rejects tomorrow's step even after today's work is complete", () => {
  const steps = preview.tracks[0].workflowSteps;
  const dayOne = new Date(start);
  let state = initializeWorkflow(steps, true, dayOne);
  for (let count = 0; count < 3; count += 1) state = transitionWorkflow({
    steps, progress: state.progress, sequential: true, repetitionTarget: 1,
    stepId: steps[0].id, action: "INCREMENT_STEP_COUNT", now: dayOne,
  });
  for (let count = 0; count < 33; count += 1) state = transitionWorkflow({
    steps, progress: state.progress, sequential: true, repetitionTarget: 1,
    stepId: steps[1].id, action: "INCREMENT_STEP_COUNT", now: dayOne,
  });
  assert.equal(state.activeStepId, null);
  assert.equal(state.progress[2].state, "LOCKED");
  assert.throws(() => transitionWorkflow({
    steps, progress: state.progress, sequential: true, repetitionTarget: 1,
    stepId: steps[2].id, action: "INCREMENT_STEP_COUNT", now: dayOne,
  }), (error: unknown) => error instanceof WorkflowTransitionError && error.code === "STEP_LOCKED");
});

test("weekend skipping carries the last track into the following week", () => {
  assert.equal(preview.days[4].scheduledAt, "2026-10-09T06:00:00.000Z");
  assert.equal(preview.completesAt, "2026-10-15T06:00:00.000Z");
});
