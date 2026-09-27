import "server-only";

import { FieldPath, FieldValue, type Query } from "firebase-admin/firestore";

import {
  HafizAuthorizationError,
  type HafizContext,
  type HafizRole,
  requireInstitutionAccess,
} from "@/lib/hafiz/authorization";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export type DirectoryResource = "institutions" | "teachers" | "students" | "parents" | "classes";

type PersonResource = "teachers" | "students" | "parents";
type DirectoryFilterStatus = "ACTIVE" | "INACTIVE" | "DISABLED" | "DELETED";
type MutableDirectoryStatus = "ACTIVE" | "INACTIVE";

const personConfiguration: Record<PersonResource, { collection: string; role: HafizRole }> = {
  teachers: { collection: "hafiz_teacher_profiles", role: "TEACHER" },
  students: { collection: "hafiz_student_profiles", role: "STUDENT" },
  parents: { collection: "hafiz_parent_profiles", role: "PARENT" },
};

export async function listDirectory(
  context: HafizContext,
  resource: DirectoryResource,
  searchParams: URLSearchParams,
) {
  requireAdmin(context);
  if (resource === "institutions") return listInstitutions(context, searchParams);

  const institutionID = requireInstitutionAccess(context, searchParams.get("institutionId"));
  const limit = parseLimit(searchParams.get("limit"));
  const status = parseOptionalStatus(searchParams.get("status"));
  const search = normalize(searchParams.get("search") || "");
  const cursor = decodeCursor(searchParams.get("cursor"));
  const collection = resource === "classes"
    ? "hafiz_classes"
    : personConfiguration[resource].collection;
  const sortField = "nameNormalized";

  let query: Query = adminDb.collection(collection)
    .where("institutionId", "==", institutionID);
  if (status) query = query.where("status", "==", status);
  if (search) {
    query = query
      .where(sortField, ">=", search)
      .where(sortField, "<=", `${search}\uf8ff`);
  }
  query = query.orderBy(sortField).orderBy(FieldPath.documentId());
  if (cursor) query = query.startAfter(cursor.sort, cursor.id);

  const snapshot = await query.limit(limit + 1).get();
  const page = snapshot.docs.slice(0, limit);
  const last = page.at(-1);
  return {
    items: page.map(toPublicRecord),
    nextCursor: snapshot.docs.length > limit && last
      ? encodeCursor(String(last.data()[sortField] || ""), last.id)
      : null,
  };
}

export async function createDirectoryRecord(
  context: HafizContext,
  resource: DirectoryResource,
  body: unknown,
) {
  requireAdmin(context);
  const payload = asObject(body);
  if (resource === "institutions") return createInstitution(context, payload);

  const institutionID = requireInstitutionAccess(context, optionalString(payload.institutionId));
  if (resource === "classes") {
    return createClass(context, institutionID, payload);
  }
  return createPerson(context, institutionID, resource, payload);
}

export async function updateDirectoryRecord(
  context: HafizContext,
  resource: DirectoryResource,
  id: string,
  body: unknown,
) {
  requireAdmin(context);
  const payload = asObject(body);
  const collection = resource === "institutions"
    ? "hafiz_institutions"
    : resource === "classes"
      ? "hafiz_classes"
      : personConfiguration[resource].collection;
  const reference = adminDb.collection(collection).doc(id);

  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) throw notFound();
    const data = snapshot.data() || {};
    const institutionID = resource === "institutions" ? snapshot.id : requiredString(data.institutionId);
    requireInstitutionAccess(context, institutionID);

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    };
    if (payload.name !== undefined || payload.displayName !== undefined) {
      const name = requiredText(payload.displayName ?? payload.name, "Ad", 2, 120);
      const field = resource === "teachers" || resource === "students" || resource === "parents"
        ? "displayName"
        : "name";
      updates[field] = name;
      updates.nameNormalized = normalize(name);
    }
    if (payload.status !== undefined) {
      const status = parseMutableStatus(payload.status);
      if (resource === "institutions" && !context.isPlatformAdmin) {
        throw new HafizAuthorizationError(403, "PLATFORM_ADMIN_REQUIRED", "Kurum durumu değiştirilemez.");
      }
      updates.status = status;
      if (resource === "teachers" || resource === "students" || resource === "parents") {
        transaction.update(adminDb.collection("hafiz_memberships").doc(id), {
          status: status === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: context.membershipID,
        });
      }
    }

    transaction.update(reference, updates);
    writeAudit(transaction, context, institutionID, `DIRECTORY_${resource.toUpperCase()}_UPDATED`, resource, id);
  });
  return { ok: true };
}

