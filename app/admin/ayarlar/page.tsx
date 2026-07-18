"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
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
    googleSiteVerification: string;
    bingSiteVerification: string;
    yandexVerification: string;
    robotsIndex: boolean;
    robotsFollow: boolean;
    locale: string;
    twitterHandle: string;
    organizationName: string;
    organizationDescription: string;
    logoUrl: string;
    socialProfiles: string[];
    noIndexPaths: string[];
    structuredDataEnabled: boolean;
    sitemapEnabled: boolean;
  };
  tracking: {
    enabled: boolean;
    ga4MeasurementId: string;
    gtmId: string;
    googleAdsId: string;
    googleAdsConversionLabel: string;
    metaPixelId: string;
    metaDomainVerification: string;
    linkedinInsightId: string;
    tiktokPixelId: string;
    clarityId: string;
    consentModeEnabled: boolean;
    debugMode: boolean;
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
    whatsappUrl: string;
    calendlyUrl: string;
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
    googleSiteVerification: "",
    bingSiteVerification: "",
    yandexVerification: "",
    robotsIndex: true,
    robotsFollow: true,
    locale: "tr_TR",
    twitterHandle: "",
    organizationName: "Dromocob",
    organizationDescription: "Film prodüksiyonu, web application ve dijital büyüme stüdyosu.",
    logoUrl: "",
    socialProfiles: [],
    noIndexPaths: ["/admin", "/profilim"],
    structuredDataEnabled: true,
    sitemapEnabled: true,
  },
  tracking: {
    enabled: true,
    ga4MeasurementId: "",
    gtmId: "",
    googleAdsId: "",
    googleAdsConversionLabel: "",
    metaPixelId: "",
    metaDomainVerification: "",
    linkedinInsightId: "",
    tiktokPixelId: "",
    clarityId: "",
    consentModeEnabled: false,
    debugMode: false,
  },
  maintenance: {
    enabled: false,
    title: "Kısa bir bakım molasındayız",
    message: "Seni daha iyi bir deneyimle karşılamak için sistemde güncelleme yapıyoruz.",
    estimatedBackAt: "",
    contactEmail: "info@dromocob.com",
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
    whatsappUrl: "",
    calendlyUrl: "",
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

function isHttpUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function Page() {
  const [tab, setTab] = useState<"seo" | "tracking" | "maintenance" | "features" | "integrations">("seo");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [keywordsText, setKeywordsText] = useState(joinLines(DEFAULT_SETTINGS.seo.keywords));
  const [allowPathsText, setAllowPathsText] = useState(joinLines(DEFAULT_SETTINGS.maintenance.allowPaths));
  const [originsText, setOriginsText] = useState(joinLines(DEFAULT_SETTINGS.integrations.allowedOrigins));
  const [socialProfilesText, setSocialProfilesText] = useState("");
  const [noIndexPathsText, setNoIndexPathsText] = useState(joinLines(DEFAULT_SETTINGS.seo.noIndexPaths));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return onSnapshot(
      doc(db, "site_settings", "global"),
      snapshot => {
        const data = snapshot.data() as Partial<SiteSettings> | undefined;

        if (!data) {
          setSettings(DEFAULT_SETTINGS);
          setKeywordsText(joinLines(DEFAULT_SETTINGS.seo.keywords));
          setAllowPathsText(joinLines(DEFAULT_SETTINGS.maintenance.allowPaths));
          setOriginsText(joinLines(DEFAULT_SETTINGS.integrations.allowedOrigins));
          setSocialProfilesText(joinLines(DEFAULT_SETTINGS.seo.socialProfiles));
          setNoIndexPathsText(joinLines(DEFAULT_SETTINGS.seo.noIndexPaths));
          return;
        }

        const next: SiteSettings = {
          ...DEFAULT_SETTINGS,
          ...data,
          seo: {
            ...DEFAULT_SETTINGS.seo,
            ...(data.seo || {}),
            keywords: Array.isArray(data.seo?.keywords) ? data.seo.keywords.map(String) : DEFAULT_SETTINGS.seo.keywords,
            socialProfiles: Array.isArray(data.seo?.socialProfiles) ? data.seo.socialProfiles.map(String) : DEFAULT_SETTINGS.seo.socialProfiles,
            noIndexPaths: Array.isArray(data.seo?.noIndexPaths) ? data.seo.noIndexPaths.map(String) : DEFAULT_SETTINGS.seo.noIndexPaths,
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
        setSocialProfilesText(joinLines(next.seo.socialProfiles));
        setNoIndexPathsText(joinLines(next.seo.noIndexPaths));
        setError("");
      },
      snapshotError => {
        setSettings(DEFAULT_SETTINGS);
        setError(snapshotError.message || "Ayarlar okunamadı.");
      }
    );
  }, []);

  const seoScore = useMemo(() => {
    const checks = [
      settings.seo.defaultTitle.length >= 30 && settings.seo.defaultTitle.length <= 60,
      settings.seo.defaultDescription.length >= 120 && settings.seo.defaultDescription.length <= 160,
      Boolean(settings.seo.canonicalUrl),
      Boolean(settings.seo.ogImage),
      parseLines(keywordsText).length >= 3,
      Boolean(settings.seo.googleSiteVerification),
      settings.seo.robotsIndex && settings.seo.robotsFollow,
      settings.seo.structuredDataEnabled,
      settings.seo.sitemapEnabled,
      Boolean(settings.seo.organizationName && settings.seo.organizationDescription),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [keywordsText, settings.seo]);

  const stats = useMemo(() => {
    const trackingCount = [
      settings.tracking.ga4MeasurementId,
      settings.tracking.gtmId,
      settings.tracking.googleAdsId,
      settings.tracking.googleAdsConversionLabel,
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
      const canonicalUrl = settings.seo.canonicalUrl.trim();
      const ogImage = settings.seo.ogImage.trim();
      const crmWebhookUrl = settings.integrations.crmWebhookUrl.trim();
      const slackWebhookUrl = settings.integrations.slackWebhookUrl.trim();
      const whatsappUrl = settings.integrations.whatsappUrl.trim();
      const calendlyUrl = settings.integrations.calendlyUrl.trim();

      if (!isHttpUrl(canonicalUrl)) {
        throw new Error("Canonical URL geçerli bir http/https adresi olmalı.");
      }

      if (!isHttpUrl(ogImage)) {
        throw new Error("OG görsel URL geçerli bir http/https adresi olmalı.");
      }

      if (!isHttpUrl(crmWebhookUrl) || !isHttpUrl(slackWebhookUrl)) {
        throw new Error("Webhook URL alanları geçerli http/https adresi olmalı.");
      }

      if (!isHttpUrl(whatsappUrl) || !isHttpUrl(calendlyUrl)) {
        throw new Error("WhatsApp ve Calendly URL alanları geçerli http/https adresi olmalı.");
      }

      const payload: SiteSettings = {
        ...settings,
        seo: {
          ...settings.seo,
          canonicalUrl,
          ogImage,
          keywords: parseLines(keywordsText),
          socialProfiles: parseLines(socialProfilesText),
          noIndexPaths: parseLines(noIndexPathsText),
        },
        tracking: {
          ...settings.tracking,
          ga4MeasurementId: settings.tracking.ga4MeasurementId.trim(),
          gtmId: settings.tracking.gtmId.trim(),
          googleAdsId: settings.tracking.googleAdsId.trim(),
          googleAdsConversionLabel: settings.tracking.googleAdsConversionLabel.trim(),
          metaPixelId: settings.tracking.metaPixelId.trim(),
          metaDomainVerification: settings.tracking.metaDomainVerification.trim(),
          linkedinInsightId: settings.tracking.linkedinInsightId.trim(),
          tiktokPixelId: settings.tracking.tiktokPixelId.trim(),
          clarityId: settings.tracking.clarityId.trim(),
        },
        maintenance: {
          ...settings.maintenance,
          allowPaths: parseLines(allowPathsText),
        },
        integrations: {
          ...settings.integrations,
          crmWebhookUrl,
          slackWebhookUrl,
          whatsappUrl,
          calendlyUrl,
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
    setSocialProfilesText(joinLines(DEFAULT_SETTINGS.seo.socialProfiles));
    setNoIndexPathsText(joinLines(DEFAULT_SETTINGS.seo.noIndexPaths));
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
        <article className="admin-panel settings-stat"><small>SEO Sağlık Skoru</small><strong>{seoScore}%</strong></article>
        <article className="admin-panel settings-stat"><small>Tracking Bağlantı</small><strong>{stats.trackingCount}</strong></article>
        <article className="admin-panel settings-stat"><small>Bakım Modu</small><strong>{stats.maintenanceStatus}</strong></article>
        <article className="admin-panel settings-stat"><small>Consent Mode</small><strong>{settings.tracking.consentModeEnabled ? "Aktif" : "Kapalı"}</strong></article>
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
          <div className="seo-control-layout">
          <div className="settings-grid seo-settings-grid">
            <div className="settings-section-title full"><span>01</span><div><strong>Arama görünümü</strong><small>Google sonuçlarında görünen temel marka bilgileri.</small></div></div>
            <label>Site Adı<input value={settings.seo.siteName} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, siteName: event.target.value } }))} /></label>
            <label>Varsayılan Başlık<input value={settings.seo.defaultTitle} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, defaultTitle: event.target.value } }))} /></label>
            <label className="full">Title Template<input value={settings.seo.titleTemplate} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, titleTemplate: event.target.value } }))} placeholder="%s | Dromocob" /></label>
            <label className="full">Varsayılan Açıklama<textarea value={settings.seo.defaultDescription} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, defaultDescription: event.target.value } }))} /></label>
            <label className="full">Anahtar Kelimeler (satır başına 1)<textarea value={keywordsText} onChange={event => setKeywordsText(event.target.value)} /></label>
            <label>Canonical URL<input value={settings.seo.canonicalUrl} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, canonicalUrl: event.target.value } }))} /></label>
            <label>OG Görsel URL<input value={settings.seo.ogImage} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, ogImage: event.target.value } }))} /></label>
            <div className="settings-section-title full"><span>02</span><div><strong>Sosyal paylaşım & marka</strong><small>Open Graph, X/Twitter ve Organization schema bilgileri.</small></div></div>
            <label>Locale<input value={settings.seo.locale} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, locale: event.target.value } }))} placeholder="tr_TR" /></label>
            <label>X / Twitter Kullanıcı Adı<input value={settings.seo.twitterHandle} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, twitterHandle: event.target.value } }))} placeholder="@dromocob" /></label>
            <label>Organization Adı<input value={settings.seo.organizationName} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, organizationName: event.target.value } }))} /></label>
            <label>Logo URL<input value={settings.seo.logoUrl} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, logoUrl: event.target.value } }))} /></label>
            <label className="full">Organization Açıklaması<textarea value={settings.seo.organizationDescription} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, organizationDescription: event.target.value } }))} /></label>
            <label className="full">Sosyal Profil URL&apos;leri (satır başına 1)<textarea value={socialProfilesText} onChange={event => setSocialProfilesText(event.target.value)} placeholder="https://instagram.com/dromocob" /></label>
            <div className="settings-section-title full"><span>03</span><div><strong>İndeksleme & doğrulama</strong><small>Arama motorlarının siteyi keşfetme ve tarama kuralları.</small></div></div>
            <label>Google Site Verification<input value={settings.seo.googleSiteVerification} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, googleSiteVerification: event.target.value } }))} placeholder="google-site-verification token" /></label>
            <label>Bing Verification<input value={settings.seo.bingSiteVerification} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, bingSiteVerification: event.target.value } }))} /></label>
            <label>Yandex Verification<input value={settings.seo.yandexVerification} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, yandexVerification: event.target.value } }))} /></label>
            <label className="toggle"><input type="checkbox" checked={settings.seo.robotsIndex} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, robotsIndex: event.target.checked } }))} /> Robots index</label>
            <label className="toggle"><input type="checkbox" checked={settings.seo.robotsFollow} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, robotsFollow: event.target.checked } }))} /> Robots follow</label>
            <label className="toggle"><input type="checkbox" checked={settings.seo.structuredDataEnabled} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, structuredDataEnabled: event.target.checked } }))} /> Organization Schema aktif</label>
            <label className="toggle"><input type="checkbox" checked={settings.seo.sitemapEnabled} onChange={event => setSettings(current => ({ ...current, seo: { ...current.seo, sitemapEnabled: event.target.checked } }))} /> XML Sitemap aktif</label>
            <label className="full">Noindex Path&apos;leri (satır başına 1)<textarea value={noIndexPathsText} onChange={event => setNoIndexPathsText(event.target.value)} placeholder="/admin" /></label>
          </div>
          <aside className="seo-preview-rail">
            <div className="seo-score-card"><div><span style={{ "--seo-score": `${seoScore * 3.6}deg` } as CSSProperties}><b>{seoScore}</b></span><div><small>SEO HEALTH</small><strong>{seoScore >= 80 ? "Mükemmel" : seoScore >= 60 ? "İyi" : "Geliştirilmeli"}</strong></div></div><p>Başlık, açıklama, indeksleme, schema ve doğrulama sinyallerine göre hesaplandı.</p></div>
            <div className="serp-preview"><p>GOOGLE PREVIEW</p><span>{settings.seo.canonicalUrl || "https://dromocob.com"}</span><h3>{settings.seo.defaultTitle || "Dromocob"}</h3><div>{settings.seo.defaultDescription || "Meta açıklaması burada görünecek."}</div><small>{settings.seo.defaultTitle.length}/60 başlık · {settings.seo.defaultDescription.length}/160 açıklama</small></div>
            <div className="og-preview"><p>SOCIAL PREVIEW</p><div className="og-preview-image" style={settings.seo.ogImage ? { backgroundImage: `url(${settings.seo.ogImage})` } : undefined}><span>1200 × 630</span></div><strong>{settings.seo.defaultTitle}</strong><small>{settings.seo.defaultDescription}</small></div>
            <div className="seo-checklist"><p>YAYIN KONTROLÜ</p>{[["Canonical URL",!!settings.seo.canonicalUrl],["OG görsel",!!settings.seo.ogImage],["Organization schema",settings.seo.structuredDataEnabled],["Sitemap",settings.seo.sitemapEnabled],["Google doğrulama",!!settings.seo.googleSiteVerification]].map(([label, ok]) => <div key={String(label)} className={ok ? "ok" : ""}><i/>{String(label)}<b>{ok ? "Hazır" : "Eksik"}</b></div>)}</div>
          </aside>
          </div>
        )}

        {tab === "tracking" && (
          <div className="settings-grid">
            <label className="toggle full"><input type="checkbox" checked={settings.tracking.enabled} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, enabled: event.target.checked } }))} /> Tracking scriptlerini aktif et</label>
            <label>GA4 Measurement ID<input value={settings.tracking.ga4MeasurementId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, ga4MeasurementId: event.target.value } }))} placeholder="G-XXXXXXXXXX" /><small>GA4 doğrudan yüklenir. GTM içinde ayrıca aynı GA4 etiketini kurma; çift ölçüm oluşur.</small></label>
            <label>GTM ID<input value={settings.tracking.gtmId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, gtmId: event.target.value } }))} placeholder="GTM-XXXXXX" /><small>Container kimliğini gir: ör. GTM-ABC1234.</small></label>
            <label>Google Ads ID<input value={settings.tracking.googleAdsId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, googleAdsId: event.target.value } }))} placeholder="AW-XXXXXXX" /></label>
            <label>Ads Conversion Label<input value={settings.tracking.googleAdsConversionLabel} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, googleAdsConversionLabel: event.target.value } }))} placeholder="abcDEF123..." /></label>
            <label>Meta Pixel ID<input value={settings.tracking.metaPixelId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, metaPixelId: event.target.value } }))} /></label>
            <label>Meta Domain Verification<input value={settings.tracking.metaDomainVerification} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, metaDomainVerification: event.target.value } }))} /></label>
            <label>LinkedIn Insight ID<input value={settings.tracking.linkedinInsightId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, linkedinInsightId: event.target.value } }))} /></label>
            <label>TikTok Pixel ID<input value={settings.tracking.tiktokPixelId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, tiktokPixelId: event.target.value } }))} /></label>
            <label>Microsoft Clarity ID<input value={settings.tracking.clarityId} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, clarityId: event.target.value } }))} /></label>
            <label className="toggle"><input type="checkbox" checked={settings.tracking.consentModeEnabled} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, consentModeEnabled: event.target.checked } }))} /> Google Consent Mode v2 (yalnızca çalışan çerez izin paneli varsa aç)</label>
            <label className="toggle"><input type="checkbox" checked={settings.tracking.debugMode} onChange={event => setSettings(current => ({ ...current, tracking: { ...current.tracking, debugMode: event.target.checked } }))} /> Analytics debug mode</label>
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
            <label>WhatsApp URL<input value={settings.integrations.whatsappUrl} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, whatsappUrl: event.target.value } }))} placeholder="https://wa.me/90..." /></label>
            <label>Calendly URL<input value={settings.integrations.calendlyUrl} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, calendlyUrl: event.target.value } }))} placeholder="https://calendly.com/..." /></label>
            <label>Rate Limit / dk<input type="number" value={settings.integrations.rateLimitPerMinute} onChange={event => setSettings(current => ({ ...current, integrations: { ...current.integrations, rateLimitPerMinute: Number(event.target.value || 0) } }))} /></label>
            <label className="full">Allowed Origins (satır başına 1)<textarea value={originsText} onChange={event => setOriginsText(event.target.value)} /></label>
          </div>
        )}
      </section>
    </div>
  );
}
