"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Camera, Check, Clapperboard, Code2, Crosshair, Globe2, Layers3, Megaphone, Plane, Search, Sparkles, X, Zap } from "lucide-react";

type ModalTheme = {
  match: (path: string) => boolean;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  chips: [string, string, string];
  metric: string;
  metricLabel: string;
  cta: string;
  icon: typeof Plane;
  color: string;
  color2: string;
};

const themes: ModalTheme[] = [
  {
    match: path => path.includes("drone"), eyebrow: "AERIAL PRODUCTION / TÜRKİYE", title: "Markanı yeni bir", accent: "perspektiften göster.",
    description: "Sinematik drone ve FPV çekimiyle mekânını, projeni veya etkinliğini izleten bir hikâyeye dönüştürelim.",
    chips: ["4K sinematik çekim", "FPV dinamik planlar", "Türkiye geneli operasyon"], metric: "4K", metricLabel: "AERIAL CINEMA", cta: "Uçuş planını oluşturalım", icon: Plane, color: "#dfff35", color2: "#49ddff",
  },
  {
    match: path => ["video-produksiyon", "tanitim-filmi", "fotograf", "otel-tanitimi", "villa-tanitimi", "restoran-tanitimi", "magaza-tanitimi", "insaat-firma-tanitimi"].some(value => path.includes(value)),
    eyebrow: "FILM & CONTENT PRODUCTION", title: "İnsanların geçmediği,", accent: "izlediği içerikler.",
    description: "Fikirden çekime, kurgudan teslim formatlarına kadar markana özel sinematik bir prodüksiyon sistemi kuralım.",
    chips: ["Kreatif konsept", "Cinema production", "Reels + reklam formatları"], metric: "4K", metricLabel: "STORY IN MOTION", cta: "Prodüksiyonu planlayalım", icon: Clapperboard, color: "#ff7548", color2: "#ffcc48",
  },
  {
    match: path => ["web-tasarim", "landing-page", "e-ticaret", "mobil-uygulama"].some(value => path.includes(value)),
    eyebrow: "DESIGN & TECHNOLOGY", title: "Dijital vitrinin", accent: "müşteriye dönüşsün.",
    description: "Hızlı, mobil öncelikli ve markana özel web deneyimiyle ziyaretçiyi güvenle harekete geçirelim.",
    chips: ["Özel arayüz", "SEO altyapısı", "Mobil öncelikli"], metric: "10K", metricLabel: "TL'DEN BAŞLAYAN", cta: "Web projesini başlatalım", icon: Code2, color: "#dfff35", color2: "#49ddff",
  },
  {
    match: path => ["seo", "google-ads", "meta-reklamlari", "instagram-yonetimi", "yerel-seo"].some(value => path.includes(value)),
    eyebrow: "GROWTH & PERFORMANCE", title: "Görünür ol. Ölç. Daha", accent: "akıllı büyü.",
    description: "Arama, reklam ve içerik kanallarını tek büyüme planında birleştirip bütçeni ölçülebilir sonuca bağlayalım.",
    chips: ["Dönüşüm takibi", "Kampanya optimizasyonu", "Şeffaf raporlama"], metric: "+ROI", metricLabel: "GROWTH SYSTEM", cta: "Büyüme planını çıkaralım", icon: Crosshair, color: "#a9ff45", color2: "#8b7cff",
  },
  {
    match: path => path.startsWith("/uygulamalar"), eyebrow: "DROMOCOB APPLICATIONS", title: "İşini hızlandıran", accent: "dijital ürünler.",
    description: "Operasyon, müşteri deneyimi ve satış süreçlerini tek bir modern ürün ekosisteminde buluşturalım.",
    chips: ["Ölçeklenebilir altyapı", "Güvenli hesap sistemi", "Sürekli geliştirme"], metric: "24/7", metricLabel: "DIGITAL ENGINE", cta: "Uygulama fikrini konuşalım", icon: Layers3, color: "#49ddff", color2: "#8b7cff",
  },
  {
    match: path => path.startsWith("/paketler"), eyebrow: "SMART SERVICE SYSTEM", title: "Hazır kalıp değil,", accent: "doğru kombinasyon.",
    description: "İhtiyacına uygun hizmetleri bir araya getirip kapsamı, takvimi ve yatırım aralığını birlikte netleştirelim.",
    chips: ["Şeffaf kapsam", "Akıllı fiyatlama", "Net teslim planı"], metric: "360°", metricLabel: "PROJECT SYSTEM", cta: "Paketini birlikte kuralım", icon: Sparkles, color: "#dfff35", color2: "#ff7548",
  },
  {
    match: path => path.startsWith("/projeler"), eyebrow: "SELECTED WORK / CASE STUDIES", title: "Sıradaki güçlü iş", accent: "seninki olabilir.",
    description: "Tasarım, teknoloji ve prodüksiyonu markanın hedeflerine göre tek yaratıcı sistemde birleştirelim.",
    chips: ["Strateji", "Üretim", "Ölçülebilir sonuç"], metric: "01→∞", metricLabel: "NEXT PROJECT", cta: "Yeni projeyi başlatalım", icon: Zap, color: "#ff7548", color2: "#dfff35",
  },
  {
    match: path => ["kurumsal", "hakkimda", "hizmetler"].some(value => path.includes(value)), eyebrow: "DROMOCOB / CREATIVE SYSTEM", title: "Tek vizyon. Çok disiplin.", accent: "Güçlü sonuç.",
    description: "Web, film ve büyüme yetkinliklerini markana özel tek bir üretim standardında buluşturalım.",
    chips: ["Creative direction", "Technology", "Growth"], metric: "360°", metricLabel: "ONE VISION", cta: "Birlikte çalışalım", icon: Globe2, color: "#dfff35", color2: "#49ddff",
  },
];

