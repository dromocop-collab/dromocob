"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
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

export default function SiteEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
  const [previewOnly, setPreviewOnly] = useState(false);
  const [draggingSection, setDraggingSection] = useState<number | null>(null);
  const [dragTargetSection, setDragTargetSection] = useState<number | null>(null);

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
      if (snapshot.data().ownerId !== user.uid) {
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
  }, [params.id, retryKey, user]);

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
    setPages((current) => current.map((page) => page.id === activePage.id ? { ...page, ...update } : page));
    setSaved(false);
  }

  function addSection(sectionId: string) {
    updateActivePage({ sections: [...activePage.sections, sectionId] });
    setPanel("pages");
  }

  function removeSection(index: number) {
    updateActivePage({ sections: activePage.sections.filter((_, itemIndex) => itemIndex !== index) });
  }

  function moveSection(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const reordered = [...activePage.sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    updateActivePage({ sections: reordered });
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
      await saveCustomerSite(user.uid, { template: site.template, accent: site.accent, businessName: site.businessName, headline: site.headline, subdomain: site.subdomain, pages, siteSettings: settings }, site.id);
      setSite({ ...site, pages, siteSettings: settings });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch {
      setError("Değişiklikler kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <div className="studio-loading"><Loader2 className="spin" /><span>Kurumsal Site Studio hazırlanıyor</span></div>;

  if (!site) return <main className="studio-load-error"><div><ShieldCheck size={30} /><p>SITE STUDIO</p><h1>Editör açılamadı.</h1><span>{error || "Site kaydı yüklenemedi."}</span><div><button onClick={() => { setLoading(true); setError(""); setRetryKey((current) => current + 1); }}>Tekrar dene</button><Link href="/sitelerim">Sitelerime dön</Link></div></div></main>;

  return <main className="site-studio">
    <header className="studio-topbar">
      <div className="studio-brand"><Link href="/sitelerim" aria-label="Sitelerime dön"><ArrowLeft size={17} /></Link><b>DC</b><span><strong>DROMOCOB</strong><small>SITES STUDIO · ENTERPRISE</small></span></div>
      <div className="studio-site-meta"><span><i /> YAYINDA</span><strong>{site.businessName}</strong><small>{site.subdomain}.dromocob.com</small></div>
      <div className="studio-actions"><Link className="studio-icon-button" href="/iletisim" title="Yardım"><CircleHelp size={17} /></Link><button className="studio-preview-button" onClick={() => setPreviewOnly((current) => !current)}><Eye size={16} /> {previewOnly ? "Düzenleyici" : "Önizle"}</button><button className="studio-save-button" onClick={saveChanges} disabled={saving}>{saving ? <Loader2 className="spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}{saving ? "Kaydediliyor" : saved ? "Kaydedildi" : "Kaydet"}</button><button className="studio-publish-button" onClick={saveChanges} disabled={saving}><Rocket size={16} /> Yayınla</button></div>
    </header>

    <div className={`studio-layout ${previewOnly ? "preview-only" : ""}`}>
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
          <section className="studio-page-settings"><p>SAYFA AYARLARI</p><label>Sayfa adı<input value={activePage.title} onChange={(event) => updateActivePage({ title: event.target.value })} /></label><label>URL adresi<div><span>{site.subdomain}.dromocob.com</span><input value={activePage.slug} onChange={(event) => updateActivePage({ slug: event.target.value })} /></div></label><button onClick={() => updateActivePage({ visible: !activePage.visible })}>{activePage.visible ? <ToggleRight /> : <ToggleLeft />} Navigasyonda göster</button>{activePage.type !== "home" && <button className="studio-delete-page" onClick={removePage}><Trash2 size={15} /> Sayfayı sil</button>}</section>
        </>}

        {panel === "sections" && <>
          <div className="studio-panel-head"><div><p>İÇERİK KÜTÜPHANESİ</p><h1>Bölüm ekle</h1></div><button onClick={() => setPanel("pages")}><X size={16} /></button></div>
          <p className="studio-panel-description">Hazır kurumsal blokları seçili sayfaya ekle.</p>
          <div className="studio-section-library">{sectionCatalog.map(({ id, name, icon: Icon, detail }) => <button key={id} onClick={() => addSection(id)}><i><Icon size={18} /></i><span><strong>{name}</strong><small>{detail}</small></span><Plus size={15} /></button>)}</div>
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
        <div className={`studio-canvas ${device}`}>
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
                if (sectionId === "hero") return <section className={`studio-preview-hero studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions onDelete={() => removeSection(index)} onEdit={() => setPanel("design")} /><small>{activePage.title.toUpperCase()} · DROMOCOB SITES</small><h2>{activePage.type === "home" ? site.headline : `${activePage.title}, markamızın hikâyesini anlatır.`}</h2><p>Strateji, tasarım ve teknolojiyle kalıcı dijital deneyimler oluşturuyoruz.</p><i /></section>;
                if (sectionId === "features") return <section className={`studio-preview-features studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions onDelete={() => removeSection(index)} /><p>YETKİNLİKLERİMİZ</p><h3>İşinizi ileri taşıyan sistemler.</h3><div><span>01<br/><b>Strateji</b></span><span>02<br/><b>Tasarım</b></span><span>03<br/><b>Teknoloji</b></span></div></section>;
                if (sectionId === "gallery") return <section className={`studio-preview-gallery studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions onDelete={() => removeSection(index)} /><div /><div /><div /></section>;
                if (sectionId === "contact") return <section className={`studio-preview-contact studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions onDelete={() => removeSection(index)} /><div><p>BİRLİKTE ÇALIŞALIM</p><h3>Yeni bir şey<br/>başlatalım.</h3></div><div><span>Ad soyad</span><span>E-posta</span><span>Mesajınız</span><button>Gönder</button></div></section>;
                return <section className={`studio-preview-generic studio-block${dragClass}`} key={`${sectionId}-${index}`} {...dragProps}><BlockActions onDelete={() => removeSection(index)} /><section><SectionIcon size={23} /><span><small>{section.name.toUpperCase()}</small><h3>{sectionId === "testimonials" ? "İş ortaklarımız anlatıyor." : "Net fikirler, güçlü sonuçlar."}</h3><p>{section.detail}. Bu alan düzenleyicide özelleştirilebilir içeriklerle yayınlanır.</p></span></section></section>;
              })}
              <button className="studio-inline-add" onClick={() => setPanel("sections")}><Plus size={16} /> Bu sayfaya bölüm ekle</button>
            </div>
          </article>
        </div>
        <footer className="studio-statusbar"><span><Globe2 size={13} /> {site.subdomain}.dromocob.com{activePage.slug === "/" ? "" : activePage.slug}</span><span><ShieldCheck size={13} /> SSL aktif</span><span><Users size={13} /> 1 düzenleyici</span><b>v1.0</b></footer>
      </section>
    </div>

    {addPageOpen && <div className="studio-modal-backdrop" onMouseDown={() => setAddPageOpen(false)}><section className="studio-add-modal" onMouseDown={(event) => event.stopPropagation()}><button className="studio-modal-close" onClick={() => setAddPageOpen(false)}><X size={17} /></button><p>YENİ SAYFA</p><h2>Site mimarisini büyüt.</h2><span>Yeni sayfa navigasyona eklenir ve kurumsal bloklarla düzenlenebilir.</span><label>Sayfa adı<input autoFocus value={newPageTitle} onChange={(event) => setNewPageTitle(event.target.value)} placeholder="Örn. Hizmetlerimiz" /></label><div className="studio-slug-preview"><Globe2 size={14} /> {site.subdomain}.dromocob.com{pageSlug}</div><div className="studio-page-template-row"><button className="selected"><FileText size={19} /><strong>Standart sayfa</strong><small>Hero + içerik</small><Check size={14} /></button><button><LayoutGrid size={19} /><strong>Boş sayfa</strong><small>Sıfırdan oluştur</small></button></div><button className="studio-create-page" onClick={addPage} disabled={!newPageTitle.trim()}>Sayfayı oluştur <ArrowRight size={16} /></button></section></div>}
    {error && <div className="studio-error">{error}</div>}
  </main>;
}

function PaletteIcon() {
  return <span className="palette-custom-icon"><i /><i /><i /></span>;
}

function BlockActions({ onDelete, onEdit }: { onDelete: () => void; onEdit?: () => void }) {
  return <div className="studio-block-actions"><button className="studio-drag-handle" title="Bölümü sürükleyerek taşı"><GripVertical size={14} /></button><button title="Bölümü düzenle" onClick={onEdit}><Settings size={14} /></button><button title="Bölümü sil" onClick={onDelete}><Trash2 size={14} /></button></div>;
}
