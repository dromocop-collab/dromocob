import "server-only";

import { FieldPath, FieldValue, type Query } from "firebase-admin/firestore";

import {
  HafizAuthorizationError,
  type HafizContext,
  type HafizFirebaseIdentity,
  requireInstitutionAccess,
} from "./authorization";
import { parsePageLimit, safeAuditMetadata } from "./production-policy";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const REGISTRATION_ROLES = ["STUDENT", "TEACHER", "PARENT"] as const;
type RegistrationRole = (typeof REGISTRATION_ROLES)[number];
type RegistrationDecision = "APPROVE" | "REJECT";

const profileCollections: Record<RegistrationRole, string> = {
  STUDENT: "hafiz_student_profiles",
  TEACHER: "hafiz_teacher_profiles",
  PARENT: "hafiz_parent_profiles",
};

export async function submitRegistrationRequest(
  auth: HafizFirebaseIdentity,
  body: unknown,
) {
  const payload = asObject(body);
  const displayName = requiredText(payload.displayName, "Ad soyad", 2, 120);
  const institutionID = requiredID(payload.institutionCode, "Kurum kodu");
  const requestedRole = registrationRole(payload.requestedRole);
  const requestReference = adminDb.collection("hafiz_registration_requests").doc(auth.userID);
  const institutionReference = adminDb.collection("hafiz_institutions").doc(institutionID);
  const scopeReference = adminDb.collection("hafiz_user_scopes").doc(auth.userID);

  await adminDb.runTransaction(async transaction => {
    const [institution, existing, scope] = await Promise.all([
      transaction.get(institutionReference),
      transaction.get(requestReference),
      transaction.get(scopeReference),
    ]);
    if (!institution.exists || institution.data()?.status !== "ACTIVE") {
      throw invalidInput("Kurum kodu geçersiz veya kurum aktif değil.");
    }
    if (scope.exists) {
      throw new HafizAuthorizationError(403, "ACCOUNT_ALREADY_PROVISIONED", "Hesap zaten tanımlı.");
    }
    if (existing.data()?.status === "APPROVED") {
      throw new HafizAuthorizationError(403, "REGISTRATION_ALREADY_APPROVED", "Başvuru zaten onaylandı.");
    }

    transaction.set(requestReference, {
      userId: auth.userID,
      email: auth.email,
      displayName,
      nameNormalized: normalize(displayName),
      institutionId: institutionID,
      requestedRole,
      status: "PENDING",
      createdAt: existing.exists ? existing.data()?.createdAt : FieldValue.serverTimestamp(),
      createdBy: auth.userID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: auth.userID,
    });
    transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
      institutionId: institutionID,
      actorUserId: auth.userID,
      actorMembershipId: "registration",
      action: existing.exists ? "REGISTRATION_RESUBMITTED" : "REGISTRATION_SUBMITTED",
      resourceType: "registrationRequest",
      resourceId: auth.userID,
      metadata: safeAuditMetadata({ requestedRole }),
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  await adminAuth.updateUser(auth.userID, { displayName });
  return { ok: true, status: "PENDING" as const };
}

export async function getRegistrationStatus(auth: HafizFirebaseIdentity) {
  const snapshot = await adminDb.collection("hafiz_registration_requests").doc(auth.userID).get();
  if (!snapshot.exists) throw notFound();
  const data = snapshot.data() || {};
  return {
    status: registrationStatus(String(data.status || "PENDING")),
    displayName: String(data.displayName || ""),
    requestedRole: String(data.requestedRole || "STUDENT"),
  };
}

export async function listRegistrationRequests(
  context: HafizContext,
  searchParams: URLSearchParams,
) {
  requireAdmin(context);
  const institutionID = requireInstitutionAccess(context, searchParams.get("institutionId"));
  const status = registrationStatus(searchParams.get("status") || "PENDING");
  const limit = parsePageLimit(searchParams.get("limit"));
  const cursor = searchParams.get("cursor")?.trim() || null;
  let query: Query = adminDb.collection("hafiz_registration_requests")
    .where("institutionId", "==", institutionID)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc");
  if (cursor) {
    const cursorSnapshot = await adminDb.collection("hafiz_registration_requests").doc(cursor).get();
    if (cursorSnapshot.exists && cursorSnapshot.data()?.institutionId === institutionID) {
      query = query.startAfter(cursorSnapshot);
    }
  }
  const snapshot = await query.limit(limit + 1).get();
  const page = snapshot.docs.slice(0, limit);
  return {
    items: page.map(document => {
      const data = document.data();
      return {
        id: document.id,
        email: String(data.email || ""),
        displayName: String(data.displayName || ""),
        institutionId: String(data.institutionId || ""),
        requestedRole: String(data.requestedRole || "STUDENT"),
        status: String(data.status || "PENDING"),
        createdAt: timestampText(data.createdAt),
      };
    }),
    nextCursor: snapshot.docs.length > limit ? page.at(-1)?.id ?? null : null,
  };
}

export async function reviewRegistrationRequest(context: HafizContext, body: unknown) {
  requireAdmin(context);
  const payload = asObject(body);
  const requestID = requiredID(payload.requestId, "Başvuru");
  const decision = registrationDecision(payload.decision);
  const requestReference = adminDb.collection("hafiz_registration_requests").doc(requestID);
  const initial = await requestReference.get();
  if (!initial.exists) throw notFound();
  const initialData = initial.data() || {};
  const institutionID = requireInstitutionAccess(context, requiredID(initialData.institutionId, "Kurum"));

  if (initialData.status === "APPROVED" && decision === "APPROVE") {
    await adminAuth.updateUser(requestID, { disabled: false });
    return { ok: true, status: "APPROVED" as const };
  }
  if (initialData.status !== "PENDING") {
    throw invalidInput("Yalnızca bekleyen başvurular değerlendirilebilir.");
  }

  const role = registrationRole(initialData.requestedRole);
  const membershipID = `${institutionID}_${requestID}_${role.toLowerCase()}`;
  const membershipReference = adminDb.collection("hafiz_memberships").doc(membershipID);
  const profileReference = adminDb.collection(profileCollections[role]).doc(membershipID);
  const scopeReference = adminDb.collection("hafiz_user_scopes").doc(requestID);

  await adminDb.runTransaction(async transaction => {
    const current = await transaction.get(requestReference);
    if (!current.exists || current.data()?.status !== "PENDING") {
      throw invalidInput("Başvuru artık beklemede değil.");
    }
    if (decision === "APPROVE") {
      const common = {
        institutionId: institutionID,
        membershipId: membershipID,
        userId: requestID,
        status: "ACTIVE",
        createdAt: FieldValue.serverTimestamp(),
        createdBy: context.membershipID,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.membershipID,
      };
      transaction.create(membershipReference, { ...common, role });
      transaction.create(profileReference, {
        ...common,
        displayName: requiredText(initialData.displayName, "Ad soyad", 2, 120),
        nameNormalized: normalize(String(initialData.displayName)),
        email: requiredText(initialData.email, "E-posta", 5, 320),
      });
      transaction.create(scopeReference, {
        status: "ACTIVE",
        activeMembershipId: membershipID,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: context.membershipID,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.membershipID,
      });
    }
    transaction.update(requestReference, {
      status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: context.membershipID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
      institutionId: institutionID,
      actorUserId: context.userID,
      actorMembershipId: context.membershipID,
      action: decision === "APPROVE" ? "REGISTRATION_APPROVED" : "REGISTRATION_REJECTED",
      resourceType: "registrationRequest",
      resourceId: requestID,
      metadata: safeAuditMetadata({ requestedRole: role, membershipId: membershipID }),
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  if (decision === "APPROVE") {
    await adminAuth.updateUser(requestID, { disabled: false });
  }
  return { ok: true, status: decision === "APPROVE" ? "APPROVED" : "REJECTED" };
}

function requireAdmin(context: HafizContext) {
  if (context.role !== "ADMIN") {
    throw new HafizAuthorizationError(403, "ROLE_FORBIDDEN", "Yönetici yetkisi gerekli.");
  }
}

function registrationRole(value: unknown): RegistrationRole {
  if (typeof value !== "string" || !REGISTRATION_ROLES.includes(value as RegistrationRole)) {
    throw invalidInput("Başvuru rolü geçersiz.");
  }
  return value as RegistrationRole;
}

function registrationDecision(value: unknown): RegistrationDecision {
  if (value !== "APPROVE" && value !== "REJECT") throw invalidInput("Başvuru kararı geçersiz.");
  return value;
}

function registrationStatus(value: string): "PENDING" | "APPROVED" | "REJECTED" {
  if (!["PENDING", "APPROVED", "REJECTED"].includes(value)) throw invalidInput("Başvuru durumu geçersiz.");
  return value as "PENDING" | "APPROVED" | "REJECTED";
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidInput("Geçersiz istek.");
  return value as Record<string, unknown>;
}

function requiredText(value: unknown, label: string, minimum: number, maximum: number): string {
  if (typeof value !== "string") throw invalidInput(`${label} gerekli.`);
  const text = value.trim();
  if (text.length < minimum || text.length > maximum) throw invalidInput(`${label} geçersiz.`);
  return text;
}

function requiredID(value: unknown, label: string): string {
  const id = requiredText(value, label, 2, 200);
  if (id.includes("/")) throw invalidInput(`${label} geçersiz.`);
  return id;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function timestampText(value: unknown): string | null {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate(): Date }).toDate().toISOString();
  }
  return null;
}

function invalidInput(message: string) {
  return new HafizAuthorizationError(403, "INVALID_INPUT", message);
}

function notFound() {
  return new HafizAuthorizationError(403, "NOT_FOUND", "Başvuru bulunamadı.");
}
