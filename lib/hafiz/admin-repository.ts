import "server-only";

import { FieldPath, FieldValue, type Query } from "firebase-admin/firestore";

import { ASSIGNMENT_TYPES, WORKFLOW_STEP_TYPES } from "./assignment-schema";
import {
  HafizAuthorizationError,
  type HafizContext,
  requireInstitutionAccess,
} from "./authorization";
import {
  parseManagedAccountStatus,
  parsePageLimit,
  safeAuditMetadata,
} from "./production-policy";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const COMPLETION_POLICIES = ["STUDENT_CONFIRM", "UPLOAD_REQUIRED", "TEACHER_APPROVAL", "AUTOMATIC"] as const;

export async function getAdminDashboard(context: HafizContext) {
  requireAdmin(context);
  const institutionID = requireInstitutionAccess(context, null);
  const scoped = (collection: string) => adminDb.collection(collection)
    .where("institutionId", "==", institutionID);
  const [memberships, classes, assignments, reviews, pendingReviews, auditEvents] = await Promise.all([
    scoped("hafiz_memberships").count().get(),
    scoped("hafiz_classes").count().get(),
    scoped("hafiz_assignments").count().get(),
    scoped("hafiz_assignment_reviews").count().get(),
    scoped("hafiz_assignment_recipients").where("status", "==", "STUDENT_WORK_COMPLETE").count().get(),
    scoped("hafiz_audit_events").count().get(),
  ]);
  return {
    institutionId: institutionID,
    memberships: memberships.data().count,
    classes: classes.data().count,
    assignments: assignments.data().count,
    reviews: reviews.data().count,
    pendingReviews: pendingReviews.data().count,
    auditEvents: auditEvents.data().count,
  };
}

export async function listAuditEvents(context: HafizContext, searchParams: URLSearchParams) {
  requireAdmin(context);
  const institutionID = requireInstitutionAccess(context, searchParams.get("institutionId"));
  const limit = parsePageLimit(searchParams.get("limit"));
  const action = optionalEnum(searchParams.get("action"), /^[A-Z][A-Z0-9_]{1,79}$/);
  const resourceType = optionalEnum(searchParams.get("resourceType"), /^[A-Za-z][A-Za-z0-9_-]{0,39}$/);
  const cursor = decodeCursor(searchParams.get("cursor"));
  let query: Query = adminDb.collection("hafiz_audit_events")
    .where("institutionId", "==", institutionID);
  if (action) query = query.where("action", "==", action);
  if (resourceType) query = query.where("resourceType", "==", resourceType);
  query = query.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
  if (cursor) query = query.startAfter(new Date(cursor.createdAt), cursor.id);
  const snapshot = await query.limit(limit + 1).get();
  const page = snapshot.docs.slice(0, limit);
  const last = page.at(-1);
  return {
    items: page.map(snapshot => {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        action: String(data.action || "UNKNOWN"),
        resourceType: String(data.resourceType || "unknown"),
        resourceId: String(data.resourceId || ""),
        actorMembershipId: String(data.actorMembershipId || "system"),
        metadata: safeAuditMetadata(data.metadata),
        createdAt: timestampText(data.createdAt),
      };
    }),
    nextCursor: snapshot.docs.length > limit && last
      ? encodeCursor(timestampText(last.data().createdAt), last.id)
      : null,
  };
}

export async function getSystemConfiguration(context: HafizContext) {
  requireAdmin(context);
  const institutionID = requireInstitutionAccess(context, null);
  const snapshot = await adminDb.collection("hafiz_system_config").doc(institutionID).get();
  const data = snapshot.data() || {};
  return {
    institutionId: institutionID,
    timezone: typeof data.timezone === "string" ? data.timezone : "Europe/Istanbul",
    requireTeacherConfirmationForVideoLesson: data.requireTeacherConfirmationForVideoLesson === true,
    allowParentDailySummary: data.allowParentDailySummary !== false,
    updatedAt: timestampText(data.updatedAt),
  };
}

export async function updateSystemConfiguration(context: HafizContext, body: unknown) {
  requireAdmin(context);
  const payload = asObject(body);
  const institutionID = requireInstitutionAccess(context, optionalString(payload.institutionId));
  const timezone = requiredTimezone(payload.timezone);
  const reference = adminDb.collection("hafiz_system_config").doc(institutionID);
  await adminDb.runTransaction(async transaction => {
    transaction.set(reference, {
      institutionId: institutionID,
      timezone,
      requireTeacherConfirmationForVideoLesson: requiredBoolean(payload.requireTeacherConfirmationForVideoLesson),
      allowParentDailySummary: requiredBoolean(payload.allowParentDailySummary),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    }, { merge: true });
    writeAudit(transaction, context, institutionID, "SYSTEM_CONFIGURATION_UPDATED", "systemConfiguration", institutionID);
  });
  return { ok: true };
}

