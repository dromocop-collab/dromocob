import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { licenseKeyHash, signReceipt } from "./crypto";
import type { LicenseRecord, SignedReceiptPayload } from "./types";

type ActivationInput = {
  licenseKey: string;
  productId: string;
  deviceHash: string;
  deviceName: string;
  platform: string;
  appVersion: string;
  osVersion: string;
};

function validateInput(input: ActivationInput) {
  if (!input.licenseKey || input.licenseKey.length > 80 || !input.productId || input.productId.length > 80 || !/^[a-f0-9]{64}$/i.test(input.deviceHash)) {
    throw new Error("INVALID_REQUEST");
  }
}

function effectiveExpiry(license: LicenseRecord) {
  return license.expiresAt?.toDate() ?? new Date("2099-12-31T23:59:59.000Z");
}

function assertLicense(license: LicenseRecord, productId: string, uid: string, email?: string) {
  if (license.status !== "active") throw new Error("LICENSE_INACTIVE");
  if (!license.products.includes("dromocob-all-apps") && !license.products.includes(productId)) throw new Error("PRODUCT_NOT_INCLUDED");
  if (license.ownerUid && license.ownerUid !== uid) throw new Error("INVALID_LICENSE");
  if (license.ownerEmail.toLowerCase() !== (email || "").toLowerCase()) throw new Error("INVALID_LICENSE");
  if (effectiveExpiry(license).getTime() <= Date.now()) throw new Error("LICENSE_EXPIRED");
}

export async function activateLicense(input: ActivationInput, user: { uid: string; email?: string }) {
  validateInput(input);
  const keyHash = licenseKeyHash(input.licenseKey);
  const result = await adminDb.runTransaction(async tx => {
    const query = adminDb.collection("licenses").where("keyHash", "==", keyHash).limit(1);
    const snapshot = await tx.get(query);
    const licenseDoc = snapshot.docs[0];
    if (!licenseDoc) throw new Error("INVALID_LICENSE");
    const license = licenseDoc.data() as LicenseRecord;
    assertLicense(license, input.productId, user.uid, user.email);

    const activations = adminDb.collection("license_activations");
    const existingQuery = activations
      .where("licenseId", "==", licenseDoc.id)
      .where("deviceHash", "==", input.deviceHash)
      .where("productId", "==", input.productId)
      .limit(1);
    const existing = await tx.get(existingQuery);
    let activationRef = existing.docs[0]?.ref;
    if (!activationRef) {
      const activeQuery = activations.where("licenseId", "==", licenseDoc.id).where("active", "==", true);
      const active = await tx.get(activeQuery);
      if (active.size >= Math.max(1, license.maxDevices)) throw new Error("DEVICE_LIMIT_REACHED");
      activationRef = activations.doc();
    }

    const now = new Date();
    const validUntil = effectiveExpiry(license);
    const graceLimit = new Date(now.getTime() + Math.max(1, Math.min(30, license.offlineGraceDays || 7)) * 86_400_000);
    const offlineUntil = new Date(Math.min(validUntil.getTime(), graceLimit.getTime()));
    const receiptPayload: SignedReceiptPayload = {
      version: 1,
      receiptId: randomUUID(),
      licenseId: licenseDoc.id,
      activationId: activationRef.id,
      userId: user.uid,
      productId: input.productId,
      deviceHash: input.deviceHash,
      plan: license.plan,
      issuedAt: now.toISOString(),
      validUntil: validUntil.toISOString(),
      offlineUntil: offlineUntil.toISOString(),
    };
    const receipt = signReceipt(receiptPayload);
    tx.set(activationRef, {
      licenseId: licenseDoc.id, userId: user.uid, userEmail: user.email || license.ownerEmail,
      productId: input.productId, deviceHash: input.deviceHash, deviceName: input.deviceName.slice(0, 180),
      platform: input.platform.slice(0, 60), appVersion: input.appVersion.slice(0, 40), osVersion: input.osVersion.slice(0, 80),
      active: true, lastValidatedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      createdAt: existing.empty ? FieldValue.serverTimestamp() : existing.docs[0].data().createdAt,
    }, { merge: true });
    tx.set(adminDb.collection("license_events").doc(), {
      type: existing.empty ? "activated" : "reactivated", licenseId: licenseDoc.id,
      activationId: activationRef.id, productId: input.productId, userId: user.uid,
      deviceHash: input.deviceHash, createdAt: FieldValue.serverTimestamp(),
    });
    if (!license.ownerUid) tx.update(licenseDoc.ref, { ownerUid: user.uid, updatedAt: FieldValue.serverTimestamp() });
    return { receipt, activationId: activationRef.id, licenseId: licenseDoc.id };
  });
  return result;
}

export async function validateActivation(activationId: string, productId: string, deviceHash: string, user: { uid: string; email?: string }) {
  if (!activationId || !productId || !/^[a-f0-9]{64}$/i.test(deviceHash)) throw new Error("INVALID_REQUEST");
  const activationRef = adminDb.collection("license_activations").doc(activationId);
  const activationDoc = await activationRef.get();
  const activation = activationDoc.data();
  if (!activationDoc.exists || !activation?.active || activation.userId !== user.uid || activation.productId !== productId || activation.deviceHash !== deviceHash) throw new Error("INVALID_LICENSE");
  const licenseDoc = await adminDb.collection("licenses").doc(activation.licenseId).get();
  if (!licenseDoc.exists) throw new Error("INVALID_LICENSE");
  const license = licenseDoc.data() as LicenseRecord;
  assertLicense(license, productId, user.uid, user.email);
  const now = new Date();
  const validUntil = effectiveExpiry(license);
  const offlineUntil = new Date(Math.min(validUntil.getTime(), now.getTime() + Math.max(1, Math.min(30, license.offlineGraceDays || 7)) * 86_400_000));
  const receipt = signReceipt({ version: 1, receiptId: randomUUID(), licenseId: licenseDoc.id, activationId, userId: user.uid, productId, deviceHash, plan: license.plan, issuedAt: now.toISOString(), validUntil: validUntil.toISOString(), offlineUntil: offlineUntil.toISOString() });
  await activationRef.update({ lastValidatedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return { receipt };
}

export async function deactivateActivation(activationId: string, deviceHash: string, userId: string) {
  const ref = adminDb.collection("license_activations").doc(activationId);
  const doc = await ref.get();
  const data = doc.data();
  if (!doc.exists || data?.userId !== userId || data?.deviceHash !== deviceHash) throw new Error("INVALID_LICENSE");
  await ref.update({ active: false, deactivatedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  await adminDb.collection("license_events").add({ type: "deactivated", licenseId: data.licenseId, activationId, userId, deviceHash, createdAt: FieldValue.serverTimestamp() });
}

export function dateToTimestamp(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new Error("INVALID_REQUEST");
  return Timestamp.fromDate(date);
}
