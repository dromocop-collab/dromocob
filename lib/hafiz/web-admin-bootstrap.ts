import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { requireAdminRole } from "@/lib/admin-guard";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const PLATFORM_INSTITUTION_ID = "hafiz-platform";

export async function bootstrapHafizWebAdmin(authorization: string | null) {
  const admin = await requireAdminRole(authorization, ["super_admin"]);
  const user = await adminAuth.getUser(admin.uid);
  if (user.disabled || !user.emailVerified) throw new Error("FORBIDDEN");

  const membershipID = `${PLATFORM_INSTITUTION_ID}_${admin.uid}_admin`;
  const institutionReference = adminDb.collection("hafiz_institutions").doc(PLATFORM_INSTITUTION_ID);
  const membershipReference = adminDb.collection("hafiz_memberships").doc(membershipID);
  const scopeReference = adminDb.collection("hafiz_user_scopes").doc(admin.uid);

  await adminDb.runTransaction(async transaction => {
    const [institution, membership, scope] = await Promise.all([
      transaction.get(institutionReference),
      transaction.get(membershipReference),
      transaction.get(scopeReference),
    ]);
    const now = FieldValue.serverTimestamp();

    transaction.set(institutionReference, {
      name: "Hafız Platform Yönetimi",
      nameNormalized: "hafız platform yönetimi",
      status: "ACTIVE",
      ...(institution.exists ? {} : { createdAt: now, createdBy: membershipID }),
      updatedAt: now,
      updatedBy: membershipID,
    }, { merge: true });

    transaction.set(membershipReference, {
      institutionId: PLATFORM_INSTITUTION_ID,
      membershipId: membershipID,
      userId: admin.uid,
      role: "ADMIN",
      status: "ACTIVE",
      accountStatus: "ACTIVE",
      ...(membership.exists ? {} : { createdAt: now, createdBy: membershipID }),
      updatedAt: now,
      updatedBy: membershipID,
    }, { merge: true });

    transaction.set(scopeReference, {
      status: "ACTIVE",
      activeMembershipId: membershipID,
      ...(scope.exists ? {} : { createdAt: now, createdBy: membershipID }),
      updatedAt: now,
      updatedBy: membershipID,
    }, { merge: true });

    if (!membership.exists) {
      transaction.create(adminDb.collection("hafiz_audit_events").doc(), {
        institutionId: PLATFORM_INSTITUTION_ID,
        actorUserId: admin.uid,
        actorMembershipId: membershipID,
        action: "PLATFORM_ADMIN_BOOTSTRAPPED",
        resourceType: "membership",
        resourceId: membershipID,
        createdAt: now,
      });
    }
  });

  if (user.customClaims?.hafizPlatformAdmin !== true) {
    await adminAuth.setCustomUserClaims(admin.uid, {
      ...(user.customClaims || {}),
      hafizPlatformAdmin: true,
    });
  }

  return {
    ok: true,
    institutionId: PLATFORM_INSTITUTION_ID,
    membershipId: membershipID,
  };
}
