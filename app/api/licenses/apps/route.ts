import { DROMOCOB_APPS } from "@/lib/licensing/types";
import { publicKeyPEM } from "@/lib/licensing/crypto";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UltraUpdate = {
  version: string;
  url: string;
  sha256: string;
  changelog: string;
  zxpUrl: string;
  zxpSha256: string;
};

type LatestManifest = {
  version?: string | {
    major?: number;
    minor?: number;
    patch?: number;
  };
  updatePackageURL?: string;
  updatePackageSHA256?: string;
  zxpURL?: string;
  zxpSHA256?: string;
  releaseNotes?: string;
  changelog?: string;
};

function versionString(value: LatestManifest["version"]): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const major = Number(value.major) || 0;
    const minor = Number(value.minor) || 0;
    const patch = Number(value.patch) || 0;

    return `${major}.${minor}.${patch}`;
  }

  return "0.0.0";
}

function versionParts(value: unknown): number[] {
  return String(value || "0")
    .split(".")
    .slice(0, 3)
    .map(part => Number(part.replace(/\D.*$/, "")) || 0);
}

function isAtLeast(candidate: unknown, baseline: string): boolean {
  const left = versionParts(candidate);
  const right = versionParts(baseline);

  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) {
      return left[index] > right[index];
    }
  }

  return true;
}

function normalizeConfiguredUpdate(value: unknown): UltraUpdate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;

  const update: UltraUpdate = {
    version: String(data.version || "").trim(),
    url: String(data.url || "").trim(),
    sha256: String(data.sha256 || "").trim().toLowerCase(),
    changelog: String(data.changelog || "").trim(),
    zxpUrl: String(data.zxpUrl || "").trim(),
    zxpSha256: String(data.zxpSha256 || "").trim().toLowerCase(),
  };

  if (
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(update.version) ||
    !/^https:\/\//i.test(update.url) ||
    !/^[a-f0-9]{64}$/i.test(update.sha256)
  ) {
    return null;
  }

  return update;
}

async function fetchLatestUltraUpdate(): Promise<UltraUpdate> {
  const response = await fetch(
    `https://dromocob.tr/downloads/latest.json?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "Dromocob-License-API"
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `ULTRA_MANIFEST_HTTP_${response.status}`
    );
  }

  const manifest =
    (await response.json()) as LatestManifest;

  const version =
    versionString(manifest.version);

  const update: UltraUpdate = {
    version,
    url:
      String(
        manifest.updatePackageURL || ""
      ).trim(),

    sha256:
      String(
        manifest.updatePackageSHA256 || ""
      ).trim().toLowerCase(),

    changelog:
      String(
        manifest.changelog ||
        manifest.releaseNotes ||
        ""
      ).trim(),

    zxpUrl:
      String(
        manifest.zxpURL || ""
      ).trim(),

    zxpSha256:
      String(
        manifest.zxpSHA256 || ""
      ).trim().toLowerCase(),
  };

  if (
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(update.version) ||
    !/^https:\/\//i.test(update.url) ||
    !/^[a-f0-9]{64}$/i.test(update.sha256)
  ) {
    throw new Error(
      "ULTRA_MANIFEST_INVALID"
    );
  }

  return update;
}

export async function GET() {
  try {
    const [settings, githubUpdate] =
      await Promise.all([
        adminDb
          .collection("app_settings")
          .doc("licensing")
          .get(),

        fetchLatestUltraUpdate()
      ]);

    const configuredDays =
      Number(
        settings.data()?.trialDays
      );

    const trialDays =
      Number.isFinite(configuredDays)
        ? Math.max(
            1,
            Math.min(
              30,
              Math.round(configuredDays)
            )
          )
        : 7;

    const ultraTrialRaw =
      Number(
        settings.data()
          ?.trialDaysByProduct
          ?.["dromocob-ultra"]
        ?? settings.data()
          ?.trialDaysByProduct
          ?.["dromocob-ultra-ae"]
        ?? trialDays
      );

    const ultraTrialDays =
      Number.isFinite(ultraTrialRaw)
        ? Math.max(
            0,
            Math.min(
              30,
              Math.round(ultraTrialRaw)
            )
          )
        : trialDays;

    const configuredUpdate =
      normalizeConfiguredUpdate(
        settings.data()?.ultraUpdate
      );

    const ultraUpdate =
      configuredUpdate &&
      isAtLeast(
        configuredUpdate.version,
        githubUpdate.version
      )
        ? configuredUpdate
        : githubUpdate;

    return Response.json(
      {
        ok: true,

        apps:
          DROMOCOB_APPS,

        receiptPublicKey:
          publicKeyPEM(),

        firebaseApiKey:
          process.env
            .NEXT_PUBLIC_FIREBASE_API_KEY
          || "",

        minimumVersions: {
          "pixel-resizer-pro": "1.0.1",
          "dromocob-ultra-ae": "2.4.1",
          "dromocob-ultra-premiere": "0.7.0",
          "dromocob-ultra-finalcut": "0.3.17"
        },

        latestVersions: {
          "pixel-resizer-pro": "1.0.1",
          "dromocob-ultra-ae":
            ultraUpdate.version,
          "dromocob-ultra-premiere": "0.7.0",
          "dromocob-ultra-finalcut": "0.3.17"
        },

        trialDays,
        ultraTrialDays,
        ultraUpdate,

        ultraPacks:
          Array.isArray(
            settings.data()?.ultraPacks
          )
            ? settings.data()?.ultraPacks
            : []
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          "Access-Control-Allow-Origin":
            "*"
        }
      }
    );
  } catch (error) {
    console.error(
      "[Dromocob License] apps route:",
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          "LICENSE_SERVICE_UNAVAILABLE"
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
