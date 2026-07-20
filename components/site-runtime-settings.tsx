"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import LiveChat from "@/components/live-chat";
import CookieConsent from "@/components/cookie-consent";
import type { PublicTrackingSettings } from "@/lib/runtime-tracking";
import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/lib/google-consent";

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

const environmentTracking: NonNullable<RuntimeSiteSettings["tracking"]> = {
  enabled: true,
  ga4MeasurementId:
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
};

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

function validId(value: unknown, pattern: RegExp): string {
  const id = cleanId(value).toUpperCase();
  return pattern.test(id) ? id : "";
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

export default function SiteRuntimeSettings({ children, initialTracking }: { children: ReactNode; initialTracking?: PublicTrackingSettings }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isWorkspaceRoute = isAdminRoute || pathname.startsWith("/site-olustur") || pathname.startsWith("/site-duzenle") || pathname.startsWith("/site-onizleme");
  const [settings, setSettings] = useState<RuntimeSiteSettings>({ tracking: { ...environmentTracking, ...initialTracking } });
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const initialPageView = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "null") as ConsentChoice | null;
        if (saved && typeof saved.analytics === "boolean" && typeof saved.advertising === "boolean") setConsent(saved);
      } catch {
        setConsent(null);
      }
    }, 0);

    const update = (event: Event) => setConsent((event as CustomEvent<ConsentChoice>).detail);
    window.addEventListener("dromocob:consent", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("dromocob:consent", update);
    };
  }, []);

  useEffect(() => {
    return onSnapshot(
      SETTINGS_DOC,
      snapshot => {
        if (!snapshot.exists()) {
          setSettings({ tracking: { ...environmentTracking, ...initialTracking } });
          return;
        }

        const data = snapshot.data() as RuntimeSiteSettings;
        setSettings({
          ...data,
          tracking: { ...environmentTracking, ...initialTracking, ...data.tracking },
        });
      },
      error => {
        if (getErrorCode(error) !== "permission-denied") {
          console.warn(
            "[DROMOCOB SETTINGS] Ayarlar okunamadı:",
            error
          );
        }

        setSettings({ tracking: { ...environmentTracking, ...initialTracking } });
      }
    );
  }, [initialTracking]);

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

  const ga4Id = trackingEnabled ? validId(tracking?.ga4MeasurementId, /^G-[A-Z0-9]+$/) : "";
  const gtmId = trackingEnabled ? validId(tracking?.gtmId, /^GTM-[A-Z0-9]+$/) : "";
  const adsId = trackingEnabled ? validId(tracking?.googleAdsId, /^AW-[0-9]+$/) : "";
  const adsConversionLabel = trackingEnabled ? cleanId(tracking?.googleAdsConversionLabel) : "";
  const pixelId = trackingEnabled ? cleanId(tracking?.metaPixelId) : "";
  const linkedinId = trackingEnabled ? cleanId(tracking?.linkedinInsightId) : "";
  const tiktokId = trackingEnabled ? cleanId(tracking?.tiktokPixelId) : "";
  const clarityId = trackingEnabled ? cleanId(tracking?.clarityId) : "";
  const debugMode = trackingEnabled && tracking?.debugMode === true;
  const gtagId = ga4Id || adsId;
  const directGtagId = gtmId ? "" : gtagId;

  useEffect(() => {
    if (initialPageView.current) {
      initialPageView.current = false;
      return;
    }

    const browserWindow = window as typeof window & {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };

    if (ga4Id && !gtmId && browserWindow.gtag) {
      browserWindow.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    if (gtmId && browserWindow.dataLayer) {
      browserWindow.dataLayer.push({ event: "virtual_page_view", page_path: pathname });
    }
  }, [ga4Id, gtmId, pathname]);

  return (
    <>
      {directGtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${directGtagId}`} strategy="afterInteractive" />
          <Script id="dromocob-gtag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());${ga4Id ? ` gtag('config', '${ga4Id}', { send_page_view: true${debugMode ? ", debug_mode: true" : ""} });` : ""}${adsId ? ` gtag('config', '${adsId}'${debugMode ? ", { debug_mode: true }" : ""});` : ""}${adsId && adsConversionLabel ? ` window.dromocobAdsConversion = function(value, currency){ gtag('event', 'conversion', { send_to: '${adsId}/${adsConversionLabel}', value: value || 1.0, currency: currency || 'TRY' }); };` : ""}`}
          </Script>
        </>
      )}

      {gtmId && (
        <>
          <Script id="dromocob-gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              title="Google Tag Manager"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {pixelId && consent?.advertising && (
        <Script id="dromocob-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${pixelId}'); fbq('track', 'PageView');`}
        </Script>
      )}

      {linkedinId && consent?.advertising && (
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

      {tiktokId && consent?.advertising && (
        <Script id="dromocob-tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript',o.async=!0,o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)}; ttq.load('${tiktokId}'); ttq.page(); }(window, document, 'ttq');`}
        </Script>
      )}

      {clarityId && consent?.analytics && (
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
          {!isWorkspaceRoute && <SiteNav />}
          <main className={isWorkspaceRoute ? "admin-route-main" : undefined}>{children}</main>
          {!isWorkspaceRoute && <SiteFooter />}
          {!isWorkspaceRoute && settings.features?.liveChatEnabled !== false && <LiveChat />}
          {!isWorkspaceRoute && trackingEnabled && <CookieConsent />}
        </>
      )}
    </>
  );
}
