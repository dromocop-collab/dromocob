import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const batch = adminDb.batch();
    batch.delete(adminDb.collection("mobile_app_users").doc(decoded.uid));
    batch.delete(adminDb.collection("mobile_premium_entitlements").doc(decoded.uid));
    await batch.commit();
    await adminAuth.deleteUser(decoded.uid);
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[MOBILE ACCOUNT DELETE]", error);
    return new NextResponse("Account deletion failed", { status: 401 });
  }
}