function requireAdmin(context: HafizContext) {
  if (context.role !== "ADMIN") {
    throw new HafizAuthorizationError(403, "ROLE_FORBIDDEN", "Yönetici yetkisi gerekli.");
  }
}

async function listInstitutions(context: HafizContext, searchParams: URLSearchParams) {
  if (!context.isPlatformAdmin) {
    const snapshot = await adminDb.collection("hafiz_institutions").doc(context.institutionID).get();
    return { items: snapshot.exists ? [toPublicRecord(snapshot)] : [], nextCursor: null };
  }
  const limit = parseLimit(searchParams.get("limit"));
  const search = normalize(searchParams.get("search") || "");
  const status = parseOptionalStatus(searchParams.get("status"));
  const cursor = decodeCursor(searchParams.get("cursor"));
  let query: Query = adminDb.collection("hafiz_institutions");
  if (status) query = query.where("status", "==", status);
  if (search) {
    query = query.where("nameNormalized", ">=", search).where("nameNormalized", "<=", `${search}\uf8ff`);
  }
  query = query.orderBy("nameNormalized").orderBy(FieldPath.documentId());
  if (cursor) query = query.startAfter(cursor.sort, cursor.id);
  query = query.limit(limit + 1);
  const snapshot = await query.get();
  const page = snapshot.docs.slice(0, limit);
  const last = page.at(-1);
  return {
    items: page.map(toPublicRecord),
    nextCursor: snapshot.docs.length > limit && last
      ? encodeCursor(String(last.data().nameNormalized || ""), last.id)
      : null,
  };
}

