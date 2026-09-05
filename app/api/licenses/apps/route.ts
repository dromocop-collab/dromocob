import { DROMOCOB_APPS } from "@/lib/licensing/types";
import { publicKeyPEM } from "@/lib/licensing/crypto";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const bundledUltraUpdate = {
  version: "2.7.0",
  url: "https://dromocob.tr/downloads/Dromocob-Ultra-2.7.0-update.zip",
  sha256: "734946f0ac12bfab57573f8a29ac98c3d7025084da8bd6f441de0daed4a11813",
  changelog: "Geçiş favorileri; son kullanılan 20 geçiş; 50 kişisel süre ve yoğunluk kaydı; kayıtlı presetleri tek tıkla uygulama; Türkçe/English destek.",
  zxpUrl: "https://dromocob.tr/downloads/Dromocob-Ultra-2.7.0.zxp",
  zxpSha256: "c0451feea63c52f1c6fa9c81f112602e9aeb1dd5532ca09b9f8bda583d3b8a56",
};

function versionParts(value: unknown) { return String(value || "0").split(".").slice(0, 3).map(part => Number(part.replace(/\D.*$/, "")) || 0); }
function isAtLeast(candidate: unknown, baseline: string) {
  const left = versionParts(candidate), right = versionParts(baseline);
  for (let index = 0; index < 3; index++) { if (left[index] !== right[index]) return left[index] > right[index]; }
  return true;
}

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
      latestVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.7.0" },
      trialDays,
      ultraTrialDays,
      ultraUpdate: isAtLeast(settings.data()?.ultraUpdate?.version, bundledUltraUpdate.version) ? settings.data()?.ultraUpdate : bundledUltraUpdate,
      ultraPacks: Array.isArray(settings.data()?.ultraPacks) ? settings.data()?.ultraPacks : [],
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ ok: false, error: "LICENSE_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
