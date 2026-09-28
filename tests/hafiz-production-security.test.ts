import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { noteVisibleTo, mayReadProtectedAudio } from "../lib/hafiz/review-policy.ts";
import { assignmentAllowsPage, studentMayResolveAssignmentQuran } from "../lib/hafiz/quran-policy.ts";
import { parentMayReadStudent, teacherMayReadStudent } from "../lib/hafiz/relationship-policy.ts";
import { initializeWorkflow, transitionWorkflow, WorkflowTransitionError } from "../lib/hafiz/workflow-policy.ts";
import { assignmentPreset } from "../lib/hafiz/assignment-schema.ts";
import { lockScreenSafeBody, mayAccessScopedResource, mayMutateAsRole, parseManagedAccountStatus, parsePageLimit, publicPushPayload, safeAuditMetadata } from "../lib/hafiz/production-policy.ts";

test("STUDENT cannot access another assignment, arbitrary Quran, locked step, audio, or approval", () => {
  const grant = { assignmentId: "a1", studentMembershipId: "s1", institutionId: "i1", editionId: "e1", pageNumbers: [341, 342, 343], status: "ACTIVE" as const };
  assert.equal(studentMayResolveAssignmentQuran({ role: "STUDENT", membershipID: "s2", institutionID: "i1" }, grant, "a1"), false);
  assert.equal(studentMayResolveAssignmentQuran({ role: "STUDENT", membershipID: "s1", institutionID: "i1" }, grant, "a2"), false);
  assert.equal(assignmentAllowsPage(grant, 344), false);
  const steps = assignmentPreset("NEW_MEMORIZATION");
  const state = initializeWorkflow(steps, true);
  assert.throws(() => transitionWorkflow({ steps, progress: state.progress, sequential: true, repetitionTarget: 5, stepId: steps[3].id, action: "COMPLETE" }), error => error instanceof WorkflowTransitionError && error.code === "STEP_LOCKED");
  assert.equal(mayReadProtectedAudio({ requesterRole: "STUDENT", requesterInstitutionID: "i1", requesterMembershipID: "s1", assetInstitutionID: "i1", assetStudentMembershipID: "s2", assignmentOwnerMembershipID: "t1" }), false);
  assert.equal(mayMutateAsRole("STUDENT", "TEACHER_REVIEW"), false);
  assert.equal(mayMutateAsRole("STUDENT", "STUDENT_PROGRESS"), true);
});

test("PARENT is link-scoped, read-only, note-filtered and has no Quran library role", () => {
  const context = { role: "PARENT" as const, membershipID: "p1", institutionID: "i1" };
  assert.equal(parentMayReadStudent(context, { institutionId: "i1", parentMembershipId: "p1", studentMembershipId: "s1", status: "ACTIVE" }, "s2"), false);
  assert.equal(parentMayReadStudent(context, { institutionId: "i1", parentMembershipId: "p1", studentMembershipId: "s1", status: "INACTIVE" }, "s1"), false);
  assert.equal(noteVisibleTo("PARENT", "PRIVATE_TEACHER"), false);
  assert.equal(noteVisibleTo("PARENT", "PARENT_VISIBLE"), true);
  assert.equal(mayMutateAsRole("PARENT", "STUDENT_PROGRESS"), false);
  assert.equal(studentMayResolveAssignmentQuran({ role: "PARENT", membershipID: "p1", institutionID: "i1" }, null, "a1"), false);
});

