"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Eye, Gauge, Loader2, MonitorSmartphone, MousePointerClick, Radio, RefreshCw, Users } from "lucide-react";
import { auth } from "@/lib/firebase";

type Item = Record<string, unknown>;
type AnalyticsData = {
  generatedAt: string;
  summary: { activeNow: number; visitors24h: number; pageViews24h: number; avgDuration: number; avgScroll: number; interactions24h: number };
  live: Item[];
  topPages: { label: string; value: number }[];
  devices: { label: string; value: number }[];
  sources: { label: string; value: number }[];
  activity: Item[];
};

function relativeTime(value: unknown) {
  const seconds = Math.max(0, Math.round((Date.now() - Date.parse(String(value))) / 1000));
  if (seconds < 10) return "şimdi";
  if (seconds < 60) return `${seconds} sn önce`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
  return `${Math.floor(seconds / 3600)} sa önce`;
}

function duration(seconds: number) {
  if (seconds < 60) return `${seconds} sn`;
  return `${Math.floor(seconds / 60)} dk ${seconds % 60} sn`;
}

function sourceLabel(value: string) {
  if (!value || value === "Bilinmiyor") return "Doğrudan";
  try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return value; }
}

const eventLabels: Record<string, string> = {
  page_view: "Sayfa görüntüledi",
  click: "Etkileşim kurdu",
  scroll: "Sayfayı kaydırdı",
  page_exit: "Sayfadan ayrıldı",
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const load = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Admin oturumu bulunamadı.");
      const response = await fetch("/api/admin/analytics", {
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(await response.text() || "Analitik verisi alınamadı.");
      setData(await response.json());
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Analitik verisi alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    if (paused) return;
    const timer = window.setInterval(() => void load(), 5_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [load, paused]);

  const maxPage = useMemo(() => Math.max(1, ...(data?.topPages.map(item => item.value) || [1])), [data]);
  const maxDevice = useMemo(() => Math.max(1, ...(data?.devices.map(item => item.value) || [1])), [data]);

  if (loading && !data) return <div className="analytics-loading"><Loader2 className="spin" /><span>Canlı veri akışı hazırlanıyor</span></div>;

  return (
    <>
      <div className="admin-title analytics-title">
        <div><p className="admin-kicker">BEHAVIOR INTELLIGENCE / REAL-TIME</p><h1>Canlı analitik.</h1><p>Ziyaretçilerin şu anda nerede olduğunu ve siteyle nasıl etkileştiğini izle.</p></div>
        <div className="analytics-actions">
          <span className="analytics-live"><i />{paused ? "AKIŞ DURAKLATILDI" : "CANLI / 5 SN"}</span>
          <button className="admin-action" onClick={() => setPaused(value => !value)}><Radio size={16} />{paused ? "Devam et" : "Duraklat"}</button>
          <button className="analytics-refresh" onClick={() => void load()} aria-label="Yenile"><RefreshCw size={16} /></button>
        </div>
      </div>

      {error && <div className="metrics-error"><div><strong>Veri akışı kesildi</strong><span>{error}</span></div><button onClick={() => void load()}>Yeniden dene</button></div>}

      <section className="analytics-hero">
        <div className="analytics-pulse"><span><i /><b>{data?.summary.activeNow || 0}</b><small>ŞU ANDA SİTEDE</small></span></div>
        <div className="analytics-live-list">
          <header><div><Activity size={16} /><strong>Aktif ziyaretçiler</strong></div><small>son 45 saniye</small></header>
          <div>
            {data?.live.length ? data.live.map(item => <article key={String(item.id)}>
              <span className="visitor-dot" /><div><strong>{String(item.currentPage || "/")}</strong><small>{String(item.city || item.country || "Konum yok")} · {String(item.device || "desktop")}</small></div><time>{relativeTime(item.lastSeenAt)}</time>
            </article>) : <div className="analytics-empty">Şu anda aktif ziyaretçi yok. Yeni girişler burada anında görünecek.</div>}
          </div>
        </div>
      </section>

      <section className="analytics-metrics">
        {[
          [Users, "Tekil ziyaretçi", data?.summary.visitors24h || 0, "Son 24 saat"],
          [Eye, "Sayfa görüntüleme", data?.summary.pageViews24h || 0, "Son 24 saat"],
          [MousePointerClick, "Etkileşim", data?.summary.interactions24h || 0, "Tıklamalar"],
          [Clock3, "Ort. aktif süre", duration(data?.summary.avgDuration || 0), "Oturum başına"],
          [Gauge, "Ort. kaydırma", `%${data?.summary.avgScroll || 0}`, "Sayfa derinliği"],
        ].map(([Icon, label, value, note]) => {
          const C = Icon as typeof Users;
          return <article key={String(label)}><C size={18} /><span>{String(label)}</span><strong>{typeof value === "number" ? value.toLocaleString("tr-TR") : String(value)}</strong><small>{String(note)}</small></article>;
        })}
      </section>

      <section className="analytics-grid">
        <div className="admin-panel analytics-ranking">
          <header><div><Eye size={17} /><span><strong>En çok gezilen sayfalar</strong><small>Son 24 saat</small></span></div></header>
          <div>{data?.topPages.length ? data.topPages.map(item => <article key={item.label}><div><strong>{item.label}</strong><b>{item.value}</b></div><span><i style={{ width: `${(item.value / maxPage) * 100}%` }} /></span></article>) : <div className="analytics-empty">Henüz sayfa görüntüleme verisi yok.</div>}</div>
        </div>

        <div className="admin-panel analytics-ranking">
          <header><div><MonitorSmartphone size={17} /><span><strong>Cihaz dağılımı</strong><small>Ziyaretçi teknolojisi</small></span></div></header>
          <div>{data?.devices.length ? data.devices.map(item => <article key={item.label}><div><strong>{item.label}</strong><b>{item.value}</b></div><span><i style={{ width: `${(item.value / maxDevice) * 100}%` }} /></span></article>) : <div className="analytics-empty">Henüz cihaz verisi yok.</div>}</div>
        </div>

        <div className="admin-panel analytics-sources">
          <header><strong>Trafik kaynakları</strong><small>Ziyaretçiler nereden geliyor?</small></header>
          <div>{data?.sources.map((item, index) => <article key={item.label}><b>{String(index + 1).padStart(2, "0")}</b><span>{sourceLabel(item.label)}</span><strong>{item.value}</strong></article>)}</div>
        </div>

        <div className="admin-panel analytics-feed">
          <header><div><Activity size={17} /><span><strong>Davranış akışı</strong><small>En yeni hareketler</small></span></div></header>
          <div>{data?.activity.length ? data.activity.map(item => <article key={String(item.id)}>
            <i className={`event-${String(item.name)}`} /><div><strong>{eventLabels[String(item.name)] || String(item.name)}</strong><span>{String(item.page || "/")}{item.label ? ` · ${String(item.label)}` : ""}</span></div><time>{relativeTime(item.createdAt)}</time>
          </article>) : <div className="analytics-empty">Aktivite oluştuğunda akış burada başlayacak.</div>}</div>
        </div>
      </section>

      <p className="analytics-footnote">Son güncelleme: {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString("tr-TR") : "—"} · Analitik yalnızca izin veren ziyaretçilerden, anonim olarak toplanır.</p>
    </>
  );
}
