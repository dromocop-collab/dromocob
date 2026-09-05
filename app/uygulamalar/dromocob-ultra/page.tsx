import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Box, Check, Clapperboard, Download, Gauge, Headphones, KeyRound, Layers3, Monitor, Palette, RefreshCw, ShieldCheck, Sparkles, Type, WandSparkles } from "lucide-react";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dromocob Ultra — After Effects Yaratıcı Araç Seti",
  description: "Carousel Lab, profesyonel geçişler, LUT, glow, 3D metin ve SFX araçlarını tek premium After Effects panelinde birleştiren Dromocob Ultra’yı keşfedin.",
  keywords: ["After Effects extension", "After Effects eklentisi", "3D carousel", "motion graphics", "LUT", "video geçişleri", "Dromocob Ultra"],
  alternates: { canonical: "/uygulamalar/dromocob-ultra" },
  openGraph: {
    title: "Dromocob Ultra — After Effects Yaratıcı Komuta Merkezi",
    description: "Carousel, geçiş, efekt, renk, metin ve ses üretimini tek panelde yönetin.",
    url: "/uygulamalar/dromocob-ultra",
    type: "website",
    images: [{ url: "/DromocobLogo.png", width: 1024, height: 1024, alt: "Dromocob Ultra" }],
  },
};

const modules = [
  [Box, "Carousel Lab", "10 parametrik 3D düzen, aktif kart odağı, otomatik kamera ve canlı controller sistemi."],
  [Clapperboard, "Geçiş Motoru", "Spin, whip, zoom, fire ve sinematik geçişleri seçili layer üzerinde hızlıca kur."],
  [Sparkles, "Glow Lab", "Katmanlı parıltı, bloom, neon ve ışık vurgularını kontrollü presetlerle tasarla."],
  [Type, "3D Metin", "Metni panelde önizle; 3D extrude, gölge, glow ve giriş animasyonlarıyla kompozisyona ekle."],
  [Palette, "LUT Studio", "Sinematik renk görünümlerini keşfet, yoğunluğunu ayarla ve non-destructive biçimde uygula."],
  [Headphones, "SFX Hub", "Whoosh, impact, riser ve arayüz seslerini proje ritmine göre hızlıca yerleştir."],
] as const;

const carouselTypes = ["Yörünge", "Yay", "Sarmal", "Tünel", "Kapak Akışı", "Kart Destesi", "Dalga", "Silindir", "Odak Rayı", "Sonsuz Bant"];

const workflow = [
  ["01", "Layer’ları seç", "Carousel’e girecek medya layer’larını kompozisyon içinde seç."],
  ["02", "Sistemi belirle", "Düzen tipini ve hazır profili seç; panel optimum değerleri hazırlasın."],
  ["03", "Canlı ayarla", "Yarıçap, derinlik, odak, kamera ve animasyonu controller üzerinden değiştir."],
  ["04", "Üretime devam et", "Carousel’i yeniden oluşturmadan UPDATE ile mevcut sistemi güncelle."],
] as const;

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dromocob Ultra",
  url: absoluteUrl("/uygulamalar/dromocob-ultra"),
  image: absoluteUrl("/DromocobLogo.png"),
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Adobe After Effects Extension",
  operatingSystem: "macOS",
  softwareVersion: "2.6.1",
  inLanguage: "tr-TR",
  description: "After Effects için carousel, geçiş, efekt, LUT, 3D metin ve ses araçlarını birleştiren yaratıcı üretim paneli.",
  featureList: modules.map(([, title]) => title),
  publisher: { "@type": "Organization", name: "Dromocob", url: absoluteUrl("/") },
};

