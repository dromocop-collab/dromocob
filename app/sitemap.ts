import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const routes = [
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: "2026-07-19" },
  { path: "/hizmetler/web-tasarim", priority: 0.95, changeFrequency: "monthly", lastModified: "2026-07-19" },
  { path: "/hizmetler/video-film-produksiyon", priority: 0.95, changeFrequency: "monthly", lastModified: "2026-07-19" },
  { path: "/projeler", priority: 0.9, changeFrequency: "weekly", lastModified: "2026-07-19" },
  { path: "/paketler", priority: 0.9, changeFrequency: "weekly", lastModified: "2026-07-19" },
  { path: "/kurumsal", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-07-19" },
  { path: "/hakkimda", priority: 0.75, changeFrequency: "monthly", lastModified: "2026-07-19" },
  { path: "/iletisim", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-07-19" },
  { path: "/kvkk-aydinlatma", priority: 0.2, changeFrequency: "yearly", lastModified: "2026-07-19" },
  { path: "/gizlilik-politikasi", priority: 0.2, changeFrequency: "yearly", lastModified: "2026-07-19" },
] satisfies Array<{
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  lastModified: string;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(route => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        "tr-TR": absoluteUrl(route.path),
        "x-default": absoluteUrl(route.path),
      },
    },
    images: [absoluteUrl("/opengraph-image")],
  }));
}
