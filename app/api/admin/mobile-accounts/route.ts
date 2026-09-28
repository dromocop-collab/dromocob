import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/admin-guard";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { effectivePremiumStatus, parsePremiumInput, serializeAdminValue } from "@/lib/mobile-premium";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 100;

async function getAuthUsers(uids: string[]) {
  const chunks: string[][] = [];
  for (let index = 0; index < uids.length; index += PAGE_SIZE) {
    chunks.push(uids.slice(index, index + PAGE_SIZE));
  }
  const results = await Promise.all(
    chunks.map(chunk => adminAuth.getUsers(chunk.map(uid => ({ uid })))),
  );
  return results.flatMap(result => result.users);
}

function responseError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
  if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
  if (message.startsWith("INVALID_") || message === "REASON_REQUIRED") {
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
  console.error("[MOBILE ACCOUNTS]", error);
  return NextResponse.json({ ok: false, error: "MOBILE_ACCOUNTS_FAILED" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "support"]);
    const search = (request.nextUrl.searchParams.get("search") || "").trim().toLowerCase();
    const markerSnapshot = await adminDb.collection("mobile_app_users")
      .orderBy("lastSeenAt", "desc")
      .limit(PAGE_SIZE)
      .get();
    const hafizScopeSnapshot = await adminDb.collection("hafiz_user_scopes")
      .limit(PAGE_SIZE)
      .get();
    const hafizUIDs = new Set(hafizScopeSnapshot.docs.map(document => document.id));
    const markerUIDs = Array.from(new Set([
      ...markerSnapshot.docs.map(document => document.id),
      ...hafizUIDs,
    ]));
    const markerByUID = new Map(markerSnapshot.docs.map(document => [document.id, serializeAdminValue(document.data()) as Record<string, unknown>]));
    const authUsers = markerUIDs.length ? await getAuthUsers(markerUIDs) : [];
    const filtered = authUsers.filter(user => !search || user.uid.toLowerCase().includes(search) || (user.email || "").toLowerCase().includes(search) || (user.displayName || "").toLowerCase().includes(search));
    const entitlementDocs = filtered.length
      ? await adminDb.getAll(...filtered.map(user => adminDb.collection("mobile_premium_entitlements").doc(user.uid)))
      : [];
    const entitlementByUid = new Map(entitlementDocs.map(doc => [doc.id, doc.exists ? serializeAdminValue(doc.data()) : null]));

    return NextResponse.json({
      ok: true,
      accounts: filtered.map(user => {
        const marker = markerByUID.get(user.uid);
        const markerApps = Array.isArray(marker?.apps)
          ? marker.apps.filter((app): app is string => typeof app === "string")
          : [];
        const apps = Array.from(new Set([
          ...markerApps,
          ...(typeof marker?.app === "string" ? [marker.app] : []),
          ...(hafizUIDs.has(user.uid) ? ["hafiz"] : []),
        ]));
        const primaryApp = typeof marker?.app === "string"
          ? marker.app
          : apps[0] || "calorievision";
        return {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          disabled: user.disabled,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime,
          lastSignInAt: user.metadata.lastSignInTime || null,
          app: primaryApp,
          apps,
          professionalRole: marker?.professionalRole || "customer",
          entitlement: entitlementByUid.get(user.uid) || null,
        };
      }),
      total: markerUIDs.length,
      nextPageToken: null,
    }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    return responseError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const body = await request.json() as { uid?: unknown; entitlement?: unknown; professionalRole?: unknown };
    if (typeof body.uid !== "string" || !body.uid.trim()) throw new Error("INVALID_UID");
    const uid = body.uid.trim();
    const input = parsePremiumInput(body.entitlement);
    const professionalRole = ["customer", "dietitian", "trainer"].includes(String(body.professionalRole))
      ? String(body.professionalRole) : "customer";
    await adminAuth.getUser(uid);

    const status = effectivePremiumStatus(input);
    const entitlementRef = adminDb.collection("mobile_premium_entitlements").doc(uid);
    const auditRef = adminDb.collection("mobile_premium_audit_logs").doc();
    const previous = await entitlementRef.get();
    const startsAt = input.startsAt ? Timestamp.fromDate(new Date(input.startsAt)) : null;
    const expiresAt = input.expiresAt ? Timestamp.fromDate(new Date(input.expiresAt)) : null;
    const entitlement = {
      uid,
      active: input.active,
      status,
      plan: input.plan,
      source: input.source,
      startsAt,
      expiresAt,
      features: input.features,
      note: input.note,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.uid,
      updatedByEmail: admin.email || null,
      ...(previous.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    };

    const batch = adminDb.batch();
    batch.set(entitlementRef, entitlement, { merge: true });
    batch.set(adminDb.collection("mobile_app_users").doc(uid), {
      professionalRole,
      roleUpdatedAt: FieldValue.serverTimestamp(),
      roleUpdatedBy: admin.uid,
    }, { merge: true });
    batch.create(auditRef, {
      action: "mobile_premium_updated",
      targetUid: uid,
      actorUid: admin.uid,
      actorEmail: admin.email || null,
      reason: input.reason,
      before: previous.exists ? previous.data() : null,
      after: entitlement,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    const user = await adminAuth.getUser(uid);
    const currentClaims = user.customClaims || {};
    const premiumActive = status === "active";
    await adminAuth.setCustomUserClaims(uid, {
      ...currentClaims,
      premium: premiumActive,
      premiumPlan: input.plan,
      premiumExpiresAt: input.expiresAt ? Math.floor(Date.parse(input.expiresAt) / 1000) : null,
      professionalRole,
    });
    return NextResponse.json({ ok: true, professionalRole, entitlement: serializeAdminValue({ ...entitlement, updatedAt: new Date().toISOString() }) });
  } catch (error) {
    return responseError(error);
  }
}
