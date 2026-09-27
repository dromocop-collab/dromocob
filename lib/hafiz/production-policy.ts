import type { HafizRole } from "./authorization";

export const ACCOUNT_STATUSES = ["ACTIVE", "DISABLED", "DELETED"] as const;
export type ManagedAccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type ResourceAuthorizationInput = {
  role: HafizRole;
  membershipID: string;
  institutionID: string;
  resourceInstitutionID: string;
  ownerMembershipID?: string | null;
  linkedStudentMembershipIDs?: readonly string[];
  requestedStudentMembershipID?: string | null;
  isPlatformAdmin?: boolean;
};

/**
 * Defense-in-depth policy used by production security tests and API repositories.
 * A role match never bypasses tenant or ownership/link checks.
 */
export function mayAccessScopedResource(input: ResourceAuthorizationInput): boolean {
  if (input.resourceInstitutionID !== input.institutionID && !input.isPlatformAdmin) return false;
  if (input.role === "ADMIN") return input.resourceInstitutionID === input.institutionID
    || input.isPlatformAdmin === true;
  if (input.role === "TEACHER") return input.ownerMembershipID === input.membershipID;
  if (input.role === "STUDENT") return input.requestedStudentMembershipID === input.membershipID;
  return input.requestedStudentMembershipID != null
    && (input.linkedStudentMembershipIDs || []).includes(input.requestedStudentMembershipID);
}

export function mayMutateAsRole(role: HafizRole, operation: "STUDENT_PROGRESS" | "TEACHER_REVIEW" | "ADMIN_CONTROL") {
  if (operation === "STUDENT_PROGRESS") return role === "STUDENT";
  if (operation === "TEACHER_REVIEW") return role === "TEACHER";
  return role === "ADMIN";
}

export function parseManagedAccountStatus(value: unknown): ManagedAccountStatus {
  if (typeof value === "string" && ACCOUNT_STATUSES.includes(value as ManagedAccountStatus)) {
    return value as ManagedAccountStatus;
  }
  throw new Error("INVALID_ACCOUNT_STATUS");
}

export function parsePageLimit(value: string | null, fallback = 25, maximum = 50): number {
  const parsed = Number(value || fallback);
  return Number.isSafeInteger(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
}

export function safeAuditMetadata(value: unknown): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>).slice(0, 20)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(key)) continue;
    if (raw === null || typeof raw === "boolean" || typeof raw === "number") output[key] = raw;
    else if (typeof raw === "string") output[key] = raw.slice(0, 300);
  }
  return output;
}

export function publicPushPayload(input: { notificationID: string; event: string; role: HafizRole }) {
  // No student names, Quran text, notes, assignment contents or signed file URLs in APNs data.
  return { notificationId: input.notificationID, event: input.event, role: input.role };
}

export function lockScreenSafeBody(event: string, storedBody: string): string {
  if (event === "TEACHER_SENT_MESSAGE") return "Öğretmeninden yeni bir mesaj var. Uygulamayı açarak görüntüle.";
  if (event === "PARENT_VISIBLE_TEACHER_NOTE") return "Yeni bir öğretmen notu var. Uygulamayı açarak görüntüle.";
  return storedBody.slice(0, 240);
}
