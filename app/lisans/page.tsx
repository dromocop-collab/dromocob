import { Suspense } from "react";

import LicenseLanding from "@/components/license-landing";
import {
  absoluteUrl,
  pageMetadata,
  siteName,
  siteUrl,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Dromocob Lisansları | Pixel Resizer PRO ve Dromocob Apps",
  description:
    "Pixel Resizer PRO ve Dromocob uygulamaları için Trial, Pro, Business ve Lifetime lisans seçeneklerini inceleyin; lisans talebinizi güvenli biçimde gönderin.",
  path: "/lisans",
  keywords: [
    "Dromocob lisans",
    "Pixel Resizer PRO lisans",
    "Dromocob Apps",
    "macOS lisans",
    "Lifetime lisans",
    "Business lisans",
    "Pro lisans",
    "License Cloud",
  ],
});

const faqs = [
  {
    question: "Lisans kaç cihazda kullanılabilir?",
    answer:
      "Cihaz limiti seçilen lisans planına göre belirlenir. Aktivasyonlar Dromocob License Cloud üzerinden yönetilir.",
  },
  {
    question: "Bilgisayar internete bağlı değilse ne olur?",
    answer:
      "Geçerli imzalı lisans makbuzu varsa tanımlanan offline grace süresi boyunca çevrimdışı kullanım devam eder.",
  },
  {
    question: "Lifetime lisans nedir?",
    answer:
      "Satın alınan ürün için süresiz lisans erişimi sağlar. Cihaz doğrulaması ve güvenlik kontrolleri devam eder.",
  },
  {
    question: "Dromocob hesabı neden gerekli?",
    answer:
      "Lisans sahibini doğrulamak ve cihaz aktivasyonlarını güvenli biçimde yönetmek için kullanılır.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/lisans#webpage`,
      url: absoluteUrl("/lisans"),
      name: "Dromocob Lisansları",
      description:
        "Pixel Resizer PRO ve Dromocob Apps için güvenli lisans planları.",
      about: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/lisans#pixel-resizer-pro`,
      name: "Pixel Resizer PRO",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "macOS",
      publisher: {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
      },
      url: absoluteUrl(
        "/lisans?product=pixel-resizer-pro",
      ),
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/lisans#faq`,
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function LisansPage() {
  return (
    <Suspense fallback={<LicensePageFallback />}>
      <LicenseLanding
        schema={schema}
        faqs={faqs}
      />
    </Suspense>
  );
}

function LicensePageFallback() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 20px",
      }}
    >
      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: 14,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "999px",
            border: "3px solid rgba(0,0,0,.1)",
            borderTopColor: "#111",
          }}
        />

        <div>
          <strong
            style={{
              display: "block",
              fontSize: 15,
            }}
          >
            Lisans merkezi hazırlanıyor
          </strong>

          <span
            style={{
              display: "block",
              marginTop: 5,
              fontSize: 12,
              opacity: 0.58,
            }}
          >
            Dromocob License Cloud yükleniyor…
          </span>
        </div>
      </div>
    </main>
  );
}