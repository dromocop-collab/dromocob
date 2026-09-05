import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, Cpu, Download, Globe2, LockKeyhole, MonitorUp, Sparkles, Star, TrendingUp, Users, Zap } from "lucide-react";
import AppStoreLive from "@/components/app-store-live";

export const metadata: Metadata = {
  title: "Dromocob Apps — Premium Uygulama Ekosistemi",
  description: "Dromocob Ultra, PhotoResize, Kalori Merkezi, Altıncı Kuyumculuk, Jacks Coffee, Dromocob ve SeninRandevun ürünlerini keşfedin. Tek hesap, ortak lisans, sade çalışma akışı.",
  alternates: { canonical: "/uygulamalar" },
};

const apps = [
  {
    num: "01",
    slug: "/uygulamalar/photoresize",
    name: "PhotoResize",
    tagline: "IMAGE PRODUCTION UTILITY",
    desc: "Mac için toplu görsel boyutlandırma aracı. Akıllı format dönüşümü, yerel performans ve profesyonel çıktı kalitesi.",
    icon: "/resize.png",
    platforms: ["macOS 14+", "Apple Silicon", "DMG"],
    color: "blue" as const,
    stat: "1.0.1",
    statLabel: "Son sürüm",
  },
  {
    num: "02",
    slug: "/uygulamalar/dromocob-ultra",
    name: "Dromocob Ultra",
    tagline: "AFTER EFFECTS CREATIVE SYSTEM",
    desc: "Carousel, geçiş, efekt, LUT, 3D metin ve SFX araçlarını tek premium After Effects panelinde birleştiren yaratıcı komuta merkezi.",
    icon: "/DromocobLogo.png",
    platforms: ["After Effects 2026", "macOS", "ZXP"],
    color: "ultra" as const,
    stat: "2.7.1",
    statLabel: "Güncel sürüm",
  },
  {
    num: "03",
    slug: "/kalori-merkezi",
    name: "Kalori Merkezi",
    tagline: "NUTRITION TRACKER APP",
    desc: "Günlük kalori, makro ve besin dengesini takip eden hızlı ve sade mobil deneyim.",
    icon: "/kalori.jpeg",
    platforms: ["iOS", "App Store", "Dromocob Account"],
    color: "orange" as const,
    stat: "1.0",
    statLabel: "App Store sürümü",
    appStoreUrl: "https://apps.apple.com/tr/app/kalori-merkezi/id6799123172",
  },
  {
    num: "04",
    slug: "/uygulamalar/altinci-kuyumculuk",
    name: "Altıncı Kuyumculuk",
    tagline: "LUXURY JEWELRY BRAND APP",
    desc: "Premium kuyumculuk deneyimi. Ürün kataloğu, mağaza bulucu, randevu sistemi ve özel kampanya bildirimleri.",
    icon: "/bizim.png",
    platforms: ["iOS", "App Store"],
    color: "gold" as const,
    stat: "App Store",
    statLabel: "Platform",
    appStoreUrl: "https://apps.apple.com/tr/app/bizim-6nc%C4%B1-kuyumculuk/id6760553574?l=tr",
  },
  {
    num: "05",
    slug: "/uygulamalar/jacks-coffee",
    name: "Jacks Coffee",
    tagline: "ARTISAN COFFEE EXPERIENCE",
    desc: "Menü keşfi, mobil sipariş, sadakat puanı toplama ve şube bulucu ile kahve deneyimini dijitale taşıyın.",
    icon: "/jacks.png",
    platforms: ["iOS", "App Store"],
    color: "brown" as const,
    stat: "App Store",
    statLabel: "Platform",
    appStoreUrl: "https://apps.apple.com/tr/app/the-jacks-coffee/id6757435094?l=tr",
  },
  {
    num: "06",
    slug: "/uygulamalar/dromocob",
    name: "Dromocob",
    tagline: "DIGITAL AGENCY HUB",
    desc: "Proje takibi, lisans yönetimi, destek kanalları ve hizmet portföyü — tüm Dromocob ekosistemi tek uygulamada.",
    icon: "/dromocob-app.png",
    platforms: ["iOS", "App Store", "Web"],
    color: "cyan" as const,
    stat: "1.0",
    statLabel: "App Store sürümü",
    appStoreUrl: "https://apps.apple.com/tr/app/dromocob/id6795915775",
  },
  {
    num: "07",
    slug: "/projeler/senin-randevun",
    name: "SeninRandevun",
    tagline: "APPOINTMENT SAAS PLATFORM",
    desc: "İşletme keşfi, online randevu, ekip, hizmet ve müşteri yönetimini web ve iOS deneyiminde birleştiren SaaS platformu.",
    icon: "/images/projects/senin-randevun.svg",
    platforms: ["Web", "iOS", "Apple Review"],
    color: "blue" as const,
    stat: "Onay Bekliyor",
    statLabel: "Apple Review",
  },
];

const stats = [
  { icon: Users, value: "12,400+", label: "Aktif Kullanıcı" },
  { icon: Download, value: "38,000+", label: "Toplam İndirme" },
  { icon: Star, value: "4.8", label: "Ortalama Puan" },
  { icon: TrendingUp, value: "7", label: "Dijital ürün" },
];

