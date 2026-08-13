import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Bot, Camera, CheckCheck, Code2, Film, Gauge, Layers3, MessageCircle, Play, Radar, ShieldCheck, Sparkles, Zap } from "lucide-react";
import ProjectGrid from "@/components/project-grid";
import PackageGrid from "@/components/package-grid";
import GrowthDiagnostic from "@/components/growth-diagnostic";
import { pageMetadata } from "@/lib/seo";
import QuoteLauncher from "@/components/quote-launcher";
import InstagramReels from "@/components/instagram-reels";
import { sitePhone, sitePhoneDisplay } from "@/lib/seo";
import HomeClientExperience from "@/components/home-client-experience";
import LaunchOffer from "@/components/launch-offer";
import HomeMotionController from "@/components/motion/home-motion-controller";
import PinnedServices from "@/components/motion/pinned-services";
import ScrollProgress from "@/components/motion/scroll-progress";
import CodeMission from "@/components/code-mission";

export const metadata = pageMetadata({
  title: "Web Tasarım, Drone Çekimi ve Video Prodüksiyon",
  description:
    "Profesyonel web tasarım, kurumsal web sitesi, özel web yazılım, drone çekimi, tanıtım filmi ve video prodüksiyon hizmetleri. Fethiye merkezli, Türkiye geneli.",
  path: "/",
  keywords: ["web tasarım", "web tasarımı", "drone", "drone çekimi", "profesyonel drone çekimi", "web sitesi yaptırma", "kurumsal web sitesi", "web tasarım ajansı", "kurumsal tanıtım filmi", "tanıtım videosu", "video prodüksiyon ajansı"],
});

