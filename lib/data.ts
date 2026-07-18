"use client";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

export const fallbackProjects: Project[] = [
  {
    id: "cinematic-brand",
    title: "Cinematic Brand Film",
    slug: "cinematic-brand-film",
    category: "Film Production",
    summary: "Marka hikâyesini premium sinematografi ve güçlü kurgu ile anlatan kampanya filmi.",
    description: "Sony FX3, profesyonel hareket sistemleri ve sinematik post-prodüksiyon yaklaşımı.",
    featured: true,
    active: true,
    order: 1
  },
  {
    id: "digital-commerce",
    title: "Digital Commerce System",
    slug: "digital-commerce-system",
    category: "Web & Product",
    summary: "Dinamik fiyat, admin operasyonu ve analitik odaklı modern e-ticaret deneyimi.",
    description: "Next.js ve Firebase tabanlı ölçeklenebilir dijital ürün altyapısı.",
    featured: true,
    active: true,
    order: 2
  },
  {
    id: "social-growth",
    title: "Social Growth Direction",
    slug: "social-growth-direction",
    category: "Growth",
    summary: "Reels, kreatif yön ve reklam odaklı uçtan uca sosyal büyüme sistemi.",
    description: "İçerik üretiminden yayın planına kadar bütünleşik yönetim.",
    active: true,
    order: 3
  }
];

export const fallbackPackages: ServicePackage[] = [
  {
    id: "launch",
    title: "Launch",
    subtitle: "Yeni marka ve işletmeler için",
    priceFrom: 25000,
    description: "Dijitalde güçlü bir ilk izlenim için temel kurumsal sistem.",
    features: ["Kurumsal web sitesi", "Mobil uyum", "Temel SEO", "İletişim ve teklif akışı", "Analytics kurulumu"],
    idealFor: ["Yeni kurulan işletmeler", "İlk dijital dönüşümünü yapan markalar"],
    kpiFocus: ["Lansman görünürlüğü", "Temel lead toplama"],
    deliveryTime: "2-3 hafta",
    supportWindow: "30 gün",
    maxRevision: 2,
    guarantee: "Yayına alındıktan sonraki ilk ay teknik stabilite desteği.",
    cta: "Launch Paketi Planla",
    theme: "dark",
    active: true,
    order: 1
  },
  {
    id: "growth",
    title: "Growth",
    subtitle: "Büyümek isteyen işletmeler için",
    priceFrom: 55000,
    description: "İçerik, web ve dönüşüm odaklı büyüme katmanı.",
    features: ["Gelişmiş dinamik web", "Admin panel", "İçerik sistemi", "Reels kreatif planı", "Dönüşüm optimizasyonu"],
    idealFor: ["Büyüme dönemindeki KOBİ", "Dijitalde düzenli müşteri akışı isteyen ekipler"],
    kpiFocus: ["Dönüşüm oranı", "Müşteri edinme maliyeti", "Satış başına gelir"],
    deliveryTime: "3-5 hafta",
    supportWindow: "60 gün",
    maxRevision: 4,
    guarantee: "Dönüşüm hunisi için temel CRO iyileştirmeleri ve performans takibi.",
    cta: "Growth Planını Özelleştir",
    theme: "light",
    badge: "En çok tercih edilen",
    featured: true,
    active: true,
    order: 2
  },
  {
    id: "authority",
    title: "Authority",
    subtitle: "Markasını kategorisinde lider konumlamak isteyenlere",
    priceFrom: 95000,
    description: "Özel yazılım, sinematik prodüksiyon ve performans mimarisi.",
    features: ["Özel web uygulaması", "Gelişmiş admin operasyonu", "Video prodüksiyon", "SEO mimarisi", "Aylık stratejik yönetim"],
    idealFor: ["Kurumsal ekipler", "Çoklu kanal büyüme hedefi olan markalar"],
    kpiFocus: ["Pazar payı", "Marka otoritesi", "Uzun vadeli gelir artışı"],
    deliveryTime: "6-10 hafta",
    supportWindow: "90 gün",
    maxRevision: 6,
    guarantee: "Quarter bazlı strateji ve ölçeklenebilir teknik mimari desteği.",
    cta: "Authority Programına Başla",
    theme: "neon",
    active: true,
    order: 3
  }
];

export async function fetchActiveProjects() {
  try {
    const snap = await getDocs(query(collection(db, "projects"), where("active", "==", true), orderBy("order")));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    return data.length ? data : fallbackProjects;
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

    return data.length ? data : fallbackPackages;
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
