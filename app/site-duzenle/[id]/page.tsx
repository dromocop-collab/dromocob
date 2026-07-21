"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Blocks,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Contact,
  Eye,
  FileText,
  GalleryHorizontal,
  Globe2,
  GripVertical,
  Home,
  LayoutGrid,
  Loader2,
  Monitor,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Rocket,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase";
import { saveCustomerSite, type CustomerSitePage, type CustomerSiteRecord, type CustomerSiteSettings } from "@/lib/customer-sites";

const sectionCatalog = [
  { id: "hero", name: "Hero / Karşılama", icon: Sparkles, detail: "Başlık, mesaj ve CTA" },
  { id: "text", name: "Zengin metin", icon: AlignLeft, detail: "Editoryal içerik alanı" },
  { id: "features", name: "Özellikler", icon: LayoutGrid, detail: "3–6 özellik kartı" },
  { id: "gallery", name: "Galeri / Projeler", icon: GalleryHorizontal, detail: "Görsel koleksiyonu" },
  { id: "testimonials", name: "Referanslar", icon: Star, detail: "Müşteri görüşleri" },
  { id: "contact", name: "İletişim formu", icon: Contact, detail: "Lead toplama formu" },
];

const defaultPages: CustomerSitePage[] = [
  { id: "home", title: "Anasayfa", slug: "/", type: "home", visible: true, sections: ["hero", "features", "gallery"] },
  { id: "about", title: "Hakkımızda", slug: "/hakkimizda", type: "standard", visible: true, sections: ["hero", "text"] },
  { id: "contact", title: "İletişim", slug: "/iletisim", type: "contact", visible: true, sections: ["hero", "contact"] },
];

const defaultSettings: CustomerSiteSettings = {
  seoTitle: "",
  seoDescription: "",
  cookieBanner: true,
  analytics: false,
  maintenance: false,
};

type Panel = "pages" | "sections" | "design" | "settings" | "analytics";
type Device = "desktop" | "mobile";
type ActivationPlan = "launch" | "business" | "scale";

const activationPlans = [
  { id: "launch" as const, name: "Launch", price: 1490, description: "Yeni markalar için güçlü başlangıç", features: [".dromocob.tr adresi", "SSL ve güvenlik", "Temel SEO", "Aylık yedekleme"] },
  { id: "business" as const, name: "Business", price: 2490, description: "Büyüyen işletmeler için tam sistem", features: ["Launch planındaki her şey", "Analytics ve dönüşüm", "Form ve lead yönetimi", "Öncelikli destek"] },
  { id: "scale" as const, name: "Scale", price: 4490, description: "Yoğun trafik ve kurumsal operasyon", features: ["Business planındaki her şey", "Gelişmiş performans", "Aylık optimizasyon", "Özel danışman"] },
];

