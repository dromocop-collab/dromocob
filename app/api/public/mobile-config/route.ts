import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const supportedApps = new Set(["dromocob", "calorievision"]);

export async function GET(request: Request) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";

  if (!apiKey || !projectId) {
    return NextResponse.json(
      { ok: false, error: "MOBILE_FIREBASE_CONFIG_MISSING" },
      { status: 503 }
    );
  }

  const requestedApp = new URL(request.url).searchParams.get("app") || "dromocob";
  const appId = supportedApps.has(requestedApp) ? requestedApp : "dromocob";
  let operation: Record<string, unknown> = {};
  try {
    operation = (await adminDb.collection("site_settings").doc(`mobile_${appId}`).get()).data() || {};
  } catch (error) {
    console.warn("[MOBILE CONFIG] App operation config unavailable", error);
  }

  return NextResponse.json(
    {
      ok: true,
      firebase: { apiKey, projectId, authDomain },
      app: {
        id: appId,
        name: appId === "calorievision" ? "Kalori Merkezi" : "Dromocob",
        maintenanceEnabled: operation.maintenanceEnabled === true,
        maintenanceTitle: String(operation.maintenanceTitle || "Kısa bir bakımdayız"),
        maintenanceMessage: String(operation.maintenanceMessage || "Deneyimi iyileştirmek için sistemi güncelliyoruz. Lütfen kısa süre sonra tekrar deneyin."),
        estimatedReturnAt: operation.estimatedReturnAt || null,
        minimumVersion: String(operation.minimumVersion || "1.0.0"),
        forceUpdate: operation.forceUpdate === true,
        updateURL: String(operation.updateURL || ""),
        supportURL: String(operation.supportURL || "https://dromocob.tr/iletisim"),
        incidentId: String(operation.incidentId || ""),
      },
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    }
  );
}
