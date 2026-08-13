import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_GOOGLE_ADS_CONVERSION_LABEL, DEFAULT_GOOGLE_ADS_ID, DEFAULT_GOOGLE_ADS_QUICK_QUOTE_LABEL, DEFAULT_GOOGLE_ADS_SELL_REQUEST_LABEL } from "@/lib/google-ads";

export type PublicTrackingSettings = {
  enabled?: boolean;
  ga4MeasurementId?: string;
  gtmId?: string;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
  googleAdsQuickQuoteLabel?: string;
  googleAdsSellRequestLabel?: string;
  metaPixelId?: string;
  metaDomainVerification?: string;
  linkedinInsightId?: string;
  tiktokPixelId?: string;
  clarityId?: string;
  consentModeEnabled?: boolean;
  debugMode?: boolean;
};

export type PublicSeoVerificationSettings = {
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  yandexVerification?: string;
};

export type PublicSeoSettings = PublicSeoVerificationSettings & {
  siteName?: string;
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  locale?: string;
  twitterHandle?: string;
  organizationName?: string;
  organizationDescription?: string;
  logoUrl?: string;
  socialProfiles?: string[];
  noIndexPaths?: string[];
  structuredDataEnabled?: boolean;
  sitemapEnabled?: boolean;
};

function verificationToken(value?: string): string {
  return String(value || "").trim().replace(/^(google-site-verification|msvalidate\.01|yandex-verification)\s*=\s*/i, "");
}

export async function getPublicTrackingSettings(): Promise<PublicTrackingSettings> {
  const fallback: PublicTrackingSettings = {
    enabled: true,
    ga4MeasurementId:
      process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
      "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
    googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || DEFAULT_GOOGLE_ADS_ID,
    googleAdsConversionLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || DEFAULT_GOOGLE_ADS_CONVERSION_LABEL,
    googleAdsQuickQuoteLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_QUICK_QUOTE_LABEL || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || DEFAULT_GOOGLE_ADS_QUICK_QUOTE_LABEL,
    googleAdsSellRequestLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_SELL_REQUEST_LABEL || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || DEFAULT_GOOGLE_ADS_SELL_REQUEST_LABEL,
  };

  try {
    const snapshot = await adminDb.collection("site_settings").doc("global").get();
    const data = snapshot.data();
    if (!data || data.active === false) return fallback;

    const stored = (data.tracking || {}) as PublicTrackingSettings;
    return {
      ...fallback,
      ...stored,
      googleAdsId: String(stored.googleAdsId || fallback.googleAdsId || "").trim(),
      googleAdsConversionLabel: String(stored.googleAdsConversionLabel || fallback.googleAdsConversionLabel || "").trim(),
      googleAdsQuickQuoteLabel: String(stored.googleAdsQuickQuoteLabel || fallback.googleAdsQuickQuoteLabel || fallback.googleAdsConversionLabel || "").trim(),
      googleAdsSellRequestLabel: String(stored.googleAdsSellRequestLabel || fallback.googleAdsSellRequestLabel || fallback.googleAdsConversionLabel || "").trim(),
    };
  } catch (error) {
    console.warn("[DROMOCOB TRACKING] Sunucu ayarları okunamadı; env değerleri kullanılıyor.", error);
    return fallback;
  }
}

export async function getPublicSeoVerificationSettings(): Promise<PublicSeoVerificationSettings> {
  const fallback: PublicSeoVerificationSettings = {
    googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    bingSiteVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    yandexVerification: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
  };
  const normalizedFallback = {
    googleSiteVerification: verificationToken(fallback.googleSiteVerification),
    bingSiteVerification: verificationToken(fallback.bingSiteVerification),
    yandexVerification: verificationToken(fallback.yandexVerification),
  };

  try {
    const snapshot = await adminDb.collection("site_settings").doc("global").get();
    const data = snapshot.data();
    if (!data || data.active === false) return normalizedFallback;

    const merged = { ...fallback, ...(data.seo as PublicSeoVerificationSettings | undefined) };
    return {
      googleSiteVerification: verificationToken(merged.googleSiteVerification),
      bingSiteVerification: verificationToken(merged.bingSiteVerification),
      yandexVerification: verificationToken(merged.yandexVerification),
    };
  } catch (error) {
    console.warn("[DROMOCOB SEO] Sunucu SEO ayarları okunamadı; env değerleri kullanılıyor.", error);
    return normalizedFallback;
  }
}

export async function getPublicSeoSettings(): Promise<PublicSeoSettings> {
  const verification = await getPublicSeoVerificationSettings();

  try {
    const snapshot = await adminDb.collection("site_settings").doc("global").get();
    const data = snapshot.data();
    if (!data || data.active === false) return verification;

    const seo = (data.seo || {}) as PublicSeoSettings;
    return {
      ...seo,
      ...verification,
      keywords: Array.isArray(seo.keywords) ? seo.keywords.map(String).filter(Boolean) : undefined,
      socialProfiles: Array.isArray(seo.socialProfiles) ? seo.socialProfiles.map(String).filter(Boolean) : undefined,
      noIndexPaths: Array.isArray(seo.noIndexPaths) ? seo.noIndexPaths.map(String).filter(Boolean) : undefined,
    };
  } catch (error) {
    console.warn("[DROMOCOB SEO] Genel SEO ayarları okunamadı; kod varsayılanları kullanılıyor.", error);
    return verification;
  }
}
