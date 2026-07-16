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
  tracking?: {
    enabled?: boolean;
    ga4MeasurementId?: string;
    gtmId?: string;
    googleAdsId?: string;
    metaPixelId?: string;
    clarityId?: string;
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

export default function SiteRuntimeSettings({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<RuntimeSiteSettings>({});

  useEffect(() => {
    return onSnapshot(SETTINGS_DOC, snapshot => {
      if (!snapshot.exists()) {
        setSettings({});
        return;
      }

      const data = snapshot.data() as RuntimeSiteSettings;
      setSettings(data);
    });
  }, []);

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

  const ga4Id = trackingEnabled ? String(tracking?.ga4MeasurementId || "").trim() : "";
  const gtmId = trackingEnabled ? String(tracking?.gtmId || "").trim() : "";
  const adsId = trackingEnabled ? String(tracking?.googleAdsId || "").trim() : "";
  const pixelId = trackingEnabled ? String(tracking?.metaPixelId || "").trim() : "";
  const clarityId = trackingEnabled ? String(tracking?.clarityId || "").trim() : "";

  return (
    <>
      {ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="dromocob-ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${ga4Id}');`}
          </Script>
        </>
      )}

      {gtmId && (
        <Script id="dromocob-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {adsId && !ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`} strategy="afterInteractive" />
          <Script id="dromocob-gads" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${adsId}');`}
          </Script>
        </>
      )}

      {pixelId && (
        <Script id="dromocob-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${pixelId}'); fbq('track', 'PageView');`}
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
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
          {settings.features?.liveChatEnabled !== false && <LiveChat />}
        </>
      )}
    </>
  );
}
