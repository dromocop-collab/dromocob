import assert from "node:assert/strict";
import test from "node:test";

import {
  mayReadClassMembership,
  parentMayReadStudent,
  studentMayReadStudent,
  teacherMayManageClass,
  teacherMayReadStudent,
  teacherMayTransferStudent,
  type ClassMembershipRecord,
  type ParentStudentLinkRecord,
  type RelationshipContext,
  type TeacherClassAssignmentRecord,
} from "../lib/hafiz/relationship-policy.ts";

const parent: RelationshipContext = {
  membershipID: "parent-a",
  institutionID: "institution-a",
  role: "PARENT",
};
const teacher: RelationshipContext = {
  membershipID: "teacher-a",
  institutionID: "institution-a",
  role: "TEACHER",
};
const student: RelationshipContext = {
  membershipID: "student-a",
  institutionID: "institution-a",
  role: "STUDENT",
};

test("parent cannot read another student's data", () => {
  const link: ParentStudentLinkRecord = {
    institutionId: "institution-a",
    parentMembershipId: "parent-a",
    studentMembershipId: "student-a",
    status: "ACTIVE",
  };
  assert.equal(parentMayReadStudent(parent, link, "student-b"), false);
  assert.equal(parentMayReadStudent(parent, { ...link, status: "INACTIVE" }, "student-a"), false);
});

test("teacher cannot cross an institution boundary", () => {
  const assignment: TeacherClassAssignmentRecord = {
    institutionId: "institution-b",
    teacherMembershipId: "teacher-a",
    classId: "class-a",
    status: "ACTIVE",
  };
  const membership: ClassMembershipRecord = {
    institutionId: "institution-b",
    classId: "class-a",
    studentMembershipId: "student-a",
    status: "ACTIVE",
  };
  assert.equal(teacherMayReadStudent(teacher, assignment, membership, "student-a"), false);
});

test("student cannot read another student", () => {
  assert.equal(studentMayReadStudent(student, "student-a"), true);
  assert.equal(studentMayReadStudent(student, "student-b"), false);
});

test("unauthorized class membership is denied", () => {
  const assignment: TeacherClassAssignmentRecord = {
    institutionId: "institution-a",
    teacherMembershipId: "teacher-a",
    classId: "class-a",
    status: "ACTIVE",
  };
  const otherClassMembership: ClassMembershipRecord = {
    institutionId: "institution-a",
    classId: "class-b",
    studentMembershipId: "student-a",
    status: "ACTIVE",
  };
  assert.equal(mayReadClassMembership(teacher, assignment, otherClassMembership), false);
});

test("teacher manages only explicitly assigned classes", () => {
  const assignment: TeacherClassAssignmentRecord = {
    institutionId: "institution-a", teacherMembershipId: "teacher-a",
    classId: "class-a", status: "ACTIVE",
  };
  assert.equal(teacherMayManageClass(teacher, assignment, "class-a"), true);
  assert.equal(teacherMayManageClass(teacher, assignment, "class-b"), false);
  assert.equal(teacherMayManageClass(teacher, { ...assignment, status: "INACTIVE" }, "class-a"), false);
});

test("student transfer requires source and target class authority", () => {
  const source: TeacherClassAssignmentRecord = {
    institutionId: "institution-a", teacherMembershipId: "teacher-a",
    classId: "class-a", status: "ACTIVE",
  };
  const target: TeacherClassAssignmentRecord = { ...source, classId: "class-b" };
  const membership: ClassMembershipRecord = {
    institutionId: "institution-a", classId: "class-a",
    studentMembershipId: "student-a", status: "ACTIVE",
  };
  assert.equal(teacherMayTransferStudent(
    teacher, source, target, membership, "student-a", "class-a", "class-b",
  ), true);
  assert.equal(teacherMayTransferStudent(
    teacher, source, { ...target, teacherMembershipId: "teacher-b" }, membership,
    "student-a", "class-a", "class-b",
  ), false);
  assert.equal(teacherMayTransferStudent(
    teacher, source, target, membership, "student-a", "class-a", "class-a",
  ), false);
});
