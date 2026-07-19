import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { projectCaseStudies } from "@/lib/project-case-studies";

const routes = [
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: "2026-07-19" },
  { path: "/hizmetler", priority: 0.9, changeFrequency: "monthly", lastModified: "2026-07-19" },
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

const serviceImages: Record<string, string[]> = {
  "/projeler": projectCaseStudies.map(project => project.coverUrl),
  "/hizmetler/web-tasarim": [
    "/images/services/web-design-system.webp",
    "/images/services/web-software-infrastructure.webp",
  ],
  "/hizmetler/video-film-produksiyon": [
    "/images/services/sony-fx3-cinema-camera.webp",
    "/images/services/gm-24-70-lens.webp",
    "/images/services/atomos-field-monitor.webp",
    "/images/services/dji-mic-2-wireless.webp",
    "/images/services/dji-rs3-gimbal.webp",
    "/images/services/cinema-lighting-system.webp",
    "/images/services/dji-mini-5-pro-drone.webp",
    "/images/services/dji-avata-2-fpv-drone.webp",
  ],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = routes.map(route => ({
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
    images: [absoluteUrl("/opengraph-image"), ...(serviceImages[route.path] || []).map(absoluteUrl)],
  }));

  const projectEntries: MetadataRoute.Sitemap = projectCaseStudies.map(project => ({
    url: absoluteUrl(`/projeler/${project.slug}`),
    lastModified: "2026-07-19",
    changeFrequency: "monthly",
    priority: 0.85,
    alternates: {
      languages: {
        "tr-TR": absoluteUrl(`/projeler/${project.slug}`),
        "x-default": absoluteUrl(`/projeler/${project.slug}`),
      },
    },
    images: [absoluteUrl(project.coverUrl)],
  }));

  return [...staticEntries, ...projectEntries];
}