async function createInstitution(context: HafizContext, payload: Record<string, unknown>) {
  if (!context.isPlatformAdmin) {
    throw new HafizAuthorizationError(403, "PLATFORM_ADMIN_REQUIRED", "Kurum oluşturma yetkisi gerekli.");
  }
  const name = requiredText(payload.name, "Kurum adı", 2, 120);
  const reference = adminDb.collection("hafiz_institutions").doc();
  await adminDb.runTransaction(async transaction => {
    transaction.create(reference, {
      name,
      nameNormalized: normalize(name),
      status: "ACTIVE",
      createdAt: FieldValue.serverTimestamp(),
      createdBy: context.membershipID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    writeAudit(transaction, context, reference.id, "INSTITUTION_CREATED", "institution", reference.id);
  });
  return { id: reference.id };
}

async function createClass(
  context: HafizContext,
  institutionID: string,
  payload: Record<string, unknown>,
) {
  const name = requiredText(payload.name, "Sınıf adı", 2, 120);
  const reference = adminDb.collection("hafiz_classes").doc();
  await adminDb.runTransaction(async transaction => {
    transaction.create(reference, {
      institutionId: institutionID,
      name,
      nameNormalized: normalize(name),
      academicPeriod: optionalString(payload.academicPeriod),
      status: "ACTIVE",
      createdAt: FieldValue.serverTimestamp(),
      createdBy: context.membershipID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    writeAudit(transaction, context, institutionID, "CLASS_CREATED", "class", reference.id);
  });
  return { id: reference.id };
}

async function createPerson(
  context: HafizContext,
  institutionID: string,
  resource: PersonResource,
  payload: Record<string, unknown>,
) {
  const email = requiredText(payload.email, "E-posta", 5, 320).toLowerCase();
  const displayName = requiredText(payload.displayName, "Ad soyad", 2, 120);
  const config = personConfiguration[resource];
  let createdFirebaseUser = false;
  let user;
  try {
    user = await adminAuth.getUserByEmail(email);
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
    user = await adminAuth.createUser({ email, displayName, disabled: false });
    createdFirebaseUser = true;
  }

  const membershipID = `${institutionID}_${user.uid}_${config.role.toLowerCase()}`;
  const membershipReference = adminDb.collection("hafiz_memberships").doc(membershipID);
  const profileReference = adminDb.collection(config.collection).doc(membershipID);
  const scopeReference = adminDb.collection("hafiz_user_scopes").doc(user.uid);

  try {
    await adminDb.runTransaction(async transaction => {
      const [membershipSnapshot, scopeSnapshot] = await Promise.all([
        transaction.get(membershipReference),
        transaction.get(scopeReference),
      ]);
      if (membershipSnapshot.exists) {
        throw new HafizAuthorizationError(403, "MEMBERSHIP_EXISTS", "Bu kullanıcı zaten ekli.");
      }
      const common = {
        institutionId: institutionID,
        membershipId: membershipID,
        userId: user.uid,
        status: "ACTIVE",
        createdAt: FieldValue.serverTimestamp(),
        createdBy: context.membershipID,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.membershipID,
      };
      transaction.create(membershipReference, { ...common, role: config.role });
      transaction.create(profileReference, {
        ...common,
        displayName,
        nameNormalized: normalize(displayName),
        email,
      });
      if (!scopeSnapshot.exists) {
        transaction.create(scopeReference, {
          status: "ACTIVE",
          activeMembershipId: membershipID,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: context.membershipID,
        });
      }
      writeAudit(transaction, context, institutionID, `${config.role}_CREATED`, resource, membershipID);
    });
  } catch (error) {
    if (createdFirebaseUser) await adminAuth.deleteUser(user.uid).catch(() => undefined);
    throw error;
  }
  return { id: membershipID };
}

function writeAudit(
  transaction: FirebaseFirestore.Transaction,
  context: HafizContext,
  institutionID: string,
  action: string,
  resourceType: string,
  resourceID: string,
) {
  const reference = adminDb.collection("hafiz_audit_events").doc();
  transaction.create(reference, {
    institutionId: institutionID,
    actorMembershipId: context.membershipID,
    actorUserId: context.userID,
    action,
    resourceType,
    resourceId: resourceID,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function toPublicRecord(snapshot: FirebaseFirestore.DocumentSnapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    name: data.name ?? data.displayName ?? "",
    email: data.email ?? null,
    status: data.status ?? "INACTIVE",
    institutionId: data.institutionId ?? snapshot.id,
    academicPeriod: data.academicPeriod ?? null,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HafizAuthorizationError(403, "INVALID_INPUT", "Geçersiz istek.");
  }
  return value as Record<string, unknown>;
}

function requiredText(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== "string") throw invalidInput(`${label} gerekli.`);
  const result = value.trim();
  if (result.length < min || result.length > max) throw invalidInput(`${label} geçersiz.`);
  return result;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw invalidInput("Kayıt kapsamı geçersiz.");
  return value;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function parseLimit(value: string | null): number {
  const parsed = Number(value || 20);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), 50) : 20;
}

function parseOptionalStatus(value: string | null): DirectoryFilterStatus | null {
  if (!value || value === "ALL") return null;
  if (["ACTIVE", "INACTIVE", "DISABLED", "DELETED"].includes(value)) {
    return value as DirectoryFilterStatus;
  }
  throw invalidInput("Durum filtresi geçersiz.");
}

function parseMutableStatus(value: unknown): MutableDirectoryStatus {
  if (value === "ACTIVE" || value === "INACTIVE") return value;
  throw invalidInput("Durum geçersiz.");
}

function encodeCursor(sort: string, id: string): string {
  return Buffer.from(JSON.stringify({ sort, id })).toString("base64url");
}

function decodeCursor(value: string | null): { sort: string; id: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return typeof parsed.sort === "string" && typeof parsed.id === "string" ? parsed : null;
  } catch {
    throw invalidInput("Sayfa anahtarı geçersiz.");
  }
}

function invalidInput(message: string) {
  return new HafizAuthorizationError(403, "INVALID_INPUT", message);
}

function notFound() {
  return new HafizAuthorizationError(403, "NOT_FOUND", "Kayıt bulunamadı.");
}