export default function Home() {
  const whatsappMessage = encodeURIComponent("Merhaba Dromocob, projem hakkında hızlıca bilgi almak istiyorum.");
  const whatsappUrl = `https://wa.me/${sitePhone.replace(/\D/g, "")}?text=${whatsappMessage}`;

  return (
    <div className="home-page">
      <HomeMotionController />
      <ScrollProgress />
      <LaunchOffer />
      <section className="hero section" data-motion-section="HERO">
        <div className="hero-noise" />
        <div className="hero-copy">
          <div className="eyebrow hero-reveal hero-reveal-one"><span className="live-dot" /> Fethiye · Türkiye</div>
          <h1 className="hero-reveal hero-reveal-two">Web tasarım & film.<br/><span>Hatırlananı</span> üret.</h1>
          <p className="hero-reveal hero-reveal-three">Markalar için kurumsal web sitesi, e-ticaret ve özel yazılım altyapıları; sinematik tanıtım filmi ve video prodüksiyonları tasarlıyorum.</p>
          <div className="hero-actions hero-reveal hero-reveal-four">
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
            <span><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></span>
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

      <section className="section trust-section" data-cinematic data-scroll-scene="trust">
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

      <section className="section split-intro" data-cinematic data-scroll-scene="expertise">
        <div><p className="eyebrow">Tek kişi. Çok disiplin. Tek standart.</p><h2>Fikirden ekrana,<br/>ekrandan <em>sonuca.</em></h2></div>
        <div><p>Bir projeye yalnızca “video”, “site” ya da “reklam” diye bakmıyorum. Markanın bütün dijital yüzünü aynı hikâyenin parçaları olarak tasarlıyorum.</p>
        <div className="pill-row"><span>Strategy</span><span>Production</span><span>Development</span><span>Growth</span></div>
        <div className="motion-expertise"><div><i>AE</i><span><small>POST-PRODUCTION / AFTER EFFECTS</small><strong>Motion & Visual Effects</strong></span></div><div className="motion-expertise-track"><span>Motion Design</span><span>Compositing</span><span>VFX</span><span>Motion Tracking</span><span>Rotoscoping</span><span>Keying</span><span>Expressions</span><span>Title Design</span></div></div></div>
      </section>

      <PinnedServices />

      <CodeMission />

      <HomeClientExperience />

      <section className="section home-projects" data-cinematic data-horizontal-projects data-motion-section="PROJECTS">
        <div className="section-head"><div><p className="eyebrow">Seçili çalışmalar</p><h2>Projeler / <span>01—10</span></h2></div><Link className="text-link" href="/projeler">Tümünü gör <ArrowRight size={16}/></Link></div>
        <div className="mobile-swipe-hint" aria-hidden="true"><span>Kaydırarak keşfet</span><i/><i/><i/><ArrowRight/></div>
        <ProjectGrid />
      </section>

      <div data-cinematic data-motion-section="APPS"><InstagramReels /></div>

      <div data-cinematic data-motion-section="ABOUT"><GrowthDiagnostic /></div>

      <section className="section dark-panel home-packages" id="paket-sistemleri" data-cinematic data-scroll-scene="packages">
        <div className="section-head"><div><p className="eyebrow"><Sparkles size={15}/> Akıllı hizmet mimarisi</p><h2>Hazır paket değil.<br/><em>Doğru kombinasyon.</em></h2></div><p>İhtiyacına göre kapsamı şekillendir, dinamik teklif motoru yaklaşık bütçeyi anında hesaplasın.</p></div>
        <div className="mobile-swipe-hint" aria-hidden="true"><span>Paketleri sağa kaydır</span><i/><i/><i/><ArrowRight/></div>
        <PackageGrid compact />
      </section>

      <section className="section whatsapp-fast-contact" data-cinematic data-scroll-scene="contact" aria-labelledby="whatsapp-contact-title">
        <div className="whatsapp-contact-copy">
          <p className="eyebrow"><span className="whatsapp-live-dot"/> Hızlı iletişim / WhatsApp</p>
          <h2 id="whatsapp-contact-title">Aklındaki projeyi<br/><em>bir mesajla başlat.</em></h2>
          <p>Uzun formlarla uğraşmadan hedefini kısaca anlat. İhtiyacını birlikte netleştirelim, sana en doğru başlangıç yolunu hızlıca paylaşayım.</p>
          <div className="whatsapp-contact-points">
            <span><Zap/> Hızlı ilk değerlendirme</span>
            <span><ShieldCheck/> Doğrudan ve güvenli iletişim</span>
          </div>
          <a className="whatsapp-contact-button" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label={`WhatsApp üzerinden ${sitePhoneDisplay} numarasına mesaj gönder`}>
            <span><MessageCircle/></span>
            <div><small>WHATSAPP&apos;TAN YAZ</small><strong>{sitePhoneDisplay}</strong></div>
            <ArrowUpRight/>
          </a>
        </div>

        <div className="whatsapp-visual" aria-hidden="true">
          <div className="whatsapp-orbit whatsapp-orbit-one"/>
          <div className="whatsapp-orbit whatsapp-orbit-two"/>
          <div className="whatsapp-phone">
            <header>
              <span className="whatsapp-avatar">DC<i/></span>
              <div><strong>Dromocob</strong><small>çevrimiçi</small></div>
              <MessageCircle/>
            </header>
            <div className="whatsapp-chat">
              <span className="whatsapp-day">BUGÜN</span>
              <p className="whatsapp-message is-incoming">Merhaba 👋 Projen için nasıl yardımcı olabilirim?<small>10:24</small></p>
              <p className="whatsapp-message is-outgoing">Markam için yeni bir web sitesi düşünüyorum.<small>10:25 <CheckCheck/></small></p>
              <p className="whatsapp-message is-incoming">Harika. Hedefini ve mevcut durumunu birkaç cümleyle paylaşman yeterli.<small>10:25</small></p>
            </div>
            <footer><span>Mesajınızı yazın</span><i><ArrowUpRight/></i></footer>
          </div>
          <div className="whatsapp-response-card"><i/><span><small>ORTALAMA İLK DÖNÜŞ</small><strong>Aynı gün içinde</strong></span></div>
        </div>
      </section>

      <section className="section mega-cta" data-cinematic data-motion-section="CONTACT">
        <p className="eyebrow">Sıradaki proje seninki olabilir</p>
        <h2>Birlikte dikkat<br/><span>çekelim.</span></h2>
        <QuoteLauncher className="round-link" ariaLabel="Yeni proje teklif motorunu aç"><ArrowRight /></QuoteLauncher>
      </section>
    </div>
  );
}
