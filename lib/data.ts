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

    // Eski genel paket şeması yerine yeni uzmanlık paketlerini göster.
    // Admin panelden yeni şemayla en az bir akış tanımlandığında dinamik veri devralır.
    return data.length && data.some(item => item.quoteService)
      ? data
      : fallbackPackages;
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
