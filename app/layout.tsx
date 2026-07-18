import type { Metadata } from "next";
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
import { getPublicTrackingSettings } from "@/lib/runtime-tracking";
import { getConsentBootstrapScript } from "@/lib/google-consent";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { default: defaultTitle, template: `%s | ${siteName}` },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  authors: [{ name: "Cihat Erdem", url: siteUrl }],
  creator: "Cihat Erdem",
  publisher: siteName,
  category: "Digital services",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: defaultKeywords,
  alternates: {
    canonical: siteUrl,
    languages: { "tr-TR": siteUrl, "x-default": siteUrl },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Dromocob — Film, Web ve Growth Sistemleri" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({children}:{children:React.ReactNode}) {
  const initialTracking = await getPublicTrackingSettings();

  return <html
  lang="tr"
  data-scroll-behavior="smooth"
><head><script
  id="dromocob-consent-bootstrap"
  dangerouslySetInnerHTML={{ __html: getConsentBootstrapScript() }}
/></head><body><script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [organizationJsonLd, websiteJsonLd] }).replace(/</g, "\\u003c") }}
/><AuthProvider><SiteRuntimeSettings initialTracking={initialTracking}>{children}</SiteRuntimeSettings></AuthProvider></body></html>;
}
