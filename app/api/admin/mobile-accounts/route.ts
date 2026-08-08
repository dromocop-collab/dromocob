import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/admin-guard";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { effectivePremiumStatus, parsePremiumInput, serializeAdminValue } from "@/lib/mobile-premium";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 100;

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
    const markerUIDs = markerSnapshot.docs
      .map(document => document.id);
    const markerByUID = new Map(markerSnapshot.docs.map(document => [document.id, serializeAdminValue(document.data()) as Record<string, unknown>]));
    const authResult = markerUIDs.length
      ? await adminAuth.getUsers(markerUIDs.map(uid => ({ uid })))
      : { users: [], notFound: [] };
    const filtered = authResult.users.filter(user => !search || user.uid.toLowerCase().includes(search) || (user.email || "").toLowerCase().includes(search) || (user.displayName || "").toLowerCase().includes(search));
    const entitlementDocs = filtered.length
      ? await adminDb.getAll(...filtered.map(user => adminDb.collection("mobile_premium_entitlements").doc(user.uid)))
      : [];
    const entitlementByUid = new Map(entitlementDocs.map(doc => [doc.id, doc.exists ? serializeAdminValue(doc.data()) : null]));

    return NextResponse.json({
      ok: true,
      accounts: filtered.map(user => ({
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime,
        lastSignInAt: user.metadata.lastSignInTime || null,
        app: markerByUID.get(user.uid)?.app || "calorievision",
        apps: markerByUID.get(user.uid)?.apps || [markerByUID.get(user.uid)?.app || "calorievision"],
        entitlement: entitlementByUid.get(user.uid) || null,
      })),
      total: markerSnapshot.size,
      nextPageToken: null,
    }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    return responseError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const body = await request.json() as { uid?: unknown; entitlement?: unknown };
    if (typeof body.uid !== "string" || !body.uid.trim()) throw new Error("INVALID_UID");
    const uid = body.uid.trim();
    const input = parsePremiumInput(body.entitlement);
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
    });
    return NextResponse.json({ ok: true, entitlement: serializeAdminValue({ ...entitlement, updatedAt: new Date().toISOString() }) });
  } catch (error) {
    return responseError(error);
  }
}
