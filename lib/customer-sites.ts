import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

export type CustomerSiteTemplate = "studio" | "restaurant" | "portfolio";

export type CustomerSiteDraft = {
  template: CustomerSiteTemplate;
  accent: string;
  businessName: string;
  headline: string;
  subdomain: string;
  pages?: CustomerSitePage[];
  siteSettings?: CustomerSiteSettings;
};

export type CustomerSitePage = {
  id: string;
  title: string;
  slug: string;
  type: "home" | "standard" | "contact";
  visible: boolean;
  sections: CustomerSiteSectionValue[];
};

export type CustomerSiteSection = {
  id: string;
  type: string;
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  mediaUrl?: string;
  images?: string[];
};

export type CustomerSiteSectionValue = string | CustomerSiteSection;

const sectionDefaults: Record<string, Omit<CustomerSiteSection, "id" | "type">> = {
  hero: { eyebrow: "YENİ NESİL DİJİTAL DENEYİM", title: "Fikrinizi güçlü bir dijital deneyime dönüştürün.", description: "Strateji, tasarım ve teknolojiyle kalıcı sonuçlar üretiyoruz.", items: [], ctaLabel: "İletişime geç", ctaUrl: "/iletisim" },
  text: { eyebrow: "YAKLAŞIMIMIZ", title: "Net fikirler, güçlü sonuçlar.", description: "Her projeyi iş hedefi, kullanıcı deneyimi ve teknik sürdürülebilirlik ekseninde tasarlıyoruz.", items: ["Stratejik planlama", "Kurumsal tasarım", "Ölçeklenebilir teknoloji"] },
  features: { eyebrow: "YETKİNLİKLERİMİZ", title: "İşinizi ileri taşıyan sistemler.", description: "Markanızı büyüten temel yetkinlikler.", items: ["Strateji", "Tasarım", "Teknoloji"] },
  services: { eyebrow: "HİZMET SİSTEMİ", title: "İhtiyacınıza göre şekillenen uzmanlıklar.", description: "Tek ekip, birbirini tamamlayan üretim disiplinleri.", items: ["Web ve ürün tasarımı", "Film ve içerik üretimi", "Büyüme ve otomasyon"] },
  gallery: { eyebrow: "SEÇİLİ İŞLER", title: "Ürettiğimiz deneyimlerden seçkiler.", description: "Marka, dijital ürün ve prodüksiyon çalışmalarımız.", items: ["Marka deneyimi", "Dijital ürün", "Büyüme sistemi"] },
  testimonials: { eyebrow: "REFERANSLAR", title: "İş ortaklarımız anlatıyor.", description: "Uzun vadeli iş birliklerinden kısa notlar.", items: ["Süreci baştan sona güvenle yönettik.", "İhtiyacımızı anlayan hızlı ve yaratıcı bir ekip.", "Dijital performansımız ölçülebilir biçimde gelişti."] },
  stats: { eyebrow: "ETKİMİZ", title: "Rakamlarla görünür sonuçlar.", description: "İş hedeflerine temas eden üretim performansı.", items: ["48+ Tamamlanan proje", "%92 Müşteri memnuniyeti", "6 Disiplin", "12+ Yıllık deneyim"] },
  pricing: { eyebrow: "ÇALIŞMA MODELLERİ", title: "İhtiyacınıza uygun kapsamı seçin.", description: "Şeffaf kapsam, net teslim ve ölçeklenebilir destek.", items: ["Başlangıç — Temel ihtiyaçlar", "Büyüme — Sürekli üretim", "Özel — Kurumsal kapsam"] },
  faq: { eyebrow: "SIK SORULANLAR", title: "Karar vermeden önce bilmeniz gerekenler.", description: "Süreç, teslim ve destek hakkında kısa yanıtlar.", items: ["Proje ne kadar sürer?", "Revizyon süreci nasıl işler?", "Yayın sonrası destek var mı?"] },
  team: { eyebrow: "EKİBİMİZ", title: "Her aşamada uzman bakış.", description: "Strateji, tasarım ve teknolojiyi aynı masada buluşturuyoruz.", items: ["Kreatif strateji", "Tasarım ve motion", "Yazılım ve otomasyon"] },
  logos: { eyebrow: "BİZE GÜVENENLER", title: "Birlikte değer ürettiğimiz markalar.", description: "Farklı sektörlerden iş ortakları.", items: ["Marka 01", "Marka 02", "Marka 03", "Marka 04", "Marka 05"] },
  timeline: { eyebrow: "SÜREÇ", title: "Fikirden yayına kontrollü ilerleyiş.", description: "Her aşaması görünür, ölçülebilir ve birlikte yönetilen süreç.", items: ["01 Keşif ve hedef", "02 Strateji ve tasarım", "03 Üretim ve test", "04 Yayın ve büyüme"] },
  video: { eyebrow: "SHOWREEL", title: "Hikâyenizi hareketle anlatın.", description: "Film, motion design ve dijital deneyimlerden seçilmiş anlar.", items: [], ctaLabel: "Videoyu oynat", ctaUrl: "#video", mediaUrl: "" },
  cta: { eyebrow: "SIRADAKİ ADIM", title: "Birlikte dikkat çekelim.", description: "İhtiyacınızı konuşalım, doğru kapsamı birlikte oluşturalım.", items: [], ctaLabel: "Projeyi başlat", ctaUrl: "/iletisim" },
  contact: { eyebrow: "BİRLİKTE ÇALIŞALIM", title: "Yeni bir şey başlatalım.", description: "Kısa formu doldurun, ekibimiz sizinle iletişime geçsin.", items: ["Ad soyad", "E-posta", "Mesajınız"], ctaLabel: "Mesaj gönder", ctaUrl: "#contact" },
};

