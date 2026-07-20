"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  Globe2,
  LayoutTemplate,
  Monitor,
  Rocket,
  Smartphone,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase";
import { clearPendingSite, readPendingSite, saveCustomerSite, storePendingSite, type CustomerSiteDraft } from "@/lib/customer-sites";

type TemplateId = "studio" | "restaurant" | "portfolio";
type Device = "desktop" | "mobile";

const templates = [
  { id: "studio" as const, name: "Nova Studio", category: "Ajans & Kurumsal", tone: "Koyu, cesur, editoryal" },
  { id: "restaurant" as const, name: "Masa No.7", category: "Restoran & Mekân", tone: "Sıcak, seçkin, iştah açıcı" },
  { id: "portfolio" as const, name: "Forma", category: "Portfolyo & Kişisel", tone: "Minimal, temiz, odaklı" },
];

const palettes = [
  { name: "Lime", value: "#d9ff43" },
  { name: "Coral", value: "#ff725e" },
  { name: "Azure", value: "#66a7ff" },
  { name: "Lavender", value: "#b896ff" },
];

function SiteBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const editingSiteId = searchParams.get("site");
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<TemplateId>("studio");
  const [device, setDevice] = useState<Device>("desktop");
  const [accent, setAccent] = useState(palettes[0].value);
  const [businessName, setBusinessName] = useState("NOVA STUDIO");
  const [headline, setHeadline] = useState("Fikirleri etkileyici deneyimlere dönüştürüyoruz.");
  const [subdomain, setSubdomain] = useState("nova-studio");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [draftReady, setDraftReady] = useState(false);

  const safeSubdomain = useMemo(() => subdomain.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""), [subdomain]);
  const draft = useMemo<CustomerSiteDraft>(() => ({ template, accent, businessName, headline, subdomain: safeSubdomain }), [accent, businessName, headline, safeSubdomain, template]);

  useEffect(() => {
    if (editingSiteId || authLoading) return;
    const pending = readPendingSite();
    queueMicrotask(() => {
      if (pending) {
        setTemplate(pending.template);
        setAccent(pending.accent);
        setBusinessName(pending.businessName);
        setHeadline(pending.headline);
        setSubdomain(pending.subdomain);
      }
      setDraftReady(true);
    });
  }, [authLoading, editingSiteId]);

  useEffect(() => {
    if (!editingSiteId || !user) return;
    let active = true;
    getDoc(doc(db, "customer_sites", editingSiteId)).then((snapshot) => {
      if (!active || !snapshot.exists() || snapshot.data().ownerId !== user.uid) return;
      const site = snapshot.data() as CustomerSiteDraft;
      setTemplate(site.template);
      setAccent(site.accent);
      setBusinessName(site.businessName);
      setHeadline(site.headline);
      setSubdomain(site.subdomain);
    }).catch(() => setSaveError("Site bilgileri yüklenemedi."));
    return () => { active = false; };
  }, [editingSiteId, user]);

  useEffect(() => {
    if (!editingSiteId && draftReady) storePendingSite(draft);
  }, [draft, draftReady, editingSiteId]);

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

  function chooseTemplate(id: TemplateId) {
    setTemplate(id);
    if (id === "restaurant") {
      setBusinessName("MASA NO.7");
      setHeadline("Mevsimin en iyi hâli, aynı masada.");
      setSubdomain("masa-no7");
      setAccent("#ff725e");
    } else if (id === "portfolio") {
      setBusinessName("FORMA");
      setHeadline("Sessiz fikirler. Güçlü işler.");
      setSubdomain("forma");
      setAccent("#b896ff");
    } else {
      setBusinessName("NOVA STUDIO");
      setHeadline("Fikirleri etkileyici deneyimlere dönüştürüyoruz.");
      setSubdomain("nova-studio");
      setAccent("#d9ff43");
    }
  }

  return (
    <main className="site-builder">
      <header className="builder-topbar">
        <Link href="/" className="builder-back" aria-label="Ana sayfaya dön"><ArrowLeft size={17} /> <span>DROMOCOB</span></Link>
        <div className="builder-progress" aria-label={`Adım ${step} / 3`}>
          {["Şablon", "Marka", "Yayınla"].map((label, index) => (
            <button key={label} className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} onClick={() => setStep(index + 1)}>
              <i>{step > index + 1 ? <Check size={12} /> : index + 1}</i><span>{label}</span>
            </button>
          ))}
        </div>
        <div className="builder-autosave"><span /> Taslak kaydedildi</div>
      </header>

      <section className="builder-workspace">
        <aside className="builder-panel">
          <div className="builder-panel-heading">
            <p>0{step} / 03 · DROMOCOB SITES</p>
            <h1>{step === 1 ? "Başlangıç noktanı seç." : step === 2 ? "Markanı sahneye çıkar." : "Yeni adresin hazır."}</h1>
            <span>{step === 1 ? "İçeriğini sonra dilediğin gibi değiştirebilirsin." : step === 2 ? "Her değişiklik sağdaki önizlemeye anında yansır." : "Son kontrolleri yap ve dünyaya açıl."}</span>
          </div>

          {step === 1 && <div className="template-list">
            {templates.map((item, index) => <button key={item.id} onClick={() => chooseTemplate(item.id)} className={template === item.id ? "selected" : ""}>
              <span className={`template-thumb template-${item.id}`}><b>{index + 1}</b><i /></span>
              <span><small>{item.category}</small><strong>{item.name}</strong><em>{item.tone}</em></span>
              <i className="template-check">{template === item.id && <Check size={14} />}</i>
            </button>)}
          </div>}

          {step === 2 && <div className="brand-controls">
            <label><span>Marka adı</span><input value={businessName} maxLength={28} onChange={(event) => setBusinessName(event.target.value)} /></label>
            <label><span>Ana mesaj</span><textarea value={headline} maxLength={90} rows={3} onChange={(event) => setHeadline(event.target.value)} /><small>{headline.length} / 90</small></label>
            <fieldset><legend>Vurgu rengi</legend><div className="palette-row">{palettes.map((color) => <button key={color.value} onClick={() => setAccent(color.value)} className={accent === color.value ? "selected" : ""} aria-label={color.name} style={{ "--swatch": color.value } as React.CSSProperties}>{accent === color.value && <Check size={14} />}</button>)}</div></fieldset>
            <button className="ai-copy-button" onClick={() => setHeadline(template === "restaurant" ? "İyi malzeme, açık ateş, unutulmayan akşamlar." : template === "portfolio" ? "Az söz. Net fikir. Kalıcı etki." : "Markaları yarının kültürüne taşıyoruz.")}><WandSparkles size={17} /><span><strong>Yapay zekâ ile iyileştir</strong><small>Mesajın için yeni bir öneri üret</small></span><Sparkles size={14} /></button>
          </div>}

          {step === 3 && <div className="publish-controls">
            <div className="publish-checklist">
              {["Mobil görünüm optimize edildi", "SSL güvenlik sertifikası hazır", "SEO ve sosyal paylaşım ayarları tamam", "Dromocob CDN aktif"].map((item) => <div key={item}><i><Check size={13} /></i><span>{item}</span></div>)}
            </div>
            <label className="domain-field"><span>Site adresin</span><div><input value={subdomain} onChange={(event) => setSubdomain(event.target.value)} /><b>.dromocob.tr</b></div></label>
            <div className="plan-summary"><span><Rocket size={17} /> Launch Plan</span><strong>₺0 <small>/ demo</small></strong><p>Bu demo hiçbir ödeme almadan yayın deneyimini gösterir.</p></div>
          </div>}

          <div className="builder-actions">
            {step > 1 ? <button className="builder-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Geri</button> : <span />}
            {step < 3 ? <button className="builder-primary" onClick={() => setStep(step + 1)}>Devam et <ArrowRight size={16} /></button> : <button className="builder-primary publish" onClick={handlePublish} disabled={saving}>{saving ? "Kaydediliyor…" : <><Rocket size={16} /> {editingSiteId ? "Değişiklikleri kaydet" : "Siteyi yayınla"}</>}</button>}
          </div>
          {saveError && <div className="builder-save-error">{saveError}</div>}
        </aside>

        <section className="preview-stage">
          <div className="preview-toolbar">
            <div><span className="preview-live"><i /> CANLI ÖNİZLEME</span><span className="preview-url"><Globe2 size={13} /> {safeSubdomain || "markan"}.dromocob.tr</span></div>
            <div className="device-toggle"><button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")} aria-label="Masaüstü görünümü"><Monitor size={16} /></button><button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")} aria-label="Mobil görünüm"><Smartphone size={16} /></button></div>
          </div>
          <div className={`site-canvas-wrap ${device}`}>
            <article className={`customer-site customer-${template}`} style={{ "--customer-accent": accent } as React.CSSProperties}>
              <nav><strong>{businessName || "MARKAN"}</strong><div><span>Hakkımızda</span><span>Projeler</span><span>İletişim</span></div><button>Birlikte çalışalım <ArrowRight size={12} /></button></nav>
              <section className="customer-hero">
                <p>BAĞIMSIZ · İSTANBUL · 2026</p>
                <h2>{headline || "Buraya güçlü bir mesaj gelecek."}</h2>
                <div className="customer-hero-foot"><span>Strateji, tasarım ve teknolojiyle<br />sınırları aşan işler üretiyoruz.</span><button><ArrowRight size={24} /></button></div>
                <i className="customer-orb" />
              </section>
              <section className="customer-strip"><span>SEÇİLİ İŞLER</span><b>01 — 04</b><p>Markaların görünür değil, unutulmaz olmasını sağlıyoruz.</p></section>
              <section className="customer-cards"><div /><div /><div /></section>
            </article>
          </div>
          <div className="preview-hint"><Eye size={14} /> Önizleme etkileşimli tasarımını temsil eder <button><LayoutTemplate size={14} /> Bölümleri düzenle <ChevronDown size={13} /></button></div>
        </section>
      </section>

      {published && <div className="publish-modal-backdrop" role="presentation" onMouseDown={() => setPublished(false)}><section className="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="publish-close" onClick={() => setPublished(false)} aria-label="Kapat"><X size={18} /></button>
        <div className="launch-orbit"><span><Rocket size={25} /></span></div>
        <p>YAYINA HAZIR</p><h2 id="publish-title">Siten harika görünüyor.</h2>
        <span>Demo tamamlandı. Gerçek yayına geçmek, içeriklerini kaydetmek ve alan adını yönetmek için hesabını oluştur.</span>
        <div className="published-address"><Globe2 size={17} /><strong>{safeSubdomain || "markan"}.dromocob.tr</strong><i><Check size={13} /></i></div>
        <Link className="builder-primary" href="/kayit">Ücretsiz hesabı oluştur <ArrowRight size={16} /></Link>
        <button className="modal-secondary" onClick={() => setPublished(false)}>Tasarıma dön</button>
      </section></div>}
    </main>
  );
}

export default function SiteBuilderPage() {
  return <Suspense fallback={<div className="my-sites-loading">Site oluşturucu hazırlanıyor…</div>}><SiteBuilderContent /></Suspense>;
}
