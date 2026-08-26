import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_ENTRY_ADS_CONFIG, normalizeEntryAdsConfig } from "@/lib/entry-ads";

export const dynamic = "force-dynamic";
const CONFIG = adminDb.collection("marketing_settings").doc("entry_ads");

export async function GET() {
  try {
    const snapshot = await CONFIG.get();
    return NextResponse.json({ config: normalizeEntryAdsConfig(snapshot.exists ? snapshot.data() : DEFAULT_ENTRY_ADS_CONFIG) }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ config: DEFAULT_ENTRY_ADS_CONFIG }, { headers: { "cache-control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const campaignId = String(body.campaignId || "").trim().slice(0, 60);
  const event = String(body.event || "");
  if (!campaignId || !["impression", "cta", "dismiss"].includes(event)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const statsRef = adminDb.collection("entry_ad_stats").doc(campaignId);
    await statsRef.set({ campaignId, [`${event}Count`]: FieldValue.increment(1), lastEventAt: FieldValue.serverTimestamp() }, { merge: true });
  } catch { /* Analytics must never block the visitor experience. */ }
  return NextResponse.json({ ok: true });
}