export default function DromocobUltraPage() {
  return <main className="ultra-product-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd).replace(/</g, "\\u003c") }} />

    <section className="ultra-product-hero section">
      <Link className="ultra-back" href="/uygulamalar"><ArrowLeft /> Tüm uygulamalar</Link>
      <div className="ultra-hero-grid">
        <div className="ultra-hero-copy">
          <p className="eyebrow"><span /> DROMOCOB APPS / AFTER EFFECTS</p>
          <div className="ultra-title"><Image src="/DromocobLogo.png" alt="Dromocob Ultra ikonu" width={112} height={112} /><span><small>CREATIVE SYSTEM</small><strong>Dromocob Ultra</strong></span></div>
          <h1>Motion üretiminin<br /><em>komuta merkezi.</em></h1>
          <p>Carousel, geçiş, efekt, LUT, 3D metin ve ses araçlarını After Effects’ten çıkmadan yönetin. Parametrik, güncellenebilir ve üretim hızına göre tasarlanmış tek bir premium panel.</p>
          <div className="ultra-hero-actions">
            <a href="/downloads/Dromocob-Ultra-2.6.1.zxp" download><Download /> ZXP’yi indir <span>v2.6.1</span></a>
            <Link href="/lisans"><KeyRound /> Lisansı etkinleştir</Link>
          </div>
          <div className="ultra-hero-meta"><span><BadgeCheck /> İmzalı ZXP</span><span><Monitor /> After Effects 2026</span><span><RefreshCw /> Panel içi güncelleme</span></div>
        </div>

        <div className="ultra-product-ui" aria-label="Dromocob Ultra Carousel Lab ürün önizlemesi">
          <header><span><Image src="/DromocobLogo.png" alt="" width={42} height={42} /><b>Dromocob Ultra</b></span><small>CAROUSEL LAB <i /></small></header>
          <div className="ultra-ui-body">
            <aside><i className="is-active">D</i><i>↯</i><i>✦</i><i>T</i><i>◐</i></aside>
            <div className="ultra-ui-main">
              <div className="ultra-ui-heading"><span><small>PARAMETRİK 3D SİSTEM</small><strong>Yörünge Carousel</strong></span><b>CANLI</b></div>
              <div className="ultra-carousel-visual"><span className="ultra-ring" />{["A","B","C","D","E"].map((card,index)=><i key={card} className={`ultra-card ultra-card-${index+1}`}>{card}</i>)}<b><Image src="/DromocobLogo.png" alt="" width={86} height={86} /></b></div>
              <div className="ultra-ui-values"><span><small>AKTİF KART</small><b>04</b></span><span><small>YARIÇAP</small><b>860</b></span><span><small>ODAK</small><b>%118</b></span></div>
              <button type="button" tabIndex={-1} aria-hidden="true">CAROUSEL OLUŞTUR <ArrowRight /></button>
            </div>
          </div>
          <footer><span><i /> COMPOSITION CONNECTED</span><b>8 LAYER · 30 FPS</b></footer>
        </div>
      </div>
      <div className="ultra-stats"><article><strong>64</strong><span>Geçiş preseti</span></article><article><strong>10</strong><span>Carousel sistemi</span></article><article><strong>2.6.1</strong><span>Güncel sürüm</span></article><article><strong>TR/EN</strong><span>Çift dil arayüz</span></article></div>
    </section>

    <section className="ultra-modules section"><header><div><p className="eyebrow">ONE PANEL / FULL WORKFLOW</p><h2>Kurgu ritminden<br /><em>final görünüme.</em></h2></div><p>Tekrarlanan teknik adımları kısaltan, yaratıcı kontrolü kullanıcıda tutan modüler araçlar.</p></header><div className="ultra-module-grid">{modules.map(([Icon,title,detail],index)=><article key={title}><span><Icon /></span><small>0{index+1} / ULTRA MODULE</small><h3>{title}</h3><p>{detail}</p><i><ArrowRight /></i></article>)}</div></section>

    <section className="ultra-carousel-section section"><div className="ultra-carousel-copy"><p className="eyebrow">CAROUSEL LAB</p><h2>Layer’ları seç.<br /><em>Sistemi kur.</em></h2><p>Seçili medyaları güvenle çoğaltan, 3D layer’lara dönüştüren ve tüm hareketi <strong>DROMOCOB_CAROUSEL_CTRL</strong> üzerinden yöneten non-destructive yapı.</p><div className="ultra-carousel-tags">{carouselTypes.map((type,index)=><span key={type}><b>{String(index+1).padStart(2,"0")}</b>{type}</span>)}</div></div><div className="ultra-carousel-console"><header><span>ACTIVE CONTROLLER</span><b><i /> CONNECTED</b></header><div className="ultra-console-orbit"><span />{[1,2,3,4,5,6].map(n=><i key={n} className={`u-console-card u-console-card-${n}`}>{n}</i>)}</div><dl><div><dt>Active Card</dt><dd>04</dd></div><div><dt>Camera Distance</dt><dd>1850</dd></div><div><dt>Focus Scale</dt><dd>118%</dd></div><div><dt>Infinite Loop</dt><dd>ON</dd></div></dl></div></section>

    <section className="ultra-workflow section"><header><p className="eyebrow">4 ADIMDA ÜRETİM</p><h2>Kontrol sende.<br /><em>Akış hep canlı.</em></h2></header><div>{workflow.map(([num,title,detail])=><article key={num}><strong>{num}</strong><span><h3>{title}</h3><p>{detail}</p></span><Check /></article>)}</div></section>

    <section className="ultra-security section"><div><p className="eyebrow">LICENSE CLOUD / UPDATE HUB</p><h2>Güvenli çalışır.<br /><em>Yeni kalır.</em></h2><p>Yalnızca lisans koduyla etkinleşir. Cihaza bağlı ES256 imzalı makbuz, çevrimdışı kullanım süresi ve SHA-256 doğrulamalı güncelleme akışıyla korunur.</p></div><div className="ultra-security-console"><article><ShieldCheck /><span><small>LİSANS MAKBUZU</small><strong>ES256 imzalı</strong></span><Check /></article><article><KeyRound /><span><small>AKTİVASYON</small><strong>Cihaza bağlı</strong></span><Check /></article><article><RefreshCw /><span><small>GÜNCELLEME</small><strong>Panel içinden</strong></span><Check /></article><article><Gauge /><span><small>OFFLINE GRACE</small><strong>Sunucudan yönetilir</strong></span><Check /></article></div></section>

    <section className="ultra-install section"><header><p className="eyebrow">KURULUM</p><h2>ZXP’den panele.<br /><em>Dört kısa adım.</em></h2></header><ol><li><b>01</b><span><strong>ZXP’yi indir</strong><small>Güncel, imzalı paketi cihazına kaydet.</small></span></li><li><b>02</b><span><strong>Extension’ı kur</strong><small>Güvenilir bir ZXP Installer veya Adobe UPIA kullan.</small></span></li><li><b>03</b><span><strong>After Effects’i aç</strong><small>Window › Extensions (Legacy) › Dromocob Ultra yolunu izle.</small></span></li><li><b>04</b><span><strong>Lisansı gir</strong><small>Lisans kodunu doğrula veya web’den tanımlanan denemeyi başlat.</small></span></li></ol></section>

    <section className="ultra-requirements section"><div><Monitor /><span><small>SİSTEM</small><strong>After Effects 2026</strong></span></div><div><Layers3 /><span><small>FORMAT</small><strong>CEP / ZXP Extension</strong></span></div><div><WandSparkles /><span><small>PLATFORM</small><strong>macOS</strong></span></div><div><KeyRound /><span><small>BAĞLANTI</small><strong>İlk aktivasyonda internet</strong></span></div></section>

    <section className="ultra-final section"><div><p className="eyebrow">DROMOCOB ULTRA 2.6.1</p><h2>After Effects’i<br /><em>üretim merkezine çevir.</em></h2></div><div><a href="/downloads/Dromocob-Ultra-2.6.1.zxp" download><Download /> İmzalı ZXP’yi indir</a><Link href="/lisans">Lisans Cloud <ArrowRight /></Link></div></section>
  </main>;
}