export async function listWorkflowPresets(context: HafizContext) {
  requireAdmin(context);
  const institutionID = requireInstitutionAccess(context, null);
  const snapshot = await adminDb.collection("hafiz_workflow_presets")
    .where("institutionId", "==", institutionID)
    .orderBy("nameNormalized")
    .orderBy(FieldPath.documentId())
    .limit(50)
    .get();
  return { items: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: timestampText(doc.data().createdAt), updatedAt: timestampText(doc.data().updatedAt) })) };
}

export async function saveWorkflowPreset(context: HafizContext, body: unknown) {
  requireAdmin(context);
  const payload = asObject(body);
  const institutionID = requireInstitutionAccess(context, optionalString(payload.institutionId));
  const id = optionalID(payload.id);
  const name = requiredText(payload.name, 2, 80);
  const assignmentType = String(payload.assignmentType || "");
  if (!ASSIGNMENT_TYPES.includes(assignmentType as never)) throw invalidInput("Görev türü geçersiz.");
  const sequentialSteps = requiredBoolean(payload.sequentialSteps);
  const workflowSteps = validateWorkflowSteps(payload.workflowSteps);
  const reference = id
    ? adminDb.collection("hafiz_workflow_presets").doc(id)
    : adminDb.collection("hafiz_workflow_presets").doc();
  await adminDb.runTransaction(async transaction => {
    if (id) {
      const existing = await transaction.get(reference);
      if (!existing.exists || existing.data()?.institutionId !== institutionID) throw notFound();
    }
    transaction.set(reference, {
      institutionId: institutionID,
      name,
      nameNormalized: name.toLocaleLowerCase("tr-TR"),
      assignmentType,
      sequentialSteps,
      workflowSteps,
      status: payload.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      ...(id ? {} : { createdAt: FieldValue.serverTimestamp(), createdBy: context.membershipID }),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    }, { merge: id != null });
    writeAudit(transaction, context, institutionID, id ? "WORKFLOW_PRESET_UPDATED" : "WORKFLOW_PRESET_CREATED", "workflowPreset", reference.id);
  });
  return { id: reference.id };
}

export async function updateAccountStatus(context: HafizContext, body: unknown) {
  requireAdmin(context);
  const payload = asObject(body);
  const membershipID = requiredText(payload.membershipId, 3, 300);
  if (membershipID === context.membershipID) throw invalidInput("Kendi yönetici hesabınızın durumunu değiştiremezsiniz.");
  const status = parseManagedAccountStatus(payload.status);
  const membershipReference = adminDb.collection("hafiz_memberships").doc(membershipID);
  const membership = await membershipReference.get();
  if (!membership.exists) throw notFound();
  const data = membership.data() || {};
  const institutionID = requireInstitutionAccess(context, String(data.institutionId || ""));
  const userID = requiredText(data.userId, 3, 200);
  const profileCollection = profileCollectionForRole(data.role);
  const previousDisabled = (await adminAuth.getUser(userID)).disabled;
  const disabled = status !== "ACTIVE";
  await adminAuth.updateUser(userID, { disabled });
  try {
    await adminDb.runTransaction(async transaction => {
      const current = await transaction.get(membershipReference);
      if (!current.exists || current.data()?.institutionId !== institutionID) throw notFound();
      const membershipStatus = status === "ACTIVE" ? "ACTIVE" : status === "DELETED" ? "DELETED" : "SUSPENDED";
      transaction.update(membershipReference, {
        status: membershipStatus,
        accountStatus: status,
        ...(status === "DELETED" ? { deletedAt: FieldValue.serverTimestamp(), deletedBy: context.membershipID } : {}),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.membershipID,
      });
      if (profileCollection) {
        transaction.update(adminDb.collection(profileCollection).doc(membershipID), {
          status: status === "ACTIVE" ? "ACTIVE" : status,
          ...(status === "DELETED" ? { deletedAt: FieldValue.serverTimestamp(), deletedBy: context.membershipID } : {}),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: context.membershipID,
        });
      }
      transaction.set(adminDb.collection("hafiz_user_scopes").doc(userID), {
        status: status === "ACTIVE" ? "ACTIVE" : status,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.membershipID,
      }, { merge: true });
      writeAudit(transaction, context, institutionID, `ACCOUNT_${status}`, "membership", membershipID, { userId: userID });
    });
  } catch (error) {
    await adminAuth.updateUser(userID, { disabled: previousDisabled }).catch(() => undefined);
    throw error;
  }
  return { ok: true, status };
}