test("TEACHER cannot forge tenant, class, student or institution ownership", () => {
  const context = { role: "TEACHER" as const, membershipID: "t1", institutionID: "i1" };
  const classAssignment = { institutionId: "i1", teacherMembershipId: "t1", classId: "c1", status: "ACTIVE" as const };
  const membership = { institutionId: "i2", classId: "c1", studentMembershipId: "s1", status: "ACTIVE" as const };
  assert.equal(teacherMayReadStudent(context, classAssignment, membership, "s1"), false);
  assert.equal(teacherMayReadStudent(context, { ...classAssignment, classId: "c2" }, { ...membership, institutionId: "i1" }, "s1"), false);
  assert.equal(mayAccessScopedResource({ role: "TEACHER", membershipID: "t1", institutionID: "i1", resourceInstitutionID: "i2", ownerMembershipID: "t1" }), false);
  assert.equal(mayAccessScopedResource({ role: "TEACHER", membershipID: "t1", institutionID: "i1", resourceInstitutionID: "i1", ownerMembershipID: "t2" }), false);
});

test("ADMIN stays institution-scoped unless trusted platform-admin claim is present", () => {
  const base = { role: "ADMIN" as const, membershipID: "a1", institutionID: "i1", resourceInstitutionID: "i2" };
  assert.equal(mayAccessScopedResource(base), false);
  assert.equal(mayAccessScopedResource({ ...base, isPlatformAdmin: true }), true);
  assert.equal(mayMutateAsRole("ADMIN", "ADMIN_CONTROL"), true);
});

