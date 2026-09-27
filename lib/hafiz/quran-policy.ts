export type QuranStudentContext = {
  role: "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";
  membershipID: string;
  institutionID: string;
};

export type AssignmentQuranGrant = {
  assignmentId: string;
  revisionNumber?: number;
  studentMembershipId: string;
  institutionId: string;
  editionId: string;
  pageNumbers: number[];
  ayahIds?: string[] | null;
  status: "ACTIVE" | "INACTIVE";
};

export function studentMayResolveAssignmentQuran(
  context: QuranStudentContext,
  grant: AssignmentQuranGrant | null,
  requestedAssignmentID: string,
): boolean {
  return context.role === "STUDENT"
    && grant !== null
    && grant.status === "ACTIVE"
    && grant.assignmentId === requestedAssignmentID
    && grant.studentMembershipId === context.membershipID
    && grant.institutionId === context.institutionID
    && grant.pageNumbers.length > 0
    && grant.pageNumbers.every(page => Number.isSafeInteger(page) && page > 0);
}

export function assignmentAllowsPage(grant: AssignmentQuranGrant, pageNumber: number): boolean {
  return grant.status === "ACTIVE" && grant.pageNumbers.includes(pageNumber);
}

export function assignmentAllowsAyah(grant: AssignmentQuranGrant, ayahID: string): boolean {
  return grant.status === "ACTIVE"
    && (grant.ayahIds == null || grant.ayahIds.includes(ayahID));
}
