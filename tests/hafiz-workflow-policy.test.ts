import assert from "node:assert/strict";
import test from "node:test";

import { assignmentPreset, type AssignmentWorkflowStep } from "../lib/hafiz/assignment-schema.ts";
import {
  initializeWorkflow,
  transitionWorkflow,
  WorkflowTransitionError,
} from "../lib/hafiz/workflow-policy.ts";

const steps = assignmentPreset("NEW_MEMORIZATION");

test("sequential workflow unlocks exactly the next student step", () => {
  let state = initializeWorkflow(steps, true);
  assert.equal(state.activeStepId, steps[0].id);
  assert.equal(state.progress[1].state, "LOCKED");
  state = transitionWorkflow({
    steps, progress: state.progress, sequential: true, repetitionTarget: 10,
    stepId: steps[0].id, action: "COMPLETE",
  });
  assert.equal(state.progress[0].state, "COMPLETED");
  assert.equal(state.progress[1].state, "AVAILABLE");
});

test("malicious completion of a locked future step is rejected", () => {
  const state = initializeWorkflow(steps, true);
  assert.throws(() => transitionWorkflow({
    steps, progress: state.progress, sequential: true, repetitionTarget: 10,
    stepId: steps[3].id, action: "COMPLETE",
  }), (error: unknown) => error instanceof WorkflowTransitionError && error.code === "STEP_LOCKED");
});

test("stored progress resumes at the legitimate active step", () => {
  const initial = initializeWorkflow(steps, true);
  const resumed = transitionWorkflow({
    steps, progress: initial.progress, sequential: true, repetitionTarget: 10,
    stepId: steps[0].id, action: "COMPLETE",
  });
  const restored = initializeFromStored(resumed.progress);
  assert.equal(restored.activeStepId, steps[1].id);
  assert.equal(restored.progress[0].state, "COMPLETED");
});

test("student completion never produces teacher approval", () => {
  let state = initializeWorkflow(steps, true);
  for (const step of steps.filter(item => item.completionPolicy !== "TEACHER_APPROVAL")) {
    const action = step.type === "REPEAT"
      ? "INCREMENT_REPETITION"
      : step.type === "AUDIO_SUBMISSION" ? "AUDIO_SUBMITTED" : "COMPLETE";
    if (step.type === "REPEAT") {
      for (let index = 0; index < 2; index++) state = transitionWorkflow({
        steps, progress: state.progress, sequential: true, repetitionTarget: 2,
        stepId: step.id, action,
      });
    } else state = transitionWorkflow({
      steps, progress: state.progress, sequential: true, repetitionTarget: 2,
      stepId: step.id, action,
    });
  }
  assert.equal(state.recipientStatus, "STUDENT_WORK_COMPLETE");
  assert.equal(state.progress.find(item => item.stepId === steps.at(-1)?.id)?.state, "AWAITING_REVIEW");
  assert.notEqual(state.recipientStatus, "TEACHER_APPROVED");
});

test("optional step can be skipped and does not block completion", () => {
  const optional: AssignmentWorkflowStep[] = assignmentPreset("READING").map((step, index) =>
    index === 0 ? { ...step, required: false } : step
  );
  let state = initializeWorkflow(optional, true);
  state = transitionWorkflow({
    steps: optional, progress: state.progress, sequential: true, repetitionTarget: 1,
    stepId: optional[0].id, action: "SKIP",
  });
  assert.equal(state.progress[1].state, "AVAILABLE");
});

test("non-sequential workflow exposes all student-controlled steps", () => {
  const state = initializeWorkflow(steps, false);
  const studentStates = steps
    .filter(step => step.completionPolicy !== "TEACHER_APPROVAL")
    .map(step => state.progress.find(item => item.stepId === step.id)?.state);
  assert.ok(studentStates.every(value => value === "AVAILABLE"));
});

function initializeFromStored(progress: ReturnType<typeof initializeWorkflow>["progress"]) {
  return transitionWorkflow({
    steps, progress, sequential: true, repetitionTarget: 10,
    stepId: steps[1].id, action: "START",
  });
}
