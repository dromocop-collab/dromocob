import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { getPublicSeoSettings } from "@/lib/runtime-tracking";

const privatePaths = [
  "/admin",
  "/profilim",
  "/giris",
  "/kayit",
  "/hesap-dogrulama",
  "/site-duzenle",
  "/site-onizleme",
  "/site-olustur",
  "/sitelerim",
  "/api",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getPublicSeoSettings();
  const configuredPrivatePaths = seo.noIndexPaths?.filter(path => path.startsWith("/")) || [];
  const disallow = [...new Set([...privatePaths, ...configuredPrivatePaths])];
  const allowPublic = seo.robotsIndex !== false;

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowPublic ? "/" : undefined,
        disallow: allowPublic ? disallow : "/",
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: allowPublic ? ["/", "/images/", "/projeler/", "/hizmetler/"] : undefined,
        disallow: allowPublic ? disallow : "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/opengraph-image"],
      },
    ],
    sitemap: seo.sitemapEnabled === false ? undefined : `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
