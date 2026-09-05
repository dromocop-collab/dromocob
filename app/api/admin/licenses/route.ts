import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminRole } from "@/lib/admin-guard";
import { dateToTimestamp } from "@/lib/licensing/service";
import { generateLicenseKey, licenseKeyHash } from "@/lib/licensing/crypto";

export const runtime = "nodejs";

type UltraUpdate = {
  version: string;
  url: string;
  sha256: string;
  changelog: string;
  zxpUrl: string;
  zxpSha256: string;
};

function normalizeUltraUpdate(value: unknown): UltraUpdate {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    version: String(data.version || "2.5.0"),
    url: String(data.url || ""),
    sha256: String(data.sha256 || ""),
    changelog: String(data.changelog || ""),
    zxpUrl: String(data.zxpUrl || ""),
    zxpSha256: String(data.zxpSha256 || ""),
  };
}

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  return Response.json({ ok: false, error: message === "UNAUTHORIZED" || message === "FORBIDDEN" ? message : "LICENSE_ADMIN_FAILED" }, { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 });
}

export async function GET(request: Request) {
  try {
    await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "license_manager", "support"]);
    const [licenses, activations, events, settings] = await Promise.all([
      adminDb.collection("licenses").orderBy("createdAt", "desc").limit(250).get(),
      adminDb.collection("license_activations").orderBy("updatedAt", "desc").limit(500).get(),
      adminDb.collection("license_events").orderBy("createdAt", "desc").limit(250).get(),
      adminDb.collection("app_settings").doc("licensing").get(),
    ]);
    const serialize = (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return { id: doc.id, ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof Timestamp ? value.toDate().toISOString() : value])) };
    };
    const configuredDays = Number(settings.data()?.trialDays);
    const trialDays = Number.isFinite(configuredDays) ? Math.max(1, Math.min(30, Math.round(configuredDays))) : 7;
    const ultraTrialDays = Number(settings.data()?.trialDaysByProduct?.["dromocob-ultra-ae"] ?? trialDays);
    return Response.json({ ok: true, licenses: licenses.docs.map(serialize), activations: activations.docs.map(serialize), events: events.docs.map(serialize), settings: { trialDays, ultraTrialDays, ultraUpdate: normalizeUltraUpdate(settings.data()?.ultraUpdate) } });
  } catch (error) { return fail(error); }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "license_manager"]);
    const body = await request.json();
    if (body.action === "ultra-update") {
      const ultraUpdate = normalizeUltraUpdate(body.ultraUpdate);
      const validVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(ultraUpdate.version);
      const validUpdateUrl = /^https:\/\//i.test(ultraUpdate.url);
      const validZxpUrl = /^https:\/\//i.test(ultraUpdate.zxpUrl);
      const validUpdateHash = /^[a-f0-9]{64}$/i.test(ultraUpdate.sha256);
      const validZxpHash = /^[a-f0-9]{64}$/i.test(ultraUpdate.zxpSha256);
      if (!validVersion || !validUpdateUrl || !validZxpUrl || !validUpdateHash || !validZxpHash) {
        return Response.json({ ok: false, error: "INVALID_ULTRA_UPDATE" }, { status: 400 });
      }
      ultraUpdate.changelog = ultraUpdate.changelog.slice(0, 2000);
      await adminDb.collection("app_settings").doc("licensing").set({ ultraUpdate, updatedBy: admin.uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      await adminDb.collection("license_events").add({ type: "ultra_update_published", version: ultraUpdate.version, userId: admin.uid, createdAt: FieldValue.serverTimestamp() });
      return Response.json({ ok: true, settings: { ultraUpdate } });
    }
    const requestedDays = Number(body.trialDays);
    if (!Number.isFinite(requestedDays) || requestedDays < 1 || requestedDays > 30) {
      return Response.json({ ok: false, error: "INVALID_TRIAL_DAYS" }, { status: 400 });
    }
    const trialDays = Math.round(requestedDays);
    const productId = String(body.productId || "");
    const update = productId === "dromocob-ultra-ae" ? { trialDaysByProduct: { "dromocob-ultra-ae": trialDays } } : { trialDays };
    await adminDb.collection("app_settings").doc("licensing").set({
      ...update,
      updatedBy: admin.uid,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    await adminDb.collection("license_events").add({ type: "trial_settings_updated", trialDays, userId: admin.uid, createdAt: FieldValue.serverTimestamp() });
    return Response.json({ ok: true, settings: productId === "dromocob-ultra-ae" ? { ultraTrialDays: trialDays } : { trialDays } });
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "license_manager"]);
    const body = await request.json();
    const email = String(body.ownerEmail || "").trim().toLowerCase();
    const products = Array.isArray(body.products) ? body.products.map(String).slice(0, 20) : [];
    if (!email.includes("@") || products.length === 0) return Response.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
    const key = generateLicenseKey();
    const ref = adminDb.collection("licenses").doc();
    await ref.set({
      keyHash: licenseKeyHash(key), keySuffix: key.slice(-5), ownerEmail: email,
      ownerUid: body.ownerUid ? String(body.ownerUid) : null,
      customerName: String(body.customerName || "").slice(0, 180),
      plan: ["trial", "pro", "business", "lifetime"].includes(body.plan) ? body.plan : "pro",
      status: "active", products, maxDevices: Math.max(1, Math.min(100, Number(body.maxDevices) || 1)),
      startsAt: Timestamp.now(), expiresAt: dateToTimestamp(body.expiresAt),
      offlineGraceDays: Math.max(1, Math.min(30, Number(body.offlineGraceDays) || 7)),
      notes: String(body.notes || "").slice(0, 2000), createdBy: admin.uid,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    await adminDb.collection("license_events").add({ type: "license_created", licenseId: ref.id, userId: admin.uid, createdAt: FieldValue.serverTimestamp() });
    return Response.json({ ok: true, id: ref.id, licenseKey: key });
  } catch (error) { return fail(error); }
}
