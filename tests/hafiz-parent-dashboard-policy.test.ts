import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  minimalParentQuranScope,
  parentMayReadDashboard,
  parentVisibleNotes,
} from "../lib/hafiz/parent-dashboard-policy.ts";
import type {
  ParentStudentLinkRecord,
  RelationshipContext,
} from "../lib/hafiz/relationship-policy.ts";

const parentA: RelationshipContext = {
  membershipID: "parent-a",
  institutionID: "institution-a",
  role: "PARENT",
};
const activeLink: ParentStudentLinkRecord = {
  institutionId: "institution-a",
  parentMembershipId: "parent-a",
  studentMembershipId: "student-a",
  status: "ACTIVE",
};

test("Parent A may read own linked child", () => {
  assert.equal(parentMayReadDashboard(parentA, activeLink, "student-a"), true);
});

test("Parent A may not read an unrelated child", () => {
  assert.equal(parentMayReadDashboard(parentA, activeLink, "student-b"), false);
  assert.equal(parentMayReadDashboard(parentA, null, "student-b"), false);
});

test("inactive parent-student link is denied", () => {
  assert.equal(parentMayReadDashboard(parentA, { ...activeLink, status: "INACTIVE" }, "student-a"), false);
});

test("direct API-style attempt with a non-parent role is denied", () => {
  assert.equal(parentMayReadDashboard({ ...parentA, role: "STUDENT" }, activeLink, "student-a"), false);
  assert.equal(parentMayReadDashboard({ ...parentA, membershipID: "parent-b" }, activeLink, "student-a"), false);
  assert.equal(parentMayReadDashboard({ ...parentA, institutionID: "institution-b" }, activeLink, "student-a"), false);
});

test("parent route remains read-only and mutation/Quran routes exclude PARENT", () => {
  const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const dashboard = source("app/api/hafiz/parent/students/[studentMembershipId]/dashboard/route.ts");
  const progress = source("app/api/hafiz/student/assignments/[assignmentId]/progress/route.ts");
  const publish = source("app/api/hafiz/teacher/assignments/[assignmentId]/publish/route.ts");
  const quran = source("app/api/hafiz/quran/editions/[editionId]/content/route.ts");
  assert.match(dashboard, /requireHafizContext\(request, \["PARENT"\]\)/);
  assert.doesNotMatch(dashboard, /export async function (POST|PATCH|PUT|DELETE)/);
  assert.match(progress, /requireHafizContext\(request, \["STUDENT"\]\)/);
  assert.match(publish, /requireHafizContext\(request, \["TEACHER"\]\)/);
  assert.match(quran, /requireHafizContext\(request, \["TEACHER", "ADMIN"\]\)/);
});

test("parent response exposes only minimal Quran page metadata", () => {
  const value = minimalParentQuranScope({
    startPage: 341,
    endPage: 343,
    editionId: "edition-private",
    ayahIds: ["2:1"],
    text: "must not leak",
  });
  assert.deepEqual(value, { startPage: 341, endPage: 343 });
  assert.equal("editionId" in value, false);
  assert.equal("ayahIds" in value, false);
  assert.equal("text" in value, false);
});

test("private and student-visible notes are never returned to parent", () => {
  const common = {
    institutionId: "institution-a",
    studentMembershipId: "student-a",
    assignmentId: "assignment-a",
  };
  const notes = parentVisibleNotes([
    { ...common, visibility: "PRIVATE_TEACHER", note: "private" },
    { ...common, visibility: "STUDENT_VISIBLE", note: "student" },
    { ...common, visibility: "PARENT_VISIBLE", note: "parent" },
    { ...common, institutionId: "institution-b", visibility: "PARENT_VISIBLE", note: "other tenant" },
  ], "institution-a", "student-a");
  assert.deepEqual(notes.map(item => item.note), ["parent"]);
});
