"use client";

import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Aperture, ArrowRight, Camera, Check, Clapperboard, Code2, Crosshair, Globe2, Layers3, MapPin, Megaphone, Plane, Search, Sparkles, X, Zap } from "lucide-react";
import AdvancedQuoteWizard from "@/components/advanced-quote-wizard";
import type { AdvancedQuoteService } from "@/lib/advanced-quote-config";
import { DEFAULT_ENTRY_ADS_CONFIG, normalizeEntryAdsConfig, routeMatches, type EntryAdsConfig } from "@/lib/entry-ads";

type ModalTheme = {
  id: string;
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
  quoteService: AdvancedQuoteService;
  nodes: [string, string, string];
};

const themes: ModalTheme[] = [
  {
    id: "drone",
    match: path => path.includes("drone"), eyebrow: "AERIAL PRODUCTION / TÜRKİYE", title: "Markanı yeni bir", accent: "perspektiften göster.",
    description: "Sinematik drone ve FPV çekimiyle mekânını, projeni veya etkinliğini izleten bir hikâyeye dönüştürelim.",
    chips: ["4K sinematik çekim", "FPV dinamik planlar", "Türkiye geneli operasyon"], metric: "120M", metricLabel: "FLIGHT ALTITUDE", cta: "Uçuş kapsamını hesapla", icon: Plane, color: "#dfff35", color2: "#49ddff", quoteService: "drone-quick", nodes: ["ROTA", "UÇUŞ", "TESLİM"],
  },
  {
    id: "equipment", match: path => path.startsWith("/kamera-ekipmanlari"), eyebrow: "CINEMA GEAR / TECH LAB", title: "Doğru ekipman.", accent: "Temiz görüntü.",
    description: "Çekim hedefin için kamera, lens, ışık, ses ve hareket sistemini doğru kombinasyonla planlayalım.",
    chips: ["Cinema kamera", "Profesyonel ışık", "Operatör desteği"], metric: "8K", metricLabel: "CAPTURE SYSTEM", cta: "Ekipman planını oluştur", icon: Aperture, color: "#ffb347", color2: "#ff5e7d", quoteService: "equipment-quick", nodes: ["KADRAJ", "IŞIK", "KAYIT"],
  },
  {
    id: "fethiye", match: path => path.startsWith("/fethiye"), eyebrow: "FETHİYE / LOCAL GROWTH", title: "Yerel gücünü", accent: "dijitale taşı.",
    description: "Fethiye'deki işletmeni web, içerik, drone ve Google görünürlüğüyle sezona hazır güçlü bir markaya dönüştürelim.",
    chips: ["Yerel SEO", "Turizm odaklı içerik", "Fethiye prodüksiyon"], metric: "48H", metricLabel: "LOCAL RESPONSE", cta: "Yerel planını oluştur", icon: MapPin, color: "#45f0d0", color2: "#49a7ff", quoteService: "fethiye-quick", nodes: ["KEŞFET", "ÜRET", "BÜYÜT"],
  },
  {
    id: "production",
    match: path => ["video-produksiyon", "tanitim-filmi", "fotograf", "otel-tanitimi", "villa-tanitimi", "restoran-tanitimi", "magaza-tanitimi", "insaat-firma-tanitimi"].some(value => path.includes(value)),
    eyebrow: "FILM & CONTENT PRODUCTION", title: "İnsanların geçmediği,", accent: "izlediği içerikler.",
    description: "Fikirden çekime, kurgudan teslim formatlarına kadar markana özel sinematik bir prodüksiyon sistemi kuralım.",
    chips: ["Kreatif konsept", "Cinema production", "Reels + reklam formatları"], metric: "24FPS", metricLabel: "STORY IN MOTION", cta: "Prodüksiyon kapsamını çıkar", icon: Clapperboard, color: "#ff7548", color2: "#ffcc48", quoteService: "video-quick", nodes: ["FİKİR", "ÇEKİM", "KURGU"],
  },
  {
    id: "web",
    match: path => ["web-tasarim", "landing-page", "e-ticaret", "mobil-uygulama"].some(value => path.includes(value)),
    eyebrow: "DESIGN & TECHNOLOGY", title: "Dijital vitrinin", accent: "müşteriye dönüşsün.",
    description: "Hızlı, mobil öncelikli ve markana özel web deneyimiyle ziyaretçiyi güvenle harekete geçirelim.",
    chips: ["Özel arayüz", "SEO altyapısı", "Mobil öncelikli"], metric: "10K", metricLabel: "TL'DEN BAŞLAYAN", cta: "Web yatırımını hesapla", icon: Code2, color: "#dfff35", color2: "#49ddff", quoteService: "web-quick", nodes: ["PLAN", "KOD", "YAYIN"],
  },
  {
    id: "growth",
    match: path => ["seo", "google-ads", "meta-reklamlari", "instagram-yonetimi", "yerel-seo"].some(value => path.includes(value)),
    eyebrow: "GROWTH & PERFORMANCE", title: "Görünür ol. Ölç. Daha", accent: "akıllı büyü.",
    description: "Arama, reklam ve içerik kanallarını tek büyüme planında birleştirip bütçeni ölçülebilir sonuca bağlayalım.",
    chips: ["Dönüşüm takibi", "Kampanya optimizasyonu", "Şeffaf raporlama"], metric: "+ROI", metricLabel: "GROWTH SYSTEM", cta: "Büyüme kapsamını çıkar", icon: Crosshair, color: "#a9ff45", color2: "#8b7cff", quoteService: "growth-quick", nodes: ["TRAFİK", "DÖNÜŞÜM", "ÖLÇÜM"],
  },
  {
    id: "apps",
    match: path => path.startsWith("/uygulamalar"), eyebrow: "DROMOCOB APPLICATIONS", title: "İşini hızlandıran", accent: "dijital ürünler.",
    description: "Operasyon, müşteri deneyimi ve satış süreçlerini tek bir modern ürün ekosisteminde buluşturalım.",
    chips: ["Ölçeklenebilir altyapı", "Güvenli hesap sistemi", "Sürekli geliştirme"], metric: "24/7", metricLabel: "DIGITAL ENGINE", cta: "Uygulama kapsamını oluştur", icon: Layers3, color: "#49ddff", color2: "#8b7cff", quoteService: "apps-quick", nodes: ["KEŞİF", "ÜRÜN", "SCALE"],
  },
  {
    id: "packages",
    match: path => path.startsWith("/paketler"), eyebrow: "SMART SERVICE SYSTEM", title: "Hazır kalıp değil,", accent: "doğru kombinasyon.",
    description: "İhtiyacına uygun hizmetleri bir araya getirip kapsamı, takvimi ve yatırım aralığını birlikte netleştirelim.",
    chips: ["Şeffaf kapsam", "Akıllı fiyatlama", "Net teslim planı"], metric: "360°", metricLabel: "PROJECT SYSTEM", cta: "Paket kapsamını hesapla", icon: Sparkles, color: "#dfff35", color2: "#ff7548", quoteService: "project-quick", nodes: ["SEÇ", "BİRLEŞTİR", "BAŞLAT"],
  },
  {
    id: "projects",
    match: path => path.startsWith("/projeler"), eyebrow: "SELECTED WORK / CASE STUDIES", title: "Sıradaki güçlü iş", accent: "seninki olabilir.",
    description: "Tasarım, teknoloji ve prodüksiyonu markanın hedeflerine göre tek yaratıcı sistemde birleştirelim.",
    chips: ["Strateji", "Üretim", "Ölçülebilir sonuç"], metric: "01→∞", metricLabel: "NEXT PROJECT", cta: "Proje kapsamını başlat", icon: Zap, color: "#ff7548", color2: "#dfff35", quoteService: "project-quick", nodes: ["BRIEF", "BUILD", "RESULT"],
  },
  {
    id: "corporate",
    match: path => ["kurumsal", "hakkimda", "hizmetler"].some(value => path.includes(value)), eyebrow: "DROMOCOB / CREATIVE SYSTEM", title: "Tek vizyon. Çok disiplin.", accent: "Güçlü sonuç.",
    description: "Web, film ve büyüme yetkinliklerini markana özel tek bir üretim standardında buluşturalım.",
    chips: ["Creative direction", "Technology", "Growth"], metric: "360°", metricLabel: "ONE VISION", cta: "Akıllı kapsamı başlat", icon: Globe2, color: "#dfff35", color2: "#49ddff", quoteService: "project-quick", nodes: ["STRATEJİ", "ÜRETİM", "BÜYÜME"],
  },
];

