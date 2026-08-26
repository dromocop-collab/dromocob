import type { AdvancedQuoteService } from "@/lib/advanced-quote-config";

export type EntryAdFrequency = "once_session" | "once_day" | "always";
export type EntryAdDevice = "all" | "desktop" | "mobile";

export type EntryAdCampaign = {
  id: string;
  name: string;
  active: boolean;
  priority: number;
  routePatterns: string[];
  device: EntryAdDevice;
  startAt: string;
  endAt: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  chips: [string, string, string];
  metric: string;
  metricLabel: string;
  cta: string;
  color: string;
  color2: string;
  quoteService: AdvancedQuoteService;
  nodes: [string, string, string];
};

export type EntryAdsConfig = {
  active: boolean;
  delayMs: number;
  frequency: EntryAdFrequency;
  maxShowsPerSession: number;
  excludedPaths: string[];
  campaigns: EntryAdCampaign[];
};

const campaign = (value: EntryAdCampaign) => value;
export const DEFAULT_ENTRY_ADS_CONFIG: EntryAdsConfig = {
  active: true,
  delayMs: 900,
  frequency: "once_session",
  maxShowsPerSession: 2,
  excludedPaths: ["/", "/admin*", "/giris*", "/kayit*", "/profilim*", "/sitelerim*", "/site-*", "/hesap-dogrulama*", "/destek*", "/gizlilik*", "/kvkk*", "/iletisim*", "/kalori-merkezi*"],
  campaigns: [
    campaign({ id:"drone",name:"Drone prodüksiyon",active:true,priority:10,routePatterns:["*drone*"],device:"all",startAt:"",endAt:"",eyebrow:"AERIAL PRODUCTION / TÜRKİYE",title:"Markanı yeni bir",accent:"perspektiften göster.",description:"Sinematik drone ve FPV çekimiyle mekânını, projeni veya etkinliğini izleten bir hikâyeye dönüştürelim.",chips:["4K sinematik çekim","FPV dinamik planlar","Türkiye geneli operasyon"],metric:"120M",metricLabel:"FLIGHT ALTITUDE",cta:"Uçuş kapsamını hesapla",color:"#dfff35",color2:"#49ddff",quoteService:"drone-quick",nodes:["ROTA","UÇUŞ","TESLİM"] }),
    campaign({ id:"equipment",name:"Kamera ekipmanları",active:true,priority:9,routePatterns:["/kamera-ekipmanlari*"],device:"all",startAt:"",endAt:"",eyebrow:"CINEMA GEAR / TECH LAB",title:"Doğru ekipman.",accent:"Temiz görüntü.",description:"Çekim hedefin için kamera, lens, ışık, ses ve hareket sistemini doğru kombinasyonla planlayalım.",chips:["Cinema kamera","Profesyonel ışık","Operatör desteği"],metric:"8K",metricLabel:"CAPTURE SYSTEM",cta:"Ekipman planını oluştur",color:"#ffb347",color2:"#ff5e7d",quoteService:"equipment-quick",nodes:["KADRAJ","IŞIK","KAYIT"] }),
    campaign({ id:"fethiye",name:"Fethiye yerel büyüme",active:true,priority:8,routePatterns:["/fethiye*"],device:"all",startAt:"",endAt:"",eyebrow:"FETHİYE / LOCAL GROWTH",title:"Yerel gücünü",accent:"dijitale taşı.",description:"Fethiye'deki işletmeni web, içerik, drone ve Google görünürlüğüyle sezona hazır güçlü bir markaya dönüştürelim.",chips:["Yerel SEO","Turizm odaklı içerik","Fethiye prodüksiyon"],metric:"48H",metricLabel:"LOCAL RESPONSE",cta:"Yerel planını oluştur",color:"#45f0d0",color2:"#49a7ff",quoteService:"fethiye-quick",nodes:["KEŞFET","ÜRET","BÜYÜT"] }),
    campaign({ id:"production",name:"Film ve prodüksiyon",active:true,priority:7,routePatterns:["*video-produksiyon*","*tanitim-filmi*","*fotograf*","*otel-tanitimi*","*villa-tanitimi*","*restoran-tanitimi*","*magaza-tanitimi*","*insaat-firma-tanitimi*"],device:"all",startAt:"",endAt:"",eyebrow:"FILM & CONTENT PRODUCTION",title:"İnsanların geçmediği,",accent:"izlediği içerikler.",description:"Fikirden çekime, kurgudan teslim formatlarına kadar markana özel sinematik bir prodüksiyon sistemi kuralım.",chips:["Kreatif konsept","Cinema production","Reels + reklam formatları"],metric:"24FPS",metricLabel:"STORY IN MOTION",cta:"Prodüksiyon kapsamını çıkar",color:"#ff7548",color2:"#ffcc48",quoteService:"video-quick",nodes:["FİKİR","ÇEKİM","KURGU"] }),
    campaign({ id:"web",name:"Web ve dijital ürün",active:true,priority:6,routePatterns:["*web-tasarim*","*landing-page*","*e-ticaret*","*mobil-uygulama*"],device:"all",startAt:"",endAt:"",eyebrow:"DESIGN & TECHNOLOGY",title:"Dijital vitrinin",accent:"müşteriye dönüşsün.",description:"Hızlı, mobil öncelikli ve markana özel web deneyimiyle ziyaretçiyi güvenle harekete geçirelim.",chips:["Özel arayüz","SEO altyapısı","Mobil öncelikli"],metric:"10K",metricLabel:"TL'DEN BAŞLAYAN",cta:"Web yatırımını hesapla",color:"#dfff35",color2:"#49ddff",quoteService:"web-quick",nodes:["PLAN","KOD","YAYIN"] }),
    campaign({ id:"growth",name:"Growth ve performans",active:true,priority:5,routePatterns:["*seo*","*google-ads*","*meta-reklamlari*","*instagram-yonetimi*"],device:"all",startAt:"",endAt:"",eyebrow:"GROWTH & PERFORMANCE",title:"Görünür ol. Ölç. Daha",accent:"akıllı büyü.",description:"Arama, reklam ve içerik kanallarını tek büyüme planında birleştirip bütçeni ölçülebilir sonuca bağlayalım.",chips:["Dönüşüm takibi","Kampanya optimizasyonu","Şeffaf raporlama"],metric:"+ROI",metricLabel:"GROWTH SYSTEM",cta:"Büyüme kapsamını çıkar",color:"#a9ff45",color2:"#8b7cff",quoteService:"growth-quick",nodes:["TRAFİK","DÖNÜŞÜM","ÖLÇÜM"] }),
    campaign({ id:"apps",name:"Dromocob uygulamaları",active:true,priority:4,routePatterns:["/uygulamalar*"],device:"all",startAt:"",endAt:"",eyebrow:"DROMOCOB APPLICATIONS",title:"İşini hızlandıran",accent:"dijital ürünler.",description:"Operasyon, müşteri deneyimi ve satış süreçlerini tek bir modern ürün ekosisteminde buluşturalım.",chips:["Ölçeklenebilir altyapı","Güvenli hesap sistemi","Sürekli geliştirme"],metric:"24/7",metricLabel:"DIGITAL ENGINE",cta:"Uygulama kapsamını oluştur",color:"#49ddff",color2:"#8b7cff",quoteService:"apps-quick",nodes:["KEŞİF","ÜRÜN","SCALE"] }),
    campaign({ id:"packages",name:"Akıllı paketler",active:true,priority:3,routePatterns:["/paketler*"],device:"all",startAt:"",endAt:"",eyebrow:"SMART SERVICE SYSTEM",title:"Hazır kalıp değil,",accent:"doğru kombinasyon.",description:"İhtiyacına uygun hizmetleri bir araya getirip kapsamı, takvimi ve yatırım aralığını birlikte netleştirelim.",chips:["Şeffaf kapsam","Akıllı fiyatlama","Net teslim planı"],metric:"360°",metricLabel:"PROJECT SYSTEM",cta:"Paket kapsamını hesapla",color:"#dfff35",color2:"#ff7548",quoteService:"project-quick",nodes:["SEÇ","BİRLEŞTİR","BAŞLAT"] }),
    campaign({ id:"projects",name:"Proje vaka çalışmaları",active:true,priority:2,routePatterns:["/projeler*"],device:"all",startAt:"",endAt:"",eyebrow:"SELECTED WORK / CASE STUDIES",title:"Sıradaki güçlü iş",accent:"seninki olabilir.",description:"Tasarım, teknoloji ve prodüksiyonu markanın hedeflerine göre tek yaratıcı sistemde birleştirelim.",chips:["Strateji","Üretim","Ölçülebilir sonuç"],metric:"01→∞",metricLabel:"NEXT PROJECT",cta:"Proje kapsamını başlat",color:"#ff7548",color2:"#dfff35",quoteService:"project-quick",nodes:["BRIEF","BUILD","RESULT"] }),
    campaign({ id:"corporate",name:"Kurumsal marka",active:true,priority:1,routePatterns:["*kurumsal*","*hakkimda*","/hizmetler*"],device:"all",startAt:"",endAt:"",eyebrow:"DROMOCOB / CREATIVE SYSTEM",title:"Tek vizyon. Çok disiplin.",accent:"Güçlü sonuç.",description:"Web, film ve büyüme yetkinliklerini markana özel tek bir üretim standardında buluşturalım.",chips:["Creative direction","Technology","Growth"],metric:"360°",metricLabel:"ONE VISION",cta:"Akıllı kapsamı başlat",color:"#dfff35",color2:"#49ddff",quoteService:"project-quick",nodes:["STRATEJİ","ÜRETİM","BÜYÜME"] }),
  ],
};