const excludedPrefixes = ["/admin", "/giris", "/kayit", "/profilim", "/sitelerim", "/site-", "/hesap-dogrulama", "/destek", "/gizlilik", "/kvkk", "/iletisim", "/kalori-merkezi"];
const subscribeToClient = () => () => {};

export default function ContextualEntryModal() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const mounted = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const theme = useMemo(() => themes.find(item => item.match(pathname)), [pathname]);
  const isExcluded = pathname === "/" || excludedPrefixes.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    if (!theme || isExcluded) return;
    const key = `dromocob-context-entry:${pathname}`;
    if (window.sessionStorage.getItem(key)) return;
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(key, "shown");
      setOpenPath(pathname);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [isExcluded, pathname, theme]);

  useEffect(() => {
    if (openPath !== pathname) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpenPath(null);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [openPath, pathname]);

  if (!mounted || openPath !== pathname || !theme) return null;
  const Icon = theme.icon;

  return createPortal(
    <div className="context-entry" style={{ "--entry-accent": theme.color, "--entry-accent-2": theme.color2 } as React.CSSProperties} role="dialog" aria-modal="true" aria-labelledby="context-entry-title">
      <button className="context-entry-backdrop" type="button" onClick={() => setOpenPath(null)} aria-label="Tanıtım penceresini kapat" />
      <section className="context-entry-card">
        <div className="context-entry-grid" aria-hidden="true" />
        <div className="context-entry-aurora" aria-hidden="true" />
        <button ref={closeRef} className="context-entry-close" type="button" onClick={() => setOpenPath(null)} aria-label="Kapat"><X /></button>

        <div className="context-entry-copy">
          <p className="context-entry-eyebrow"><i/><Icon /> {theme.eyebrow}</p>
          <h2 id="context-entry-title">{theme.title}<br/><em>{theme.accent}</em></h2>
          <p>{theme.description}</p>
          <div className="context-entry-chips">{theme.chips.map((chip, index) => <span key={chip}><Check /> <b>0{index + 1}</b>{chip}</span>)}</div>
          <div className="context-entry-actions">
            <Link href="/iletisim" onClick={() => setOpenPath(null)}>{theme.cta}<ArrowRight /></Link>
            <button type="button" onClick={() => setOpenPath(null)}>Sayfayı keşfet</button>
          </div>
          <small><i/> Şu an yeni proje talepleri açık</small>
        </div>

        <div className="context-entry-visual" aria-hidden="true">
          <div className="entry-scope entry-scope-one"/><div className="entry-scope entry-scope-two"/><div className="entry-scope entry-scope-three"/>
          <div className="entry-beam" />
          <div className="entry-core"><Icon/><strong>{theme.metric}</strong><span>{theme.metricLabel}</span><i/></div>
          <span className="entry-data entry-data-one"><Search/> DISCOVER <b>01</b></span>
          <span className="entry-data entry-data-two"><Camera/> CREATE <b>02</b></span>
          <span className="entry-data entry-data-three"><Megaphone/> GROW <b>03</b></span>
        </div>
      </section>
    </div>,
    document.body,
  );
}
