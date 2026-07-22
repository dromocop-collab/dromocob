import type { Metadata } from "next";
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
import { getPublicSeoVerificationSettings, getPublicTrackingSettings } from "@/lib/runtime-tracking";
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
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
  const [initialTracking, seoVerification] = await Promise.all([
    getPublicTrackingSettings(),
    getPublicSeoVerificationSettings(),
  ]);

  return <html lang="tr" data-scroll-behavior="smooth">
    <head>{[
      <Script key="consent-bootstrap" id="dromocob-consent-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: getConsentBootstrapScript() }} />,
      seoVerification.googleSiteVerification ? <meta key="google-verification" name="google-site-verification" content={seoVerification.googleSiteVerification} /> : null,
      seoVerification.bingSiteVerification ? <meta key="bing-verification" name="msvalidate.01" content={seoVerification.bingSiteVerification} /> : null,
      seoVerification.yandexVerification ? <meta key="yandex-verification" name="yandex-verification" content={seoVerification.yandexVerification} /> : null,
    ]}</head>
    <body>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [organizationJsonLd, websiteJsonLd] }).replace(/</g, "\\u003c") }} />
      <AuthProvider><SiteRuntimeSettings initialTracking={initialTracking}>{children}</SiteRuntimeSettings></AuthProvider>
    </body>
  </html>;
}
