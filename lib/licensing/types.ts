export const ULTRA_FAMILY_PRODUCT_ID = "dromocob-ultra";

export const ULTRA_HOST_PRODUCT_IDS = [
  "dromocob-ultra-ae",
  "dromocob-ultra-premiere",
  "dromocob-ultra-finalcut",
] as const;

export const DROMOCOB_APPS = [
  { id: "pixel-resizer-pro", name: "Pixel Resizer PRO", bundleId: "com.cihat.photoResize" },
  { id: "ai-upscaler", name: "AI Upscaler" },
  { id: "background-remover", name: "Background Remover" },
  { id: "watermark-studio", name: "Watermark Studio" },
  { id: "image-compressor", name: "Image Compressor" },
  { id: "video-converter", name: "Video Converter" },
  { id: ULTRA_FAMILY_PRODUCT_ID, name: "Dromocob Ultra Universal" },
  { id: "dromocob-ultra-ae", name: "Dromocob Ultra for After Effects", bundleId: "com.dromocob.ultra.panel", familyId: ULTRA_FAMILY_PRODUCT_ID },
  { id: "dromocob-ultra-premiere", name: "Dromocob Ultra for Premiere Pro", bundleId: "com.dromocob.ultra.premiere", familyId: ULTRA_FAMILY_PRODUCT_ID },
  { id: "dromocob-ultra-finalcut", name: "Dromocob Ultra for Final Cut Pro", bundleId: "com.dromocob.ultra.finalcut", familyId: ULTRA_FAMILY_PRODUCT_ID },
] as const;

export function isUltraProduct(value: unknown): boolean {
  const productId = String(value ?? "").trim().toLowerCase();
  return productId === ULTRA_FAMILY_PRODUCT_ID ||
    (ULTRA_HOST_PRODUCT_IDS as readonly string[]).includes(productId);
}

export function hasProductEntitlement(
  products: readonly string[],
  requestedProduct: unknown
): boolean {
  const requested = String(requestedProduct ?? "").trim().toLowerCase();
  const normalized = products.map(product => String(product).trim().toLowerCase());

  if (isUltraProduct(requested)) {
    return normalized.includes("dromocob-all-apps") ||
      normalized.includes(ULTRA_FAMILY_PRODUCT_ID) ||
      normalized.includes(requested);
  }

  return normalized.includes("dromocob-all-apps") || normalized.includes(requested);
}

export type LicenseStatus = "active" | "suspended" | "revoked" | "expired";
export type LicensePlan = "trial" | "pro" | "business" | "lifetime";

export type LicenseRecord = {
  keyHash: string;
  keySuffix: string;
  ownerUid?: string;
  ownerEmail: string;
  customerName?: string;
  plan: LicensePlan;
  status: LicenseStatus;
  products: string[];
  maxDevices: number;
  startsAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp | null;
  offlineGraceDays: number;
  notes?: string;
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};

export type SignedReceiptPayload = {
  version: 1;
  receiptId: string;
  licenseId: string;
  activationId: string;
  userId: string;
  productId: string;
  deviceHash: string;
  plan: LicensePlan;
  issuedAt: string;
  validUntil: string;
  offlineUntil: string;
};

export type SignedReceipt = {
  payload: SignedReceiptPayload;
  signature: string;
  algorithm: "ES256";
};
