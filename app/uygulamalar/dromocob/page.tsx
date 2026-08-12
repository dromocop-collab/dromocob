import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Boxes, Check, Cloud, Code2, FolderKanban, Globe2, Headphones, KeyRound, Layers3, LockKeyhole, MessageSquare, Monitor, Rocket, Settings2, ShieldCheck, Smartphone, Sparkles, Users, Zap } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Dromocob App — Dijital Ajans Merkezi",
  description: "Dromocob uygulamasıyla proje takibi, lisans yönetimi, destek kanalları ve hizmet portföyü. Tüm ekosistem tek uygulamada.",
  alternates: { canonical: "/uygulamalar/dromocob" },
};

const features = [
  [FolderKanban, "Proje Takibi", "Aktif projelerinizi gerçek zamanlı olarak takip edin ve ilerleme raporlarını görüntüleyin."],
  [KeyRound, "Lisans Yönetimi", "Tüm Dromocob uygulamalarının lisanslarını merkezi olarak yönetin."],
  [Headphones, "Canlı Destek", "Destek ekibine doğrudan uygulama içinden ulaşın."],
  [BarChart3, "Analitik Panel", "Web sitenizin performans metriklerini anlık olarak izleyin."],
  [Code2, "Hizmet Portföyü", "Web tasarım, SEO ve dijital pazarlama hizmetlerini keşfedin."],
  [Cloud, "Cloud Sync", "Tüm verileriniz güvenli bulut altyapısında senkronize edilir."],
];

export default function DromocobAppPage() {
  return <><SiteNav/><main className="app-detail-page app-detail-cyan">

    {/* ── HERO ── */}
    <section className="app-detail-hero section">
      <Link className="app-back" href="/uygulamalar"><ArrowLeft/> Tüm uygulamalar</Link>
      <div className="app-detail-grid">
        <div className="app-detail-copy">
          <p className="eyebrow">DROMOCOB APPS / 05</p>
          <div className="app-title-line">
            <span className="app-icon-cyan"><Image src="/dromocob-app.png" alt="Dromocob" width={78} height={78}/></span>
            <div><small>WEB &amp; MOBİL</small><h1>Dromocob</h1></div>
          </div>
          <h2>Tüm ekosistem<br/><em>avucunuzda.</em></h2>
          <p>Proje takibi, lisans yönetimi, destek kanalları ve hizmet portföyü — tüm Dromocob operasyonu tek uygulamada birleşiyor.</p>
          <div className="app-download-row">
            <a className="app-primary-download app-download-cyan" href="#">
              <span><Smartphone/><b>Apple Onay Bekliyor</b><small>iOS &amp; Android</small></span>
            </a>
            <Link href="/giris">Hesabına giriş <KeyRound/></Link>
          </div>
          <div className="app-version">
            <i className="version-cyan"/><span>Apple onay aşamasında</span><strong>Review</strong><small>Gönderildi</small>
          </div>
        </div>

        <div className="app-showcase app-showcase-cyan">
          <div className="app-showcase-phone app-showcase-phone-wide">
            <div className="app-showcase-notch"/>
            <div className="app-showcase-screen">
              <div className="app-showcase-header-cyan">
                <Sparkles/><span>DROMOCOB</span>
              </div>
              <div className="app-showcase-content">
                <div className="app-showcase-dash-card">
                  <div className="app-showcase-dash-row"><FolderKanban/><div><strong>3 Aktif Proje</strong><small>2 tamamlandı</small></div></div>
                  <div className="app-showcase-dash-row"><KeyRound/><div><strong>5 Lisans</strong><small>Tümü aktif</small></div></div>
                </div>
                <div className="app-showcase-dash-metrics">
                  <article><strong>12.4K</strong><small>Ziyaretçi</small></article>
                  <article><strong>98%</strong><small>Uptime</small></article>
                  <article><strong>4.8</strong><small>Puan</small></article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── FEATURES ── */}
    <section className="app-feature-section app-feature-cyan section">
      <header>
        <p className="eyebrow">ALL-IN-ONE HUB</p>
        <h2>Merkezi<br/><em>kontrol noktası.</em></h2>
      </header>
      <div>
        {features.map(([Icon, title, detail]) => (
          <article key={String(title)}>
            <span><Icon/></span>
            <small>DROMOCOB</small>
            <h3>{String(title)}</h3>
            <p>{String(detail)}</p>
          </article>
        ))}
      </div>
    </section>

    {/* ── PLATFORM ── */}
    <section className="app-brand-trust app-brand-cyan section">
      <div>
        <p className="eyebrow">CROSS PLATFORM</p>
        <h2>Her yerden<br/><em>erişim.</em></h2>
        <p>Dromocob uygulaması web, iOS ve Android platformlarında çalışır. Nerede olursanız olun, projeleriniz ve lisanslarınız yanınızda.</p>
      </div>
      <div className="app-trust-cards">
        <article><Monitor/><div><small>WEB</small><strong>Tarayıcıdan erişim</strong></div><Check/></article>
        <article><Smartphone/><div><small>MOBİL</small><strong>iOS &amp; Android</strong></div><Check/></article>
        <article><Cloud/><div><small>SYNC</small><strong>Gerçek zamanlı</strong></div><Check/></article>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="app-final-download app-final-cyan section">
      <div>
        <p className="eyebrow">APPLE REVIEW</p>
        <h2>Dromocob App<br/>onay bekliyor.</h2>
      </div>
      <a href="/giris">
        <Rocket/> Hesabına giriş yap <span>Yakında</span>
      </a>
    </section>

  </main><SiteFooter/></>;
}
