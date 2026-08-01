export const DROMOCOB_APPS = [
  { id: "pixel-resizer-pro", name: "Pixel Resizer PRO", bundleId: "com.cihat.photoResize" },
  { id: "ai-upscaler", name: "AI Upscaler" },
  { id: "background-remover", name: "Background Remover" },
  { id: "watermark-studio", name: "Watermark Studio" },
  { id: "image-compressor", name: "Image Compressor" },
  { id: "video-converter", name: "Video Converter" },
] as const;

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
