"use client";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { projectCaseStudies } from "@/lib/project-case-studies";
import type { Project, ServicePackage, QuoteQuestion, QuoteRule } from "@/lib/types";

type QuestionOptionShape = {
  label?: string;
  value?: string;
  priceDelta?: number;
};

type RuleConditionShape = {
  key?: string;
  operator?: string;
  value?: string | number;
};

function toArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map(item => String(item || "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizePackage(raw: Record<string, unknown>, id: string): ServicePackage {
  const title = String(raw.title || raw.name || "").trim();
  const subtitle = String(raw.subtitle || raw.segment || "").trim();
  const description = String(raw.description || "").trim();
  const priceFrom = Number(raw.priceFrom || raw.startingPrice || 0);

  const themeValue = String(raw.theme || "").trim().toLowerCase();
  const theme = ["light", "neon", "dark", "graphite", "royal"].includes(themeValue)
    ? (themeValue as ServicePackage["theme"])
    : undefined;

  return {
    id,
    title,
    subtitle,
    image: String(raw.image || "").trim() || undefined,
    promoVideo: String(raw.promoVideo || "").trim() || undefined,
    description,
    priceFrom,
    features: toArray(raw.features),
    idealFor: toArray(raw.idealFor),
    kpiFocus: toArray(raw.kpiFocus),
    deliveryTime: String(raw.deliveryTime || "").trim() || undefined,
    supportWindow: String(raw.supportWindow || "").trim() || undefined,
    guarantee: String(raw.guarantee || "").trim() || undefined,
    maxRevision: Number(raw.maxRevision || 0) || undefined,
    badge: String(raw.badge || "").trim() || undefined,
    cta: String(raw.cta || raw.buttonText || "").trim() || undefined,
    active: raw.active !== false,
    featured: raw.featured === true,
    order: Number(raw.order || 0) || 0,
    theme,
    quoteService: ["web", "software", "video", "social", "hybrid"].includes(String(raw.quoteService || ""))
      ? (String(raw.quoteService) as ServicePackage["quoteService"])
      : undefined,
  };
}

function parseJsonArray<T>(value: unknown) {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [] as T[];
}

function normalizeQuestion(raw: Record<string, unknown>, id: string): QuoteQuestion {
  const typeValue = String(raw.type || "single").trim().toLowerCase();
  const type: QuoteQuestion["type"] = typeValue === "multi" || typeValue === "number" ? typeValue : "single";

  return {
    id,
    key: String(raw.key || "").trim(),
    title: String(raw.title || "").trim(),
    subtitle: String(raw.subtitle || "").trim() || undefined,
    type,
    options: parseJsonArray<QuestionOptionShape>(raw.options || raw.optionsJson)
      .map(option => ({
        label: String(option?.label || "").trim(),
        value: String(option?.value || "").trim(),
        priceDelta: Number(option?.priceDelta || 0),
      }))
      .filter(option => option.label && option.value),
    min: Number(raw.min || 0) || undefined,
    max: Number(raw.max || 0) || undefined,
    active: raw.active !== false,
    order: Number(raw.order || 0) || 0,
    serviceTypes: toArray(raw.serviceTypes),
  };
}

function normalizeRule(raw: Record<string, unknown>, id: string): QuoteRule {
  const priceTypeValue = String(raw.priceType || "add").trim().toLowerCase();
  const priceType: QuoteRule["priceType"] =
    priceTypeValue === "multiply" || priceTypeValue === "fixed" ? priceTypeValue : "add";

  const operatorFallback = "eq";

  return {
    id,
    name: String(raw.name || "").trim(),
    enabled: raw.enabled !== false,
    priority: Number(raw.priority || 0) || 0,
    conditions: parseJsonArray<RuleConditionShape>(raw.conditions || raw.conditionsJson)
      .map(condition => ({
        key: String(condition?.key || "").trim(),
        operator: ["eq", "includes", "gte", "lte"].includes(String(condition?.operator || ""))
          ? (String(condition?.operator) as QuoteRule["conditions"][number]["operator"])
          : operatorFallback,
        value: typeof condition?.value === "number" ? condition.value : String(condition?.value || "").trim(),
      }))
      .filter(condition => condition.key),
    priceType,
    value: Number(raw.value || 0),
    note: String(raw.note || "").trim() || undefined,
  };
}

export const fallbackProjects: Project[] = projectCaseStudies.map<Project>((project, index) => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  category: project.category,
  projectType: ["cinematic-brand", "social-growth"].includes(project.id) ? "Film" : "Web",
  summary: project.summary,
  description: project.description,
  coverUrl: project.coverUrl,
  year: project.year,
  featured: index < 2,
  active: true,
  order: index + 1,
})).concat({
  id: "bizim-6nci-kuyumculuk-app",
  title: "Bizim 6'ncı Kuyumculuk",
  slug: "bizim-6nci-kuyumculuk-app",
  category: "Shopping App",
  projectType: "App",
  summary: "Altın ve takı koleksiyonlarını keşif, güvenli sipariş, hesap yönetimi, favoriler ve stok bildirimleriyle mobilde buluşturan alışveriş uygulaması.",
  description: "Bizim 6'ncı Kuyumculuk için geliştirilen iOS uygulaması; ürün filtreleme, sepet, sipariş takibi, kuponlar, favoriler, iadeler ve stok bildirimlerini tek mobil deneyimde birleştirir.",
  coverUrl: "/images/projects/bizim-6nci-kuyumculuk-app.jpg",
  externalUrl: "https://apps.apple.com/tr/app/bizim-6nc%C4%B1-kuyumculuk/id6760553574?l=tr",
  client: "Bizim 6'ncı Kuyumculuk",
  year: 2026,
  featured: true,
  active: true,
  order: projectCaseStudies.length + 1,
}, {
  id: "the-jacks-coffee",
  title: "The Jacks Coffee",
  slug: "the-jacks-coffee-app",
  category: "Food & Beverage App",
  projectType: "App",
  summary: "Menü keşfi, hızlı sipariş, QR damga, kampanya ve sadakat deneyimini tek mobil uygulamada birleştiren kahve platformu.",
  description: "The Jacks Coffee Lounge için geliştirilen iOS uygulaması; sipariş, favoriler, QR sadakat sistemi, kampanyalar ve hesap yönetimini mobil öncelikli bir deneyimde toplar.",
  coverUrl: "/images/projects/the-jacks-coffee-app.jpg",
  externalUrl: "https://apps.apple.com/us/app/the-jacks-coffee/id6757435094",
  client: "The Jacks Coffee Lounge",
  year: 2026,
  featured: true,
  active: true,
  order: projectCaseStudies.length + 2,
});