test("direct Firestore and Storage access remain default-denied", () => {
  const firestore = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  const storage = readFileSync(new URL("../storage.rules", import.meta.url), "utf8");
  for (const collection of ["hafiz_assignments", "hafiz_quran_pages", "hafiz_audio_assets", "hafiz_audit_events", "hafiz_system_config", "hafiz_workflow_presets", "hafiz_registration_requests"]) {
    assert.match(firestore, new RegExp(`match /${collection}/\\{documentId\\} \\{ allow read, write: if false; \\}`));
  }
  assert.match(storage, /match \/hafiz-private-audio\/\{allPaths=\*\*\} \{\s*allow read, write: if false;/);
});

test("registration remains pending until an institution admin approves trusted scope", () => {
  const publicRoute = readFileSync(new URL("../app/api/hafiz/auth/register/route.ts", import.meta.url), "utf8");
  const adminRoute = readFileSync(new URL("../app/api/hafiz/admin/registration-requests/route.ts", import.meta.url), "utf8");
  const repository = readFileSync(new URL("../lib/hafiz/registration-repository.ts", import.meta.url), "utf8");
  assert.match(publicRoute, /requireFirebaseIdentity\(request\)/);
  assert.doesNotMatch(publicRoute, /requireHafizContext\(request, \["STUDENT"/);
  assert.match(adminRoute, /requireHafizContext\(request, \["ADMIN"\]\)/);
  assert.match(repository, /const REGISTRATION_ROLES = \["STUDENT", "TEACHER", "PARENT"\]/);
  assert.doesNotMatch(repository, /REGISTRATION_ROLES[^\n]+ADMIN/);
  assert.match(repository, /status: "PENDING"/);
  assert.match(repository, /optionalInstitutionID\(payload\.institutionCode\)/);
  assert.match(repository, /DEFAULT_REGISTRATION_INSTITUTION_ID/);
  assert.match(repository, /transaction\.create\(institutionReference/);
  assert.match(repository, /transaction\.create\(scopeReference/);
  assert.match(repository, /decision === "APPROVE"/);
});

test("Hafız accounts are discoverable in the shared premium control center", () => {
  const registration = readFileSync(new URL("../lib/hafiz/registration-repository.ts", import.meta.url), "utf8");
  const accountRoute = readFileSync(new URL("../app/api/admin/mobile-accounts/route.ts", import.meta.url), "utf8");
  const mobileRegistration = readFileSync(new URL("../app/api/mobile/accounts/register/route.ts", import.meta.url), "utf8");
  const controlCenter = readFileSync(new URL("../components/admin/mobile-account-control-center.tsx", import.meta.url), "utf8");
  assert.match(registration, /apps: FieldValue\.arrayUnion\("hafiz"\)/);
  assert.match(accountRoute, /collection\("hafiz_user_scopes"\)/);
  assert.match(accountRoute, /hafizUIDs\.has\(user\.uid\)/);
  assert.match(mobileRegistration, /"dromocob", "calorievision", "hafiz"/);
  assert.match(controlCenter, /"calorievision" \| "dromocob" \| "hafiz"/);
  assert.match(controlCenter, /app === "hafiz"/);
});

test("admin-created people receive Firebase credentials without persisting a password", () => {
  const directory = readFileSync(new URL("../lib/hafiz/directory.ts", import.meta.url), "utf8");
  assert.match(directory, /const password = requiredPassword\(payload\.password\)/);
  assert.match(directory, /adminAuth\.createUser\(\{ email, password, displayName, disabled: false \}\)/);
  assert.match(directory, /provider\.providerId === "password"/);
  assert.match(directory, /ACCOUNT_ALREADY_HAS_PASSWORD/);
  assert.match(directory, /adminAuth\.updateUser\(userID, \{ password, disabled: false \}\)/);
  assert.match(directory, /_PASSWORD_RESET/);
  assert.doesNotMatch(directory, /transaction\.(?:create|set|update)\([^\n]+password/);
  assert.doesNotMatch(directory, /metadata: [^\n]*password/);
});

test("teacher class visibility requires an explicit admin-managed assignment", () => {
  const relationships = readFileSync(new URL("../lib/hafiz/relationships.ts", import.meta.url), "utf8");
  const adminCenter = readFileSync(new URL("../components/admin/hafiz-control-center.tsx", import.meta.url), "utf8");
  const route = readFileSync(
    new URL("../app/api/hafiz/admin/relationships/[kind]/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /requireHafizContext\(request, \["ADMIN"\]\)/);
  assert.match(relationships, /teacherMembershipId/);
  assert.match(relationships, /adminDb\.getAll\(\.\.\.classReferences\)/);
  assert.match(adminCenter, /relationships\/teacherClassAssignment/);
  assert.match(adminCenter, /Öğretmeni sınıfa bağla/);
});

test("push payload never contains protected content", () => {
  const payload = publicPushPayload({ notificationID: "n1", event: "REVISION_REQUIRED", role: "STUDENT" });
  assert.deepEqual(Object.keys(payload).sort(), ["event", "notificationId", "role"]);
  assert.equal("note" in payload, false);
  assert.equal("quranText" in payload, false);
  assert.equal("fileUrl" in payload, false);
  assert.doesNotMatch(lockScreenSafeBody("TEACHER_SENT_MESSAGE", "Mahrem öğretmen mesajı"), /Mahrem/);
});

test("student progress and teacher review keep core writes independent from notification delivery", () => {
  const studentRepository = readFileSync(
    new URL("../lib/hafiz/student-assignment-repository.ts", import.meta.url), "utf8",
  );
  const reviewRepository = readFileSync(
    new URL("../lib/hafiz/review-repository.ts", import.meta.url), "utf8",
  );
  assert.match(studentRepository, /transaction\.update\(recipientReference, recipientUpdate\)/);
  assert.match(studentRepository, /STUDENT PROGRESS NOTIFICATION/);
  assert.match(reviewRepository, /REVIEW STUDENT NOTIFICATION/);
  assert.match(reviewRepository, /if \(approvedAyahs\.length\)/);
  assert.doesNotMatch(
    reviewRepository,
    /approvedAyahIds:\s*FieldValue\.arrayUnion\(\.\.\.\(revisionData\.quranScope\.ayahIds \|\| \[\]\)\)/,
  );
});

test("admin control plane is role guarded, bounded and strips unsafe audit data", () => {
  for (const route of ["dashboard", "audit-events", "system", "workflow-presets", "account-status"]) {
    const source = readFileSync(new URL(`../app/api/hafiz/admin/${route}/route.ts`, import.meta.url), "utf8");
    assert.match(source, /requireHafizContext\(request, \["ADMIN"\]\)/);
  }
  assert.equal(parsePageLimit("999"), 50);
  assert.equal(parsePageLimit("bad"), 25);
  assert.equal(parseManagedAccountStatus("DELETED"), "DELETED");
  assert.throws(() => parseManagedAccountStatus("SUPERUSER"));
  assert.deepEqual(safeAuditMetadata({ safeKey: "x".repeat(500), "bad-key!": "secret", nested: { token: "no" } }), { safeKey: "x".repeat(300) });
});

test("student institution transfer is platform-admin guarded and revokes old active links", () => {
  const route = readFileSync("app/api/hafiz/admin/student-transfer/route.ts", "utf8");
  const repository = readFileSync("lib/hafiz/admin-repository.ts", "utf8");
  assert.match(route, /requireHafizContext\(request, \["ADMIN"\]\)/);
  assert.match(repository, /PLATFORM_ADMIN_REQUIRED/);
  assert.match(repository, /STUDENT_INSTITUTION_TRANSFERRED/);
  assert.match(repository, /STUDENT_TRANSFERRED_OUT/);
  assert.match(repository, /STUDENT_TRANSFERRED_IN/);
  assert.match(repository, /activeMembershipId: membershipID/);
  assert.match(repository, /status: "REVOKED"/);
});

test("directory institution transfer is platform-admin guarded and preserves historical scope", () => {
  const route = readFileSync("app/api/hafiz/admin/directory-transfer/route.ts", "utf8");
  const repository = readFileSync("lib/hafiz/admin-repository.ts", "utf8");
  assert.match(route, /requireHafizContext\(request, \["ADMIN"\]\)/);
  assert.match(repository, /requirePlatformAdmin\(context\)/);
  assert.match(repository, /deactivatedReason: `\$\{role\}_INSTITUTION_TRANSFERRED`/);
  assert.match(repository, /CLASS_INSTITUTION_TRANSFERRED/);
  assert.match(repository, /transferredFromClassId/);
  assert.match(repository, /transaction\.update\(sourceReference, \{\s*status: "INACTIVE"/);
});

test("institution transfer queries have explicit composite indexes", () => {
  const config = JSON.parse(readFileSync("firestore.indexes.json", "utf8")) as {
    indexes: Array<{ collectionGroup: string; fields: Array<{ fieldPath: string }> }>;
  };
  const hasIndex = (collection: string, fields: string[]) => config.indexes.some(index =>
    index.collectionGroup === collection
      && fields.every(field => index.fields.some(candidate => candidate.fieldPath === field))
  );
  assert.equal(hasIndex("hafiz_teacher_class_assignments", ["institutionId", "classId", "status"]), true);
  assert.equal(hasIndex("hafiz_parent_student_links", ["institutionId", "studentMembershipId", "status"]), true);
  assert.equal(hasIndex("hafiz_assignment_quran_grants", ["institutionId", "studentMembershipId", "status"]), true);
});

test("web admin bootstrap is restricted to an existing super admin", () => {
  const route = readFileSync(new URL("../app/api/admin/hafiz/bootstrap/route.ts", import.meta.url), "utf8");
  const bootstrap = readFileSync(new URL("../lib/hafiz/web-admin-bootstrap.ts", import.meta.url), "utf8");
  assert.match(route, /bootstrapHafizWebAdmin\(request\.headers\.get\("authorization"\)\)/);
  assert.match(bootstrap, /requireAdminRole\(authorization, \["super_admin"\]\)/);
  assert.match(bootstrap, /!user\.emailVerified/);
  assert.match(bootstrap, /hafizPlatformAdmin: true/);
  assert.match(bootstrap, /role: "ADMIN"/);
  assert.match(bootstrap, /activeMembershipId: membershipID/);
  assert.doesNotMatch(bootstrap, /request\.json/);
});
