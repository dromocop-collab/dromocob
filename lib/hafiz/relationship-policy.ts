export type RelationshipRole = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

export type RelationshipContext = {
  membershipID: string;
  institutionID: string;
  role: RelationshipRole;
};

export type ParentStudentLinkRecord = {
  institutionId: string;
  parentMembershipId: string;
  studentMembershipId: string;
  status: "ACTIVE" | "INACTIVE";
};

export type TeacherClassAssignmentRecord = {
  institutionId: string;
  teacherMembershipId: string;
  classId: string;
  status: "ACTIVE" | "INACTIVE";
};

export type ClassMembershipRecord = {
  institutionId: string;
  classId: string;
  studentMembershipId: string;
  status: "ACTIVE" | "INACTIVE";
};

export function parentMayReadStudent(
  context: RelationshipContext,
  link: ParentStudentLinkRecord | null,
  requestedStudentMembershipID: string,
): boolean {
  return context.role === "PARENT"
    && link !== null
    && link.status === "ACTIVE"
    && link.institutionId === context.institutionID
    && link.parentMembershipId === context.membershipID
    && link.studentMembershipId === requestedStudentMembershipID;
}

export function teacherMayReadStudent(
  context: RelationshipContext,
  assignment: TeacherClassAssignmentRecord | null,
  membership: ClassMembershipRecord | null,
  requestedStudentMembershipID: string,
): boolean {
  return context.role === "TEACHER"
    && assignment !== null
    && membership !== null
    && assignment.status === "ACTIVE"
    && membership.status === "ACTIVE"
    && assignment.institutionId === context.institutionID
    && membership.institutionId === context.institutionID
    && assignment.teacherMembershipId === context.membershipID
    && assignment.classId === membership.classId
    && membership.studentMembershipId === requestedStudentMembershipID;
}

export function studentMayReadStudent(
  context: RelationshipContext,
  requestedStudentMembershipID: string,
): boolean {
  return context.role === "STUDENT"
    && context.membershipID === requestedStudentMembershipID;
}

export function mayReadClassMembership(
  context: RelationshipContext,
  assignment: TeacherClassAssignmentRecord | null,
  membership: ClassMembershipRecord,
): boolean {
  if (membership.institutionId !== context.institutionID || membership.status !== "ACTIVE") {
    return false;
  }
  if (context.role === "ADMIN") return true;
  return context.role === "TEACHER"
    && assignment !== null
    && assignment.status === "ACTIVE"
    && assignment.institutionId === context.institutionID
    && assignment.teacherMembershipId === context.membershipID
    && assignment.classId === membership.classId;
}
