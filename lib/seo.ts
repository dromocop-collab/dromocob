import type { Metadata } from "next";

export const siteUrl = "https://dromocob.tr";
export const siteName = "Dromocob";
export const siteEmail = "info@dromocob.tr";
export const sitePhone = "+905304788298";
export const sitePhoneDisplay = "+90 530 478 82 98";
export const defaultTitle = "Kurumsal Web Sitesi ve Video Prodüksiyon | Türkiye";
export const defaultDescription =
  "Fethiye merkezli Dromocob; markalar için sinematik film prodüksiyonu, yüksek performanslı web ürünleri, SEO ve ölçülebilir büyüme sistemleri geliştirir.";

export const defaultKeywords = [
  "Dromocob",
  "Cihat Erdem",
  "web sitesi",
  "web sitesi tasarımı",
  "web sitesi yaptırma",
  "kurumsal web sitesi",
  "kurumsal web tasarım",
  "kurumsal tanıtım sitesi",
  "web tasarım ajansı",
  "web yazılım ajansı",
  "e-ticaret sitesi",
  "özel web yazılım",
  "video prodüksiyon",
  "kurumsal tanıtım filmi",
  "kurumsal tanıtım videosu",
  "reklam filmi çekimi",
  "marka filmi",
  "tanıtım filmi",
  "dijital büyüme",
  "Next.js web geliştirme",
  "Firebase admin panel",
  "Fethiye web tasarım",
  "Fethiye video prodüksiyon",
  "Muğla web tasarım",
  "Muğla video prodüksiyon",
  "İstanbul web tasarım",
  "İstanbul video prodüksiyon",
  "e-ticaret altyapısı",
  "SEO uyumlu web sitesi",
];

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
}: SeoOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords],
    alternates: {
      canonical: url,
      languages: { "tr-TR": url, "x-default": url },
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "tr_TR",
      type: "website",
      images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: `${siteName} — Film, Web ve Growth Sistemleri` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
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
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/icon.png"),
    contentUrl: absoluteUrl("/icon.png"),
    width: 512,
    height: 512,
  },
  image: absoluteUrl("/opengraph-image"),
  description: defaultDescription,
  areaServed: {
    "@type": "Country",
    name: "Türkiye",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Fethiye",
    addressRegion: "Muğla",
    addressCountry: "TR",
  },
  founder: {
    "@type": "Person",
    name: "Cihat Erdem",
  },
  serviceType: [
    "Film production",
    "Web development",
    "Digital growth systems",
    "SEO",
  ],
  knowsLanguage: ["tr-TR"],
  priceRange: "₺₺₺",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Dromocob hizmetleri",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Kurumsal web tasarım ve web yazılım" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Video prodüksiyon ve film yapım" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Teknik SEO ve dijital büyüme" } },
    ],
  },
  email: siteEmail,
  telephone: sitePhone,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: siteEmail,
    telephone: sitePhone,
    areaServed: "TR",
    availableLanguage: ["Turkish"],
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: siteName,
  description: defaultDescription,
  inLanguage: "tr-TR",
  publisher: { "@id": `${siteUrl}/#organization` },
};
