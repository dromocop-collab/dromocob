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
  availableAt?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export function studentMayResolveAssignmentQuran(
  context: QuranStudentContext,
  grant: AssignmentQuranGrant | null,
  requestedAssignmentID: string,
  now = new Date(),
): boolean {
  return context.role === "STUDENT"
    && grant !== null
    && grant.status === "ACTIVE"
    && grant.assignmentId === requestedAssignmentID
    && grant.studentMembershipId === context.membershipID
    && grant.institutionId === context.institutionID
    && grantIsAvailable(grant, now)
    && grant.pageNumbers.length > 0
    && grant.pageNumbers.every(page => Number.isSafeInteger(page) && page > 0);
}

export function assignmentAllowsPage(
  grant: AssignmentQuranGrant,
  pageNumber: number,
  now = new Date(),
): boolean {
  return grant.status === "ACTIVE" && grantIsAvailable(grant, now) && grant.pageNumbers.includes(pageNumber);
}

export function assignmentAllowsAyah(grant: AssignmentQuranGrant, ayahID: string, now = new Date()): boolean {
  return grant.status === "ACTIVE"
    && grantIsAvailable(grant, now)
    && (grant.ayahIds == null || grant.ayahIds.includes(ayahID));
}

function grantIsAvailable(grant: AssignmentQuranGrant, now: Date) {
  if (grant.availableAt == null) return true;
  const availableAt = new Date(grant.availableAt);
  return !Number.isNaN(availableAt.getTime()) && availableAt.getTime() <= now.getTime();
}
