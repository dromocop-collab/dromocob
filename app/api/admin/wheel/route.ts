import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdminRole } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_WHEEL_CONFIG, normalizeWheelConfig } from "@/lib/promo-wheel";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  return new NextResponse(message === "UNAUTHORIZED" ? "Unauthorized" : message === "FORBIDDEN" ? "Forbidden" : "Wheel operation failed", { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const [configSnapshot, spinSnapshot, couponSnapshot] = await Promise.all([
      adminDb.collection("promo_wheel").doc("config").get(),
      adminDb.collection("wheel_spins").orderBy("createdAt", "desc").limit(100).get(),
      adminDb.collection("coupons").where("source", "==", "promo_wheel").limit(500).get(),
    ]);
    const config = normalizeWheelConfig(configSnapshot.exists ? configSnapshot.data() : DEFAULT_WHEEL_CONFIG);
    const spins = spinSnapshot.docs.map(document => ({ id: document.id, ...document.data(), createdAt: document.data().createdAt?.toDate?.().toISOString?.() || "" }));
    const coupons = couponSnapshot.docs.map(document => document.data());
    return NextResponse.json({ config, stats: { spins: spinSnapshot.size, coupons: coupons.length, used: coupons.filter(item => item.status === "used").length }, recentSpins: spins }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const config = normalizeWheelConfig(await request.json());
    if (config.rewards.filter(item => item.active && item.weight > 0).length < 2) return NextResponse.json({ message: "En az iki aktif ve olasılığı sıfırdan büyük dilim gerekli." }, { status: 400 });
    await adminDb.collection("promo_wheel").doc("config").set({ ...config, updatedAt: FieldValue.serverTimestamp(), updatedBy: admin.uid }, { merge: true });
    return NextResponse.json({ ok: true, config });
  } catch (error) { return errorResponse(error); }
}
