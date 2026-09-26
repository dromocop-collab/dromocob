import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { effectivePremiumStatus, serializeAdminValue } from "@/lib/mobile-premium";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  let user;
  try {
    user = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.warn("[MOBILE ENTITLEMENT] Invalid identity token", error);
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [snapshot, account] = await Promise.all([
      adminDb.collection("mobile_premium_entitlements").doc(user.uid).get(),
      adminDb.collection("mobile_app_users").doc(user.uid).get(),
    ]);
    const professionalRole = account.data()?.professionalRole || "customer";
    if (!snapshot.exists) {
      return NextResponse.json({ ok: true, professionalRole, entitlement: { active: false, status: "inactive", plan: "free", source: null, startsAt: null, expiresAt: null, features: [] } }, { headers: { "cache-control": "private, no-store" } });
    }

    const data = serializeAdminValue(snapshot.data()) as Record<string, unknown>;
    const status = effectivePremiumStatus({
      active: data.active === true,
      startsAt: typeof data.startsAt === "string" ? data.startsAt : null,
      expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : null,
    });
    return NextResponse.json({ ok: true, professionalRole, entitlement: { ...data, active: status === "active", status } }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    console.error("[MOBILE ENTITLEMENT]", error);
    return NextResponse.json(
      { ok: false, error: "ENTITLEMENT_LOOKUP_FAILED", message: "Üyelik bilgisi şu anda alınamıyor." },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
