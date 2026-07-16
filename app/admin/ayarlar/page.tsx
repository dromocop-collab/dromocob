"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { Check, Globe, LineChart, ShieldCheck, Wrench } from "lucide-react";
import { db } from "@/lib/firebase";

type SiteSettings = {
  active: boolean;
  version: number;
  seo: {
    siteName: string;
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    canonicalUrl: string;
    ogImage: string;
    robotsIndex: boolean;
    robotsFollow: boolean;
  };
  tracking: {
    enabled: boolean;
    ga4MeasurementId: string;
    gtmId: string;
    googleAdsId: string;
    metaPixelId: string;
    linkedinInsightId: string;
    tiktokPixelId: string;
    clarityId: string;
  };
  maintenance: {
    enabled: boolean;
    title: string;
    message: string;
    estimatedBackAt: string;
    contactEmail: string;
    allowPaths: string[];
  };
  features: {
    liveChatEnabled: boolean;
    quoteWizardEnabled: boolean;
    registrationEnabled: boolean;
    publicProjectsEnabled: boolean;
    autoLeadCaptureEnabled: boolean;
  };
  integrations: {
    crmWebhookUrl: string;
    slackWebhookUrl: string;
    recaptchaSiteKey: string;
    cookieConsentId: string;
    allowedOrigins: string[];
    rateLimitPerMinute: number;
  };
};

const DEFAULT_SETTINGS: SiteSettings = {
  active: true,
  version: 1,
  seo: {
    siteName: "Dromocob",
    defaultTitle: "Dromocob | Film, Web & Growth",
    titleTemplate: "%s | Dromocob",
    defaultDescription: "Sinematik prodüksiyon, modern web ürünleri ve büyüme odaklı dijital sistemler.",
    keywords: ["kurumsal web sitesi", "video prodüksiyon", "dijital büyüme"],
    canonicalUrl: "https://dromocob.com",
    ogImage: "",
    robotsIndex: true,
    robotsFollow: true,
  },
  tracking: {
    enabled: true,
    ga4MeasurementId: "",
    gtmId: "",
    googleAdsId: "",
    metaPixelId: "",
    linkedinInsightId: "",
    tiktokPixelId: "",
    clarityId: "",
  },
  maintenance: {
    enabled: false,
    title: "Kısa bir bakım molasındayız",
    message: "Seni daha iyi bir deneyimle karşılamak için sistemde güncelleme yapıyoruz.",
    estimatedBackAt: "",
    contactEmail: "hello@dromocob.com",
    allowPaths: ["/admin", "/giris"],
  },
  features: {
    liveChatEnabled: true,
    quoteWizardEnabled: true,
    registrationEnabled: true,
    publicProjectsEnabled: true,
    autoLeadCaptureEnabled: true,
  },
  integrations: {
    crmWebhookUrl: "",
    slackWebhookUrl: "",
    recaptchaSiteKey: "",
    cookieConsentId: "",
    allowedOrigins: ["https://dromocob.com"],
    rateLimitPerMinute: 30,
  },
};

function parseLines(value: string) {
  return value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);
}

function joinLines(values: string[]) {
  return values.join("\n");
}

