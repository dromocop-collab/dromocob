import assert from "node:assert/strict";
import test from "node:test";

import {
  assignmentAllowsPage,
  assignmentAllowsAyah,
  studentMayResolveAssignmentQuran,
  type AssignmentQuranGrant,
  type QuranStudentContext,
} from "../lib/hafiz/quran-policy.ts";

const student: QuranStudentContext = {
  role: "STUDENT",
  membershipID: "student-a",
  institutionID: "institution-a",
};

const grant: AssignmentQuranGrant = {
  assignmentId: "assignment-341-343",
  studentMembershipId: "student-a",
  institutionId: "institution-a",
  editionId: "approved-edition",
  pageNumbers: [341, 342, 343],
  status: "ACTIVE",
};

test("assignment pages 341 through 343 are authorized", () => {
  assert.equal(studentMayResolveAssignmentQuran(student, grant, grant.assignmentId), true);
  assert.equal(assignmentAllowsPage(grant, 341), true);
  assert.equal(assignmentAllowsPage(grant, 342), true);
  assert.equal(assignmentAllowsPage(grant, 343), true);
});

test("pages immediately outside assignment scope are rejected", () => {
  assert.equal(assignmentAllowsPage(grant, 340), false);
  assert.equal(assignmentAllowsPage(grant, 344), false);
});

test("unrelated Quran content is rejected", () => {
  assert.equal(assignmentAllowsPage(grant, 1), false);
  assert.equal(assignmentAllowsPage(grant, 604), false);
});

test("an exact ayah scope rejects unrelated surah content on the same page", () => {
  const exactGrant = { ...grant, ayahIds: ["36:1", "36:2"] };
  assert.equal(assignmentAllowsAyah(exactGrant, "36:1"), true);
  assert.equal(assignmentAllowsAyah(exactGrant, "37:1"), false);
});

test("changing assignment id cannot widen access", () => {
  assert.equal(studentMayResolveAssignmentQuran(student, grant, "assignment-other"), false);
});

test("another student cannot resolve the assignment", () => {
  assert.equal(studentMayResolveAssignmentQuran(
    { ...student, membershipID: "student-b" },
    grant,
    grant.assignmentId,
  ), false);
});

test("cross-tenant and inactive grants are rejected", () => {
  assert.equal(studentMayResolveAssignmentQuran(
    { ...student, institutionID: "institution-b" },
    grant,
    grant.assignmentId,
  ), false);
  assert.equal(studentMayResolveAssignmentQuran(
    student,
    { ...grant, status: "INACTIVE" },
    grant.assignmentId,
  ), false);
});

test("a scheduled plan page stays private until its study day", () => {
  const scheduled = { ...grant, availableAt: "2026-10-05T06:00:00.000Z" };
  assert.equal(studentMayResolveAssignmentQuran(
    student, scheduled, grant.assignmentId, new Date("2026-10-05T05:59:59.000Z")), false);
  assert.equal(assignmentAllowsPage(scheduled, 341, new Date("2026-10-05T05:59:59.000Z")), false);
  assert.equal(studentMayResolveAssignmentQuran(
    student, scheduled, grant.assignmentId, new Date("2026-10-05T06:00:00.000Z")), true);
});
