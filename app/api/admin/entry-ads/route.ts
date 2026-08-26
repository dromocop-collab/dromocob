import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdminRole } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_ENTRY_ADS_CONFIG, normalizeEntryAdsConfig } from "@/lib/entry-ads";

export const dynamic = "force-dynamic";
function failure(error: unknown) { const message = error instanceof Error ? error.message : "UNKNOWN"; return new NextResponse(message === "UNAUTHORIZED" ? "Unauthorized" : message === "FORBIDDEN" ? "Forbidden" : "Entry ads operation failed", { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 }); }

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const [configSnapshot, statsSnapshot] = await Promise.all([adminDb.collection("marketing_settings").doc("entry_ads").get(), adminDb.collection("entry_ad_stats").get()]);
    const stats = Object.fromEntries(statsSnapshot.docs.map(document => [document.id, { impressions: Number(document.data().impressionCount || 0), cta: Number(document.data().ctaCount || 0), dismiss: Number(document.data().dismissCount || 0) }]));
    return NextResponse.json({ config: normalizeEntryAdsConfig(configSnapshot.exists ? configSnapshot.data() : DEFAULT_ENTRY_ADS_CONFIG), stats }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return failure(error); }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const config = normalizeEntryAdsConfig(await request.json());
    if (!config.campaigns.length) return NextResponse.json({ message: "En az bir reklam kampanyası gerekli." }, { status: 400 });
    await adminDb.collection("marketing_settings").doc("entry_ads").set({ ...config, updatedAt: FieldValue.serverTimestamp(), updatedBy: admin.uid });
    return NextResponse.json({ ok: true, config });
  } catch (error) { return failure(error); }
}
