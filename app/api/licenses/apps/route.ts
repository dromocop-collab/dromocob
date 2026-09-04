import { DROMOCOB_APPS } from "@/lib/licensing/types";
import { publicKeyPEM } from "@/lib/licensing/crypto";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await adminDb.collection("app_settings").doc("licensing").get();
    const configuredDays = Number(settings.data()?.trialDays);
    const trialDays = Number.isFinite(configuredDays) ? Math.max(1, Math.min(30, Math.round(configuredDays))) : 7;
    return Response.json({
      ok: true,
      apps: DROMOCOB_APPS,
      receiptPublicKey: publicKeyPEM(),
      firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      minimumVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.2.0" },
      latestVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.2.0" },
      trialDays,
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ ok: false, error: "LICENSE_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