export function inferProjectType(raw: Record<string, unknown>): Project["projectType"] {
  const explicit = String(raw.projectType || "").trim().toLocaleLowerCase("tr-TR");
  if (explicit === "app" || explicit === "uygulama") return "App";
  if (explicit === "film" || explicit === "video") return "Film";
  if (explicit === "web") return "Web";
  const context = `${raw.title || ""} ${raw.category || ""} ${raw.slug || ""}`.toLocaleLowerCase("tr-TR");
  if (context.includes("bizim 6'ncı") || context.includes("bizim-6nci") || context.includes("jacks") || context.includes("mobil uygulama") || context.includes("shopping app")) return "App";
  if (context.includes("film") || context.includes("prodüksiyon") || context.includes("reels")) return "Film";
  return "Web";
}

export const fallbackPackages: ServicePackage[] = [
  {
    id: "web-application",
    title: "Web Application",
    subtitle: "Kurumsal platform ve özel yazılım",
    priceFrom: 65000,
    description: "Markanın satış, operasyon ve müşteri deneyimini tek merkezde yöneten ölçeklenebilir dijital ürün.",
    features: ["Stratejik UX ve arayüz tasarımı", "Next.js web uygulaması", "Gelişmiş yönetim paneli", "Üyelik ve rol yönetimi", "CRM, ERP ve API entegrasyonları", "SEO, analitik ve performans mimarisi"],
    idealFor: ["Kurumsal markalar", "B2B hizmet şirketleri", "Dijital ürün girişimleri"],
    kpiFocus: ["Nitelikli lead", "Operasyon verimliliği", "Dönüşüm oranı"],
    deliveryTime: "5-9 hafta",
    supportWindow: "90 gün",
    maxRevision: 5,
    guarantee: "Yayın öncesi kalite kontrol, performans denetimi ve 90 günlük stabilizasyon desteği.",
    cta: "Web Sistemini Planla",
    theme: "graphite",
    quoteService: "software",
    active: true,
    order: 1
  },
  {
    id: "video-production",
    title: "Video Production",
    subtitle: "Sinematik marka ve kampanya filmleri",
    priceFrom: 45000,
    description: "Konseptten post prodüksiyona kadar markayı güçlü bir anlatıya dönüştüren uçtan uca film üretimi.",
    features: ["Kreatif konsept ve senaryo", "Storyboard ve çekim planı", "Sinematik kamera ve ışık ekibi", "Drone ve hareketli kamera opsiyonları", "Kurgu, renk ve ses tasarımı", "Dikey ve yatay teslim formatları"],
    idealFor: ["Marka lansmanları", "Reklam kampanyaları", "Ürün ve hizmet tanıtımları"],
    kpiFocus: ["İzlenme kalitesi", "Marka hatırlanırlığı", "Kampanya etkileşimi"],
    deliveryTime: "3-6 hafta",
    supportWindow: "45 gün",
    maxRevision: 3,
    guarantee: "Yayın platformlarına uygun master çıktılar ve arşivlenebilir teslim paketi.",
    cta: "Prodüksiyonu Planla",
    theme: "royal",
    quoteService: "video",
    active: true,
    order: 2
  },
  {
    id: "digital-flagship",
    title: "Digital Flagship",
    subtitle: "Web application + video production",
    priceFrom: 125000,
    description: "Dijital ürün, sinematik marka anlatısı ve büyüme altyapısını tek kreatif-teknoloji ekibinde birleştiren amiral paket.",
    features: ["Özel web uygulaması ve admin sistemi", "Marka filmi veya kampanya prodüksiyonu", "Fotoğraf ve dijital içerik kütüphanesi", "CRM, analitik ve otomasyon entegrasyonu", "Lansman stratejisi ve kanal adaptasyonları", "90 günlük optimizasyon ve danışmanlık"],
    idealFor: ["Yeni nesil kurumsal dönüşüm", "Marka ve ürün lansmanı", "Kategori liderliği hedefleyen ekipler"],
    kpiFocus: ["Dönüşüm", "Marka otoritesi", "Dijital operasyon", "İçerik performansı"],
    deliveryTime: "8-14 hafta",
    supportWindow: "120 gün",
    maxRevision: 6,
    guarantee: "Tek proje lideri, entegre üretim takvimi ve lansman sonrası performans optimizasyonu.",
    cta: "Flagship Kapsamını Oluştur",
    theme: "neon",
    badge: "En kapsamlı sistem",
    featured: true,
    quoteService: "hybrid",
    active: true,
    order: 3
  },
  {
    id: "emergency-drone",
    title: "Acil Drone Operasyon",
    subtitle: "Kurumsal hava görüntüleme · Hızlı planlama",
    priceFrom: 18000,
    description: "Etkinlik, tesis, şantiye, gayrimenkul ve kampanya ihtiyaçları için hızlı değerlendirme ve kontrollü drone çekim operasyonu.",
    features: ["Hızlı proje ve lokasyon briefi", "Uçuş uygunluğu ve operasyon kontrolü", "Kurumsal hedef kare / rota planı", "Tesis, etkinlik ve proje çekimi", "Teslim formatı ve kanal adaptasyonu", "14 gün dosya erişim desteği"],
    idealFor: ["Acil kurumsal çekim ihtiyacı", "Tesis ve şantiye sunumu", "Etkinlik ve lansman ekipleri"],
    kpiFocus: ["Operasyon hızı", "Kullanılabilir hava görüntüsü", "Net teslim planı"],
    deliveryTime: "Hızlı uygunluk",
    supportWindow: "14 gün",
    maxRevision: 1,
    guarantee: "Çekim öncesi lokasyon, hava koşulları ve operasyon uygunluğunu teyit eden kontrollü planlama yaklaşımı.",
    cta: "Acil Drone Çekimini Planla",
    theme: "dark",
    badge: "Hızlı operasyon",
    quoteService: "video",
    active: true,
    order: 4
  },
  {
    id: "social-growth-engine",
    title: "Social Growth Engine",
    subtitle: "Aylık Reels · İçerik · Büyüme sistemi",
    priceFrom: 32000,
    description: "Markanın her ay ne anlatacağını, nasıl üreteceğini ve hangi verilerle gelişeceğini düzenli bir içerik operasyonuna dönüştüren büyüme sistemi.",
    features: ["Aylık kreatif yön ve içerik planı", "Toplu Reels / Shorts çekim günü", "Dikey video kurgu ve motion graphics", "Kapak, altyazı ve kanal adaptasyonları", "Yayın takvimi ve içerik matrisi", "Aylık performans değerlendirmesi"],
    idealFor: ["Düzenli içerik üretmek isteyen markalar", "Sosyal satış yapan işletmeler", "Kurucu ve uzman markaları"],
    kpiFocus: ["İçerik devamlılığı", "Nitelikli erişim", "Etkileşim ve talep"],
    deliveryTime: "Aylık üretim döngüsü",
    supportWindow: "Sürekli kreatif destek",
    maxRevision: 2,
    guarantee: "Her ay yazılı içerik planı, teslim matrisi ve sonraki üretimi geliştiren performans notu.",
    cta: "Büyüme Sistemini Kur",
    theme: "light",
    badge: "Aylık büyüme",
    quoteService: "social",
    active: true,
    order: 5
  },
  {
    id: "ai-automation-suite",
    title: "AI Automation Suite",
    subtitle: "Yapay zekâ · CRM · Operasyon otomasyonu",
    priceFrom: 85000,
    description: "Tekrarlayan müşteri, teklif, içerik ve operasyon işlerini yapay zekâ destekli akışlarla hızlandıran kuruma özel otomasyon sistemi.",
    features: ["Operasyon ve darboğaz analizi", "AI destekli müşteri karşılama akışları", "CRM, form ve bildirim otomasyonları", "Teklif ve talep sınıflandırma sistemi", "Yönetim paneli ve canlı raporlama", "Ekip eğitimi, dokümantasyon ve stabilizasyon"],
    idealFor: ["Manuel operasyon yükü yüksek ekipler", "Çok kanaldan talep alan şirketler", "Ölçeklenmek isteyen hizmet markaları"],
    kpiFocus: ["Yanıt süresi", "Operasyon maliyeti", "Lead işleme verimliliği"],
    deliveryTime: "5-8 hafta",
    supportWindow: "90 gün stabilizasyon",
    maxRevision: 4,
    guarantee: "Canlıya alınan akışlar için senaryo testleri, hata kayıtları ve 90 günlük kontrollü iyileştirme desteği.",
    cta: "Otomasyonu Planla",
    theme: "graphite",
    badge: "Yeni nesil operasyon",
    quoteService: "software",
    active: true,
    order: 6
  }
];

