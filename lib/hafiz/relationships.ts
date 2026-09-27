import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import {
  HafizAuthorizationError,
  type HafizContext,
  requireInstitutionAccess,
} from "@/lib/hafiz/authorization";
import {
  parentMayReadStudent,
  studentMayReadStudent,
  teacherMayReadStudent,
} from "@/lib/hafiz/relationship-policy";
import { adminDb } from "@/lib/firebase-admin";

export type RelationshipKind = "classMembership" | "teacherClassAssignment" | "parentStudentLink";

type RelationshipValues = {
  classId?: string;
  studentMembershipId?: string;
  teacherMembershipId?: string;
  parentMembershipId?: string;
};

const relationshipCollections: Record<RelationshipKind, string> = {
  classMembership: "hafiz_class_memberships",
  teacherClassAssignment: "hafiz_teacher_class_assignments",
  parentStudentLink: "hafiz_parent_student_links",
};

export async function createRelationship(
  context: HafizContext,
  kind: RelationshipKind,
  body: unknown,
) {
  requireAdmin(context);
  const payload = asObject(body);
  const institutionID = requireInstitutionAccess(context, optionalString(payload.institutionId));
  const values: RelationshipValues = await validateRelationshipReferences(
    kind,
    institutionID,
    payload,
  );
  const id = relationshipID(kind, values);
  const reference = adminDb.collection(relationshipCollections[kind]).doc(id);

  await adminDb.runTransaction(async transaction => {
    const existing = await transaction.get(reference);
    const record = {
      institutionId: institutionID,
      ...values,
      relationshipType: kind === "parentStudentLink"
        ? optionalString(payload.relationshipType) || "GUARDIAN"
        : null,
      status: "ACTIVE",
      createdAt: existing.exists
        ? existing.data()?.createdAt || FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
      createdBy: existing.exists
        ? existing.data()?.createdBy || context.membershipID
        : context.membershipID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    };
    transaction.set(reference, record, { merge: true });
    writeAudit(
      transaction,
      context,
      institutionID,
      `${kind.toUpperCase()}_ACTIVATED`,
      kind,
      reference.id,
    );
  });
  return { id: reference.id };
}

export async function updateRelationship(
  context: HafizContext,
  kind: RelationshipKind,
  id: string,
  body: unknown,
) {
  requireAdmin(context);
  const payload = asObject(body);
  const status = payload.status === "ACTIVE" || payload.status === "INACTIVE"
    ? payload.status
    : null;
  if (!status) throw invalidInput("Durum geçersiz.");
  const reference = adminDb.collection(relationshipCollections[kind]).doc(id);

  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) throw notFound();
    const institutionID = requiredString(snapshot.data()?.institutionId);
    requireInstitutionAccess(context, institutionID);
    transaction.update(reference, {
      status,
      relationshipType: kind === "parentStudentLink"
        ? optionalString(payload.relationshipType) || snapshot.data()?.relationshipType || "GUARDIAN"
        : snapshot.data()?.relationshipType || null,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    writeAudit(
      transaction,
      context,
      institutionID,
      `${kind.toUpperCase()}_${status}`,
      kind,
      id,
    );
  });
  return { ok: true };
}

export async function listRelationships(
  context: HafizContext,
  kind: RelationshipKind,
  searchParams: URLSearchParams,
) {
  requireAdmin(context);
  const institutionID = requireInstitutionAccess(context, searchParams.get("institutionId"));
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 100);
  let query = adminDb.collection(relationshipCollections[kind])
    .where("institutionId", "==", institutionID);
  const status = searchParams.get("status");
  if (status === "ACTIVE" || status === "INACTIVE") query = query.where("status", "==", status);
  const snapshot = await query.limit(limit).get();
  return {
    items: snapshot.docs.map(document => ({ id: document.id, ...document.data() })),
    nextCursor: null,
  };
}

export async function listTeacherClasses(context: HafizContext) {
  requireRole(context, "TEACHER");
  const assignments = await adminDb.collection("hafiz_teacher_class_assignments")
    .where("institutionId", "==", context.institutionID)
    .where("teacherMembershipId", "==", context.membershipID)
    .where("status", "==", "ACTIVE")
    .get();
  const classReferences = assignments.docs.map(document =>
    adminDb.collection("hafiz_classes").doc(requiredString(document.data().classId))
  );
  const classes = classReferences.length > 0 ? await adminDb.getAll(...classReferences) : [];
  return {
    items: classes
      .filter(snapshot => snapshot.exists
        && snapshot.data()?.status === "ACTIVE"
        && snapshot.data()?.institutionId === context.institutionID)
      .map(snapshot => publicClass(snapshot)),
    nextCursor: null,
  };
}

