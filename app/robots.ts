import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const privatePaths = [
  "/admin",
  "/profilim",
  "/giris",
  "/kayit",
  "/hesap-dogrulama",
  "/api",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: ["/", "/images/", "/projeler/", "/hizmetler/"],
        disallow: privatePaths,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/opengraph-image"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
