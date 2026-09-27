import assert from "node:assert/strict";
import test from "node:test";

import { assignmentPreset } from "../lib/hafiz/assignment-schema.ts";
import {
  applyTeacherReview,
  mayReadProtectedAudio,
  noteVisibleTo,
} from "../lib/hafiz/review-policy.ts";
import { initializeWorkflow, transitionWorkflow } from "../lib/hafiz/workflow-policy.ts";

function completedStudentWork() {
  const steps = assignmentPreset("NEW_MEMORIZATION");
  let state = initializeWorkflow(steps, true);
  for (const step of steps.filter(item => item.completionPolicy !== "TEACHER_APPROVAL")) {
    if (step.type === "REPEAT") {
      state = transitionWorkflow({ steps, progress: state.progress, sequential: true,
        repetitionTarget: 1, stepId: step.id, action: "INCREMENT_REPETITION" });
    } else {
      state = transitionWorkflow({ steps, progress: state.progress, sequential: true,
        repetitionTarget: 1, stepId: step.id,
        action: step.type === "AUDIO_SUBMISSION" ? "AUDIO_SUBMITTED" : "COMPLETE" });
    }
  }
  return { steps, state };
}

test("teacher approval completes trusted review steps without client approval", () => {
  const { steps, state } = completedStudentWork();
  const result = applyTeacherReview("APPROVED", steps, state.progress);
  assert.equal(result.status, "APPROVED");
  assert.equal(result.approvalGranted, true);
  assert.ok(result.progress.every(item => item.state === "COMPLETED" || item.state === "SKIPPED"));
});

test("revision request preserves history and reopens audio submission", () => {
  const { steps, state } = completedStudentWork();
  const result = applyTeacherReview("REVISION_REQUIRED", steps, state.progress);
  const audio = steps.find(item => item.type === "AUDIO_SUBMISSION")!;
  assert.equal(result.status, "IN_PROGRESS");
  assert.equal(result.lastActiveStepId, audio.id);
  assert.equal(result.progress.find(item => item.stepId === audio.id)?.state, "AVAILABLE");
});

test("protected audio is tenant and owner scoped", () => {
  const base = {
    requesterInstitutionID: "institution-a", requesterMembershipID: "teacher-a",
    assetInstitutionID: "institution-a", assetStudentMembershipID: "student-a",
    assignmentOwnerMembershipID: "teacher-a",
  };
  assert.equal(mayReadProtectedAudio({ ...base, requesterRole: "TEACHER" }), true);
  assert.equal(mayReadProtectedAudio({ ...base, requesterRole: "TEACHER", requesterMembershipID: "teacher-b" }), false);
  assert.equal(mayReadProtectedAudio({ ...base, requesterRole: "TEACHER", requesterInstitutionID: "institution-b" }), false);
  assert.equal(mayReadProtectedAudio({ ...base, requesterRole: "STUDENT", requesterMembershipID: "student-a" }), true);
  assert.equal(mayReadProtectedAudio({ ...base, requesterRole: "STUDENT", requesterMembershipID: "student-b" }), false);
  assert.equal(mayReadProtectedAudio({ ...base, requesterRole: "PARENT" }), false);
});

test("teacher note visibility never leaks private or student notes to parent", () => {
  assert.equal(noteVisibleTo("TEACHER", "PRIVATE_TEACHER"), true);
  assert.equal(noteVisibleTo("STUDENT", "PRIVATE_TEACHER"), false);
  assert.equal(noteVisibleTo("PARENT", "PRIVATE_TEACHER"), false);
  assert.equal(noteVisibleTo("PARENT", "STUDENT_VISIBLE"), false);
  assert.equal(noteVisibleTo("PARENT", "PARENT_VISIBLE"), true);
});

test("video lesson can wait for teacher confirmation without collecting call data", () => {
  const steps = assignmentPreset("READING").slice(0, 1).map(step => ({
    ...step, type: "VIDEO_LESSON" as const,
    configuration: { teacherConfirmationRequired: true },
  }));
  const state = initializeWorkflow(steps, true);
  const submitted = transitionWorkflow({ steps, progress: state.progress, sequential: true,
    repetitionTarget: 1, stepId: steps[0].id, action: "VIDEO_LESSON_COMPLETE" });
  assert.equal(submitted.progress[0].state, "AWAITING_REVIEW");
  assert.equal(submitted.recipientStatus, "STUDENT_WORK_COMPLETE");
});
