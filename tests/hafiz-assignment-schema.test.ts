import assert from "node:assert/strict";
import test from "node:test";

import {
  assignmentPreset,
  type AssignmentSnapshotInput,
  validateAssignmentSnapshot,
} from "../lib/hafiz/assignment-schema.ts";
import {
  mayTransitionAssignmentStatus,
  recipientKeepsPublishedRevision,
  targetContainsOnlyAuthorizedStudents,
  teacherMayTargetClass,
} from "../lib/hafiz/assignment-policy.ts";

const now = new Date("2026-09-27T12:00:00.000Z");

function validSnapshot(): AssignmentSnapshotInput {
  return {
    assignmentType: "NEW_MEMORIZATION",
    sequentialSteps: true,
    repetitionTarget: 10,
    deadlineAt: "2026-10-04T12:00:00.000Z",
    teacherNote: "Tecvit işaretlerine dikkat et.",
    quranScope: {
      kind: "PAGE_RANGE",
      editionId: "approved-edition",
      editionChecksum: "sha256:verified",
      sourceVersion: "1.0",
      pageNumbers: [341, 342, 343],
      ayahIds: null,
      startPage: 341,
      endPage: 343,
    },
    workflowSteps: assignmentPreset("NEW_MEMORIZATION"),
    target: { type: "STUDENTS", classId: null, studentMembershipIds: ["student-a"] },
  };
}

test("NEW_MEMORIZATION preset has the required ordered workflow", () => {
  const steps = assignmentPreset("NEW_MEMORIZATION");
  assert.deepEqual(steps.map(step => step.type), [
    "LISTEN", "READ_FROM_PAGE", "MEMORIZE", "REPEAT", "AUDIO_SUBMISSION", "TEACHER_REVIEW",
  ]);
  assert.equal(validateAssignmentSnapshot(validSnapshot(), now).valid, true);
});

test("empty Quran scope and unauthorized targets are rejected", () => {
  const invalid = validSnapshot();
  invalid.quranScope.pageNumbers = [];
  assert.equal(validateAssignmentSnapshot(invalid, now).valid, false);
  assert.equal(targetContainsOnlyAuthorizedStudents(
    validSnapshot().target,
    new Set(["student-b"]),
  ), false);
});

test("workflow ids, ordering and teacher review evidence are validated", () => {
  const invalid = validSnapshot();
  invalid.workflowSteps[1].id = invalid.workflowSteps[0].id;
  invalid.workflowSteps[1].order = 8;
  invalid.workflowSteps = invalid.workflowSteps.filter(step => step.type !== "AUDIO_SUBMISSION");
  const result = validateAssignmentSnapshot(invalid, now);
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.match(result.errors.join(" "), /benzersiz/);
    assert.match(result.errors.join(" "), /sıralı/);
    assert.match(result.errors.join(" "), /Öğretmen kontrolünden önce/);
  }
});

test("invalid deadline and repetition target are rejected", () => {
  const invalid = validSnapshot();
  invalid.deadlineAt = "2026-09-26T12:00:00.000Z";
  invalid.repetitionTarget = 0;
  const result = validateAssignmentSnapshot(invalid, now);
  assert.equal(result.valid, false);
});

test("teacher cannot target another teacher or tenant class", () => {
  const context = { role: "TEACHER" as const, membershipID: "teacher-a", institutionID: "institution-a" };
  assert.equal(teacherMayTargetClass(context, {
    classId: "class-a", institutionId: "institution-a", teacherMembershipId: "teacher-a", status: "ACTIVE",
  }, "class-a"), true);
  assert.equal(teacherMayTargetClass(context, {
    classId: "class-a", institutionId: "institution-b", teacherMembershipId: "teacher-a", status: "ACTIVE",
  }, "class-a"), false);
  assert.equal(teacherMayTargetClass(context, {
    classId: "class-a", institutionId: "institution-a", teacherMembershipId: "teacher-b", status: "ACTIVE",
  }, "class-a"), false);
});

test("new publication does not silently move an existing recipient revision", () => {
  assert.equal(recipientKeepsPublishedRevision(1, 2), 1);
  assert.equal(recipientKeepsPublishedRevision(null, 2), 2);
});

test("assignment status transitions are constrained", () => {
  assert.equal(mayTransitionAssignmentStatus("PUBLISHED", "ACTIVE"), true);
  assert.equal(mayTransitionAssignmentStatus("ACTIVE", "COMPLETED"), true);
  assert.equal(mayTransitionAssignmentStatus("COMPLETED", "DRAFT"), false);
});