export default function AppsPage() {
  return <main className="apps-page">

    {/* ── HERO ── */}
    <section className="apps-hero section">
      <div className="apps-hero-copy">
        <p className="eyebrow">DROMOCOB / APP ECOSYSTEM</p>
        <h1>Uygulama<br />ekosistemi.<br /><em>Tek merkezde.</em></h1>
        <p>Mac masaüstü araçlarından mobil marka deneyimlerine, beslenme takibinden proje yönetimine — tüm Dromocob uygulamaları tek hesap ve ortak lisans mimarisinde.</p>
        <div className="apps-actions">
          <Link href="/uygulamalar/dromocob-ultra">Dromocob Ultra <ArrowRight /></Link>
          <Link href="/uygulamalar/photoresize">PhotoResize <ArrowRight /></Link>
          <Link href="/kalori-merkezi">Kalori Merkezi <ArrowRight /></Link>
          <a href="/downloads/Dromocob-Ultra-2.7.1.zxp" download>Dromocob Ultra ZXP <Download /></a>
        </div>
        <div className="apps-trust">
          <span><LockKeyhole /> İmzalı lisans</span>
          <span><Cpu /> Apple Silicon</span>
          <span><Zap /> Yerel işlem</span>
        </div>
      </div>
      <div className="apps-orbit" aria-label="Dromocob Apps ürün görselleri">
        <div className="apps-orbit-glow" />
        <div className="apps-orbit-ring" />
        <div className="apps-orbit-ring apps-orbit-ring-2" />
        <div className="apps-app-icon apps-app-icon-center"><Image src="/DromocobLogo.png" alt="Dromocob Ultra" width={512} height={512} /></div>
        <div className="apps-app-icon apps-app-icon-tl"><Image src="/kalori.jpeg" alt="Kalori Merkezi" width={512} height={512} /></div>
        <div className="apps-app-icon apps-app-icon-tr"><Image src="/bizim.png" alt="Altıncı Kuyumculuk" width={512} height={512} /></div>
        <div className="apps-app-icon apps-app-icon-bl"><Image src="/jacks.png" alt="Jacks Coffee" width={512} height={512} /></div>
        <div className="apps-app-icon apps-app-icon-br"><Image src="/dromocob-app.png" alt="Dromocob" width={512} height={512} /></div>
        <span className="orbit-chip chip-one"><BadgeCheck /> License Cloud</span>
        <span className="orbit-chip chip-two"><MonitorUp /> macOS Native</span>
        <span className="orbit-chip chip-three"><Sparkles /> Pro Workflow</span>
      </div>
    </section>

    {/* ── STATS BAND ── */}
    <section className="apps-stats-band section">
      {stats.map(s => <article key={s.label}><s.icon /><div><strong>{s.value}</strong><span>{s.label}</span></div></article>)}
    </section>

    <AppStoreLive />

    {/* ── FEATURED APPS ── */}
    <section className="apps-featured section">
      <header>
        <div>
          <p className="eyebrow">7 ÜRÜN / TEK EKOSİSTEM</p>
          <h2>Tüm<br />uygulamalar.<br /><em>Bir arada.</em></h2>
        </div>
        <p>Profesyonel üretim araçlarından mobil marka deneyimlerine, beslenme takibinden proje yönetimine — Dromocob ekosistemindeki tüm uygulamalar burada.</p>
      </header>
      <div className="apps-featured-grid">
        {apps.map(app => (
          <Link key={app.slug} className={`app-product-card app-card-${app.color}`} href={app.slug}>
            <div className="app-product-number">{app.num}</div>
            <div className="app-product-icon">
              <Image src={app.icon} alt={`${app.name} ikonu`} width={512} height={512} />
            </div>
            <div className="app-product-info">
              <small>{app.tagline}</small>
              <h3>{app.name}</h3>
              <p>{app.desc}</p>
              <div className="app-product-tags">
                {app.platforms.map(p => <span key={p}>{p}</span>)}
              </div>
            </div>
            <div className="app-product-meta">
              <div className="app-product-stat"><strong>{app.stat}</strong><span>{app.statLabel}</span></div>
              <i><ArrowRight /></i>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* ── ECOSYSTEM ── */}
    <section className="apps-ecosystem section">
      <div className="apps-eco-visual">
        <div className="apps-eco-grid">
          {apps.map(app => (
            <div key={app.slug} className={`apps-eco-node apps-eco-${app.color}`}>
              <Image src={app.icon} alt={app.name} width={512} height={512} />
              <span>{app.name}</span>
            </div>
          ))}
        </div>
        <div className="apps-eco-center">
          <Image src="/logo.svg" alt="Dromocob" width={68} height={68} />
        </div>
      </div>
      <div className="apps-eco-copy">
        <p className="eyebrow">ONE ACCOUNT / ALL APPS</p>
        <h2>Büyüyen bir<br /><em>uygulama sistemi.</em></h2>
        <p>Tek Dromocob hesabı ile tüm uygulamalara erişin. Ortak lisans mimarisi, merkezi destek kanalları ve güvenli kimlik doğrulama her uygulamada standart.</p>
        <div className="apps-eco-features">
          <article><Boxes /><div><strong>Ortak Lisans</strong><span>Tek hesap, tüm uygulamalar</span></div></article>
          <article><LockKeyhole /><div><strong>Güvenli Kimlik</strong><span>ES256 imzalı doğrulama</span></div></article>
          <article><Globe2 /><div><strong>Çapraz Platform</strong><span>macOS, iOS, Android, Web</span></div></article>
          <article><Sparkles /><div><strong>Sürekli Güncelleme</strong><span>Otomatik sürüm kontrolü</span></div></article>
        </div>
      </div>
    </section>

    {/* ── LICENSE BAND ── */}
    <section className="apps-license-band section">
      <Boxes />
      <div>
        <small>DROMOCOB ACCOUNT</small>
        <h2>Tek hesap. Tek lisans.<br />Bütün Dromocob Apps.</h2>
      </div>
      <Link href="/giris">Hesabına giriş yap <ArrowRight /></Link>
    </section>

  </main>;
}
