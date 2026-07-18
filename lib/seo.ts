import type { Metadata } from "next";

export const siteUrl = "https://dromocob.com";
export const siteName = "Dromocob";
export const defaultTitle = "Dromocob | Film, Web & Growth";
export const defaultDescription =
  "Sinematik prodüksiyon, modern web ürünleri ve büyüme odaklı dijital sistemler.";

export const defaultKeywords = [
  "Dromocob",
  "Cihat Erdem",
  "kurumsal web sitesi",
  "video prodüksiyon",
  "dijital büyüme",
  "Next.js web geliştirme",
  "Firebase admin panel",
  "İstanbul yazılım",
  "marka filmi",
  "e-ticaret altyapısı",
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
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "tr_TR",
      type: "website",
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
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
  areaServed: {
    "@type": "Country",
    name: "Türkiye",
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
  email: "info@dromocob.com",
};