export async function listTeacherStudents(context: HafizContext) {
  requireRole(context, "TEACHER");
  const assignments = await adminDb.collection("hafiz_teacher_class_assignments")
    .where("institutionId", "==", context.institutionID)
    .where("teacherMembershipId", "==", context.membershipID)
    .where("status", "==", "ACTIVE")
    .get();
  const memberships = (await Promise.all(assignments.docs.map(document => {
    const classID = requiredString(document.data().classId);
    return adminDb.collection("hafiz_class_memberships")
      .where("institutionId", "==", context.institutionID)
      .where("classId", "==", classID)
      .where("status", "==", "ACTIVE")
      .get();
  }))).flatMap(snapshot => snapshot.docs);

  const uniqueStudentIDs = [...new Set(memberships.map(document =>
    requiredString(document.data().studentMembershipId)
  ))];
  const profiles = await Promise.all(uniqueStudentIDs.map(id =>
    adminDb.collection("hafiz_student_profiles").doc(id).get()
  ));
  return {
    items: profiles
      .filter(snapshot => snapshot.exists
        && snapshot.data()?.status === "ACTIVE"
        && snapshot.data()?.institutionId === context.institutionID)
      .map(publicProfile),
    nextCursor: null,
  };
}

export async function listParentStudents(context: HafizContext) {
  requireRole(context, "PARENT");
  const links = await adminDb.collection("hafiz_parent_student_links")
    .where("institutionId", "==", context.institutionID)
    .where("parentMembershipId", "==", context.membershipID)
    .where("status", "==", "ACTIVE")
    .get();
  const profiles = await Promise.all(links.docs.map(document =>
    adminDb.collection("hafiz_student_profiles")
      .doc(requiredString(document.data().studentMembershipId))
      .get()
  ));
  return {
    items: profiles
      .filter(snapshot => snapshot.exists
        && snapshot.data()?.status === "ACTIVE"
        && snapshot.data()?.institutionId === context.institutionID)
      .map(publicProfile),
    nextCursor: null,
  };
}

export async function getParentVisibleStudent(context: HafizContext, studentMembershipID: string) {
  requireRole(context, "PARENT");
  const linkReference = adminDb.collection("hafiz_parent_student_links")
    .doc(`${context.membershipID}_${studentMembershipID}`);
  const [link, profile] = await Promise.all([
    linkReference.get(),
    adminDb.collection("hafiz_student_profiles").doc(studentMembershipID).get(),
  ]);
  if (!parentMayReadStudent(context, link.exists ? link.data() as never : null, studentMembershipID)) {
    throw notFound();
  }
  if (!profile.exists
    || profile.data()?.status !== "ACTIVE"
    || profile.data()?.institutionId !== context.institutionID) throw notFound();
  const reviews = await adminDb.collection("hafiz_assignment_reviews")
    .where("studentMembershipId", "==", studentMembershipID).get();
  return {
    ...publicProfile(profile),
    parentVisibleFeedback: reviews.docs.map(document => document.data())
      .filter(data => data.institutionId === context.institutionID && data.visibility === "PARENT_VISIBLE")
      .map(data => ({
        assignmentId: data.assignmentId,
        decision: data.decision,
        shortcut: data.shortcut || null,
        note: data.note || null,
        createdAt: data.createdAt?.toDate?.().toISOString?.() || "",
      })),
  };
}

export async function getTeacherVisibleStudent(context: HafizContext, studentMembershipID: string) {
  requireRole(context, "TEACHER");
  const memberships = await adminDb.collection("hafiz_class_memberships")
    .where("institutionId", "==", context.institutionID)
    .where("studentMembershipId", "==", studentMembershipID)
    .where("status", "==", "ACTIVE")
    .get();
  let authorized = false;
  for (const membership of memberships.docs) {
    const classID = requiredString(membership.data().classId);
    const assignment = await adminDb.collection("hafiz_teacher_class_assignments")
      .doc(`${classID}_${context.membershipID}`).get();
    if (teacherMayReadStudent(
      context,
      assignment.exists ? assignment.data() as never : null,
      membership.data() as never,
      studentMembershipID,
    )) {
      authorized = true;
      break;
    }
  }
  if (!authorized) throw notFound();
  const profile = await adminDb.collection("hafiz_student_profiles").doc(studentMembershipID).get();
  if (!profile.exists
    || profile.data()?.status !== "ACTIVE"
    || profile.data()?.institutionId !== context.institutionID) throw notFound();
  return publicProfile(profile);
}

