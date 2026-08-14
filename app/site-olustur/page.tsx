"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, ChevronDown, Eye, Globe2, LayoutTemplate, MapPin, Monitor, Rocket, Smartphone, Sparkles, Target, Users, WandSparkles, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase";
import {
  clearPendingSite,
  createCustomerSitePages,
  readPendingSite,
  saveCustomerSite,
  storePendingSite,
  type CustomerBrandTone,
  type CustomerBusinessIndustry,
  type CustomerSiteBrief,
  type CustomerSiteDraft,
  type CustomerSiteGoal,
  type CustomerSiteTemplate,
} from "@/lib/customer-sites";

type Device = "desktop" | "mobile";

const industryOptions: Array<{
  id: CustomerBusinessIndustry;
  label: string;
  detail: string;
  template: CustomerSiteTemplate;
  accent: string;
  services: string[];
  audience: string;
  headline: string;
}> = [
  { id: "creative", label: "Ajans & yaratıcı işler", detail: "Stüdyo, prodüksiyon, yazılım", template: "studio", accent: "#d9ff43", services: ["Marka stratejisi", "Web tasarım", "İçerik üretimi"], audience: "büyümek isteyen markalar", headline: "Fikirleri etkileyici deneyimlere dönüştürüyoruz." },
  { id: "restaurant", label: "Restoran & gastronomi", detail: "Restoran, kafe, butik üretim", template: "restaurant", accent: "#ff725e", services: ["Sezon menüsü", "Özel davetler", "Masa rezervasyonu"], audience: "iyi lezzet ve özel deneyim arayan misafirler", headline: "Mevsimin en iyi hâli, aynı masada." },
  { id: "beauty", label: "Güzellik & bakım", detail: "Salon, klinik, wellness", template: "portfolio", accent: "#e7a6a1", services: ["Cilt bakımı", "Profesyonel uygulamalar", "Kişisel bakım planı"], audience: "kendine iyi bakmayı önemseyen misafirler", headline: "Kendinin en iyi hâline yer aç." },
  { id: "health", label: "Sağlık & danışmanlık", detail: "Klinik, uzman, terapi", template: "portfolio", accent: "#64c8b4", services: ["Uzman değerlendirmesi", "Kişisel danışmanlık", "Takip programı"], audience: "güvenilir uzman desteği arayan danışanlar", headline: "Sağlığınız için güven veren bir başlangıç." },
  { id: "construction", label: "İnşaat & mimarlık", detail: "Mimarlık, yapı, dekorasyon", template: "studio", accent: "#f0b84b", services: ["Proje tasarımı", "Uygulama ve taahhüt", "İç mimari"], audience: "nitelikli yaşam alanları arayan yatırımcılar", headline: "Kalıcı yapılar, ölçülü detaylar, güçlü yaşamlar." },
  { id: "real-estate", label: "Gayrimenkul", detail: "Emlak, proje, yatırım", template: "studio", accent: "#70b7ff", services: ["Portföy danışmanlığı", "Yatırım analizi", "Satış ve kiralama"], audience: "doğru gayrimenkul fırsatını arayan yatırımcılar", headline: "Doğru lokasyon. Güçlü yatırım. Net karar." },
  { id: "ecommerce", label: "E-ticaret & perakende", detail: "Ürün, butik, online mağaza", template: "portfolio", accent: "#ff9a55", services: ["Yeni koleksiyon", "Çok satanlar", "Hızlı teslimat"], audience: "özgün ve kaliteli ürünler arayan müşteriler", headline: "Seveceğiniz ürünler, zahmetsiz bir alışveriş." },
  { id: "professional", label: "Profesyonel hizmet", detail: "Hukuk, mali müşavirlik, B2B", template: "portfolio", accent: "#9eb6d8", services: ["Stratejik danışmanlık", "Kurumsal çözümler", "Sürekli destek"], audience: "güvenilir bir iş ortağı arayan kurumlar", headline: "Karmaşık ihtiyaçlara açık, güvenilir çözümler." },
];

const goalOptions: Array<{ id: CustomerSiteGoal; label: string; detail: string; cta: string }> = [
  { id: "whatsapp", label: "WhatsApp mesajı", detail: "Hızlı iletişim ve sıcak lead", cta: "WhatsApp'tan yazın" },
  { id: "call", label: "Telefon araması", detail: "Doğrudan görüşme", cta: "Hemen arayın" },
  { id: "appointment", label: "Randevu", detail: "Takvim ve rezervasyon", cta: "Randevu oluşturun" },
  { id: "quote", label: "Teklif talebi", detail: "Nitelikli proje başvurusu", cta: "Teklif alın" },
  { id: "sales", label: "Ürün satışı", detail: "Koleksiyon ve ürün keşfi", cta: "Ürünleri keşfedin" },
];

