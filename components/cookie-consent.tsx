"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Settings2, X } from "lucide-react";
import {
  CONSENT_STORAGE_KEY,
  consentUpdate,
  type ConsentChoice,
} from "@/lib/google-consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function readChoice(): ConsentChoice | null {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "null") as Partial<ConsentChoice> | null;
    return value && typeof value.analytics === "boolean" && typeof value.advertising === "boolean"
      ? { analytics: value.analytics, advertising: value.advertising, updatedAt: String(value.updatedAt || "") }
      : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readChoice();
      if (saved) {
        setAnalytics(saved.analytics);
        setAdvertising(saved.advertising);
      } else {
        setVisible(true);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function save(nextAnalytics: boolean, nextAdvertising: boolean) {
    const choice: ConsentChoice = {
      analytics: nextAnalytics,
      advertising: nextAdvertising,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(...args: unknown[]) { window.dataLayer.push(args); };
    window.gtag("consent", "update", consentUpdate(choice));
    window.dataLayer.push({
      event: "dromocob_consent_update",
      consent_analytics: nextAnalytics,
      consent_advertising: nextAdvertising,
    });
    window.dispatchEvent(new CustomEvent("dromocob:consent", { detail: choice }));
    setAnalytics(nextAnalytics);
    setAdvertising(nextAdvertising);
    setVisible(false);
    setPreferences(false);
  }

  if (!ready) return null;

  return (
    <>
      {visible ? (
        <section className="cookie-consent" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
          <button className="cookie-consent-close" onClick={() => save(false, false)} aria-label="Çerezleri reddet ve kapat"><X /></button>
          <div className="cookie-consent-icon"><Cookie /></div>
          <div className="cookie-consent-copy">
            <p className="eyebrow">Gizlilik tercihleri</p>
            <h2 id="cookie-consent-title">Deneyimini sen yönet.</h2>
            <p>Zorunlu çerezler siteyi çalıştırır. Analitik ve reklam çerezleri yalnızca izninle ölçüm ve iyileştirme için kullanılır. Detaylar <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>&apos;nda.</p>
            {preferences && (
              <div className="cookie-preferences">
                <label><span><strong>Zorunlu</strong><small>Güvenlik ve temel site işlevleri</small></span><input type="checkbox" checked disabled /></label>
                <label><span><strong>Analitik</strong><small>GA4 kullanım ve performans ölçümü</small></span><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /></label>
                <label><span><strong>Reklam</strong><small>Kampanya ölçümü ve kişiselleştirme</small></span><input type="checkbox" checked={advertising} onChange={event => setAdvertising(event.target.checked)} /></label>
              </div>
            )}
          </div>
          <div className="cookie-consent-actions">
            <button className="button" onClick={() => save(true, true)}>Tümünü kabul et</button>
            <button className="cookie-secondary" onClick={() => save(false, false)}>Reddet</button>
            {preferences ? (
              <button className="cookie-secondary" onClick={() => save(analytics, advertising)}>Tercihleri kaydet</button>
            ) : (
              <button className="cookie-secondary" onClick={() => setPreferences(true)}><Settings2 /> Özelleştir</button>
            )}
          </div>
        </section>
      ) : (
        <button className="cookie-settings-button" onClick={() => setVisible(true)} aria-label="Çerez tercihlerini aç"><Cookie /></button>
      )}
    </>
  );
}
