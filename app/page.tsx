import Link from "next/link";
import { ArrowRight, Bot, Camera, Code2, Film, Gauge, Layers3, Play, Radar, Sparkles } from "lucide-react";
import ProjectGrid from "@/components/project-grid";
import PackageGrid from "@/components/package-grid";
import GrowthDiagnostic from "@/components/growth-diagnostic";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Web Tasarım ve Video Prodüksiyon Ajansı | Türkiye",
  description:
    "Markalar için sinematik film prodüksiyonu, yüksek dönüşümlü web deneyimleri, admin paneller ve dijital büyüme sistemleri.",
  path: "/",
  keywords: ["film prodüksiyonu", "web tasarım", "büyüme sistemi"],
});

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero section">
        <div className="hero-noise" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> İstanbul · Türkiye</div>
          <h1>Web tasarım & film.<br/><span>Hatırlananı</span> üret.</h1>
          <p>Markalar için sinematik filmler, yüksek dönüşümlü web deneyimleri ve büyümeyi yöneten dijital sistemler tasarlıyorum.</p>
          <div className="hero-actions">
            <Link className="button" href="/projeler">Projeleri İncele <ArrowRight size={18} /></Link>
            <Link className="text-link" href="/hakkimda"><Play size={15} /> Hikâyemi keşfet</Link>
          </div>
        </div>
        <div className="hero-system">
          <div className="system-grid" />
          <div className="system-scan" />
          <div className="system-orbit orbit-outer"><i/><i/><i/></div>
          <div className="system-orbit orbit-one"><i/><i/></div>
          <div className="system-orbit orbit-two"><i/></div>
          <div className="system-core">
            <span>DC</span>
            <small>DIGITAL FLAGSHIP</small>
            <b><i/> ALL SYSTEMS ACTIVE</b>
          </div>
          <span className="system-tag tag-film"><Camera size={16} /><span><small>PRODUCTION</small>BRAND FILM</span><b>4K</b></span>
          <span className="system-tag tag-code"><Code2 size={16} /><span><small>TECHNOLOGY</small>WEB APP</span><b>LIVE</b></span>
          <span className="system-tag tag-growth"><Radar size={16} /><span><small>INTELLIGENCE</small>GROWTH</span><b>+28%</b></span>
          <span className="system-tag tag-automation"><Bot size={16} /><span><small>OPERATIONS</small>AUTOMATION</span><b>24/7</b></span>
          <div className="system-console">
            <span><Film size={13}/> Video production</span>
            <span><Layers3 size={13}/> Product system</span>
            <span><Gauge size={13}/> Performance layer</span>
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>04</strong><span>uzmanlık<br/>tek vizyon</span></div>
          <div><strong>360°</strong><span>uçtan uca<br/>üretim</span></div>
          <div><strong>∞</strong><span>ölçeklenebilir<br/>sistem</span></div>
        </div>
      </section>

      <section className="marquee"><div>FILM PRODUCTION · WEB SYSTEMS · MOBILE PRODUCTS · CREATIVE DIRECTION · SEO · GROWTH · </div></section>

      <section className="section trust-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Kurumsal çalışma standardı</p>
            <h2>Süreç net.<br/><span>Risk yönetilebilir.</span></h2>
          </div>
          <p>Kurumsal ekiplerin beklentisine uygun şekilde kapsam, teslim takvimi, revizyon sınırı ve iletişim ritmi proje başında yazılı olarak netleşir.</p>
        </div>
        <div className="trust-grid">
          <article><strong>01</strong><h3>Kickoff + kapsam</h3><p>İş hedefi, kullanıcı profili ve teslim kapsamı tek dokümanda netleştirilir.</p></article>
          <article><strong>02</strong><h3>Haftalık raporlama</h3><p>Üretim adımları, riskler ve bir sonraki hafta planı düzenli paylaşılır.</p></article>
          <article><strong>03</strong><h3>Canlıya alma planı</h3><p>Yayın öncesi kontrol listesi ile teknik ve içerik tarafı adım adım doğrulanır.</p></article>
          <article><strong>04</strong><h3>Yayın sonrası destek</h3><p>İlk 30 günde performans, güvenlik ve kullanıcı geri bildirimi birlikte takip edilir.</p></article>
        </div>
      </section>

      <section className="section split-intro">
        <div><p className="eyebrow">Tek kişi. Çok disiplin. Tek standart.</p><h2>Fikirden ekrana,<br/>ekrandan <em>sonuca.</em></h2></div>
        <div><p>Bir projeye yalnızca “video”, “site” ya da “reklam” diye bakmıyorum. Markanın bütün dijital yüzünü aynı hikâyenin parçaları olarak tasarlıyorum.</p>
        <div className="pill-row"><span>Strategy</span><span>Production</span><span>Development</span><span>Growth</span></div></div>
      </section>

      <section className="section home-projects">
        <div className="section-head"><div><p className="eyebrow">Seçili çalışmalar</p><h2>Projeler / <span>01—03</span></h2></div><Link className="text-link" href="/projeler">Tümünü gör <ArrowRight size={16}/></Link></div>
        <ProjectGrid />
      </section>

      <GrowthDiagnostic />

      <section className="section dark-panel home-packages" id="paket-sistemleri">
        <div className="section-head"><div><p className="eyebrow"><Sparkles size={15}/> Akıllı hizmet mimarisi</p><h2>Hazır paket değil.<br/><em>Doğru kombinasyon.</em></h2></div><p>İhtiyacına göre kapsamı şekillendir, dinamik teklif motoru yaklaşık bütçeyi anında hesaplasın.</p></div>
        <PackageGrid />
      </section>

      <section className="section mega-cta">
        <p className="eyebrow">Sıradaki proje seninki olabilir</p>
        <h2>Birlikte dikkat<br/><span>çekelim.</span></h2>
        <Link className="round-link" href="/iletisim"><ArrowRight /></Link>
      </section>
    </div>
  );
}