const toneOptions: Array<{ id: CustomerBrandTone; label: string; detail: string }> = [
  { id: "bold", label: "Cesur", detail: "Büyük tipografi, güçlü kontrast" },
  { id: "premium", label: "Premium", detail: "Seçkin, rafine ve güvenli" },
  { id: "warm", label: "Samimi", detail: "Yakın, insani ve davetkâr" },
  { id: "minimal", label: "Minimal", detail: "Sade, net ve odaklı" },
];

const templates = [
  { id: "studio" as const, name: "Editorial Impact", tone: "Koyu, cesur, yüksek etki" },
  { id: "restaurant" as const, name: "Warm Stories", tone: "Sıcak, duyusal, atmosferik" },
  { id: "portfolio" as const, name: "Quiet Confidence", tone: "Temiz, rafine, güven veren" },
];

const palettes = [
  { name: "Lime", value: "#d9ff43" }, { name: "Coral", value: "#ff725e" }, { name: "Azure", value: "#66a7ff" },
  { name: "Sage", value: "#64c8b4" }, { name: "Amber", value: "#f0b84b" }, { name: "Rose", value: "#e7a6a1" },
];

const defaultBrief: CustomerSiteBrief = {
  industry: "creative",
  location: "İstanbul",
  audience: industryOptions[0].audience,
  services: industryOptions[0].services,
  primaryGoal: "quote",
  contactValue: "",
  differentiator: "Strateji, tasarım ve teknolojiyi tek ekipte buluşturuyoruz.",
  brandTone: "bold",
};

