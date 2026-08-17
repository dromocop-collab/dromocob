import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";
import { getPublicSeoSettings } from "@/lib/runtime-tracking";

/**
 * DROMOCOB — ROBOTS POLICY
 *
 * Amaç:
 * - Public sayfaların arama motorları tarafından taranabilmesi
 * - Admin, hesap, preview ve API alanlarının crawler'lardan kapatılması
 * - Runtime SEO ayarlarının desteklenmesi
 * - Sitemap'in yalnızca aktif olduğunda yayınlanması
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

// MARK: - Normalize Path

function normalizePath(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  let path =
    value.trim();

  if (
    !path ||
    !path.startsWith("/")
  ) {
    return null;
  }

  // Prevent malformed / external-looking entries.
  if (
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\0")
  ) {
    return null;
  }

  // Query/hash fragments do not belong in robots rules.
  path =
    path
      .split("?")[0]
      .split("#")[0];

  if (!path) {
    return null;
  }

  return path;
}

// MARK: - Build Disallow List

function buildDisallowList(
  configuredPaths:
    unknown,
): string[] {
  const runtimePaths =
    Array.isArray(
      configuredPaths,
    )
      ? configuredPaths
          .map(
            normalizePath,
          )
          .filter(
            (
              path,
            ): path is string =>
              path !== null,
          )
      : [];

  return [
    ...new Set([
      ...privatePaths,
      ...runtimePaths,
    ]),
  ].sort();
}

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

export default async function robots():
  Promise<MetadataRoute.Robots>
{
  const seo =
    await getPublicSeoSettings();

  const baseUrl =
    normalizeSiteUrl(
      siteUrl,
    );

  const sitemapEnabled =
    seo.sitemapEnabled !==
    false;

  const indexingEnabled =
    seo.robotsIndex !==
    false;

  const disallow =
    buildDisallowList(
      seo.noIndexPaths,
    );

  /**
   * GLOBAL NOINDEX MODE
   *
   * Admin panelinden robotsIndex kapatılırsa
   * crawler erişimini tamamen kapat.
   *
   * Bu özellikle staging / bakım / geçici
   * index kapatma durumları için kullanılabilir.
   */
  if (!indexingEnabled) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],

      sitemap:
        sitemapEnabled
          ? `${baseUrl}/sitemap.xml`
          : undefined,

      host:
        baseUrl,
    };
  }

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

    sitemap:
      sitemapEnabled
        ? `${baseUrl}/sitemap.xml`
        : undefined,

    host:
      baseUrl,
  };
}