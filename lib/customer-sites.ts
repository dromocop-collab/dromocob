import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export type CustomerSiteTemplate = "studio" | "restaurant" | "portfolio";

export type CustomerBusinessIndustry = "creative" | "restaurant" | "beauty" | "health" | "construction" | "real-estate" | "ecommerce" | "professional";
export type CustomerSiteGoal = "whatsapp" | "call" | "appointment" | "quote" | "sales";
export type CustomerBrandTone = "bold" | "premium" | "warm" | "minimal";

export type CustomerSiteBrief = {
  industry: CustomerBusinessIndustry;
  location: string;
  audience: string;
  services: string[];
  primaryGoal: CustomerSiteGoal;
  contactValue: string;
  differentiator: string;
  brandTone: CustomerBrandTone;
};

export type CustomerSiteDraft = {
  template: CustomerSiteTemplate;
  accent: string;
  businessName: string;
  headline: string;
  subdomain: string;
  brief?: CustomerSiteBrief;
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

const industryLabels: Record<CustomerBusinessIndustry, string> = {
  creative: "Yaratıcı stüdyo",
  restaurant: "Restoran ve gastronomi",
  beauty: "Güzellik ve bakım",
  health: "Sağlık ve danışmanlık",
  construction: "İnşaat ve mimarlık",
  "real-estate": "Gayrimenkul",
  ecommerce: "E-ticaret ve perakende",
  professional: "Profesyonel hizmetler",
};

const goalCopy: Record<CustomerSiteGoal, { label: string; url: string; contactTitle: string }> = {
  whatsapp: { label: "WhatsApp'tan yazın", url: "https://wa.me/", contactTitle: "Hızlıca konuşalım." },
  call: { label: "Hemen arayın", url: "tel:", contactTitle: "Bizi doğrudan arayın." },
  appointment: { label: "Randevu oluşturun", url: "/iletisim", contactTitle: "Size uygun zamanı seçelim." },
  quote: { label: "Teklif alın", url: "/iletisim", contactTitle: "İhtiyacınızı birlikte netleştirelim." },
  sales: { label: "Ürünleri keşfedin", url: "#hizmetler", contactTitle: "Aradığınızı birlikte bulalım." },
};

export function createCustomerSitePages(input: Pick<CustomerSiteDraft, "businessName" | "headline" | "brief">): CustomerSitePage[] {
  const businessName = input.businessName.trim() || "Markanız";
  const brief = input.brief;
  const services = brief?.services?.filter(Boolean).slice(0, 6) || [];
  const industry = brief ? industryLabels[brief.industry] : "Yeni nesil işletme";
  const location = brief?.location?.trim() || "Türkiye";
  const audience = brief?.audience?.trim() || "doğru müşteriler";
  const difference = brief?.differentiator?.trim() || "İhtiyacı anlayan, güven veren ve sonuç odaklı bir deneyim sunuyoruz.";
  const goal = goalCopy[brief?.primaryGoal || "quote"];
  const contactValue = brief?.contactValue?.trim() || "";
  const contactDigits = contactValue.replace(/\D/g, "");
  const goalUrl = brief?.primaryGoal === "whatsapp" && contactDigits
    ? `https://wa.me/${contactDigits}`
    : brief?.primaryGoal === "call" && contactValue
      ? `tel:${contactValue.replace(/\s/g, "")}`
      : brief?.primaryGoal === "appointment" && /^https?:\/\//.test(contactValue)
        ? contactValue
        : goal.url;
  const serviceItems = services.length ? services : ["Stratejik danışmanlık", "Uçtan uca hizmet", "Sürekli destek"];

  return [
    {
      id: "home",
      title: "Anasayfa",
      slug: "/",
      type: "home",
      visible: true,
      sections: [
        { id: "home-hero", type: "hero", eyebrow: `${industry.toUpperCase()} · ${location.toUpperCase()}`, title: input.headline, description: `${businessName}, ${audience} için net, güvenilir ve özenli çözümler üretir.`, items: [], ctaLabel: goal.label, ctaUrl: goalUrl },
        { id: "home-services", type: "services", eyebrow: "UZMANLIK ALANLARIMIZ", title: "İhtiyacınıza göre şekillenen hizmetler.", description: difference, items: serviceItems },
        { id: "home-text", type: "text", eyebrow: `NEDEN ${businessName.toUpperCase()}?`, title: "İyi iş, doğru anlayışla başlar.", description: difference, items: ["İhtiyaca özel yaklaşım", `${location} odaklı hizmet`, "Şeffaf ve hızlı iletişim"] },
        { id: "home-cta", type: "cta", eyebrow: "SIRADAKİ ADIM", title: goal.contactTitle, description: `${businessName} ekibiyle iletişime geçin; ihtiyacınızı dinleyip en doğru rotayı birlikte oluşturalım.`, items: [], ctaLabel: goal.label, ctaUrl: goalUrl },
      ],
    },
    {
      id: "about",
      title: "Hakkımızda",
      slug: "/hakkimizda",
      type: "standard",
      visible: true,
      sections: [
        { id: "about-hero", type: "hero", eyebrow: `${businessName.toUpperCase()} · ${industry.toUpperCase()}`, title: `${location}'dan daha iyisini üretmek için çalışıyoruz.`, description: difference, items: [], ctaLabel: goal.label, ctaUrl: goalUrl },
        { id: "about-story", type: "text", eyebrow: "YAKLAŞIMIMIZ", title: `${audience} için tasarlanmış gerçek çözümler.`, description: `${businessName}, her projeye dikkat, uzmanlık ve açık iletişimle yaklaşır.`, items: serviceItems.slice(0, 3) },
        { id: "about-process", type: "timeline", eyebrow: "NASIL ÇALIŞIYORUZ", title: "İlk görüşmeden sonuca net bir süreç.", description: "Her adımı görünür ve anlaşılır tutuyoruz.", items: ["01 İhtiyacı dinliyoruz", "02 Doğru çözümü planlıyoruz", "03 Özenle uyguluyoruz", "04 Sonucu birlikte büyütüyoruz"] },
      ],
    },
    {
      id: "contact",
      title: "İletişim",
      slug: "/iletisim",
      type: "contact",
      visible: true,
      sections: [
        { id: "contact-hero", type: "hero", eyebrow: `${location.toUpperCase()} · İLETİŞİM`, title: goal.contactTitle, description: `Sorunuzu veya ihtiyacınızı paylaşın. ${businessName} ekibi en kısa sürede size dönüş yapsın.`, items: [], ctaLabel: goal.label, ctaUrl: goalUrl },
        { id: "contact-form", type: "contact", eyebrow: "BİZE ULAŞIN", title: "Mesajınızı bırakın.", description: "Kısa bilgilerinizi paylaşın, görüşmeyi biz başlatalım.", items: ["Ad soyad", "Telefon / E-posta", "Nasıl yardımcı olabiliriz?"], ctaLabel: "Mesajı gönder", ctaUrl: "#contact" },
      ],
    },
  ];
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
const PENDING_SITE_TRANSFER_KEY = "dromocob.pending-customer-site.transfer.v1";

function pendingTransferId(): string {
  const current = window.localStorage.getItem(PENDING_SITE_TRANSFER_KEY);
  if (current) return current;
  const next = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(PENDING_SITE_TRANSFER_KEY, next);
  return next;
}

export function storePendingSite(draft: CustomerSiteDraft): void {
  pendingTransferId();
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
  window.localStorage.removeItem(PENDING_SITE_TRANSFER_KEY);
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
  const user = auth.currentUser;
  if (!user || user.uid !== ownerId) throw new Error("Oturum doğrulanamadı. Lütfen yeniden giriş yapıp tekrar dene.");
  const token = await user.getIdToken();
  const response = await fetch("/api/customer-sites/import", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ draft, transferId: pendingTransferId() }),
  });
  const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null;
  if (!response.ok || !payload?.id) throw new Error(payload?.message || "Taslak sunucuya aktarılamadı. Taslağın cihazında güvende; tekrar deneyebilirsin.");
  clearPendingSite();
  return payload.id;
}