const quoteServices = new Set(DEFAULT_ENTRY_ADS_CONFIG.campaigns.map(item => item.quoteService));
const clean = (value: unknown, fallback: string, max: number) => String(value || fallback).trim().slice(0, max);
const list = (value: unknown, fallback: string[], max = 20) => Array.isArray(value) ? value.map(item => String(item).trim().slice(0, 120)).filter(Boolean).slice(0, max) : fallback;
export function normalizeEntryAdsConfig(value: unknown): EntryAdsConfig {
  const raw = value && typeof value === "object" ? value as Partial<EntryAdsConfig> : {};
  const baseMap = new Map(DEFAULT_ENTRY_ADS_CONFIG.campaigns.map(item => [item.id, item]));
  const campaigns = Array.isArray(raw.campaigns) ? raw.campaigns.map((value, index) => {
    const item = value as Partial<EntryAdCampaign>;
    const fallback = baseMap.get(String(item.id)) || DEFAULT_ENTRY_ADS_CONFIG.campaigns[index % DEFAULT_ENTRY_ADS_CONFIG.campaigns.length];
    const chips = list(item.chips, fallback.chips, 3); const nodes = list(item.nodes, fallback.nodes, 3);
    return { ...fallback, id: clean(item.id, fallback.id, 60), name: clean(item.name, fallback.name, 100), active: item.active !== false, priority: Number(item.priority) || 0, routePatterns: list(item.routePatterns, fallback.routePatterns), device: ["all","desktop","mobile"].includes(String(item.device)) ? item.device as EntryAdDevice : "all", startAt: clean(item.startAt,"",40), endAt: clean(item.endAt,"",40), eyebrow: clean(item.eyebrow,fallback.eyebrow,100), title: clean(item.title,fallback.title,100), accent: clean(item.accent,fallback.accent,100), description: clean(item.description,fallback.description,400), chips: [chips[0] || "Avantaj", chips[1] || "Hızlı başlangıç", chips[2] || "Özel kapsam"] as [string,string,string], metric: clean(item.metric,fallback.metric,18), metricLabel: clean(item.metricLabel,fallback.metricLabel,50), cta: clean(item.cta,fallback.cta,80), color: /^#[0-9a-f]{6}$/i.test(String(item.color)) ? String(item.color) : fallback.color, color2: /^#[0-9a-f]{6}$/i.test(String(item.color2)) ? String(item.color2) : fallback.color2, quoteService: quoteServices.has(item.quoteService as AdvancedQuoteService) ? item.quoteService as AdvancedQuoteService : fallback.quoteService, nodes: [nodes[0] || "PLAN", nodes[1] || "ÜRET", nodes[2] || "YAYIN"] as [string,string,string] };
  }) : DEFAULT_ENTRY_ADS_CONFIG.campaigns;
  return { active: raw.active !== false, delayMs: Math.max(0, Math.min(30000, Number(raw.delayMs) || 900)), frequency: ["once_session","once_day","always"].includes(String(raw.frequency)) ? raw.frequency as EntryAdFrequency : "once_session", maxShowsPerSession: Math.max(1, Math.min(20, Number(raw.maxShowsPerSession) || 2)), excludedPaths: list(raw.excludedPaths, DEFAULT_ENTRY_ADS_CONFIG.excludedPaths), campaigns };
}

export function routeMatches(pathname: string, patterns: string[]) {
  return patterns.some(pattern => { const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*"); return new RegExp(`^${escaped}$`, "i").test(pathname); });
}
