import "server-only";

import { adminDb } from "@/lib/firebase-admin";

export type PublicTrackingSettings = {
  enabled?: boolean;
  ga4MeasurementId?: string;
  gtmId?: string;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
  metaPixelId?: string;
  metaDomainVerification?: string;
  linkedinInsightId?: string;
  tiktokPixelId?: string;
  clarityId?: string;
  consentModeEnabled?: boolean;
  debugMode?: boolean;
};

export async function getPublicTrackingSettings(): Promise<PublicTrackingSettings> {
  const fallback: PublicTrackingSettings = {
    enabled: true,
    ga4MeasurementId:
      process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
      "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
  };

  try {
    const snapshot = await adminDb.collection("site_settings").doc("global").get();
    const data = snapshot.data();
    if (!data || data.active === false) return fallback;

    return { ...fallback, ...(data.tracking as PublicTrackingSettings | undefined) };
  } catch (error) {
    console.warn("[DROMOCOB TRACKING] Sunucu ayarları okunamadı; env değerleri kullanılıyor.", error);
    return fallback;
  }
}