export async function fetchActiveProjects() {
  try {
    const snap = await getDocs(query(collection(db, "projects"), where("active", "==", true), orderBy("order")));
    const data = snap.docs.map(d => {
      const raw = d.data() as Record<string, unknown>;
      return { id: d.id, ...raw, projectType: inferProjectType(raw) } as Project;
    });
    if (!data.length) return fallbackProjects;

    const dynamicBySlug = new Map(data.map(project => [project.slug, project]));
    const bundled = fallbackProjects.map(project => {
      const dynamic = dynamicBySlug.get(project.slug);
      return dynamic ? {
        ...project,
        ...dynamic,
        coverUrl: dynamic.coverUrl || project.coverUrl,
        projectType: dynamic.projectType || project.projectType,
        externalUrl: dynamic.externalUrl || project.externalUrl,
      } : project;
    });
    const bundledSlugs = new Set(fallbackProjects.map(project => project.slug));
    return [...bundled, ...data.filter(project => !bundledSlugs.has(project.slug))];
  } catch {
    return fallbackProjects;
  }
}

export async function fetchActivePackages() {
  try {
    const snap = await getDocs(query(collection(db, "packages"), where("active", "==", true), orderBy("order")));
    const data = snap.docs
      .map(d => normalizePackage(d.data() as Record<string, unknown>, d.id))
      .filter(item => item.title && item.priceFrom > 0 && item.features.length > 0);

    if (!data.length || !data.some(item => item.quoteService)) return fallbackPackages;

    const dynamicById = new Map(data.map(item => [item.id, item]));
    const bundled = fallbackPackages.map(item => {
      const dynamic = dynamicById.get(item.id);
      return dynamic ? {
        ...item,
        ...dynamic,
        image: dynamic.image || item.image,
        promoVideo: dynamic.promoVideo || item.promoVideo,
      } : item;
    });
    const bundledIds = new Set(fallbackPackages.map(item => item.id));
    return [...bundled, ...data.filter(item => !bundledIds.has(item.id))]
      .sort((first, second) => Number(first.order || 0) - Number(second.order || 0));
  } catch {
    return fallbackPackages;
  }
}

export async function fetchQuoteEngine() {
  const questionSnap = await getDocs(query(collection(db, "quote_questions"), where("active", "==", true), orderBy("order")));
  const ruleSnap = await getDocs(query(collection(db, "quote_rules"), where("enabled", "==", true), orderBy("priority")));

  return {
    questions: questionSnap.docs
      .map(d => normalizeQuestion(d.data() as Record<string, unknown>, d.id))
      .filter(x => x.active !== false && x.key && x.title),
    rules: ruleSnap.docs
      .map(d => normalizeRule(d.data() as Record<string, unknown>, d.id))
      .filter(x => x.enabled && x.name)
  };
}
