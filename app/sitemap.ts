import type { MetadataRoute } from "next";
import { packageDetails } from "@/lib/package-details";
import { projectCaseStudies } from "@/lib/project-case-studies";
import { absoluteUrl } from "@/lib/seo";

/**
 * Search engines use the sitemap as a discovery map, not a ranking mechanism.
 * Keep only canonical, public URLs here; internal tools, authentication and previews
 * remain excluded by robots.ts and are deliberately absent from this file.
 */
export const revalidate = 3600;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
type PublicRoute = {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  lastModified: string;
  images?: string[];
};

const updated = {
  core: "2026-07-21",
  services: "2026-07-21",
  packages: "2026-07-21",
  legal: "2026-07-19",
} as const;

const openGraphImage = "/opengraph-image";
const webServiceImages = [
  "/images/services/web-design-system.webp",
  "/images/services/web-software-infrastructure.webp",
];
const productionServiceImages = [
  "/images/services/sony-fx3-cinema-camera.webp",
  "/images/services/gm-24-70-lens.webp",
  "/images/services/atomos-field-monitor.webp",
  "/images/services/dji-mic-2-wireless.webp",
  "/images/services/dji-rs3-gimbal.webp",
  "/images/services/cinema-lighting-system.webp",
  "/images/services/dji-mini-5-pro-drone.webp",
  "/images/services/dji-avata-2-fpv-drone.webp",
];

const publicRoutes: PublicRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/hizmetler", priority: 0.93, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages, ...productionServiceImages] },
  { path: "/hizmetler/web-tasarim", priority: 0.97, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/hizmetler/video-film-produksiyon", priority: 0.97, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/acil-drone-cekimi", priority: 0.94, changeFrequency: "weekly", lastModified: updated.services, images: [openGraphImage, "/images/services/dji-mini-5-pro-drone.webp", "/images/services/dji-avata-2-fpv-drone.webp"] },
  { path: "/drone-cekimi", priority: 0.96, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, "/images/services/dji-mini-5-pro-drone.webp", "/images/services/dji-avata-2-fpv-drone.webp", ...productionServiceImages] },
  { path: "/web-tasarim", priority: 0.96, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/tanitim-filmi", priority: 0.96, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/magaza-tanitimi", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/seo", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/google-ads", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/projeler", priority: 0.92, changeFrequency: "weekly", lastModified: updated.core, images: [openGraphImage, ...projectCaseStudies.map(project => project.coverUrl)] },
  { path: "/paketler", priority: 0.92, changeFrequency: "weekly", lastModified: updated.packages, images: [openGraphImage] },
  { path: "/kurumsal", priority: 0.84, changeFrequency: "monthly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/hakkimda", priority: 0.76, changeFrequency: "monthly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/iletisim", priority: 0.82, changeFrequency: "monthly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/kvkk-aydinlatma", priority: 0.2, changeFrequency: "yearly", lastModified: updated.legal },
  { path: "/gizlilik-politikasi", priority: 0.2, changeFrequency: "yearly", lastModified: updated.legal },
];

function localizedAlternates(path: string) {
  const url = absoluteUrl(path);
  return { languages: { "tr-TR": url, "x-default": url } };
}

function uniqueAbsoluteImages(images: string[] = []) {
  return [...new Set(images.filter(Boolean).map(image => absoluteUrl(image)))];
}

function entry(route: PublicRoute): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(route.path),
    lastModified: new Date(`${route.lastModified}T12:00:00.000Z`),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: localizedAlternates(route.path),
    images: uniqueAbsoluteImages(route.images),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = publicRoutes.map(entry);

  const packageEntries: MetadataRoute.Sitemap = packageDetails.map(item => {
    const path = `/paketler/${item.slug}`;
    return {
      url: absoluteUrl(path),
      lastModified: new Date(`${updated.packages}T12:00:00.000Z`),
      changeFrequency: "monthly",
      priority: item.slug === "digital-flagship" ? 0.94 : 0.9,
      alternates: localizedAlternates(path),
      images: uniqueAbsoluteImages([openGraphImage]),
    };
  });

  const projectEntries: MetadataRoute.Sitemap = projectCaseStudies.map(project => {
    const path = `/projeler/${project.slug}`;
    const projectUpdated = new Date(Date.UTC(project.year, 0, 15, 12));
    return {
      url: absoluteUrl(path),
      lastModified: projectUpdated,
      changeFrequency: "monthly",
      priority: project.year >= 2026 ? 0.89 : 0.85,
      alternates: localizedAlternates(path),
      images: uniqueAbsoluteImages([project.coverUrl, openGraphImage]),
    };
  });

  // Guard against accidental duplicate canonical URLs as content grows.
  const seen = new Set<string>();
  return [...staticEntries, ...packageEntries, ...projectEntries].filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
