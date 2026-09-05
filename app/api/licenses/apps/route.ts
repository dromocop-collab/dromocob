import { DROMOCOB_APPS } from "@/lib/licensing/types";
import { publicKeyPEM } from "@/lib/licensing/crypto";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await adminDb.collection("app_settings").doc("licensing").get();
    const configuredDays = Number(settings.data()?.trialDays);
    const trialDays = Number.isFinite(configuredDays) ? Math.max(1, Math.min(30, Math.round(configuredDays))) : 7;
    const ultraTrialRaw = Number(settings.data()?.trialDaysByProduct?.["dromocob-ultra-ae"] ?? trialDays);
    const ultraTrialDays = Number.isFinite(ultraTrialRaw) ? Math.max(0, Math.min(30, Math.round(ultraTrialRaw))) : trialDays;
    return Response.json({
      ok: true,
      apps: DROMOCOB_APPS,
      receiptPublicKey: publicKeyPEM(),
      firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      minimumVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.4.1" },
      latestVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.5.0" },
      trialDays,
      ultraTrialDays,
      ultraUpdate: settings.data()?.ultraUpdate || {
        version: "2.5.0",
        url: "https://dromocob.tr/downloads/Dromocob-Ultra-2.5.0-update.zip",
        sha256: "bd7e69db37b50ae02a8a90b2f8dff2f427266072b463333d8622b889050f53da",
        changelog: "Türkçe arayüz, sadeleştirilmiş 3D Döngü Laboratuvarı ve yayın altyapısı.",
        zxpUrl: "https://dromocob.tr/downloads/Dromocob-Ultra-2.5.0.zxp",
        zxpSha256: "c28853b5049436d5ac2116da4bebf9033b1691bf5c77ecdc0279b9f1ebb82562",
      },
      ultraPacks: Array.isArray(settings.data()?.ultraPacks) ? settings.data()?.ultraPacks : [],
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ ok: false, error: "LICENSE_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
