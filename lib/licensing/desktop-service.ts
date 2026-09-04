import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { licenseKeyHash, sha256, signReceipt } from "./crypto";
import { activateLicense, deactivateActivation, validateActivation } from "./service";
import type { LicenseRecord, SignedReceiptPayload } from "./types";

const PRODUCT = "dromocob-ultra-ae";
type DesktopInput = { licenseKey: string; productId: string; deviceHash: string; deviceName: string; platform: string; appVersion: string; osVersion: string };

function validDevice(value: unknown) { return /^[a-f0-9]{64}$/i.test(String(value || "")); }
function receipt(payload: SignedReceiptPayload) { return signReceipt(payload); }

export async function enforceDesktopRateLimit(request: Request, deviceHash: string) {
  const ip = String(request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
  const bucket = Math.floor(Date.now() / 60_000);
  const ref = adminDb.collection("license_desktop_rate_limits").doc(sha256(`${ip}:${deviceHash}:${bucket}`));
  await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const count = Number(snapshot.data()?.count || 0);
    if (count >= 12) throw new Error("RATE_LIMITED");
    transaction.set(ref, { count: count + 1, bucket, expiresAt: Timestamp.fromMillis((bucket + 10) * 60_000), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

export async function activateDesktop(input: DesktopInput) {
  if (input.productId !== PRODUCT || !validDevice(input.deviceHash) || !String(input.licenseKey || "").trim()) throw new Error("INVALID_REQUEST");
  const found = await adminDb.collection("licenses").where("keyHash", "==", licenseKeyHash(input.licenseKey)).limit(1).get();
  const doc = found.docs[0];
  const data = doc?.data() as LicenseRecord | undefined;
  if (!doc || !data) throw new Error("INVALID_LICENSE");
  return activateLicense(input, { uid: data.ownerUid || `desktop-license:${doc.id}`, email: data.ownerEmail });
}

export async function validateDesktop(activationId: string, productId: string, deviceHash: string) {
  if (productId !== PRODUCT || !validDevice(deviceHash)) throw new Error("INVALID_REQUEST");
  const snap = await adminDb.collection("license_activations").doc(activationId).get();
  const data = snap.data();
  if (!snap.exists || !data || data.deviceHash !== deviceHash || data.productId !== PRODUCT) throw new Error("INVALID_LICENSE");
  return validateActivation(activationId, productId, deviceHash, { uid: String(data.userId || ""), email: String(data.userEmail || "") });
}

export async function deactivateDesktop(activationId: string, deviceHash: string, key: string) {
  const activation = await adminDb.collection("license_activations").doc(activationId).get();
  const data = activation.data();
  if (!activation.exists || !data || data.deviceHash !== deviceHash || data.productId !== PRODUCT) throw new Error("INVALID_LICENSE");
  const license = await adminDb.collection("licenses").doc(String(data.licenseId || "")).get();
  if (!license.exists || license.data()?.keyHash !== licenseKeyHash(key)) throw new Error("INVALID_LICENSE");
  await deactivateActivation(activationId, deviceHash, String(data.userId || ""));
}

export async function startOrValidateTrial(deviceHash: string) {
  if (!validDevice(deviceHash)) throw new Error("INVALID_REQUEST");
  const id = sha256(`${PRODUCT}:${deviceHash}`);
  const ref = adminDb.collection("license_trials").doc(id);
  const settings = await adminDb.collection("app_settings").doc("licensing").get();
  const configured = Number(settings.data()?.trialDaysByProduct?.[PRODUCT] ?? settings.data()?.trialDays ?? 7);
  const days = Math.max(0, Math.min(30, Math.round(configured)));
  if (!days) throw new Error("TRIAL_DISABLED");
  const now = new Date();
  const existing = await ref.get();
  const startedAt = existing.exists && existing.data()?.startedAt instanceof Timestamp ? existing.data()!.startedAt.toDate() : now;
  const validUntil = new Date(startedAt.getTime() + days * 86_400_000);
  if (existing.data()?.status === "revoked" || validUntil.getTime() <= now.getTime()) throw new Error("TRIAL_EXPIRED");
  if (!existing.exists) await ref.set({ productId: PRODUCT, deviceHash, status: "active", startedAt: Timestamp.fromDate(startedAt), expiresAt: Timestamp.fromDate(validUntil), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  else await ref.update({ lastValidatedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  const payload: SignedReceiptPayload = { version: 1, receiptId: randomUUID(), licenseId: `trial:${id}`, activationId: `trial:${id}`, userId: "desktop-trial", productId: PRODUCT, deviceHash, plan: "trial", issuedAt: now.toISOString(), validUntil: validUntil.toISOString(), offlineUntil: validUntil.toISOString() };
  return { receipt: receipt(payload), trialDays: days };
}