export async function getStudentSelf(context: HafizContext, studentMembershipID: string) {
  requireRole(context, "STUDENT");
  if (!studentMayReadStudent(context, studentMembershipID)) throw notFound();
  const profile = await adminDb.collection("hafiz_student_profiles").doc(studentMembershipID).get();
  if (!profile.exists
    || profile.data()?.status !== "ACTIVE"
    || profile.data()?.institutionId !== context.institutionID) throw notFound();
  return publicProfile(profile);
}

async function validateRelationshipReferences(
  kind: RelationshipKind,
  institutionID: string,
  payload: Record<string, unknown>,
) {
  if (kind === "classMembership") {
    const classId = requiredString(payload.classId);
    const studentMembershipId = requiredString(payload.studentMembershipId);
    await requireScopedActive("hafiz_classes", classId, institutionID);
    await requireScopedActive("hafiz_student_profiles", studentMembershipId, institutionID);
    return { classId, studentMembershipId };
  }
  if (kind === "teacherClassAssignment") {
    const classId = requiredString(payload.classId);
    const teacherMembershipId = requiredString(payload.teacherMembershipId);
    await requireScopedActive("hafiz_classes", classId, institutionID);
    await requireScopedActive("hafiz_teacher_profiles", teacherMembershipId, institutionID);
    return { classId, teacherMembershipId };
  }
  const parentMembershipId = requiredString(payload.parentMembershipId);
  const studentMembershipId = requiredString(payload.studentMembershipId);
  await requireScopedActive("hafiz_parent_profiles", parentMembershipId, institutionID);
  await requireScopedActive("hafiz_student_profiles", studentMembershipId, institutionID);
  return { parentMembershipId, studentMembershipId };
}

async function requireScopedActive(collection: string, id: string, institutionID: string) {
  const snapshot = await adminDb.collection(collection).doc(id).get();
  if (!snapshot.exists
    || snapshot.data()?.institutionId !== institutionID
    || snapshot.data()?.status !== "ACTIVE") {
    throw notFound();
  }
}

function relationshipID(kind: RelationshipKind, values: RelationshipValues): string {
  switch (kind) {
  case "classMembership":
    return `${requiredString(values.classId)}_${requiredString(values.studentMembershipId)}`;
  case "teacherClassAssignment":
    return `${requiredString(values.classId)}_${requiredString(values.teacherMembershipId)}`;
  case "parentStudentLink":
    return `${requiredString(values.parentMembershipId)}_${requiredString(values.studentMembershipId)}`;
  }
}

function writeAudit(
  transaction: FirebaseFirestore.Transaction,
  context: HafizContext,
  institutionID: string,
  action: string,
  resourceType: string,
  resourceID: string,
) {
  transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
    institutionId: institutionID,
    actorMembershipId: context.membershipID,
    actorUserId: context.userID,
    action,
    resourceType,
    resourceId: resourceID,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function publicProfile(snapshot: FirebaseFirestore.DocumentSnapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    name: data.displayName || "",
    status: data.status || "INACTIVE",
    institutionId: data.institutionId || "",
  };
}

function publicClass(snapshot: FirebaseFirestore.DocumentSnapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    name: data.name || "",
    status: data.status || "INACTIVE",
    institutionId: data.institutionId || "",
    academicPeriod: data.academicPeriod || null,
  };
}

function requireAdmin(context: HafizContext) {
  requireRole(context, "ADMIN");
}

function requireRole(context: HafizContext, role: HafizContext["role"]) {
  if (context.role !== role) {
    throw new HafizAuthorizationError(403, "ROLE_FORBIDDEN", "Rol bu işlem için yetkili değil.");
  }
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidInput("Geçersiz istek.");
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw invalidInput("İlişki kimliği geçersiz.");
  return value.trim();
}

function invalidInput(message: string) {
  return new HafizAuthorizationError(403, "INVALID_INPUT", message);
}

function notFound() {
  return new HafizAuthorizationError(403, "NOT_FOUND", "Kayıt bulunamadı.");
}
