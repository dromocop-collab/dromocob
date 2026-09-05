import { DROMOCOB_APPS } from "@/lib/licensing/types";
import { publicKeyPEM } from "@/lib/licensing/crypto";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const bundledUltraUpdate = {
  version: "2.6.1",
  url: "https://dromocob.tr/downloads/Dromocob-Ultra-2.6.1-update.zip",
  sha256: "4b651b88f192d9756c5104e8b6d7e4200b01f4fc3fcf9bd83cfed8b60bb748c7",
  changelog: "Temaya uyumlu scrollbar; Türkçe/English dil seçimi; arayüz ölçeği ve gelişmiş tercihler; kurumsal WhatsApp ve web destek merkezi.",
  zxpUrl: "https://dromocob.tr/downloads/Dromocob-Ultra-2.6.1.zxp",
  zxpSha256: "b191c61d40f7f912d3b329b674ee5c814fe2bc6e9f2f7a336eb8366f798b40cc",
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
      latestVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.6.1" },
      trialDays,
      ultraTrialDays,
      ultraUpdate: isAtLeast(settings.data()?.ultraUpdate?.version, bundledUltraUpdate.version) ? settings.data()?.ultraUpdate : bundledUltraUpdate,
      ultraPacks: Array.isArray(settings.data()?.ultraPacks) ? settings.data()?.ultraPacks : [],
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ ok: false, error: "LICENSE_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