export default function SiteEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const [site, setSite] = useState<CustomerSiteRecord | null>(null);
  const [pages, setPages] = useState<CustomerSitePage[]>(defaultPages);
  const [settings, setSettings] = useState<CustomerSiteSettings>(defaultSettings);
  const [activePageId, setActivePageId] = useState("home");
  const [panel, setPanel] = useState<Panel>("pages");
  const [device, setDevice] = useState<Device>("desktop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [addPageOpen, setAddPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [draggingSection, setDraggingSection] = useState<number | null>(null);
  const [dragTargetSection, setDragTargetSection] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activationStep, setActivationStep] = useState<1 | 2 | 3>(1);
  const [activationPlan, setActivationPlan] = useState<ActivationPlan>("business");
  const [annualBilling, setAnnualBilling] = useState(true);
  const [activationBusy, setActivationBusy] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [activationReference, setActivationReference] = useState("");
  const [sectionNotice, setSectionNotice] = useState("");

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];

  useEffect(() => {
    if (!authLoading && !user) router.replace("/giris");
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user || !params.id) return;
    let active = true;
    getDoc(doc(db, "customer_sites", params.id)).then((snapshot) => {
      if (!active) return;
      if (!snapshot.exists()) {
        setError("Bu site kaydı bulunamadı. Site silinmiş veya adres değişmiş olabilir.");
        setLoading(false);
        return;
      }
      if (snapshot.data().ownerId !== user.uid && !isAdmin) {
        setError("Bu siteyi düzenleme yetkin bulunmuyor.");
        setLoading(false);
        return;
      }
      const record = { id: snapshot.id, ...snapshot.data() } as CustomerSiteRecord;
      setSite(record);
      setPages(record.pages?.length ? record.pages : defaultPages);
      setSettings({ ...defaultSettings, ...record.siteSettings });
      setLoading(false);
    }).catch((loadError: unknown) => {
      const code = typeof loadError === "object" && loadError && "code" in loadError ? String(loadError.code) : "";
      setError(code.includes("permission-denied") ? "Site verisine erişilemedi. Firestore müşteri sitesi kurallarının yayınlandığını kontrol et." : "Site düzenleyici açılamadı. Bağlantını kontrol edip tekrar dene.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [isAdmin, params.id, retryKey, user]);

  const pageSlug = useMemo(() => {
    const normalized = newPageTitle.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `/${normalized || "yeni-sayfa"}`;
  }, [newPageTitle]);

  function addPage() {
    const title = newPageTitle.trim();
    if (!title) return;
    const page: CustomerSitePage = { id: `${Date.now()}`, title, slug: pageSlug, type: "standard", visible: true, sections: ["hero", "text"] };
    setPages((current) => [...current, page]);
    setActivePageId(page.id);
    setNewPageTitle("");
    setAddPageOpen(false);
  }

  function updateActivePage(update: Partial<CustomerSitePage>) {
    setPages((current) => current.map((page) => page.id === activePageId ? { ...page, ...update } : page));
    setSaved(false);
  }

  function addSection(sectionId: string) {
    const catalogItem = sectionCatalog.find((item) => item.id === sectionId);
    setPages((current) => current.map((page) => page.id === activePageId
      ? { ...page, sections: [...(page.sections || []), sectionId] }
      : page));
    setSaved(false);
    setSectionNotice(`${catalogItem?.name || "Bölüm"} sayfaya eklendi.`);
    window.setTimeout(() => setSectionNotice(""), 2200);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const canvas = document.querySelector<HTMLElement>(".studio-canvas");
      canvas?.scrollTo({ top: canvas.scrollHeight, behavior: "smooth" });
    }));
  }

  function removeSection(index: number) {
    setPages((current) => current.map((page) => page.id === activePageId
      ? { ...page, sections: page.sections.filter((_, itemIndex) => itemIndex !== index) }
      : page));
    setSaved(false);
  }

  function moveSection(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setPages((current) => current.map((page) => {
      if (page.id !== activePageId) return page;
      const reordered = [...page.sections];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return { ...page, sections: reordered };
    }));
    setSaved(false);
  }

  function removePage() {
    if (activePage.type === "home") return;
    const remaining = pages.filter((page) => page.id !== activePage.id);
    setPages(remaining);
    setActivePageId(remaining[0].id);
  }

  async function saveChanges() {
    if (!site || !user) return;
    setSaving(true);
    setError("");
    try {
      await saveCustomerSite(site.ownerId || user.uid, { template: site.template, accent: site.accent, businessName: site.businessName, headline: site.headline, subdomain: site.subdomain, pages, siteSettings: settings }, site.id);
      setSite({ ...site, pages, siteSettings: settings });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch {
      setError("Değişiklikler kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  async function requestActivation() {
    if (!site || !user) return;
    setActivationBusy(true);
    setActivationError("");
    const selected = activationPlans.find((plan) => plan.id === activationPlan) ?? activationPlans[1];
    const total = annualBilling ? selected.price * 10 : selected.price;
    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          service: "web",
          serviceLabel: `Dromocob Sites Aktivasyonu — ${selected.name}`,
          quoteVersion: "site-activation-v1",
          estimatedPrice: total,
          sourcePath: `/site-duzenle/${site.id}`,
          contact: { name: profile?.displayName || user.displayName || "Dromocob müşterisi", company: profile?.company || site.businessName, email: user.email || "", phone: profile?.phone || "", city: profile?.city || "", preferredContact: "E-posta" },
          answers: { siteId: site.id, subdomain: site.subdomain, plan: selected.name, billing: annualBilling ? "annual" : "monthly" },
          notes: [`Site: ${site.businessName}`, `Adres: ${site.subdomain}.dromocob.tr`, `Plan: ${selected.name}`, `Dönem: ${annualBilling ? "Yıllık" : "Aylık"}`],
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Aktivasyon talebi oluşturulamadı.");
      setActivationReference(String(payload?.referenceId || "DC-ACTIVE"));
      setActivationStep(3);
    } catch (activationRequestError) {
      setActivationError(activationRequestError instanceof Error ? activationRequestError.message : "Aktivasyon talebi oluşturulamadı.");
    } finally {
      setActivationBusy(false);
    }
  }

  if (authLoading || loading) return <div className="studio-loading"><Loader2 className="spin" /><span>Kurumsal Site Studio hazırlanıyor</span></div>;

  if (!site) return <main className="studio-load-error"><div><ShieldCheck size={30} /><p>SITE STUDIO</p><h1>Editör açılamadı.</h1><span>{error || "Site kaydı yüklenemedi."}</span><div><button onClick={() => { setLoading(true); setError(""); setRetryKey((current) => current + 1); }}>Tekrar dene</button><Link href="/sitelerim">Sitelerime dön</Link></div></div></main>;

  return <main className="site-studio">
    <header className="studio-topbar">
      <div className="studio-brand"><Link href="/sitelerim" aria-label="Sitelerime dön"><ArrowLeft size={17} /></Link><b><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></b><span><strong>DROMOCOB</strong><small>SITES STUDIO · ENTERPRISE</small></span></div>
      <div className="studio-site-meta"><span><i /> YAYINDA</span><strong>{site.businessName}</strong><small>{site.subdomain}.dromocob.tr</small></div>
      <div className="studio-actions"><Link className="studio-icon-button" href="/iletisim" title="Yardım"><CircleHelp size={17} /></Link><Link className="studio-preview-button" href={`/site-onizleme/${site.id}`} target="_blank"><Eye size={16} /> Siteyi önizle</Link><button className="studio-save-button" onClick={saveChanges} disabled={saving}>{saving ? <Loader2 className="spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}{saving ? "Kaydediliyor" : saved ? "Kaydedildi" : "Kaydet"}</button><button className="studio-publish-button" onClick={() => setUpgradeOpen(true)}><Rocket size={16} /> Canlıya al</button></div>
    </header>

    <div className="studio-layout">
      <nav className="studio-rail" aria-label="Düzenleyici araçları">
        <button className={panel === "pages" ? "active" : ""} onClick={() => setPanel("pages")}><FileText /><span>Sayfalar</span></button>
        <button className={panel === "sections" ? "active" : ""} onClick={() => setPanel("sections")}><Blocks /><span>Bölümler</span></button>
        <button className={panel === "design" ? "active" : ""} onClick={() => setPanel("design")}><PaletteIcon /><span>Tasarım</span></button>
        <button className={panel === "settings" ? "active" : ""} onClick={() => setPanel("settings")}><Settings /><span>Ayarlar</span></button>
        <button className={panel === "analytics" ? "active" : ""} onClick={() => setPanel("analytics")}><BarChart3 /><span>Analiz</span></button>
        <button className="studio-rail-bottom"><PanelLeftClose /><span>Daralt</span></button>
      </nav>

      <aside className="studio-panel">
        {panel === "pages" && <>
          <div className="studio-panel-head"><div><p>SİTE MİMARİSİ</p><h1>Sayfalar</h1></div><button onClick={() => setAddPageOpen(true)}><Plus size={16} /></button></div>
          <div className="studio-search"><Search size={15} /><input placeholder="Sayfa ara…" /></div>
          <div className="studio-page-tree">
            <span>ANA NAVİGASYON <small>{pages.filter((page) => page.visible).length} SAYFA</small></span>
            {pages.map((page) => <button key={page.id} className={activePage.id === page.id ? "active" : ""} onClick={() => setActivePageId(page.id)}><GripVertical size={14} /><i>{page.type === "home" ? <Home size={15} /> : page.type === "contact" ? <Contact size={15} /> : <FileText size={15} />}</i><span><strong>{page.title}</strong><small>{page.slug}</small></span>{!page.visible && <Eye size={13} />}<MoreHorizontal size={15} /></button>)}
          </div>
          <button className="studio-add-page" onClick={() => setAddPageOpen(true)}><Plus size={16} /><span><strong>Yeni sayfa ekle</strong><small>Boş veya hazır şablondan</small></span><ChevronRight size={16} /></button>
          <section className="studio-page-settings"><p>SAYFA AYARLARI</p><label>Sayfa adı<input value={activePage.title} onChange={(event) => updateActivePage({ title: event.target.value })} /></label><label>URL adresi<div><span>{site.subdomain}.dromocob.tr</span><input value={activePage.slug} onChange={(event) => updateActivePage({ slug: event.target.value })} /></div></label><button onClick={() => updateActivePage({ visible: !activePage.visible })}>{activePage.visible ? <ToggleRight /> : <ToggleLeft />} Navigasyonda göster</button>{activePage.type !== "home" && <button className="studio-delete-page" onClick={removePage}><Trash2 size={15} /> Sayfayı sil</button>}</section>
        </>}

        {panel === "sections" && <>
          <div className="studio-panel-head"><div><p>İÇERİK KÜTÜPHANESİ</p><h1>Bölüm ekle</h1></div><button onClick={() => setPanel("pages")}><X size={16} /></button></div>
          <p className="studio-panel-description">Hazır kurumsal blokları seçili sayfaya ekle.</p>
          <div className="studio-section-summary"><span><Blocks size={14} /> {activePage.sections.length} aktif bölüm</span>{sectionNotice && <strong><Check size={13} /> {sectionNotice}</strong>}</div>
          <div className="studio-section-library">{sectionCatalog.map(({ id, name, icon: Icon, detail }) => { const count = activePage.sections.filter((section) => section === id).length; return <button type="button" key={id} onClick={() => addSection(id)}><i><Icon size={18} /></i><span><strong>{name}</strong><small>{detail}</small></span>{count > 0 && <b>{count}</b>}<Plus size={15} /></button>; })}</div>
        </>}

        {panel === "settings" && <>
          <div className="studio-panel-head"><div><p>KURUMSAL KONTROL</p><h1>Site ayarları</h1></div><ShieldCheck size={20} /></div>
          <div className="studio-settings-form"><label>SEO başlığı<input value={settings.seoTitle} placeholder={site.businessName} onChange={(event) => setSettings({ ...settings, seoTitle: event.target.value })} /></label><label>Meta açıklaması<textarea rows={4} value={settings.seoDescription} placeholder={site.headline} onChange={(event) => setSettings({ ...settings, seoDescription: event.target.value })} /></label><button onClick={() => setSettings({ ...settings, cookieBanner: !settings.cookieBanner })}><span><strong>KVKK / Çerez bildirimi</strong><small>Yasal onay katmanı</small></span>{settings.cookieBanner ? <ToggleRight /> : <ToggleLeft />}</button><button onClick={() => setSettings({ ...settings, analytics: !settings.analytics })}><span><strong>Analytics ölçümü</strong><small>Ziyaretçi ve dönüşüm analizi</small></span>{settings.analytics ? <ToggleRight /> : <ToggleLeft />}</button><button onClick={() => setSettings({ ...settings, maintenance: !settings.maintenance })}><span><strong>Bakım modu</strong><small>Siteyi geçici olarak gizle</small></span>{settings.maintenance ? <ToggleRight /> : <ToggleLeft />}</button></div>
        </>}

        {panel === "design" && <>
          <div className="studio-panel-head"><div><p>MARKA SİSTEMİ</p><h1>Tasarım</h1></div><Sparkles size={20} /></div>
          <div className="studio-settings-form"><label>Marka adı<input value={site.businessName} onChange={(event) => { setSite({ ...site, businessName: event.target.value }); setSaved(false); }} /></label><label>Ana mesaj<textarea rows={4} value={site.headline} onChange={(event) => { setSite({ ...site, headline: event.target.value }); setSaved(false); }} /></label><label>Vurgu rengi<input type="color" value={site.accent} onChange={(event) => { setSite({ ...site, accent: event.target.value }); setSaved(false); }} /></label></div>
          <div className="studio-design-tokens"><p>AKTİF TASARIM SİSTEMİ</p><div><span style={{ background: site.accent }} /><strong>{site.template.toUpperCase()}</strong><small>Kurumsal tipografi · Akışkan grid · AA kontrast</small></div></div>
        </>}

        {panel === "analytics" && <>
          <div className="studio-panel-head"><div><p>PERFORMANS MERKEZİ</p><h1>Analiz</h1></div><BarChart3 size={20} /></div>
          <p className="studio-panel-description">Yayın sonrası ziyaretçi ve dönüşüm verileri burada görünür.</p>
          <div className="studio-analytics-cards"><article><span>SON 30 GÜN</span><strong>—</strong><small>Henüz veri oluşmadı</small></article><article><span>DÖNÜŞÜM</span><strong>—%</strong><small>Analytics bağlantısı bekleniyor</small></article><article><span>SAYFA SKORU</span><strong>94</strong><small>Teknik önizleme skoru</small></article></div>
          {!settings.analytics && <button className="studio-enable-analytics" onClick={() => { setSettings({ ...settings, analytics: true }); setPanel("settings"); }}>Analytics&apos;i etkinleştir <ArrowRight size={15} /></button>}
        </>}
      </aside>

      <section className="studio-canvas-shell">
        <div className="studio-canvas-toolbar"><div className="studio-breadcrumb"><Home size={14} /><ChevronRight size={13} /><strong>{activePage.title}</strong><ChevronDown size={13} /></div><div className="studio-device-toggle"><button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}><Monitor size={16} /></button><button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}><Smartphone size={16} /></button></div><span><i /> Otomatik kayıt aktif</span></div>
        <div className="studio-upgrade-bar"><div><span><Sparkles size={15} /></span><p><strong>Tasarımın hazır — şimdi gerçek müşterilerinle buluştur.</strong><small>Özel alan adı, SSL, yüksek hızlı yayın ve Dromocob desteğiyle siteni canlıya al.</small></p></div><button onClick={() => setUpgradeOpen(true)}>Siteyi canlıya al <ArrowRight size={15} /></button></div>
        <div className={`studio-canvas ${device}`} onWheel={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.scrollTop += event.deltaY;
        }} onDragOver={(event) => {
          if (draggingSection === null) return;
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          const edge = 110;
          if (event.clientY < bounds.top + edge) event.currentTarget.scrollBy({ top: -22, behavior: "auto" });
          else if (event.clientY > bounds.bottom - edge) event.currentTarget.scrollBy({ top: 22, behavior: "auto" });
        }}>
          <article className={`studio-site-preview studio-preview-${site.template}`} style={{ "--studio-accent": site.accent } as React.CSSProperties}>
            <nav><strong>{site.businessName}</strong><div>{pages.filter((page) => page.visible).map((page) => <span className={page.id === activePage.id ? "active" : ""} key={page.id}>{page.title}</span>)}</div><button>İletişime geç <ArrowRight size={11} /></button></nav>
            <div className="studio-preview-sections">
              {activePage.sections.map((sectionId, index) => {
                const section = sectionCatalog.find((item) => item.id === sectionId) ?? sectionCatalog[0];
                const SectionIcon = section.icon;
                const dragProps = {
                  draggable: true,
                  onDragStart: () => { setDraggingSection(index); setDragTargetSection(index); },
                  onDragOver: (event: React.DragEvent<HTMLElement>) => { event.preventDefault(); setDragTargetSection(index); },
                  onDrop: (event: React.DragEvent<HTMLElement>) => { event.preventDefault(); if (draggingSection !== null) moveSection(draggingSection, index); setDraggingSection(null); setDragTargetSection(null); },
                  onDragEnd: () => { setDraggingSection(null); setDragTargetSection(null); },
                };
                const dragClass = `${draggingSection === index ? " is-dragging" : ""}${dragTargetSection === index && draggingSection !== index ? " is-drag-target" : ""}`;
                const actionProps = { onDelete: () => removeSection(index), onMoveUp: index > 0 ? () => moveSection(index, index - 1) : undefined, onMoveDown: index < activePage.sections.length - 1 ? () => moveSection(index, index + 1) : undefined };
                if (sectionId === "hero") return <section className={`studio-preview-hero studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions {...actionProps} onEdit={() => setPanel("design")} /><small>{activePage.title.toUpperCase()} · DROMOCOB SITES</small><h2>{activePage.type === "home" ? site.headline : `${activePage.title}, markamızın hikâyesini anlatır.`}</h2><p>Strateji, tasarım ve teknolojiyle kalıcı dijital deneyimler oluşturuyoruz.</p><i /></section>;
                if (sectionId === "features") return <section className={`studio-preview-features studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions {...actionProps} /><p>YETKİNLİKLERİMİZ</p><h3>İşinizi ileri taşıyan sistemler.</h3><div><span>01<br/><b>Strateji</b></span><span>02<br/><b>Tasarım</b></span><span>03<br/><b>Teknoloji</b></span></div></section>;
                if (sectionId === "gallery") return <section className={`studio-preview-gallery studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions {...actionProps} /><div /><div /><div /></section>;
                if (sectionId === "contact") return <section className={`studio-preview-contact studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions {...actionProps} /><div><p>BİRLİKTE ÇALIŞALIM</p><h3>Yeni bir şey<br/>başlatalım.</h3></div><div><span>Ad soyad</span><span>E-posta</span><span>Mesajınız</span><button>Gönder</button></div></section>;
                return <section className={`studio-preview-generic studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions {...actionProps} /><section><SectionIcon size={23} /><span><small>{section.name.toUpperCase()}</small><h3>{sectionId === "testimonials" ? "İş ortaklarımız anlatıyor." : "Net fikirler, güçlü sonuçlar."}</h3><p>{section.detail}. Bu alan düzenleyicide özelleştirilebilir içeriklerle yayınlanır.</p></span></section></section>;
              })}
              <button className="studio-inline-add" onClick={() => setPanel("sections")}><Plus size={16} /> Bu sayfaya bölüm ekle</button>
            </div>
          </article>
        </div>
        <footer className="studio-statusbar"><span><Globe2 size={13} /> {site.subdomain}.dromocob.tr{activePage.slug === "/" ? "" : activePage.slug}</span><span><ShieldCheck size={13} /> SSL aktif</span><span><Users size={13} /> 1 düzenleyici</span><b>v1.0</b></footer>
      </section>
    </div>

    {addPageOpen && <div className="studio-modal-backdrop" onMouseDown={() => setAddPageOpen(false)}><section className="studio-add-modal" onMouseDown={(event) => event.stopPropagation()}><button className="studio-modal-close" onClick={() => setAddPageOpen(false)}><X size={17} /></button><p>YENİ SAYFA</p><h2>Site mimarisini büyüt.</h2><span>Yeni sayfa navigasyona eklenir ve kurumsal bloklarla düzenlenebilir.</span><label>Sayfa adı<input autoFocus value={newPageTitle} onChange={(event) => setNewPageTitle(event.target.value)} placeholder="Örn. Hizmetlerimiz" /></label><div className="studio-slug-preview"><Globe2 size={14} /> {site.subdomain}.dromocob.tr{pageSlug}</div><div className="studio-page-template-row"><button className="selected"><FileText size={19} /><strong>Standart sayfa</strong><small>Hero + içerik</small><Check size={14} /></button><button><LayoutGrid size={19} /><strong>Boş sayfa</strong><small>Sıfırdan oluştur</small></button></div><button className="studio-create-page" onClick={addPage} disabled={!newPageTitle.trim()}>Sayfayı oluştur <ArrowRight size={16} /></button></section></div>}
    {upgradeOpen && <div className="studio-modal-backdrop" onMouseDown={() => setUpgradeOpen(false)}><section className={`studio-upgrade-modal activation-step-${activationStep}`} onMouseDown={(event) => event.stopPropagation()}><button className="studio-modal-close" onClick={() => setUpgradeOpen(false)}><X size={17} /></button>{activationStep === 1 && <><div className="studio-upgrade-orb"><Rocket size={25} /></div><p>YAYIN AKTİVASYON MERKEZİ</p><h2>Tasarımını gerçek bir<br/>iş aracına dönüştür.</h2><span>Demo adresini aktif yayına taşı; müşterilerin seni bulsun, formlar çalışsın ve markan profesyonel bir altyapıda büyüsün.</span><div className="studio-upgrade-benefits"><div><Check size={14} /><strong>{site.subdomain}.dromocob.tr</strong><small>Yayına hazır site adresi</small></div><div><ShieldCheck size={14} /><strong>SSL + Güvenlik</strong><small>Kurumsal koruma katmanı</small></div><div><BarChart3 size={14} /><strong>Analytics</strong><small>Ziyaretçi ve dönüşüm ölçümü</small></div></div><button className="studio-upgrade-cta" onClick={() => setActivationStep(2)}>Yayın planını yapılandır <ArrowRight size={16} /></button><button className="studio-upgrade-later" onClick={() => setUpgradeOpen(false)}>Şimdilik düzenlemeye devam et</button></>}{activationStep === 2 && <><div className="activation-head"><button onClick={() => setActivationStep(1)}><ArrowLeft size={15} /> Geri</button><p>02 / PLAN VE DÖNEM</p><h2>Yayın altyapını seç.</h2><span>İhtiyacına uygun kapasiteyi seç; ekibimiz aktivasyonu kontrol ederek başlatsın.</span></div><div className="activation-billing"><button className={!annualBilling ? "active" : ""} onClick={() => setAnnualBilling(false)}>Aylık</button><button className={annualBilling ? "active" : ""} onClick={() => setAnnualBilling(true)}>Yıllık <small>2 AY AVANTAJ</small></button></div><div className="activation-plans">{activationPlans.map((plan) => <button key={plan.id} className={activationPlan === plan.id ? "selected" : ""} onClick={() => setActivationPlan(plan.id)}><span>{plan.name === "Business" && "ÖNERİLEN"}</span><div><strong>{plan.name}</strong><small>{plan.description}</small></div><b>₺{(annualBilling ? plan.price * 10 : plan.price).toLocaleString("tr-TR")} <small>+ KDV / {annualBilling ? "yıl" : "ay"}</small></b><ul>{plan.features.map((feature) => <li key={feature}><Check size={12} /> {feature}</li>)}</ul><i>{activationPlan === plan.id ? <Check size={14} /> : null}</i></button>)}</div><div className="activation-summary"><span><Globe2 size={15} /> {site.subdomain}.dromocob.tr</span><strong>{activationPlans.find((plan) => plan.id === activationPlan)?.name} · {annualBilling ? "Yıllık" : "Aylık"}</strong></div>{activationError && <div className="activation-error">{activationError}</div>}<button className="studio-upgrade-cta" onClick={requestActivation} disabled={activationBusy}>{activationBusy ? <Loader2 className="spin" size={16} /> : <Rocket size={16} />}{activationBusy ? "Talep oluşturuluyor" : "Aktivasyon talebini onayla"}</button><small className="activation-legal">Bu adım doğrudan ödeme almaz. Dromocob ekibi kapsam ve ödeme bağlantısını hesabına iletir.</small></>}{activationStep === 3 && <div className="activation-success"><div><Check size={28} /></div><p>AKTİVASYON TALEBİ ALINDI</p><h2>Siten için yayın sırası oluşturuldu.</h2><span>Ekibimiz altyapı ve alan adı kontrollerini tamamlayıp hesabın üzerinden seninle iletişime geçecek.</span><section><small>TALEP REFERANSI</small><strong>{activationReference}</strong></section><button className="studio-upgrade-cta" onClick={() => { setUpgradeOpen(false); setActivationStep(1); }}>Studio&apos;ya dön <ArrowRight size={16} /></button></div>}</section></div>}
    {error && <div className="studio-error">{error}</div>}
  </main>;
}

function PaletteIcon() {
  return <span className="palette-custom-icon"><i /><i /><i /></span>;
}

function BlockActions({ onDelete, onEdit, onMoveUp, onMoveDown }: { onDelete: () => void; onEdit?: () => void; onMoveUp?: () => void; onMoveDown?: () => void }) {
  return <div className="studio-block-actions"><button className="studio-drag-handle" title="Bölümü sürükleyerek taşı"><GripVertical size={14} /></button><button title="Yukarı taşı" disabled={!onMoveUp} onClick={onMoveUp}><ArrowUp size={14} /></button><button title="Aşağı taşı" disabled={!onMoveDown} onClick={onMoveDown}><ArrowDown size={14} /></button>{onEdit && <button title="Bölümü düzenle" onClick={onEdit}><Settings size={14} /></button>}<button title="Bölümü sil" onClick={onDelete}><Trash2 size={14} /></button></div>;
}
