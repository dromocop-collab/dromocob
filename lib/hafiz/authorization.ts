import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData, DocumentSnapshot } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const HAFIZ_ROLES = ["STUDENT", "TEACHER", "PARENT", "ADMIN"] as const;
export type HafizRole = (typeof HAFIZ_ROLES)[number];

export type HafizContext = {
  identity: DecodedIdToken;
  userID: string;
  membershipID: string;
  institutionID: string;
  role: HafizRole;
  isPlatformAdmin: boolean;
  session: {
    userID: string;
    displayName: string;
    email: string | null;
    accountStatus: "ACTIVE";
    activeMembership: {
      id: string;
      role: HafizRole;
      status: "ACTIVE";
      institution: {
        id: string;
        name: string;
        status: "ACTIVE";
      };
    };
  };
};

export type HafizFirebaseIdentity = {
  identity: DecodedIdToken;
  userID: string;
  email: string;
};

export class HafizAuthorizationError extends Error {
  constructor(
    readonly status: 401 | 403,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function requireHafizContext(
  request: NextRequest,
  allowedRoles: readonly HafizRole[] = HAFIZ_ROLES,
): Promise<HafizContext> {
  const token = extractBearerToken(request);
  const identity = await verifyIdentity(token);
  const firebaseUser = await adminAuth.getUser(identity.uid);

  if (firebaseUser.disabled) {
    throw new HafizAuthorizationError(403, "ACCOUNT_DISABLED", "Hesap devre dışı.");
  }

  const scopeSnapshot = await adminDb.collection("hafiz_user_scopes").doc(identity.uid).get();
  const scope = requireActiveDocument(scopeSnapshot, "NO_ACTIVE_MEMBERSHIP");
  const activeMembershipID = readRequiredString(scope, "activeMembershipId");

  const membershipSnapshot = await adminDb
    .collection("hafiz_memberships")
    .doc(activeMembershipID)
    .get();
  const membership = requireActiveDocument(membershipSnapshot, "NO_ACTIVE_MEMBERSHIP");

  if (readRequiredString(membership, "userId") !== identity.uid) {
    throw new HafizAuthorizationError(403, "MEMBERSHIP_MISMATCH", "Üyelik kullanıcıyla eşleşmiyor.");
  }

  const role = readRole(membership.role);
  if (!allowedRoles.includes(role)) {
    throw new HafizAuthorizationError(403, "ROLE_FORBIDDEN", "Rol bu işlem için yetkili değil.");
  }

  const institutionID = readRequiredString(membership, "institutionId");
  const institutionSnapshot = await adminDb
    .collection("hafiz_institutions")
    .doc(institutionID)
    .get();
  const institution = requireActiveDocument(institutionSnapshot, "INSTITUTION_INACTIVE");

  return {
    identity,
    userID: identity.uid,
    membershipID: membershipSnapshot.id,
    institutionID,
    role,
    isPlatformAdmin: identity.hafizPlatformAdmin === true,
    session: {
      userID: identity.uid,
      displayName: firebaseUser.displayName || firebaseUser.email || "Kullanıcı",
      email: firebaseUser.email || null,
      accountStatus: "ACTIVE",
      activeMembership: {
        id: membershipSnapshot.id,
        role,
        status: "ACTIVE",
        institution: {
          id: institutionSnapshot.id,
          name: readRequiredString(institution, "name"),
          status: "ACTIVE",
        },
      },
    },
  };
}

export async function requireFirebaseIdentity(
  request: NextRequest,
): Promise<HafizFirebaseIdentity> {
  const identity = await verifyIdentity(extractBearerToken(request));
  const firebaseUser = await adminAuth.getUser(identity.uid);
  const email = firebaseUser.email?.trim().toLowerCase();
  if (!email) {
    throw new HafizAuthorizationError(403, "EMAIL_REQUIRED", "Hesap için e-posta gerekli.");
  }
  return { identity, userID: identity.uid, email };
}

export function requireInstitutionAccess(
  context: HafizContext,
  requestedInstitutionID?: string | null,
): string {
  const institutionID = requestedInstitutionID?.trim() || context.institutionID;
  if (institutionID !== context.institutionID && !context.isPlatformAdmin) {
    throw new HafizAuthorizationError(403, "TENANT_FORBIDDEN", "Başka bir kuruma erişilemez.");
  }
  return institutionID;
}

function extractBearerToken(request: NextRequest): string {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    throw new HafizAuthorizationError(401, "AUTH_REQUIRED", "Kimlik doğrulaması gerekli.");
  }
  const token = authorization.slice(7).trim();
  if (!token) {
    throw new HafizAuthorizationError(401, "AUTH_REQUIRED", "Kimlik doğrulaması gerekli.");
  }
  return token;
}

async function verifyIdentity(token: string): Promise<DecodedIdToken> {
  try {
    return await adminAuth.verifyIdToken(token, true);
  } catch {
    throw new HafizAuthorizationError(401, "SESSION_EXPIRED", "Oturum geçersiz veya süresi dolmuş.");
  }
}

function requireActiveDocument(
  snapshot: DocumentSnapshot,
  errorCode: string,
): DocumentData {
  if (!snapshot.exists || snapshot.data()?.status !== "ACTIVE") {
    throw new HafizAuthorizationError(403, errorCode, "Aktif yetki kapsamı bulunamadı.");
  }
  return snapshot.data() as DocumentData;
}

function readRequiredString(data: DocumentData, field: string): string {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new HafizAuthorizationError(403, "INVALID_AUTHORIZATION_DATA", "Yetki verisi geçersiz.");
  }
  return value;
}

function readRole(value: unknown): HafizRole {
  if (typeof value !== "string" || !HAFIZ_ROLES.includes(value as HafizRole)) {
    throw new HafizAuthorizationError(403, "INVALID_ROLE", "Geçerli rol bulunamadı.");
  }
  return value as HafizRole;
}
