import type { AssignmentTarget } from "./assignment-schema";

export type AssignmentTeacherContext = {
  role: "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";
  membershipID: string;
  institutionID: string;
};

export type AuthorizedClass = {
  classId: string;
  institutionId: string;
  teacherMembershipId: string;
  status: "ACTIVE" | "INACTIVE";
};

export function teacherMayTargetClass(
  context: AssignmentTeacherContext,
  assignment: AuthorizedClass | null,
  requestedClassID: string,
): boolean {
  return context.role === "TEACHER"
    && assignment !== null
    && assignment.status === "ACTIVE"
    && assignment.classId === requestedClassID
    && assignment.teacherMembershipId === context.membershipID
    && assignment.institutionId === context.institutionID;
}

export function targetContainsOnlyAuthorizedStudents(
  target: AssignmentTarget,
  authorizedStudentIDs: ReadonlySet<string>,
): boolean {
  return target.studentMembershipIds.length > 0
    && target.studentMembershipIds.every(id => authorizedStudentIDs.has(id));
}

export function recipientKeepsPublishedRevision(
  existingRevisionNumber: number | null,
  newlyPublishedRevisionNumber: number,
): number {
  return existingRevisionNumber ?? newlyPublishedRevisionNumber;
}

export function mayTransitionAssignmentStatus(from: string, to: string): boolean {
  const allowed: Record<string, readonly string[]> = {
    DRAFT: ["PUBLISHED", "CANCELLED"],
    PUBLISHED: ["ACTIVE", "ARCHIVED", "CANCELLED"],
    ACTIVE: ["COMPLETED", "ARCHIVED", "CANCELLED"],
    COMPLETED: ["ARCHIVED"],
    ARCHIVED: [],
    CANCELLED: ["ARCHIVED"],
  };
  return allowed[from]?.includes(to) === true;
}
