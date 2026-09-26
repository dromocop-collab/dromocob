import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";
import { serializeAdminValue } from "@/lib/mobile-premium";

export const dynamic = "force-dynamic";

const documentRef = adminDb.collection("site_settings").doc("mobile_calorievision");

const defaults = {
  appName: "Kalori Merkezi",
  maintenanceEnabled: false,
  maintenanceTitle: "Kısa bir bakımdayız",
  maintenanceMessage: "Deneyimi iyileştirmek için sistemi güncelliyoruz. Lütfen kısa süre sonra tekrar deneyin.",
  estimatedReturnAt: "",
  minimumVersion: "1.0.0",
  forceUpdate: false,
  updateURL: "",
  supportURL: "https://dromocob.tr/iletisim",
  incidentId: "",
};

function text(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function validURL(value: string, optional = false) {
  if (!value && optional) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") throw new Error("INVALID_URL");
    return parsed.toString();
  } catch {
    throw new Error("INVALID_URL");
  }
}

function parseInput(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("INVALID_BODY");
  const body = value as Record<string, unknown>;
  if (typeof body.maintenanceEnabled !== "boolean" || typeof body.forceUpdate !== "boolean") throw new Error("INVALID_FLAGS");
  const minimumVersion = text(body.minimumVersion, defaults.minimumVersion, 24);
  if (!/^\d+(?:\.\d+){1,3}$/.test(minimumVersion)) throw new Error("INVALID_VERSION");
  const maintenanceTitle = text(body.maintenanceTitle, defaults.maintenanceTitle, 100);
  const maintenanceMessage = text(body.maintenanceMessage, defaults.maintenanceMessage, 500);
  if (!maintenanceTitle || !maintenanceMessage) throw new Error("INVALID_MAINTENANCE_COPY");
  const reason = text(body.reason, "", 300);
  if (!reason) throw new Error("REASON_REQUIRED");
  const updateURL = validURL(text(body.updateURL, "", 500), true);
  if (body.forceUpdate && !updateURL) throw new Error("INVALID_UPDATE_URL");

  return {
    config: {
      appName: defaults.appName,
      maintenanceEnabled: body.maintenanceEnabled,
      maintenanceTitle,
      maintenanceMessage,
      estimatedReturnAt: text(body.estimatedReturnAt, "", 80),
      minimumVersion,
      forceUpdate: body.forceUpdate,
      updateURL,
      supportURL: validURL(text(body.supportURL, defaults.supportURL, 500)),
      incidentId: text(body.incidentId, "", 80),
    },
    reason,
  };
}

function responseError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
  if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
  if (message.startsWith("INVALID_") || message === "REASON_REQUIRED") return NextResponse.json({ ok: false, error: message }, { status: 400 });
  console.error("[MOBILE OPERATION]", error);
  return NextResponse.json({ ok: false, error: "MOBILE_OPERATION_FAILED" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "support"]);
    const snapshot = await documentRef.get();
    return NextResponse.json({
      ok: true,
      config: { ...defaults, ...(snapshot.exists ? serializeAdminValue(snapshot.data()) as Record<string, unknown> : {}) },
    }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    return responseError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const { config, reason } = parseInput(await request.json());
    const previous = await documentRef.get();
    const batch = adminDb.batch();
    batch.set(documentRef, {
      ...config,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.uid,
      updatedByEmail: admin.email || null,
    }, { merge: true });
    batch.create(adminDb.collection("mobile_operation_audit_logs").doc(), {
      action: "calorievision_operation_updated",
      actorUid: admin.uid,
      actorEmail: admin.email || null,
      reason,
      before: previous.exists ? previous.data() : null,
      after: config,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return NextResponse.json({ ok: true, config: { ...config, updatedAt: new Date().toISOString(), updatedByEmail: admin.email || null } });
  } catch (error) {
    return responseError(error);
  }
}
