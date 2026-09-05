import type { MetadataRoute } from "next";
import { packageDetails } from "@/lib/package-details";
import { projectCaseStudies } from "@/lib/project-case-studies";
import { absoluteUrl } from "@/lib/seo";
import { adminDb } from "@/lib/firebase-admin";
import { getPublicSeoSettings } from "@/lib/runtime-tracking";
import { equipmentCatalog } from "@/lib/equipment-catalog";
import { fethiyeDestinations } from "@/lib/fethiye-destinations";

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
  core: "2026-08-17",
  services: "2026-08-17",
  products: "2026-08-17",
  licenses: "2026-08-17",
  packages: "2026-08-17",
  legal: "2026-08-17",
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
const productImages = {
  dromocobUltra: [
    "/DromocobLogo.png",
  ],
  kaloriMerkezi: [
    "/images/apps/kalori-merkezi-icon.jpg",
  ],
  pixelResizer: [
    "/images/apps/pixel-resizer-icon.png",
  ],
} as const;
const publicRoutes: PublicRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/hizmetler", priority: 0.93, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages, ...productionServiceImages] },
  { path: "/acil-drone-cekimi", priority: 0.94, changeFrequency: "weekly", lastModified: updated.services, images: [openGraphImage, "/images/services/dji-mini-5-pro-drone.webp", "/images/services/dji-avata-2-fpv-drone.webp"] },
  { path: "/drone-cekimi", priority: 0.96, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, "/images/services/dji-mini-5-pro-drone.webp", "/images/services/dji-avata-2-fpv-drone.webp", ...productionServiceImages] },
  { path: "/web-tasarim", priority: 0.97, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/kurumsal-web-tasarim", priority: 0.96, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/e-ticaret-web-tasarim", priority: 0.96, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/landing-page", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/mobil-uygulama", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/tanitim-filmi", priority: 0.97, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/video-produksiyon", priority: 0.96, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/magaza-tanitimi", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/villa-tanitimi", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/restoran-tanitimi", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/otel-tanitimi", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/insaat-firma-tanitimi", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/kurumsal-fotograf-cekimi", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/kamera-ekipmanlari", priority: 0.91, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
  { path: "/fethiye", priority: 0.95, changeFrequency: "daily", lastModified: updated.services, images: [openGraphImage, ...productionServiceImages] },
 {
  path: "/lisans",
  priority: 0.94,
  changeFrequency: "weekly",
  lastModified: updated.licenses,
  images: [openGraphImage],
},
  { path: "/seo", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/teknik-seo", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/yerel-seo", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/google-ads", priority: 0.95, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/meta-reklamlari", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/instagram-yonetimi", priority: 0.94, changeFrequency: "monthly", lastModified: updated.services, images: [openGraphImage, ...webServiceImages] },
  { path: "/projeler", priority: 0.92, changeFrequency: "weekly", lastModified: updated.core, images: [openGraphImage, ...projectCaseStudies.map(project => project.coverUrl)] },
  { path: "/paketler", priority: 0.92, changeFrequency: "weekly", lastModified: updated.packages, images: [openGraphImage] },
 {
  path: "/uygulamalar",
  priority: 0.94,
  changeFrequency: "weekly",
  lastModified: updated.products,
  images: [openGraphImage],
},
{
  path: "/uygulamalar/photoresize",
  priority: 0.95,
  changeFrequency: "weekly",
  lastModified: updated.products,
  images: [
    openGraphImage,
    ...productImages.pixelResizer,
  ],
}, 
{
  path: "/uygulamalar/dromocob-ultra",
  priority: 0.96,
  changeFrequency: "weekly",
  lastModified: updated.products,
  images: [
    openGraphImage,
    ...productImages.dromocobUltra,
  ],
},
{
  path: "/kalori-merkezi",
  priority: 0.92,
  changeFrequency: "weekly",
  lastModified: updated.products,
  images: [
    openGraphImage,
    ...productImages.kaloriMerkezi,
  ],
},
  { path: "/kalori-merkezi/destek", priority: 0.3, changeFrequency: "yearly", lastModified: updated.legal },
  { path: "/kalori-merkezi/gizlilik", priority: 0.3, changeFrequency: "yearly", lastModified: updated.legal },
  { path: "/kurumsal", priority: 0.84, changeFrequency: "monthly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/hakkimda", priority: 0.76, changeFrequency: "monthly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/iletisim", priority: 0.82, changeFrequency: "monthly", lastModified: updated.core, images: [openGraphImage] },
  { path: "/destek", priority: 0.3, changeFrequency: "yearly", lastModified: updated.legal },
  { path: "/gizlilik", priority: 0.3, changeFrequency: "yearly", lastModified: updated.legal },
  { path: "/kvkk-aydinlatma", priority: 0.2, changeFrequency: "yearly", lastModified: updated.legal },
  { path: "/gizlilik-politikasi", priority: 0.2, changeFrequency: "yearly", lastModified: updated.legal },
];

function localizedAlternates(path: string) {
  const url = absoluteUrl(path);
  return { languages: { "tr-TR": url, "x-default": url } };
}

/**
 * Next.js 16.2.x writes sitemap URL values directly into XML without escaping
 * reserved characters. Firebase download URLs contain query separators such as
 * "&token=", which must be serialized as "&amp;token=" or the entire sitemap
 * becomes invalid XML. Keep the real URL intact for crawlers while making the
 * generated XML well-formed.
 */
function escapeSitemapUrl(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function uniqueAbsoluteImages(images: string[] = []) {
  return [
    ...new Set(
      images
        .filter(Boolean)
        .map(image => validHttpUrl(absoluteUrl(image)))
        .filter((image): image is string => Boolean(image))
        .map(escapeSitemapUrl),
    ),
  ];
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

type FirestoreSeoEntry = {
  slug: string;
  title: string;
  image?: string;
  updatedAt?: Date;
};

function firestoreDate(
  value: unknown,
): Date | undefined {
  if (
    !value ||
    typeof value !== "object" ||
    !("toDate" in value)
  ) {
    return undefined;
  }

  const candidate =
    value as {
      toDate?: () => Date;
    };

  if (
    typeof candidate.toDate !==
    "function"
  ) {
    return undefined;
  }

  try {
    const date =
      candidate.toDate();

    return Number.isNaN(
      date.getTime(),
    )
      ? undefined
      : date;
  } catch {
    return undefined;
  }
}
function safeDate(
  value: Date | undefined,
  fallback: string,
) {
  if (
    value &&
    Number.isFinite(value.getTime())
  ) {
    return value;
  }

  return new Date(
    `${fallback}T12:00:00.000Z`,
  );
}
function normalizeSlug(
  value: unknown,
) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9-]/g, "");
}
async function getPublishedContent() {
  try {
    const [projectsSnapshot, packagesSnapshot] = await Promise.all([
      adminDb.collection("projects").where("active", "==", true).get(),
      adminDb.collection("packages").where("active", "==", true).get(),
    ]);

    const projects: FirestoreSeoEntry[] = projectsSnapshot.docs.map(document => {
      const data = document.data();
      return {
       slug: normalizeSlug(
  data.slug,
),
        title: String(data.title || "").trim(),
        image: String(data.coverUrl || data.coverImage || "").trim() || undefined,
        updatedAt: firestoreDate(data.updatedAt) || firestoreDate(data.createdAt),
      };
    }).filter(item => item.slug && item.title);

    const packages: FirestoreSeoEntry[] = packagesSnapshot.docs.map(document => {
      const data = document.data();
      const known = packageDetails.find(item => item.packageId === document.id || item.slug === data.slug);
      return {
        slug: normalizeSlug(
  known?.slug ||
  data.slug,
),
        title: String(data.title || known?.title || "").trim(),
        image: String(data.image || "").trim() || undefined,
        updatedAt: firestoreDate(data.updatedAt) || firestoreDate(data.createdAt),
      };
    }).filter(item => item.slug && item.title);

    return { projects, packages };
  } catch (error) {
    console.warn("[SITEMAP] Firestore içerikleri okunamadı; yerleşik içerikler kullanılıyor.", error);
    return { projects: [] as FirestoreSeoEntry[], packages: [] as FirestoreSeoEntry[] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seoSettings, published] = await Promise.all([getPublicSeoSettings(), getPublishedContent()]);
  if (seoSettings.sitemapEnabled === false) return [];

  const staticEntries = publicRoutes.map(entry);

  const packageEntries: MetadataRoute.Sitemap = packageDetails.map(item => {
    const path = `/paketler/${item.slug}`;
    const live = published.packages.find(entry => entry.slug === item.slug);
    return {
      url: absoluteUrl(path),
   lastModified: safeDate(
  live?.updatedAt,
  updated.packages,
),
      changeFrequency: "monthly",
      priority: item.slug === "digital-flagship" ? 0.94 : 0.9,
      alternates: localizedAlternates(path),
      images: uniqueAbsoluteImages([live?.image || "", openGraphImage]),
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

  const equipmentEntries: MetadataRoute.Sitemap = equipmentCatalog.map(item => {
    const path = `/kamera-ekipmanlari/${item.slug}`;
    return {
      url: absoluteUrl(path),
      lastModified: new Date(`${updated.services}T12:00:00.000Z`),
      changeFrequency: "monthly",
      priority: 0.82,
      alternates: localizedAlternates(path),
      images: uniqueAbsoluteImages([item.image, openGraphImage]),
    };
  });

  const fethiyeEntries: MetadataRoute.Sitemap = fethiyeDestinations.map(destination => {
    const path = `/fethiye/gezilecek-yerler/${destination.slug}`;
    return {
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: localizedAlternates(path),
      images: uniqueAbsoluteImages([destination.image, openGraphImage]),
    };
  });

  const firestoreProjectEntries: MetadataRoute.Sitemap = published.projects.map(project => {
    const path = `/projeler/${project.slug}`;
    return {
      url: absoluteUrl(path),
     lastModified: safeDate(
  project.updatedAt,
  updated.core,
),
      changeFrequency: "monthly",
      priority: 0.86,
      alternates: localizedAlternates(path),
      images: uniqueAbsoluteImages([project.image || "", openGraphImage]),
    };
  });

  // Guard against accidental duplicate canonical URLs as content grows.
  const seen = new Set<string>();
  return [...staticEntries, ...fethiyeEntries, ...equipmentEntries, ...packageEntries, ...firestoreProjectEntries, ...projectEntries].filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
