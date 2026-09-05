import { DROMOCOB_APPS } from "@/lib/licensing/types";
import { publicKeyPEM } from "@/lib/licensing/crypto";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const bundledUltraUpdate = {
  version: "2.7.1",
  url: "https://dromocob.tr/downloads/Dromocob-Ultra-2.7.1-update.zip",
  sha256: "d31648a0cef45f461d45a6aaf1fb197b57993e1380d64139105ef694db16e404",
  changelog: "Lisans başlangıcı bağımsızlaştırıldı; aktivasyon öncesi cihaz kimliği kontrolü; CEP Node uyumluluğu; geçerli mevcut lisansın başarısız anahtar denemesinde korunması.",
  zxpUrl: "https://dromocob.tr/downloads/Dromocob-Ultra-2.7.1.zxp",
  zxpSha256: "158bfcbc68a4b429d9bc4703251a43f4f1a4e345b360466f7d3b8a19b250df6c",
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
      latestVersions: { "pixel-resizer-pro": "1.0.1", "dromocob-ultra-ae": "2.7.1" },
      trialDays,
      ultraTrialDays,
      ultraUpdate: isAtLeast(settings.data()?.ultraUpdate?.version, bundledUltraUpdate.version) ? settings.data()?.ultraUpdate : bundledUltraUpdate,
      ultraPacks: Array.isArray(settings.data()?.ultraPacks) ? settings.data()?.ultraPacks : [],
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ ok: false, error: "LICENSE_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