function slugify(value: string): string {
  return value.toLocaleLowerCase("tr-TR").replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i").replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SiteBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const editingSiteId = searchParams.get("site");
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<CustomerSiteTemplate>("studio");
  const [device, setDevice] = useState<Device>("desktop");
  const [accent, setAccent] = useState(palettes[0].value);
  const [businessName, setBusinessName] = useState("NOVA STUDIO");
  const [headline, setHeadline] = useState(industryOptions[0].headline);
  const [subdomain, setSubdomain] = useState("nova-studio");
  const [subdomainEdited, setSubdomainEdited] = useState(false);
  const [brief, setBrief] = useState<CustomerSiteBrief>(defaultBrief);
  const [customService, setCustomService] = useState("");
  const [copyVersion, setCopyVersion] = useState(0);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [draftReady, setDraftReady] = useState(false);

  const industry = industryOptions.find((item) => item.id === brief.industry) || industryOptions[0];
  const primaryGoal = goalOptions.find((item) => item.id === brief.primaryGoal) || goalOptions[3];
  const safeSubdomain = useMemo(() => slugify(subdomain), [subdomain]);
  const pages = useMemo(() => createCustomerSitePages({ businessName, headline, brief }), [brief, businessName, headline]);
  const draft = useMemo<CustomerSiteDraft>(() => ({ template, accent, businessName, headline, subdomain: safeSubdomain, brief, pages }), [accent, brief, businessName, headline, pages, safeSubdomain, template]);
  const needsDirectContact = brief.primaryGoal === "whatsapp" || brief.primaryGoal === "call";
  const briefScore = [businessName, brief.location, brief.audience, brief.services.length ? "yes" : "", brief.differentiator, headline, !needsDirectContact || brief.contactValue].filter(Boolean).length;

  function hydrateDraft(site: CustomerSiteDraft) {
    const inferredIndustry: CustomerBusinessIndustry = site.template === "restaurant" ? "restaurant" : "creative";
    const inferredConfig = industryOptions.find((item) => item.id === inferredIndustry) || industryOptions[0];
    setTemplate(site.template);
    setAccent(site.accent);
    setBusinessName(site.businessName);
    setHeadline(site.headline);
    setSubdomain(site.subdomain);
    setSubdomainEdited(true);
    setBrief(site.brief ? { ...defaultBrief, ...site.brief } : { ...defaultBrief, industry: inferredIndustry, services: inferredConfig.services, audience: inferredConfig.audience });
  }

  useEffect(() => {
    if (editingSiteId || authLoading) return;
    const pending = readPendingSite();
    queueMicrotask(() => {
      if (pending) hydrateDraft(pending);
      setDraftReady(true);
    });
  }, [authLoading, editingSiteId]);

  useEffect(() => {
    if (!editingSiteId || !user) return;
    let active = true;
    getDoc(doc(db, "customer_sites", editingSiteId)).then((snapshot) => {
      if (!active || !snapshot.exists() || snapshot.data().ownerId !== user.uid) return;
      hydrateDraft(snapshot.data() as CustomerSiteDraft);
      setDraftReady(true);
    }).catch(() => setSaveError("Site bilgileri yüklenemedi."));
    return () => { active = false; };
  }, [editingSiteId, user]);

  useEffect(() => {
    if (!editingSiteId && draftReady) storePendingSite(draft);
  }, [draft, draftReady, editingSiteId]);

  function updateBrief<K extends keyof CustomerSiteBrief>(key: K, value: CustomerSiteBrief[K]) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  function chooseIndustry(id: CustomerBusinessIndustry) {
    const next = industryOptions.find((item) => item.id === id) || industryOptions[0];
    setBrief((current) => ({ ...current, industry: id, services: next.services, audience: next.audience }));
    setTemplate(next.template);
    setAccent(next.accent);
    setHeadline(next.headline);
  }

  function handleBusinessName(value: string) {
    setBusinessName(value);
    if (!subdomainEdited) setSubdomain(slugify(value));
  }

  function toggleService(service: string) {
    setBrief((current) => ({ ...current, services: current.services.includes(service) ? current.services.filter((item) => item !== service) : [...current.services, service].slice(0, 6) }));
  }

  function addCustomService() {
    const service = customService.trim();
    if (!service || brief.services.includes(service)) return;
    updateBrief("services", [...brief.services, service].slice(0, 6));
    setCustomService("");
  }

  function generateHeadline() {
    const options: Record<CustomerBusinessIndustry, string[]> = {
      creative: ["Fikirden etkiye uzanan dijital deneyimler.", "Markanızı yarının kültürüne taşıyoruz.", "Stratejiyle başlar, etkiyle hatırlanır."],
      restaurant: ["İyi malzeme, açık ateş, unutulmayan akşamlar.", "Her tabakta mevsim, her masada yeni bir hikâye.", "Şehrin ritmi, sofranın sıcaklığı."],
      beauty: ["Işığınızı ortaya çıkaran özenli dokunuşlar.", "Bakım değil, kendinize ayırdığınız iyi bir an.", "Doğal güzelliğiniz için kişisel bir yaklaşım."],
      health: ["Bilgiyle dinliyor, güvenle yanınızda oluyoruz.", "Sağlığınız için anlaşılır ve kişisel bir yol.", "İyi hissetmeye güvenli bir başlangıç."],
      construction: ["İyi tasarım, sağlam uygulama, kalıcı değer.", "Yaşamı ölçüyle, yapıyı özenle tasarlıyoruz.", "Bugünden geleceğe kalan mekânlar."],
      "real-estate": ["Doğru mülkü değil, doğru kararı bulun.", "Lokasyonu değere, fırsatı yatırıma dönüştürün.", "Yeni yaşamınız için güvenilir bir rota."],
      ecommerce: ["Özenle seçildi, sizin için bir araya geldi.", "Yeni favorileriniz tek bir dokunuş uzağınızda.", "İyi tasarım, iyi ürün, kolay alışveriş."],
      professional: ["Deneyimle analiz ediyor, netlikle çözüyoruz.", "İşiniz için güvenilir akıl, ölçülebilir sonuç.", "Karmaşık kararlar için sağlam bir ortak."],
    };
    const nextVersion = copyVersion + 1;
    setCopyVersion(nextVersion);
    setHeadline(options[brief.industry][nextVersion % options[brief.industry].length]);
  }

  function canContinue() {
    if (step === 1) return Boolean(businessName.trim() && brief.location.trim());
    if (step === 2) return Boolean(brief.audience.trim() && brief.services.length && brief.differentiator.trim() && (!needsDirectContact || brief.contactValue.trim()));
    if (step === 3) return Boolean(headline.trim());
    return true;
  }

  async function handlePublish() {
    setSaveError("");
    if (!user) {
      storePendingSite(draft);
      setPublished(true);
      return;
    }
    setSaving(true);
    try {
      await saveCustomerSite(user.uid, draft, editingSiteId);
      clearPendingSite();
      router.push("/sitelerim");
    } catch {
      setSaveError("Site kaydedilemedi. Lütfen tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  const stepMeta = [
    { label: "İşletme", title: "Önce işini anlayalım.", description: "Sektörünü ve hizmet verdiğin bölgeyi seç; tasarım motoru ilk yönü oluştursun." },
    { label: "Hedef", title: "Kime, ne sunuyorsun?", description: "İçerik yapısını müşterilerine ve ana dönüşüm hedefine göre kuralım." },
    { label: "Tasarım", title: "Markanı sahneye çıkar.", description: "Sana özel hazırlanan tasarım yönünü son dokunuşlarla güçlendir." },
    { label: "Yayınla", title: "Yeni adresin hazır.", description: "Üretilen site mimarisini kontrol et ve markanı dünyaya aç." },
  ];

  return (
    <main className="site-builder">
      <header className="builder-topbar">
        <Link href="/" className="builder-back" aria-label="Ana sayfaya dön"><ArrowLeft size={17} /> <span>DROMOCOB</span></Link>
        <div className="builder-progress" aria-label={`Adım ${step} / 4`}>
          {stepMeta.map((item, index) => <button key={item.label} className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} onClick={() => index + 1 <= step && setStep(index + 1)}><i>{step > index + 1 ? <Check size={12} /> : index + 1}</i><span>{item.label}</span></button>)}
        </div>
        <div className="builder-autosave"><span /> Brief %{Math.round((briefScore / 7) * 100)} hazır</div>
      </header>

      <section className="builder-workspace">
        <aside className="builder-panel">
          <div className="builder-panel-heading"><p>0{step} / 04 · DROMOCOB SITES INTELLIGENCE</p><h1>{stepMeta[step - 1].title}</h1><span>{stepMeta[step - 1].description}</span></div>

          {step === 1 && <div className="business-discovery-controls">
            <fieldset><legend>İşletme türün nedir?</legend><div className="industry-grid">{industryOptions.map((item, index) => <button type="button" key={item.id} className={brief.industry === item.id ? "selected" : ""} onClick={() => chooseIndustry(item.id)}><i>{String(index + 1).padStart(2, "0")}</i><span><strong>{item.label}</strong><small>{item.detail}</small></span>{brief.industry === item.id && <Check />}</button>)}</div></fieldset>
            <div className="builder-field-grid">
              <label><span>İşletme / marka adı</span><div><Building2 /><input value={businessName} maxLength={36} onChange={(event) => handleBusinessName(event.target.value)} placeholder="Örn. Nova Studio" /></div></label>
              <label><span>Hizmet bölgesi</span><div><MapPin /><input value={brief.location} maxLength={40} onChange={(event) => updateBrief("location", event.target.value)} placeholder="Örn. Fethiye" /></div></label>
            </div>
            <div className="builder-intelligence-note"><Sparkles /><span><strong>Tasarım motoru aktif</strong><small>{industry.label} sektörü için {template === "studio" ? "yüksek etkili" : template === "restaurant" ? "atmosferik" : "rafine"} bir başlangıç yönü hazırlandı.</small></span></div>
          </div>}

          {step === 2 && <div className="business-goal-controls">
            <label className="builder-text-field"><span>İdeal müşterin kim?</span><div><Users /><textarea rows={2} value={brief.audience} maxLength={120} onChange={(event) => updateBrief("audience", event.target.value)} placeholder="Örn. Yeni ev arayan aileler" /></div><small>{brief.audience.length} / 120</small></label>
            <fieldset><legend>Öne çıkarmak istediğin hizmetler</legend><div className="service-chip-grid">{industry.services.map((service) => <button type="button" key={service} className={brief.services.includes(service) ? "selected" : ""} onClick={() => toggleService(service)}>{brief.services.includes(service) && <Check />}{service}</button>)}</div><div className="custom-service-field"><input value={customService} onChange={(event) => setCustomService(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomService(); } }} placeholder="Başka bir hizmet ekle" maxLength={42} /><button type="button" onClick={addCustomService}>Ekle</button></div>{brief.services.some((service) => !industry.services.includes(service)) && <div className="custom-service-list">{brief.services.filter((service) => !industry.services.includes(service)).map((service) => <button type="button" key={service} onClick={() => toggleService(service)}>{service}<X /></button>)}</div>}</fieldset>
            <fieldset><legend>Sitenin ana hedefi</legend><div className="goal-grid">{goalOptions.map((goal) => <button type="button" key={goal.id} className={brief.primaryGoal === goal.id ? "selected" : ""} onClick={() => updateBrief("primaryGoal", goal.id)}><Target /><span><strong>{goal.label}</strong><small>{goal.detail}</small></span>{brief.primaryGoal === goal.id && <Check />}</button>)}</div></fieldset>
            {(brief.primaryGoal === "whatsapp" || brief.primaryGoal === "call" || brief.primaryGoal === "appointment") && <label className="builder-text-field builder-contact-field"><span>{brief.primaryGoal === "appointment" ? "Randevu bağlantısı" : "İletişim numarası"}</span><div><Target /><input value={brief.contactValue} onChange={(event) => updateBrief("contactValue", event.target.value)} placeholder={brief.primaryGoal === "appointment" ? "https://takvim-adresin.com" : "Örn. +90 555 000 00 00"} /></div></label>}
            <label className="builder-text-field"><span>Seni rakiplerinden ayıran nedir?</span><div><Sparkles /><textarea rows={2} value={brief.differentiator} maxLength={150} onChange={(event) => updateBrief("differentiator", event.target.value)} placeholder="Örn. Aynı gün keşif ve şeffaf fiyatlandırma" /></div><small>{brief.differentiator.length} / 150</small></label>
          </div>}

          {step === 3 && <div className="brand-controls brand-controls-advanced">
            <div className="ai-blueprint"><header><div><Sparkles /><span><small>DROMOCOB AI BLUEPRINT</small><strong>{industry.label} için tasarım yönü</strong></span></div><b>%{Math.round((briefScore / 7) * 100)}</b></header><div><span><small>Sayfa mimarisi</small><strong>3 sayfa · {pages.reduce((total, page) => total + page.sections.length, 0)} akıllı bölüm</strong></span><span><small>Dönüşüm hedefi</small><strong>{primaryGoal.label}</strong></span></div></div>
            <fieldset><legend>Marka tonu</legend><div className="tone-grid">{toneOptions.map((tone) => <button type="button" key={tone.id} className={brief.brandTone === tone.id ? "selected" : ""} onClick={() => updateBrief("brandTone", tone.id)}><strong>{tone.label}</strong><small>{tone.detail}</small>{brief.brandTone === tone.id && <Check />}</button>)}</div></fieldset>
            <fieldset><legend>Tasarım sistemi</legend><div className="template-direction-grid">{templates.map((item) => <button type="button" key={item.id} onClick={() => setTemplate(item.id)} className={template === item.id ? "selected" : ""}><span className={`template-thumb template-${item.id}`}><i /></span><span><strong>{item.name}</strong><small>{item.tone}</small></span>{template === item.id && <Check />}</button>)}</div></fieldset>
            <label><span>Ana mesaj</span><textarea value={headline} maxLength={90} rows={3} onChange={(event) => setHeadline(event.target.value)} /><small>{headline.length} / 90</small></label>
            <button type="button" className="ai-copy-button" onClick={generateHeadline}><WandSparkles size={17} /><span><strong>İşletmeme göre yeni mesaj üret</strong><small>Sektör, hedef kitle ve marka tonunu birlikte kullanır</small></span><Sparkles size={14} /></button>
            <fieldset><legend>Vurgu rengi</legend><div className="palette-row">{palettes.map((color) => <button type="button" key={color.value} onClick={() => setAccent(color.value)} className={accent === color.value ? "selected" : ""} aria-label={color.name} style={{ "--swatch": color.value } as React.CSSProperties}>{accent === color.value && <Check size={14} />}</button>)}</div></fieldset>
          </div>}

          {step === 4 && <div className="publish-controls">
            <div className="generated-site-summary"><span><Globe2 /></span><div><small>İŞLETMENE ÖZEL ÜRETİLDİ</small><strong>{businessName}</strong><p>{industry.label} · {brief.location} · {brief.services.length} hizmet</p></div></div>
            <div className="publish-checklist">{[`${pages.length} sayfalık içerik mimarisi üretildi`, `${brief.services.length} hizmet için içerik alanı hazırlandı`, `${primaryGoal.label} dönüşüm akışı yerleştirildi`, "Mobil görünüm, SEO ve SSL ayarları hazır"].map((item) => <div key={item}><i><Check size={13} /></i><span>{item}</span></div>)}</div>
            <label className="domain-field"><span>Site adresin</span><div><input value={subdomain} onChange={(event) => { setSubdomainEdited(true); setSubdomain(event.target.value); }} /><b>.dromocob.tr</b></div></label>
            <div className="plan-summary"><span><Rocket size={17} /> Launch Plan</span><strong>₺0 <small>/ demo</small></strong><p>İşletme brief&apos;in, içerik mimarin ve tasarım yönün hesabına güvenle kaydedilir.</p></div>
          </div>}

          <div className="builder-actions">
            {step > 1 ? <button type="button" className="builder-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Geri</button> : <span />}
            {step < 4 ? <button type="button" className="builder-primary" onClick={() => canContinue() && setStep(step + 1)} disabled={!canContinue()}>Devam et <ArrowRight size={16} /></button> : <button type="button" className="builder-primary publish" onClick={handlePublish} disabled={saving}>{saving ? "Kaydediliyor…" : <><Rocket size={16} /> {editingSiteId ? "Değişiklikleri kaydet" : "Siteyi yayınla"}</>}</button>}
          </div>
          {saveError && <div className="builder-save-error">{saveError}</div>}
        </aside>

        <section className="preview-stage">
          <div className="preview-toolbar"><div><span className="preview-live"><i /> CANLI İŞLETME ÖNİZLEMESİ</span><span className="preview-url"><Globe2 size={13} /> {safeSubdomain || "markan"}.dromocob.tr</span></div><div className="device-toggle"><button type="button" className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")} aria-label="Masaüstü görünümü"><Monitor size={16} /></button><button type="button" className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")} aria-label="Mobil görünüm"><Smartphone size={16} /></button></div></div>
          <div className={`site-canvas-wrap ${device}`}>
            <article className={`customer-site customer-${template} customer-tone-${brief.brandTone}`} style={{ "--customer-accent": accent } as React.CSSProperties}>
              <nav><strong>{businessName || "MARKAN"}</strong><div><span>Hakkımızda</span><span>Hizmetler</span><span>İletişim</span></div><button>{primaryGoal.cta} <ArrowRight size={12} /></button></nav>
              <section className="customer-hero"><p>{industry.label.toUpperCase()} · {brief.location.toUpperCase() || "TÜRKİYE"}</p><h2>{headline || "Buraya güçlü bir mesaj gelecek."}</h2><div className="customer-hero-foot"><span>{businessName || "Markanız"}, {brief.audience || "doğru müşteriler"} için<br />özenli ve sonuç odaklı çözümler sunar.</span><button aria-label={primaryGoal.cta}><ArrowRight size={24} /></button></div><i className="customer-orb" /></section>
              <section className="customer-strip"><span>UZMANLIKLAR</span><b>01 — {String(Math.max(brief.services.length, 3)).padStart(2, "0")}</b><p>{brief.differentiator || "İşletmenizin güçlü farkı burada görünür."}</p></section>
              <section className="customer-cards">{(brief.services.length ? brief.services : industry.services).slice(0, 3).map((service, index) => <div key={service}><small>0{index + 1}</small><strong>{service}</strong><span>Detayları keşfet <ArrowRight /></span></div>)}</section>
            </article>
          </div>
          <div className="preview-hint"><Eye size={14} /> Brief&apos;indeki her cevap siteye anında işlenir <button type="button"><LayoutTemplate size={14} /> {pages.length} sayfa üretildi <ChevronDown size={13} /></button></div>
        </section>
      </section>

      {published && <div className="publish-modal-backdrop" role="presentation" onMouseDown={() => setPublished(false)}><section className="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title" onMouseDown={(event) => event.stopPropagation()}><button className="publish-close" onClick={() => setPublished(false)} aria-label="Kapat"><X size={18} /></button><div className="launch-orbit"><span><Rocket size={25} /></span></div><p>İŞLETMENE ÖZEL SİTE HAZIR</p><h2 id="publish-title">Siten yayına hazır.</h2><span>{industry.label} sektörüne, {brief.audience} hedef kitlesine ve {primaryGoal.label.toLocaleLowerCase("tr-TR")} hedefine göre oluşturuldu.</span><div className="published-address"><Globe2 size={17} /><strong>{safeSubdomain || "markan"}.dromocob.tr</strong><i><Check size={13} /></i></div><Link className="builder-primary" href="/kayit">Ücretsiz hesabı oluştur <ArrowRight size={16} /></Link><button className="modal-secondary" onClick={() => setPublished(false)}>Tasarıma dön</button></section></div>}
    </main>
  );
}

export default function SiteBuilderPage() {
  return <Suspense fallback={<div className="my-sites-loading">Site oluşturucu hazırlanıyor…</div>}><SiteBuilderContent /></Suspense>;
}
