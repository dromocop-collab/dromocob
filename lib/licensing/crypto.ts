import { createHash, createPrivateKey, createPublicKey, randomBytes, sign, verify } from "node:crypto";
import type { SignedReceipt, SignedReceiptPayload } from "./types";

export function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function normalizeLicenseKey(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generateLicenseKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(20);
  const body = Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
  return `DROM-${body.slice(0, 5)}-${body.slice(5, 10)}-${body.slice(10, 15)}-${body.slice(15, 20)}`;
}

export function licenseKeyHash(value: string) {
  return sha256(normalizeLicenseKey(value));
}

export function canonicalReceipt(payload: SignedReceiptPayload) {
  return JSON.stringify({
    activationId: payload.activationId,
    deviceHash: payload.deviceHash,
    issuedAt: payload.issuedAt,
    licenseId: payload.licenseId,
    offlineUntil: payload.offlineUntil,
    plan: payload.plan,
    productId: payload.productId,
    receiptId: payload.receiptId,
    userId: payload.userId,
    validUntil: payload.validUntil,
    version: payload.version,
  });
}

function privateKey() {
  const raw = process.env.DROMOCOB_LICENSE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!raw) throw new Error("LICENSE_SIGNING_KEY_NOT_CONFIGURED");
  return createPrivateKey(raw);
}

export function signReceipt(payload: SignedReceiptPayload): SignedReceipt {
  const signature = sign("sha256", Buffer.from(canonicalReceipt(payload)), {
    key: privateKey(),
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  return { payload, signature, algorithm: "ES256" };
}

export function publicKeyPEM() {
  const configured = process.env.DROMOCOB_LICENSE_PUBLIC_KEY?.replace(/\\n/g, "\n");
  if (configured) return configured;
  return createPublicKey(privateKey()).export({ type: "spki", format: "pem" }).toString();
}

export function verifyReceipt(receipt: SignedReceipt) {
  if (receipt.algorithm !== "ES256" || receipt.payload.version !== 1) return false;
  return verify(
    "sha256",
    Buffer.from(canonicalReceipt(receipt.payload)),
    { key: createPublicKey(publicKeyPEM()), dsaEncoding: "ieee-p1363" },
    Buffer.from(receipt.signature, "base64url"),
  );
}
