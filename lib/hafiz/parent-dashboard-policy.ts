import type { ParentStudentLinkRecord, RelationshipContext } from "./relationship-policy.ts";
import { parentMayReadStudent } from "./relationship-policy.ts";

export type ParentNoteRecord = {
  institutionId?: string;
  studentMembershipId?: string;
  visibility?: string;
  assignmentId?: string;
  decision?: string;
  shortcut?: string | null;
  note?: string | null;
  createdAt?: unknown;
};

export function parentMayReadDashboard(
  context: RelationshipContext,
  link: ParentStudentLinkRecord | null,
  requestedStudentMembershipID: string,
) {
  return parentMayReadStudent(context, link, requestedStudentMembershipID);
}

export function minimalParentQuranScope(value: unknown) {
  const scope = asObject(value);
  const startPage = positiveInteger(scope.startPage);
  const endPage = positiveInteger(scope.endPage);
  if (endPage < startPage) throw new Error("INVALID_PARENT_QURAN_SCOPE");
  return { startPage, endPage };
}

export function parentVisibleNotes(
  records: ParentNoteRecord[],
  institutionID: string,
  studentMembershipID: string,
) {
  return records.filter(record =>
    record.institutionId === institutionID
    && record.studentMembershipId === studentMembershipID
    && record.visibility === "PARENT_VISIBLE"
  );
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_PARENT_QURAN_SCOPE");
  }
  return value as Record<string, unknown>;
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("INVALID_PARENT_QURAN_SCOPE");
  return number;
}
