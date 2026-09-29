import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { HafizAuthorizationError, type HafizContext } from "@/lib/hafiz/authorization";
import { adminDb } from "@/lib/firebase-admin";
import {
  teacherMayManageClass,
  teacherMayTransferStudent,
  type ClassMembershipRecord,
  type TeacherClassAssignmentRecord,
} from "@/lib/hafiz/relationship-policy";

export async function getTeacherClassManagement(context: HafizContext) {
  requireTeacher(context);
  const assignments = await adminDb.collection("hafiz_teacher_class_assignments")
    .where("institutionId", "==", context.institutionID)
    .where("teacherMembershipId", "==", context.membershipID)
    .where("status", "==", "ACTIVE")
    .limit(100)
    .get();
  const classIDs = [...new Set(assignments.docs.map(doc => requiredID(doc.data().classId)))];
  if (!classIDs.length) return { classes: [], students: [] };

  const [classes, membershipSnapshots] = await Promise.all([
    adminDb.getAll(...classIDs.map(id => adminDb.collection("hafiz_classes").doc(id))),
    Promise.all(classIDs.map(classID => adminDb.collection("hafiz_class_memberships")
      .where("institutionId", "==", context.institutionID)
      .where("classId", "==", classID)
      .where("status", "==", "ACTIVE")
      .limit(500)
      .get())),
  ]);
  const activeClasses = classes.filter(doc => doc.exists
    && doc.data()?.institutionId === context.institutionID
    && doc.data()?.status === "ACTIVE");
  const activeClassIDs = new Set(activeClasses.map(doc => doc.id));
  const memberships = membershipSnapshots.flatMap(snapshot => snapshot.docs)
    .filter(doc => activeClassIDs.has(String(doc.data().classId)));
  const studentClassIDs = new Map<string, string[]>();
  memberships.forEach(doc => {
    const studentID = requiredID(doc.data().studentMembershipId);
    const classID = requiredID(doc.data().classId);
    studentClassIDs.set(studentID, [...(studentClassIDs.get(studentID) || []), classID]);
  });
  const profiles = studentClassIDs.size
    ? await adminDb.getAll(...[...studentClassIDs.keys()].map(id =>
      adminDb.collection("hafiz_student_profiles").doc(id)))
    : [];

  return {
    classes: activeClasses.map(doc => ({
      id: doc.id,
      name: String(doc.data()?.name || "Sınıf"),
      academicPeriod: typeof doc.data()?.academicPeriod === "string"
        ? doc.data()?.academicPeriod
        : null,
      status: "ACTIVE",
      studentCount: memberships.filter(item => item.data().classId === doc.id).length,
    })),
    students: profiles.filter(doc => doc.exists
      && doc.data()?.institutionId === context.institutionID
      && doc.data()?.status === "ACTIVE")
      .map(doc => ({
        id: doc.id,
        name: String(doc.data()?.displayName || "Öğrenci"),
        classIds: studentClassIDs.get(doc.id) || [],
      })),
  };
}