export function getCustomerSectionType(section: CustomerSiteSectionValue): string {
  return typeof section === "string" ? section : section.type;
}

export function createCustomerSection(type: string, id = `${type}-${Date.now()}`): CustomerSiteSection {
  const defaults = sectionDefaults[type] || sectionDefaults.text;
  return { id, type, ...defaults, items: [...defaults.items] };
}

export function resolveCustomerSection(section: CustomerSiteSectionValue | null | undefined, fallbackId: string): CustomerSiteSection {
  if (typeof section === "string") return createCustomerSection(section, fallbackId);
  if (!section) return createCustomerSection("text", fallbackId);
  const defaults = createCustomerSection(section.type, section.id || fallbackId);
  return { ...defaults, ...section, items: Array.isArray(section.items) ? section.items : defaults.items };
}

export type CustomerSiteSettings = {
  seoTitle: string;
  seoDescription: string;
  cookieBanner: boolean;
  analytics: boolean;
  maintenance: boolean;
};

export type CustomerSiteRecord = CustomerSiteDraft & {
  id: string;
  ownerId: string;
  status: "draft" | "published";
  createdAt?: { toMillis?: () => number } | null;
  updatedAt?: { toMillis?: () => number } | null;
};

const PENDING_SITE_KEY = "dromocob.pending-customer-site.v1";

export function storePendingSite(draft: CustomerSiteDraft): void {
  window.localStorage.setItem(PENDING_SITE_KEY, JSON.stringify(draft));
}

export function readPendingSite(): CustomerSiteDraft | null {
  try {
    const raw = window.localStorage.getItem(PENDING_SITE_KEY);
    return raw ? JSON.parse(raw) as CustomerSiteDraft : null;
  } catch {
    return null;
  }
}

export function clearPendingSite(): void {
  window.localStorage.removeItem(PENDING_SITE_KEY);
}

export async function saveCustomerSite(ownerId: string, draft: CustomerSiteDraft, existingId?: string | null): Promise<string> {
  const siteRef = existingId ? doc(db, "customer_sites", existingId) : doc(collection(db, "customer_sites"));
  await setDoc(siteRef, {
    ...draft,
    ownerId,
    status: "published",
    ...(existingId ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  }, { merge: Boolean(existingId) });
  return siteRef.id;
}

export async function importPendingSite(ownerId: string): Promise<string | null> {
  const draft = readPendingSite();
  if (!draft) return null;
  const id = await saveCustomerSite(ownerId, draft);
  clearPendingSite();
  return id;
}
