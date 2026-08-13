import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import SiteRuntimeSettings from "@/components/site-runtime-settings";
import {
  defaultDescription,
  defaultKeywords,
  defaultTitle,
  organizationJsonLd,
  websiteJsonLd,
  siteName,
  siteUrl,
} from "@/lib/seo";
import { getPublicSeoSettings, getPublicTrackingSettings } from "@/lib/runtime-tracking";
import { getConsentBootstrapScript } from "@/lib/google-consent";
import FirstPartyAnalytics from "@/components/first-party-analytics";

export const revalidate = 60;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#070a07" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublicSeoSettings();
  const canonical = seo.canonicalUrl?.trim() || siteUrl;
  const name = seo.siteName?.trim() || siteName;
  const title = seo.defaultTitle?.trim() || defaultTitle;
  const description = seo.defaultDescription?.trim() || defaultDescription;
  const titleTemplate = seo.titleTemplate?.includes("%s") ? seo.titleTemplate : `%s | ${name}`;
  const ogImage = seo.ogImage?.trim() || "/opengraph-image";
  const index = seo.robotsIndex !== false;
  const follow = seo.robotsFollow !== false;
  const twitterHandle = seo.twitterHandle?.trim();

  return {
    title: { default: title, template: titleTemplate },
    description,
    metadataBase: new URL(new URL(canonical).origin),
    applicationName: name,
    authors: [{ name: "Cihat Erdem", url: siteUrl }],
    creator: "Cihat Erdem",
    publisher: name,
    category: "Digital services",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    keywords: seo.keywords?.length ? [...new Set([...defaultKeywords, ...seo.keywords])] : defaultKeywords,
    alternates: { canonical, languages: { "tr-TR": canonical, "x-default": canonical } },
    manifest: "/manifest.webmanifest",
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: name,
      locale: seo.locale?.trim() || "tr_TR",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${name} — Film, Web ve Growth Sistemleri` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: twitterHandle || undefined,
      site: twitterHandle || undefined,
      images: [ogImage],
    },
    icons: {
      icon: [{ url: "/favicon.ico", type: "image/x-icon" }, { url: "/icon.png", type: "image/png", sizes: "512x512" }],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    robots: {
      index,
      follow,
      googleBot: { index, follow, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
  };
}

export default async function RootLayout({children}:{children:React.ReactNode}) {
  const [initialTracking, seoSettings] = await Promise.all([
    getPublicTrackingSettings(),
    getPublicSeoSettings(),
  ]);
  const organization = {
    ...organizationJsonLd,
    name: seoSettings.organizationName?.trim() || organizationJsonLd.name,
    description: seoSettings.organizationDescription?.trim() || organizationJsonLd.description,
    logo: seoSettings.logoUrl?.trim()
      ? { "@type": "ImageObject", url: seoSettings.logoUrl.trim(), contentUrl: seoSettings.logoUrl.trim() }
      : organizationJsonLd.logo,
    sameAs: seoSettings.socialProfiles?.length ? seoSettings.socialProfiles : undefined,
  };

  return <html lang="tr" data-scroll-behavior="smooth" suppressHydrationWarning>
    <head>{[
      <Script key="consent-bootstrap" id="dromocob-consent-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: getConsentBootstrapScript() }} />,
      seoSettings.googleSiteVerification ? <meta key="google-verification" name="google-site-verification" content={seoSettings.googleSiteVerification} /> : null,
      seoSettings.bingSiteVerification ? <meta key="bing-verification" name="msvalidate.01" content={seoSettings.bingSiteVerification} /> : null,
      seoSettings.yandexVerification ? <meta key="yandex-verification" name="yandex-verification" content={seoSettings.yandexVerification} /> : null,
    ]}</head>
    <body>
      {seoSettings.structuredDataEnabled !== false && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [organization, { ...websiteJsonLd, name: seoSettings.siteName?.trim() || websiteJsonLd.name, description: seoSettings.defaultDescription?.trim() || websiteJsonLd.description }] }).replace(/</g, "\\u003c") }} />}
      <AuthProvider><SiteRuntimeSettings initialTracking={initialTracking}>{children}</SiteRuntimeSettings></AuthProvider>
      <FirstPartyAnalytics />
    </body>
  </html>;
}