export default function Page() {
  const [tab, setTab] = useState<"seo" | "tracking" | "maintenance" | "features" | "integrations">("seo");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [keywordsText, setKeywordsText] = useState(joinLines(DEFAULT_SETTINGS.seo.keywords));
  const [allowPathsText, setAllowPathsText] = useState(joinLines(DEFAULT_SETTINGS.maintenance.allowPaths));
  const [originsText, setOriginsText] = useState(joinLines(DEFAULT_SETTINGS.integrations.allowedOrigins));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return onSnapshot(doc(db, "site_settings", "global"), snapshot => {
      const data = snapshot.data() as Partial<SiteSettings> | undefined;

      if (!data) {
        setSettings(DEFAULT_SETTINGS);
        setKeywordsText(joinLines(DEFAULT_SETTINGS.seo.keywords));
        setAllowPathsText(joinLines(DEFAULT_SETTINGS.maintenance.allowPaths));
        setOriginsText(joinLines(DEFAULT_SETTINGS.integrations.allowedOrigins));
        return;
      }

      const next: SiteSettings = {
        ...DEFAULT_SETTINGS,
        ...data,
        seo: {
          ...DEFAULT_SETTINGS.seo,
          ...(data.seo || {}),
          keywords: Array.isArray(data.seo?.keywords) ? data.seo.keywords.map(String) : DEFAULT_SETTINGS.seo.keywords,
        },
        tracking: {
          ...DEFAULT_SETTINGS.tracking,
          ...(data.tracking || {}),
        },
        maintenance: {
          ...DEFAULT_SETTINGS.maintenance,
          ...(data.maintenance || {}),
          allowPaths: Array.isArray(data.maintenance?.allowPaths)
            ? data.maintenance.allowPaths.map(String)
            : DEFAULT_SETTINGS.maintenance.allowPaths,
        },
        features: {
          ...DEFAULT_SETTINGS.features,
          ...(data.features || {}),
        },
        integrations: {
          ...DEFAULT_SETTINGS.integrations,
          ...(data.integrations || {}),
          allowedOrigins: Array.isArray(data.integrations?.allowedOrigins)
            ? data.integrations.allowedOrigins.map(String)
            : DEFAULT_SETTINGS.integrations.allowedOrigins,
        },
      };

      setSettings(next);
      setKeywordsText(joinLines(next.seo.keywords));
      setAllowPathsText(joinLines(next.maintenance.allowPaths));
      setOriginsText(joinLines(next.integrations.allowedOrigins));
    });
  }, []);

  const stats = useMemo(() => {
    const trackingCount = [
      settings.tracking.ga4MeasurementId,
      settings.tracking.gtmId,
      settings.tracking.googleAdsId,
      settings.tracking.metaPixelId,
      settings.tracking.linkedinInsightId,
      settings.tracking.tiktokPixelId,
      settings.tracking.clarityId,
    ].filter(Boolean).length;

    return {
      trackingCount,
      maintenanceStatus: settings.maintenance.enabled ? "Aktif" : "Pasif",
    };
  }, [settings]);

  async function saveSettings() {
    setSaving(true);
    setStatus("");
    setError("");

    try {
      const payload: SiteSettings = {
        ...settings,
        seo: {
          ...settings.seo,
          keywords: parseLines(keywordsText),
        },
        maintenance: {
          ...settings.maintenance,
          allowPaths: parseLines(allowPathsText),
        },
        integrations: {
          ...settings.integrations,
          allowedOrigins: parseLines(originsText),
        },
        version: Number(settings.version || 0) + 1,
      };

      await setDoc(doc(db, "site_settings", "global"), {
        ...payload,
        active: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setStatus("Ayarlar başarıyla kaydedildi.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  function restoreDefaults() {
    setSettings(DEFAULT_SETTINGS);
    setKeywordsText(joinLines(DEFAULT_SETTINGS.seo.keywords));
    setAllowPathsText(joinLines(DEFAULT_SETTINGS.maintenance.allowPaths));
    setOriginsText(joinLines(DEFAULT_SETTINGS.integrations.allowedOrigins));
    setStatus("Varsayılan değerler forma yüklendi. Kaydet ile yayınlayabilirsin.");
  }

  return (
    <div className="settings-center">
      <div className="admin-title">
        <div>
          <p className="admin-kicker">SETTINGS ORCHESTRATION CENTER</p>
          <h1>Site Ayarları</h1>
          <p>SEO, tracking, bakım modu, özellik bayrakları ve entegrasyonları tek merkezden yönet.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="admin-action" onClick={restoreDefaults}><Wrench size={15} /> Varsayılanları Yükle</button>
          <button type="button" className="admin-action" onClick={saveSettings} disabled={saving}><Check size={15} /> {saving ? "Kaydediliyor..." : "Kaydet ve Yayınla"}</button>
        </div>
      </div>

      {status && <div className="admin-note">{status}</div>}
      {error && <div className="admin-alert">{error}</div>}

      <section className="settings-stats-grid">
        <article className="admin-panel settings-stat"><small>Sürüm</small><strong>{settings.version}</strong></article>
        <article className="admin-panel settings-stat"><small>Tracking Bağlantı</small><strong>{stats.trackingCount}</strong></article>
        <article className="admin-panel settings-stat"><small>Bakım Modu</small><strong>{stats.maintenanceStatus}</strong></article>
      </section>

      <div className="admin-segment settings-tabs">
        <button className={tab === "seo" ? "active" : ""} onClick={() => setTab("seo")}><Globe size={14} /> SEO</button>
        <button className={tab === "tracking" ? "active" : ""} onClick={() => setTab("tracking")}><LineChart size={14} /> Tracking</button>
        <button className={tab === "maintenance" ? "active" : ""} onClick={() => setTab("maintenance")}><Wrench size={14} /> Bakım Modu</button>
        <button className={tab === "features" ? "active" : ""} onClick={() => setTab("features")}><Check size={14} /> Özellik Bayrakları</button>
        <button className={tab === "integrations" ? "active" : ""} onClick={() => setTab("integrations")}><ShieldCheck size={14} /> Entegrasyon & Güvenlik</button>
      </div>

      <section className="admin-panel settings-form-panel">
        {tab === "seo" && (
          <div className="settings-grid">
            <label>Site Adı<input value={settings.seo.siteName} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, siteName: event.target.value } }))} /></label>
            <label>Varsayılan Başlık<input value={settings.seo.defaultTitle} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, defaultTitle: event.target.value } }))} /></label>
            <label className="full">Title Template<input value={settings.seo.titleTemplate} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, titleTemplate: event.target.value } }))} placeholder="%s | Dromocob" /></label>
            <label className="full">Varsayılan Açıklama<textarea value={settings.seo.defaultDescription} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, defaultDescription: event.target.value } }))} /></label>
            <label className="full">Anahtar Kelimeler (satır başına 1)<textarea value={keywordsText} onChange={event => setKeywordsText(event.target.value)} /></label>
            <label>Canonical URL<input value={settings.seo.canonicalUrl} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, canonicalUrl: event.target.value } }))} /></label>
            <label>OG Görsel URL<input value={settings.seo.ogImage} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, ogImage: event.target.value } }))} /></label>
            <label className="toggle"><input type="checkbox" checked={settings.seo.robotsIndex} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, robotsIndex: event.target.checked } }))} /> Robots index</label>
            <label className="toggle"><input type="checkbox" checked={settings.seo.robotsFollow} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, robotsFollow: event.target.checked } }))} /> Robots follow</label>
          </div>
        )}

        {tab === "tracking" && (
          <div className="settings-grid">
            <label className="toggle full"><input type="checkbox" checked={settings.tracking.enabled} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, enabled: event.target.checked } }))} /> Tracking scriptlerini aktif et</label>
            <label>GA4 Measurement ID<input value={settings.tracking.ga4MeasurementId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, ga4MeasurementId: event.target.value } }))} placeholder="G-XXXXXXXXXX" /></label>
            <label>GTM ID<input value={settings.tracking.gtmId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, gtmId: event.target.value } }))} placeholder="GTM-XXXXXX" /></label>
            <label>Google Ads ID<input value={settings.tracking.googleAdsId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, googleAdsId: event.target.value } }))} placeholder="AW-XXXXXXX" /></label>
            <label>Meta Pixel ID<input value={settings.tracking.metaPixelId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, metaPixelId: event.target.value } }))} /></label>
            <label>LinkedIn Insight ID<input value={settings.tracking.linkedinInsightId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, linkedinInsightId: event.target.value } }))} /></label>
            <label>TikTok Pixel ID<input value={settings.tracking.tiktokPixelId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, tiktokPixelId: event.target.value } }))} /></label>
            <label>Microsoft Clarity ID<input value={settings.tracking.clarityId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, clarityId: event.target.value } }))} /></label>
          </div>
        )}

        {tab === "maintenance" && (
          <div className="settings-grid">
            <label className="toggle full"><input type="checkbox" checked={settings.maintenance.enabled} onChange={event => setSettings(current => ({ ...current, maintenance: { ...current.maintenance, enabled: event.target.checked } }))} /> Bakım modunu aktif et</label>
            <label>Bakım Başlığı<input value={settings.maintenance.title} onChange={event => setSettings(current => ({ ...current, maintenance: { ...current.maintenance, title: event.target.value } }))} /></label>
            <label>Geri Açılma Zamanı<input value={settings.maintenance.estimatedBackAt} onChange={event => setSettings(current => ({ ...current, maintenance: { ...current.maintenance, estimatedBackAt: event.target.value } }))} placeholder="16 Temmuz 2026 23:00" /></label>
            <label className="full">Bakım Mesajı<textarea value={settings.maintenance.message} onChange={event => setSettings(current => ({ ...current, maintenance: { ...current.maintenance, message: event.target.value } }))} /></label>
            <label>İletişim E-postası<input value={settings.maintenance.contactEmail} onChange={event => setSettings(current => ({ ...current, maintenance: { ...current.maintenance, contactEmail: event.target.value } }))} /></label>
            <label className="full">İzinli Pathler (satır başına 1)<textarea value={allowPathsText} onChange={event => setAllowPathsText(event.target.value)} /></label>
          </div>
        )}

        {tab === "features" && (
          <div className="settings-grid">
            <label className="toggle"><input type="checkbox" checked={settings.features.liveChatEnabled} onChange={event => setSettings(current => ({ ...current, features: { ...current.features, liveChatEnabled: event.target.checked } }))} /> Canlı Chat</label>
            <label className="toggle"><input type="checkbox" checked={settings.features.quoteWizardEnabled} onChange={event => setSettings(current => ({ ...current, features: { ...current.features, quoteWizardEnabled: event.target.checked } }))} /> Teklif Sihirbazı</label>
            <label className="toggle"><input type="checkbox" checked={settings.features.registrationEnabled} onChange={event => setSettings(current => ({ ...current, features: { ...current.features, registrationEnabled: event.target.checked } }))} /> Kayıt Sayfası</label>
            <label className="toggle"><input type="checkbox" checked={settings.features.publicProjectsEnabled} onChange={event => setSettings(current => ({ ...current, features: { ...current.features, publicProjectsEnabled: event.target.checked } }))} /> Projeler Sayfası</label>
            <label className="toggle"><input type="checkbox" checked={settings.features.autoLeadCaptureEnabled} onChange={event => setSettings(current => ({ ...current, features: { ...current.features, autoLeadCaptureEnabled: event.target.checked } }))} /> Otomatik Lead Toplama</label>
          </div>
        )}

        {tab === "integrations" && (
          <div className="settings-grid">
            <label className="full">CRM Webhook URL<input value={settings.integrations.crmWebhookUrl} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, crmWebhookUrl: event.target.value } }))} /></label>
            <label className="full">Slack Webhook URL<input value={settings.integrations.slackWebhookUrl} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, slackWebhookUrl: event.target.value } }))} /></label>
            <label>reCAPTCHA Site Key<input value={settings.integrations.recaptchaSiteKey} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, recaptchaSiteKey: event.target.value } }))} /></label>
            <label>Cookie Consent ID<input value={settings.integrations.cookieConsentId} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, cookieConsentId: event.target.value } }))} /></label>
            <label>Rate Limit / dk<input type="number" value={settings.integrations.rateLimitPerMinute} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, rateLimitPerMinute: Number(event.target.value || 0) } }))} /></label>
            <label className="full">Allowed Origins (satır başına 1)<textarea value={originsText} onChange={event => setOriginsText(event.target.value)} /></label>
          </div>
        )}
      </section>
    </div>
  );
}
