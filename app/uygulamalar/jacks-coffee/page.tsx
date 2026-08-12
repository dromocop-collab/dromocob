import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, BadgeCheck, Check, Clock, Coffee, CreditCard, Gift, Globe2, Heart, MapPin, Phone, QrCode, ShieldCheck, Smartphone, Sparkles, Star, Store, Users } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Jacks Coffee — Artisan Kahve Deneyimi",
  description: "Jacks Coffee uygulamasıyla menü keşfi, mobil sipariş, sadakat puanları ve şube bulucu. Dromocob ekosistemi.",
  alternates: { canonical: "/uygulamalar/jacks-coffee" },
};

const features = [
  [Coffee, "Menü Keşfi", "Tüm içecek ve yiyecekleri detaylı açıklama ve fiyatlarıyla keşfedin."],
  [CreditCard, "Mobil Sipariş", "Sıra beklemeden siparişinizi verin, mağazadan teslim alın."],
  [Gift, "Sadakat Puanı", "Her alışverişte puan toplayın, ücretsiz içecekler kazanın."],
  [MapPin, "Şube Bulucu", "Size en yakın Jacks Coffee şubesini haritada bulun."],
  [Clock, "Hızlı Tekrar Sipariş", "Favori siparişlerinizi tek dokunuşla tekrarlayın."],
  [QrCode, "QR ile Ödeme", "QR kod ile hızlı ve güvenli ödeme yapın."],
];

export default function JacksCoffeePage() {
  return <><SiteNav/><main className="app-detail-page app-detail-brown">

    {/* ── HERO ── */}
    <section className="app-detail-hero section">
      <Link className="app-back" href="/uygulamalar"><ArrowLeft/> Tüm uygulamalar</Link>
      <div className="app-detail-grid">
        <div className="app-detail-copy">
          <p className="eyebrow">DROMOCOB APPS / 04</p>
          <div className="app-title-line">
            <span className="app-icon-brown"><Image src="/jacks.png" alt="Jacks Coffee" width={78} height={78}/></span>
            <div><small>FOR iOS &amp; ANDROID</small><h1>Jacks Coffee</h1></div>
          </div>
          <h2>Kahve keyfi<br/><em>dijitalde.</em></h2>
          <p>Artisan kahve deneyimini mobilde yaşayın. Menü keşfinden mobil siparişe, sadakat puanlarından şube bulucuya — kahveniz her zaman yanınızda.</p>
          <div className="app-download-row">
            <a className="app-primary-download app-download-brown" href="https://apps.apple.com/tr/app/the-jacks-coffee/id6757435094?l=tr" target="_blank" rel="noreferrer">
              <span><Smartphone/><b>App Store&apos;dan indir</b><small>iOS</small></span>
            </a>
            <Link href="/giris">Dromocob hesabı <Coffee/></Link>
          </div>
          <div className="app-version">
            <i className="version-brown"/><span>App Store&apos;da yayında</span><strong>Aktif</strong><small>iOS</small>
          </div>
        </div>

        <div className="app-showcase app-showcase-brown">
          <div className="app-showcase-phone">
            <div className="app-showcase-notch"/>
            <div className="app-showcase-screen">
              <div className="app-showcase-header-brown">
                <Coffee/><span>JACKS COFFEE</span>
              </div>
              <div className="app-showcase-content">
                <div className="app-showcase-menu-item">
                  <div className="app-showcase-menu-icon"><Coffee/></div>
                  <div><small>SIGNATURE</small><strong>Caramel Latte</strong><span>₺85</span></div>
                  <button className="app-showcase-add">+</button>
                </div>
                <div className="app-showcase-menu-item">
                  <div className="app-showcase-menu-icon"><Star/></div>
                  <div><small>BESTSELLER</small><strong>Flat White</strong><span>₺75</span></div>
                  <button className="app-showcase-add">+</button>
                </div>
                <div className="app-showcase-loyalty">
                  <Gift/><div><strong>245 Puan</strong><small>1 içecek hediye!</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── FEATURES ── */}
    <section className="app-feature-section app-feature-brown section">
      <header>
        <p className="eyebrow">COFFEE EXPERIENCE</p>
        <h2>Her yudumda<br/><em>ayrıcalık.</em></h2>
      </header>
      <div>
        {features.map(([Icon, title, detail]) => (
          <article key={String(title)}>
            <span><Icon/></span>
            <small>JACKS COFFEE</small>
            <h3>{String(title)}</h3>
            <p>{String(detail)}</p>
          </article>
        ))}
      </div>
    </section>

    {/* ── LOYALTY ── */}
    <section className="app-brand-trust app-brand-brown section">
      <div>
        <p className="eyebrow">LOYALTY PROGRAM</p>
        <h2>Kahve sevgini<br/><em>ödüllendiriyoruz.</em></h2>
        <p>Her alışverişte puan kazan, ücretsiz içecekler ve sürpriz hediyeler ile kahve deneyimini daha da keyifli hale getir.</p>
      </div>
      <div className="app-trust-cards">
        <article><Award/><div><small>SADAKAT</small><strong>Puan toplama</strong></div><Check/></article>
        <article><Gift/><div><small>HEDİYE</small><strong>Ücretsiz içecek</strong></div><Check/></article>
        <article><Star/><div><small>VIP</small><strong>Özel kampanyalar</strong></div><Check/></article>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="app-final-download app-final-brown section">
      <div>
        <p className="eyebrow">APP STORE</p>
        <h2>Jacks Coffee<br/>App Store&apos;da.</h2>
      </div>
      <a href="https://apps.apple.com/tr/app/the-jacks-coffee/id6757435094?l=tr" target="_blank" rel="noreferrer">
        <Sparkles/> App Store&apos;dan indir
      </a>
    </section>

  </main><SiteFooter/></>;
}
