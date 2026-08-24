import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/**
 * DROMOCOB — ROBOTS POLICY
 *
 * Amaç:
 * - Public sayfaların arama motorları tarafından taranabilmesi
 * - Admin, hesap, preview ve API alanlarının crawler'lardan kapatılması
 * - Veritabanı erişiminden bağımsız, hızlı ve her zaman geçerli yanıt verilmesi
 * - Canonical sitemap adresinin her yanıtta yayınlanması
 *
 * NOT:
 * robots.txt bir güvenlik mekanizması değildir.
 * Private alanlar ayrıca authentication / authorization ile korunmalıdır.
 */

// MARK: - Private Routes

const privatePaths = [
  // Admin
  "/admin",
  "/admin/",

  // Authentication
  "/giris",
  "/kayit",
  "/hesap-dogrulama",

  // User account
  "/profilim",
  "/profilim/",
  "/sitelerim",
  "/sitelerim/",

  // Site builder / editor
  "/site-duzenle",
  "/site-duzenle/",
  "/site-onizleme",
  "/site-onizleme/",
  "/site-olustur",
  "/site-olustur/",

  // Backend
  "/api",
  "/api/",
] as const;

// MARK: - Normalize Site URL

function normalizeSiteUrl(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /\/+$/,
      "",
    );
}

// MARK: - Robots

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    normalizeSiteUrl(
      siteUrl,
    );
  const disallow = [...privatePaths].sort();

  /**
   * PRODUCTION MODE
   */
  return {
    rules: [
      // ---------------------------------
      // GLOBAL CRAWLERS
      // ---------------------------------

      {
        userAgent: "*",

        allow: "/",

        disallow,
      },

      // ---------------------------------
      // GOOGLE IMAGE
      // ---------------------------------

      {
        userAgent:
          "Googlebot-Image",

        allow: [
          "/images/",
          "/opengraph-image",
        ],

        disallow,
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,

    host:
      baseUrl,
  };
}
