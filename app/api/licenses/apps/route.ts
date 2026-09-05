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
      latestVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.5.1" },
      trialDays,
      ultraTrialDays,
      ultraUpdate: settings.data()?.ultraUpdate || {
        version: "2.5.1",
        url: "https://dromocob.tr/downloads/Dromocob-Ultra-2.5.1-update.zip",
        sha256: "0b4bcdb608bc6477dc9c759b816cc93303a282aaf6a3c36004a7527c90fb77cb",
        changelog: "Kurumsal aktif lisans görünümü; otomatik beat ve bass/impact marker motoru; ses fade ve marker yönetim araçları.",
        zxpUrl: "https://dromocob.tr/downloads/Dromocob-Ultra-2.5.1.zxp",
        zxpSha256: "849c9fbf18801e93151f3983f3d1176e6688f5dd9e32683b9002604e56ffe80d",
      },
      ultraPacks: Array.isArray(settings.data()?.ultraPacks) ? settings.data()?.ultraPacks : [],
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ ok: false, error: "LICENSE_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
