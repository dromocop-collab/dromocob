import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const routes = [
  { path: "/", priority: 1 },
  { path: "/hakkimda", priority: 0.8 },
  { path: "/projeler", priority: 0.9 },
  { path: "/paketler", priority: 0.9 },
  { path: "/iletisim", priority: 0.8 },
  { path: "/kvkk-aydinlatma", priority: 0.3 },
  { path: "/gizlilik-politikasi", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(route => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}