const subscribeToClient = () => () => {};

export default function ContextualEntryModal() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [quoteService, setQuoteService] = useState<AdvancedQuoteService | null>(null);
  const [config, setConfig] = useState<EntryAdsConfig>(DEFAULT_ENTRY_ADS_CONFIG);
  const [mobile, setMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const mounted = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const campaign = useMemo(() => config.campaigns.filter(item => item.active).sort((a, b) => b.priority - a.priority).find(item => {
    if (currentTime && item.startAt && new Date(item.startAt).getTime() > currentTime) return false;
    if (currentTime && item.endAt && new Date(item.endAt).getTime() < currentTime) return false;
    if (item.device === "mobile" && !mobile) return false;
    if (item.device === "desktop" && mobile) return false;
    return routeMatches(pathname, item.routePatterns);
  }), [config.campaigns, currentTime, mobile, pathname]);
  const visualTheme = useMemo(() => themes.find(item => item.id === campaign?.id) || themes.find(item => item.match(pathname)) || themes[0], [campaign?.id, pathname]);
  const theme = useMemo(() => campaign ? { ...campaign, icon: visualTheme.icon } : undefined, [campaign, visualTheme.icon]);
  const isExcluded = !config.active || config.excludedPaths.some(pattern => routeMatches(pathname, [pattern]));

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/entry-ads", { cache: "no-store" }).then(response => response.json()).then(payload => { if (!cancelled) setConfig(normalizeEntryAdsConfig(payload.config)); }).catch(() => undefined);
    const updateDevice = () => { setMobile(window.matchMedia("(max-width: 700px)").matches); setCurrentTime(Date.now()); };
    const frame = window.requestAnimationFrame(updateDevice);
    window.addEventListener("resize", updateDevice);
    return () => { cancelled = true; window.cancelAnimationFrame(frame); window.removeEventListener("resize", updateDevice); };
  }, []);

  const track = useCallback((event: "impression" | "cta" | "dismiss") => {
    if (!campaign) return;
    void fetch("/api/public/entry-ads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ campaignId: campaign.id, event }) });
  }, [campaign]);

  const dismiss = useCallback(() => { track("dismiss"); setOpenPath(null); }, [track]);

  useEffect(() => {
    if (!theme || !campaign || isExcluded) return;
    const key = `dromocob-entry-ad:${campaign.id}`;
    const sessionCount = Number(window.sessionStorage.getItem("dromocob-entry-ad:count") || 0);
    if (sessionCount >= config.maxShowsPerSession) return;
    if (config.frequency === "once_session" && window.sessionStorage.getItem(key)) return;
    if (config.frequency === "once_day" && window.localStorage.getItem(key) === new Date().toISOString().slice(0, 10)) return;
    const timer = window.setTimeout(() => {
      if (document.querySelector(".advanced-quote-backdrop, .modal-backdrop")) return;
      window.sessionStorage.setItem("dromocob-entry-ad:count", String(sessionCount + 1));
      if (config.frequency === "once_session") window.sessionStorage.setItem(key, "shown");
      if (config.frequency === "once_day") window.localStorage.setItem(key, new Date().toISOString().slice(0, 10));
      setOpenPath(pathname);
      track("impression");
    }, config.delayMs);
    return () => window.clearTimeout(timer);
  }, [campaign, config.delayMs, config.frequency, config.maxShowsPerSession, isExcluded, pathname, theme, track]);

  useEffect(() => {
    const closeForQuote = () => setOpenPath(null);
    window.addEventListener("dromocob:quote-open", closeForQuote);
    return () => window.removeEventListener("dromocob:quote-open", closeForQuote);
  }, []);

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

  if (!mounted || (!quoteService && openPath !== pathname) || !theme) return null;
  const Icon = theme.icon;

  return <>{openPath === pathname && createPortal(
    <div className={`context-entry context-entry-${theme.id}`} data-theme={theme.id} style={{ "--entry-accent": theme.color, "--entry-accent-2": theme.color2 } as React.CSSProperties} role="dialog" aria-modal="true" aria-labelledby="context-entry-title">
      <button className="context-entry-backdrop" type="button" onClick={dismiss} aria-label="Tanıtım penceresini kapat" />
      <section className="context-entry-card">
        <div className="context-entry-grid" aria-hidden="true" />
        <div className="context-entry-aurora" aria-hidden="true" />
        <button ref={closeRef} className="context-entry-close" type="button" onClick={dismiss} aria-label="Kapat"><X /></button>

        <div className="context-entry-copy">
          <p className="context-entry-eyebrow"><i/><Icon /> {theme.eyebrow}</p>
          <h2 id="context-entry-title">{theme.title}<br/><em>{theme.accent}</em></h2>
          <p>{theme.description}</p>
          <div className="context-entry-chips">{theme.chips.map((chip, index) => <span key={chip}><Check /> <b>0{index + 1}</b>{chip}</span>)}</div>
          <div className="context-entry-actions">
            <button type="button" onClick={() => { track("cta"); setOpenPath(null); setQuoteService(theme.quoteService); }}>{theme.cta}<ArrowRight /></button>
            <button type="button" onClick={dismiss}>Sayfayı keşfet</button>
          </div>
          <small><i/> Şu an yeni proje talepleri açık</small>
        </div>

        <div className="context-entry-visual" aria-hidden="true">
          <div className="entry-scope entry-scope-one"/><div className="entry-scope entry-scope-two"/><div className="entry-scope entry-scope-three"/>
          <div className="entry-beam" />
          <div className="entry-core"><Icon/><strong>{theme.metric}</strong><span>{theme.metricLabel}</span><i/></div>
          <span className="entry-data entry-data-one"><Search/> {theme.nodes[0]} <b>01</b></span>
          <span className="entry-data entry-data-two"><Camera/> {theme.nodes[1]} <b>02</b></span>
          <span className="entry-data entry-data-three"><Megaphone/> {theme.nodes[2]} <b>03</b></span>
        </div>
      </section>
    </div>,
    document.body,
  )}{quoteService && <AdvancedQuoteWizard service={quoteService} initiallyOpen hideTrigger onClose={() => setQuoteService(null)}/>}</>;
}
