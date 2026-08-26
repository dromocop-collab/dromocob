/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, BellRing, Box, CircleCheck, Clock3, Cloud, RefreshCw, Rocket, Rss, Sparkles } from "lucide-react";
import type { StorePulse } from "@/lib/app-store-monitor";

const REFRESH_MS = 5 * 60 * 1000;

function relativeTime(value: string) {
  const seconds = Math.round((Date.parse(value) - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

export default function AppStoreLive() {
  const [pulse, setPulse] = useState<StorePulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async (force = false) => {
    try {
      const response = await fetch(`/api/public/app-store${force ? "?force=1" : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error("STORE_PULSE_FAILED");
      const next = await response.json() as StorePulse;
      setPulse(next);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refresh());
    const timer = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, [refresh]);

  return (
    <section className="store-pulse section" aria-label="App Store canlı takip">
      <div className="store-pulse-head">
        <div>
          <p className="store-pulse-kicker"><span><i/> LIVE</span> APP STORE INTELLIGENCE</p>
          <h2>Mağaza nabzı.<br/><em>Her sürüm radarda.</em></h2>
          <p>Apple mağazası otomatik taranır; yeni uygulamalar, sürüm değişiklikleri ve yayın notları burada canlı bir ürün akışına dönüşür.</p>
        </div>
        <div className="store-pulse-console">
          <span><Cloud/> APPLE LOOKUP NODE</span>
          <strong>{loading ? "BAĞLANIYOR" : error ? "BAĞLANTI BEKLİYOR" : "SENKRONİZE"}</strong>
          <small>{pulse ? `Son kontrol ${relativeTime(pulse.checkedAt)}` : "15 dakikalık mağaza taraması"}</small>
          <button type="button" onClick={() => { setLoading(true); void refresh(true); }} disabled={loading}><RefreshCw className={loading ? "is-spinning" : ""}/> Şimdi kontrol et</button>
        </div>
      </div>

      {error && !pulse ? (
        <div className="store-pulse-error"><Rss/><div><strong>Apple sinyali geçici olarak alınamadı.</strong><span>Takip motoru bir sonraki periyotta otomatik yeniden deneyecek.</span></div></div>
      ) : (
        <div className="store-pulse-grid">
          <div className="store-pulse-apps">
            <header><span>CANLI ENVANTER</span><b>{pulse?.apps.length || 0} ÜRÜN</b></header>
            {loading && !pulse ? Array.from({ length: 3 }).map((_, index) => <div className="store-pulse-skeleton" key={index}/>) : pulse?.apps.map(app => (
              <a className="store-pulse-app" key={app.trackId} href={app.url} target="_blank" rel="noreferrer">
                <img src={app.icon} alt={`${app.name} App Store ikonu`}/>
                <div><small>{app.genre} · iOS {app.minimumOsVersion}+</small><strong>{app.name}</strong><span><CircleCheck/> App Store’da yayında</span></div>
                <div className="store-pulse-version"><small>VERSION</small><b>{app.version}</b><time>{relativeTime(app.versionReleaseDate)}</time></div>
                <ArrowUpRight/>
              </a>
            ))}
          </div>

          <div className="store-pulse-feed">
            <header><span><Rss/> RELEASE FEED</span><b>AUTO</b></header>
            <div className="store-pulse-timeline">
              {pulse?.events.slice(0, 5).map((event, index) => (
                <article key={event.id}>
                  <i>{event.type === "new_app" ? <Rocket/> : <Sparkles/>}</i>
                  <div>
                    <small>{event.type === "new_app" ? "YENİ ÜRÜN" : "SÜRÜM GÜNCELLEMESİ"} · {relativeTime(event.eventAt)}</small>
                    <h3>{event.title}</h3>
                    <p>{event.detail}</p>
                    <a href={event.url} target="_blank" rel="noreferrer">App Store’da incele <ArrowUpRight/></a>
                  </div>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="store-pulse-footer">
        <span><BellRing/> Yeni ürün algılama</span><span><Box/> Versiyon karşılaştırma</span><span><RefreshCw/> 15 dk otomatik tarama</span><span className="store-pulse-pending"><Clock3/> SeninRandevun · Apple Review</span>
        {pulse?.artistUrl && <a href={pulse.artistUrl} target="_blank" rel="noreferrer">{pulse.artistName} mağazasını aç <ArrowUpRight/></a>}
      </footer>
    </section>
  );
}
