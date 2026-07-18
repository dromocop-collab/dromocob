"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import LiveChat from "@/components/live-chat";

type RuntimeSiteSettings = {
  active?: boolean;
  seo?: {
    googleSiteVerification?: string;
    bingSiteVerification?: string;
    yandexVerification?: string;
  };
  tracking?: {
    enabled?: boolean;
    ga4MeasurementId?: string;
    gtmId?: string;
    googleAdsId?: string;
    googleAdsConversionLabel?: string;
    metaPixelId?: string;
    metaDomainVerification?: string;
    linkedinInsightId?: string;
    tiktokPixelId?: string;
    clarityId?: string;
    consentModeEnabled?: boolean;
    debugMode?: boolean;
  };
  maintenance?: {
    enabled?: boolean;
    title?: string;
    message?: string;
    estimatedBackAt?: string;
    contactEmail?: string;
    allowPaths?: string[];
  };
  features?: {
    liveChatEnabled?: boolean;
  };
};

const SETTINGS_DOC = doc(db, "site_settings", "global");

function getErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(error.code);
  }

  return "";
}

function cleanId(value: unknown): string {
  return String(value || "").trim();
}

function upsertMeta(name: string, content: string) {
  if (!content) return;

  const selector = `meta[name="${name}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    existing.content = content;
    return;
  }

  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

export default function SiteRuntimeSettings({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [settings, setSettings] = useState<RuntimeSiteSettings>({});

  useEffect(() => {
    return onSnapshot(
      SETTINGS_DOC,
      snapshot => {
        if (!snapshot.exists()) {
          setSettings({});
          return;
        }

        const data = snapshot.data() as RuntimeSiteSettings;
        setSettings(data);
      },
      error => {
        if (getErrorCode(error) !== "permission-denied") {
          console.warn(
            "[DROMOCOB SETTINGS] Ayarlar okunamadı:",
            error
          );
        }

        setSettings({});
      }
    );
  }, []);

  useEffect(() => {
    const seo = settings.seo;
    const tracking = settings.tracking;

    upsertMeta("google-site-verification", cleanId(seo?.googleSiteVerification));
    upsertMeta("msvalidate.01", cleanId(seo?.bingSiteVerification));
    upsertMeta("yandex-verification", cleanId(seo?.yandexVerification));
    upsertMeta("facebook-domain-verification", cleanId(tracking?.metaDomainVerification));
  }, [settings.seo, settings.tracking]);

  const maintenance = settings.maintenance;

  const shouldShowMaintenance = useMemo(() => {
    if (!maintenance?.enabled) return false;

    const allowPaths = Array.isArray(maintenance.allowPaths)
      ? maintenance.allowPaths.filter(Boolean)
      : [];

    if (allowPaths.some(path => pathname.startsWith(path))) {
      return false;
    }

    return !pathname.startsWith("/admin");
  }, [maintenance, pathname]);

  const tracking = settings.tracking;
  const trackingEnabled = tracking?.enabled !== false;

  const ga4Id = trackingEnabled ? cleanId(tracking?.ga4MeasurementId) : "";
  const gtmId = trackingEnabled ? cleanId(tracking?.gtmId) : "";
  const adsId = trackingEnabled ? cleanId(tracking?.googleAdsId) : "";
  const adsConversionLabel = trackingEnabled ? cleanId(tracking?.googleAdsConversionLabel) : "";
  const pixelId = trackingEnabled ? cleanId(tracking?.metaPixelId) : "";
  const linkedinId = trackingEnabled ? cleanId(tracking?.linkedinInsightId) : "";
  const tiktokId = trackingEnabled ? cleanId(tracking?.tiktokPixelId) : "";
  const clarityId = trackingEnabled ? cleanId(tracking?.clarityId) : "";
  const debugMode = trackingEnabled && tracking?.debugMode === true;
  const consentModeEnabled = trackingEnabled && tracking?.consentModeEnabled !== false;
  const gtagId = ga4Id || adsId;

  return (
    <>
      {gtagId && consentModeEnabled && (
        <Script id="dromocob-consent-mode" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });`}
        </Script>
      )}

      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="dromocob-gtag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());${ga4Id ? ` gtag('config', '${ga4Id}', { send_page_view: true${debugMode ? ", debug_mode: true" : ""} });` : ""}${adsId ? ` gtag('config', '${adsId}'${debugMode ? ", { debug_mode: true }" : ""});` : ""}${adsId && adsConversionLabel ? ` window.dromocobAdsConversion = function(value, currency){ gtag('event', 'conversion', { send_to: '${adsId}/${adsConversionLabel}', value: value || 1.0, currency: currency || 'TRY' }); };` : ""}`}
          </Script>
        </>
      )}

      {gtmId && (
        <Script id="dromocob-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {pixelId && (
        <Script id="dromocob-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${pixelId}'); fbq('track', 'PageView');`}
        </Script>
      )}

      {linkedinId && (
        <>
          <Script id="dromocob-linkedin-insight" strategy="afterInteractive">
            {`_linkedin_partner_id = '${linkedinId}'; window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || []; window._linkedin_data_partner_ids.push(_linkedin_partner_id); (function(l) { if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])}; window.lintrk.q=[]} var s = document.getElementsByTagName('script')[0]; var b = document.createElement('script'); b.type = 'text/javascript'; b.async = true; b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js'; s.parentNode.insertBefore(b, s);})(window.lintrk);`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://px.ads.linkedin.com/collect/?pid=${linkedinId}&fmt=gif`} />
          </noscript>
        </>
      )}

      {tiktokId && (
        <Script id="dromocob-tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript',o.async=!0,o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)}; ttq.load('${tiktokId}'); ttq.page(); }(window, document, 'ttq');`}
        </Script>
      )}

      {clarityId && (
        <Script id="dromocob-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, 'clarity', 'script', '${clarityId}');`}
        </Script>
      )}

      {shouldShowMaintenance ? (
        <div className="site-maintenance-gate">
          <div className="site-maintenance-card">
            <p className="eyebrow">Sistem güncellemesi</p>
            <h1>{maintenance?.title || "Kısa bir bakım molasındayız"}</h1>
            <p>{maintenance?.message || "Seni daha iyi bir deneyimle karşılamak için sistemi güncelliyoruz."}</p>
            {maintenance?.estimatedBackAt && <small>Tahmini açılış: {maintenance.estimatedBackAt}</small>}
            {maintenance?.contactEmail && <a href={`mailto:${maintenance.contactEmail}`}>{maintenance.contactEmail}</a>}
          </div>
        </div>
      ) : (
        <>
          {!isAdminRoute && <SiteNav />}
          <main className={isAdminRoute ? "admin-route-main" : undefined}>{children}</main>
          {!isAdminRoute && <SiteFooter />}
          {!isAdminRoute && settings.features?.liveChatEnabled !== false && <LiveChat />}
        </>
      )}
    </>
  );
}