export async function createTeacherClass(context: HafizContext, body: unknown) {
  requireTeacher(context);
  const payload = asObject(body);
  const name = requiredText(payload.name, "Sınıf adı", 2, 120);
  const academicPeriod = optionalText(payload.academicPeriod, 40);
  const classReference = adminDb.collection("hafiz_classes").doc();
  const assignmentReference = adminDb.collection("hafiz_teacher_class_assignments")
    .doc(`${classReference.id}_${context.membershipID}`);
  await adminDb.runTransaction(async transaction => {
    transaction.create(classReference, {
      institutionId: context.institutionID,
      name,
      nameNormalized: normalize(name),
      academicPeriod,
      status: "ACTIVE",
      createdAt: FieldValue.serverTimestamp(),
      createdBy: context.membershipID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    transaction.create(assignmentReference, {
      institutionId: context.institutionID,
      classId: classReference.id,
      teacherMembershipId: context.membershipID,
      status: "ACTIVE",
      createdAt: FieldValue.serverTimestamp(),
      createdBy: context.membershipID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    audit(transaction, context, "TEACHER_CLASS_CREATED", classReference.id);
  });
  return { id: classReference.id };
}

export async function updateTeacherClass(context: HafizContext, body: unknown) {
  requireTeacher(context);
  const payload = asObject(body);
  const classID = requiredID(payload.classId);
  const name = requiredText(payload.name, "Sınıf adı", 2, 120);
  const academicPeriod = optionalText(payload.academicPeriod, 40);
  const classReference = adminDb.collection("hafiz_classes").doc(classID);
  const assignmentReference = adminDb.collection("hafiz_teacher_class_assignments")
    .doc(`${classID}_${context.membershipID}`);
  await adminDb.runTransaction(async transaction => {
    const [classSnapshot, assignmentSnapshot] = await Promise.all([
      transaction.get(classReference), transaction.get(assignmentReference),
    ]);
    if (!classSnapshot.exists || classSnapshot.data()?.status !== "ACTIVE"
      || classSnapshot.data()?.institutionId !== context.institutionID
      || !teacherMayManageClass(context, assignmentRecord(assignmentSnapshot), classID)) {
      throw forbidden();
    }
    transaction.update(classReference, {
      name,
      nameNormalized: normalize(name),
      academicPeriod,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    });
    audit(transaction, context, "TEACHER_CLASS_UPDATED", classID);
  });
  return { ok: true };
}

export async function transferTeacherStudent(context: HafizContext, body: unknown) {
  requireTeacher(context);
  const payload = asObject(body);
  const studentID = requiredID(payload.studentMembershipId);
  const sourceClassID = requiredID(payload.sourceClassId);
  const targetClassID = requiredID(payload.targetClassId);
  const sourceAssignment = adminDb.collection("hafiz_teacher_class_assignments")
    .doc(`${sourceClassID}_${context.membershipID}`);
  const targetAssignment = adminDb.collection("hafiz_teacher_class_assignments")
    .doc(`${targetClassID}_${context.membershipID}`);
  const sourceClass = adminDb.collection("hafiz_classes").doc(sourceClassID);
  const targetClass = adminDb.collection("hafiz_classes").doc(targetClassID);
  const student = adminDb.collection("hafiz_student_profiles").doc(studentID);
  const sourceMembership = adminDb.collection("hafiz_class_memberships")
    .doc(`${sourceClassID}_${studentID}`);
  const targetMembership = adminDb.collection("hafiz_class_memberships")
    .doc(`${targetClassID}_${studentID}`);

  await adminDb.runTransaction(async transaction => {
    const [sourceAssignmentSnapshot, targetAssignmentSnapshot, sourceClassSnapshot,
      targetClassSnapshot, studentSnapshot, sourceMembershipSnapshot,
      targetMembershipSnapshot] = await Promise.all([
      transaction.get(sourceAssignment), transaction.get(targetAssignment),
      transaction.get(sourceClass), transaction.get(targetClass), transaction.get(student),
      transaction.get(sourceMembership), transaction.get(targetMembership),
    ]);
    const classesAreActive = [sourceClassSnapshot, targetClassSnapshot].every(snapshot =>
      snapshot.exists && snapshot.data()?.institutionId === context.institutionID
        && snapshot.data()?.status === "ACTIVE");
    const studentIsActive = studentSnapshot.exists
      && studentSnapshot.data()?.institutionId === context.institutionID
      && studentSnapshot.data()?.status === "ACTIVE";
    if (!classesAreActive || !studentIsActive || !teacherMayTransferStudent(
      context,
      assignmentRecord(sourceAssignmentSnapshot),
      assignmentRecord(targetAssignmentSnapshot),
      membershipRecord(sourceMembershipSnapshot),
      studentID,
      sourceClassID,
      targetClassID,
    )) throw forbidden();

    transaction.update(sourceMembership, {
      status: "INACTIVE",
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
      deactivatedReason: "TEACHER_CLASS_TRANSFER",
    });
    transaction.set(targetMembership, {
      institutionId: context.institutionID,
      classId: targetClassID,
      studentMembershipId: studentID,
      status: "ACTIVE",
      createdAt: targetMembershipSnapshot.exists
        ? targetMembershipSnapshot.data()?.createdAt || FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
      createdBy: targetMembershipSnapshot.exists
        ? targetMembershipSnapshot.data()?.createdBy || context.membershipID
        : context.membershipID,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: context.membershipID,
    }, { merge: true });
    audit(transaction, context, "TEACHER_STUDENT_CLASS_TRANSFERRED", studentID, {
      sourceClassId: sourceClassID, targetClassId: targetClassID,
    });
  });
  return { ok: true };
}

function assignmentRecord(snapshot: FirebaseFirestore.DocumentSnapshot): TeacherClassAssignmentRecord | null {
  return snapshot.exists ? snapshot.data() as TeacherClassAssignmentRecord : null;
}

function membershipRecord(snapshot: FirebaseFirestore.DocumentSnapshot): ClassMembershipRecord | null {
  return snapshot.exists ? snapshot.data() as ClassMembershipRecord : null;
}

function audit(transaction: FirebaseFirestore.Transaction, context: HafizContext,
  action: string, resourceID: string, metadata?: Record<string, string>) {
  transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
    institutionId: context.institutionID,
    actorMembershipId: context.membershipID,
    actorUserId: context.userID,
    action,
    resourceType: "teacherClassManagement",
    resourceId: resourceID,
    ...(metadata ? { metadata } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
}

function requireTeacher(context: HafizContext) {
  if (context.role !== "TEACHER") throw forbidden();
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid("İstek geçersiz.");
  return value as Record<string, unknown>;
}

function requiredID(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 300) {
    throw invalid("Kayıt kimliği geçersiz.");
  }
  return value.trim();
}

function requiredText(value: unknown, title: string, min: number, max: number): string {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw invalid(`${title} ${min}-${max} karakter olmalıdır.`);
  }
  return value.trim();
}

function optionalText(value: unknown, max: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.trim().length > max) throw invalid("Akademik dönem geçersiz.");
  return value.trim() || null;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR").normalize("NFKC");
}

function invalid(message: string) {
  return new HafizAuthorizationError(403, "INVALID_INPUT", message);
}

function forbidden() {
  return new HafizAuthorizationError(403, "CLASS_MANAGEMENT_FORBIDDEN", "Bu sınıf için yönetim yetkiniz yok.");
}