function requireAdmin(context: HafizContext) {
  if (context.role !== "ADMIN") throw new HafizAuthorizationError(403, "ROLE_FORBIDDEN", "Yönetici yetkisi gerekli.");
}

function writeAudit(
  transaction: FirebaseFirestore.Transaction,
  context: HafizContext,
  institutionID: string,
  action: string,
  resourceType: string,
  resourceID: string,
  metadata: Record<string, unknown> = {},
) {
  transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
    institutionId: institutionID,
    actorMembershipId: context.membershipID,
    actorUserId: context.userID,
    action,
    resourceType,
    resourceId: resourceID,
    metadata: safeAuditMetadata(metadata),
    createdAt: FieldValue.serverTimestamp(),
  });
}

function validateWorkflowSteps(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) throw invalidInput("Çalışma akışı geçersiz.");
  const ids = new Set<string>();
  const orders = new Set<number>();
  return value.map((raw, index) => {
    const item = asObject(raw);
    const id = requiredText(item.id, 2, 80);
    const type = String(item.type || "");
    const order = Number(item.order);
    if (ids.has(id) || orders.has(order) || !Number.isSafeInteger(order) || order !== index + 1) throw invalidInput("Adım sırası veya kimliği geçersiz.");
    if (!WORKFLOW_STEP_TYPES.includes(type as never)) throw invalidInput("Adım türü geçersiz.");
    ids.add(id); orders.add(order);
    const completionPolicy = requiredText(item.completionPolicy, 3, 40);
    if (!COMPLETION_POLICIES.includes(completionPolicy as never)) throw invalidInput("Tamamlama politikası geçersiz.");
    if (["TEACHER_REVIEW", "RECITE_TO_TEACHER"].includes(type) && completionPolicy !== "TEACHER_APPROVAL") {
      throw invalidInput("Öğretmen kontrollü adım politikası geçersiz.");
    }
    if (type === "AUDIO_SUBMISSION" && completionPolicy !== "UPLOAD_REQUIRED") {
      throw invalidInput("Ses teslimi yükleme gerektirmelidir.");
    }
    return {
      id, type, order,
      required: item.required !== false,
      enabled: item.enabled !== false,
      configuration: item.configuration && typeof item.configuration === "object" && !Array.isArray(item.configuration) ? item.configuration : {},
      completionPolicy,
    };
  });
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidInput("Geçersiz istek.");
  return value as Record<string, unknown>;
}
function optionalString(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function optionalID(value: unknown) { const id = optionalString(value); if (id && !/^[A-Za-z0-9_-]{3,120}$/.test(id)) throw invalidInput("Kimlik geçersiz."); return id; }
function requiredText(value: unknown, min: number, max: number) { if (typeof value !== "string") throw invalidInput("Zorunlu alan eksik."); const text = value.trim(); if (text.length < min || text.length > max) throw invalidInput("Alan uzunluğu geçersiz."); return text; }
function requiredBoolean(value: unknown) { if (typeof value !== "boolean") throw invalidInput("Ayar değeri geçersiz."); return value; }
function requiredTimezone(value: unknown) { const timezone = requiredText(value, 3, 80); try { new Intl.DateTimeFormat("tr-TR", { timeZone: timezone }); } catch { throw invalidInput("Saat dilimi geçersiz."); } return timezone; }
function profileCollectionForRole(role: unknown) { if (role === "TEACHER") return "hafiz_teacher_profiles"; if (role === "STUDENT") return "hafiz_student_profiles"; if (role === "PARENT") return "hafiz_parent_profiles"; return null; }
function optionalEnum(value: string | null, pattern: RegExp) { if (!value) return null; if (!pattern.test(value)) throw invalidInput("Filtre geçersiz."); return value; }
function encodeCursor(createdAt: string, id: string) { return Buffer.from(JSON.stringify({ createdAt, id })).toString("base64url"); }
function decodeCursor(value: string | null): { createdAt: string; id: string } | null { if (!value) return null; try { const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")); if (typeof parsed.createdAt !== "string" || Number.isNaN(new Date(parsed.createdAt).getTime()) || typeof parsed.id !== "string") throw new Error(); return parsed; } catch { throw invalidInput("Sayfa anahtarı geçersiz."); } }
function timestampText(value: unknown) { if (typeof value === "string") return value; if (value && typeof value === "object" && "toDate" in value) return (value as { toDate(): Date }).toDate().toISOString(); return ""; }
function invalidInput(message: string) { return new HafizAuthorizationError(403, "INVALID_INPUT", message); }
function notFound() { return new HafizAuthorizationError(403, "NOT_FOUND", "Kayıt bulunamadı."); }
