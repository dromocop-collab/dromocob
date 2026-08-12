import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Bell, Calendar, Check, Crown, Diamond, ExternalLink, Gem, Globe2, Heart, MapPin, Phone, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Star, Store } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Altıncı Kuyumculuk — Premium Kuyumculuk Deneyimi",
  description: "Altıncı Kuyumculuk uygulamasıyla ürün kataloğu, mağaza bulucu, randevu sistemi ve özel kampanya bildirimleri. Dromocob ekosistemi.",
  alternates: { canonical: "/uygulamalar/altinci-kuyumculuk" },
};

const features = [
  [ShoppingBag, "Ürün Kataloğu", "Koleksiyon ve ürünleri detaylı görseller ve fiyat bilgisiyle keşfedin."],
  [MapPin, "Mağaza Bulucu", "Size en yakın Altıncı Kuyumculuk mağazasını haritada bulun."],
  [Calendar, "Randevu Sistemi", "Özel alışveriş deneyimi için mağazadan randevu alın."],
  [Bell, "Kampanya Bildirimleri", "Yeni koleksiyonlar ve indirimlerden anında haberdar olun."],
  [Heart, "Favori Listem", "Beğendiğiniz ürünleri kaydedin ve kolayca takip edin."],
  [Crown, "VIP Üyelik", "Özel müşteri avantajları ve erken erişim fırsatları."],
];

export default function AltinciKuyumculukPage() {
  return <><SiteNav/><main className="app-detail-page app-detail-gold">

    {/* ── HERO ── */}
    <section className="app-detail-hero section">
      <Link className="app-back" href="/uygulamalar"><ArrowLeft/> Tüm uygulamalar</Link>
      <div className="app-detail-grid">
        <div className="app-detail-copy">
          <p className="eyebrow">DROMOCOB APPS / 03</p>
          <div className="app-title-line">
            <span><Image src="/bizim.png" alt="Altıncı Kuyumculuk" width={78} height={78}/></span>
            <div><small>FOR iOS &amp; ANDROID</small><h1>Altıncı Kuyumculuk</h1></div>
          </div>
          <h2>Lüks kuyumculuk<br/><em>deneyimi.</em></h2>
          <p>Premium kuyumculuk ürünlerini keşfedin, mağaza randevusu alın ve özel kampanyalardan ilk siz haberdar olun.</p>
          <div className="app-download-row">
            <a className="app-primary-download app-download-gold" href="https://apps.apple.com/tr/app/bizim-6nc%C4%B1-kuyumculuk/id6760553574?l=tr" target="_blank" rel="noreferrer">
              <span><Smartphone/><b>App Store&apos;dan indir</b><small>iOS</small></span>
            </a>
            <Link href="/giris">Dromocob hesabı <Crown/></Link>
          </div>
          <div className="app-version">
            <i className="version-gold"/><span>App Store&apos;da yayında</span><strong>Aktif</strong><small>iOS</small>
          </div>
        </div>

        <div className="app-showcase app-showcase-gold">
          <div className="app-showcase-phone">
            <div className="app-showcase-notch"/>
            <div className="app-showcase-screen">
              <div className="app-showcase-header-gold">
                <Diamond/><span>ALTINCI KUYUMCULUK</span>
              </div>
              <div className="app-showcase-content">
                <div className="app-showcase-product">
                  <div className="app-showcase-product-img"><Gem/></div>
                  <div><small>YENİ KOLEKSİYON</small><strong>Altın Pırlanta Yüzük</strong><span>₺24.500</span></div>
                </div>
                <div className="app-showcase-product">
                  <div className="app-showcase-product-img"><Star/></div>
                  <div><small>EN ÇOK SATAN</small><strong>Elmas Kolye Seti</strong><span>₺18.900</span></div>
                </div>
                <button><Heart/> Favorilere ekle</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── FEATURES ── */}
    <section className="app-feature-section app-feature-gold section">
      <header>
        <p className="eyebrow">PREMIUM FEATURES</p>
        <h2>Kuyumculuk<br/><em>dijitale taşındı.</em></h2>
      </header>
      <div>
        {features.map(([Icon, title, detail]) => (
          <article key={String(title)}>
            <span><Icon/></span>
            <small>ALTINCI KUYUMCULUK</small>
            <h3>{String(title)}</h3>
            <p>{String(detail)}</p>
          </article>
        ))}
      </div>
    </section>

    {/* ── BRAND TRUST ── */}
    <section className="app-brand-trust app-brand-gold section">
      <div>
        <p className="eyebrow">BRAND EXPERIENCE</p>
        <h2>Güven ve<br/><em>prestij.</em></h2>
        <p>Altıncı Kuyumculuk, onlarca yıllık kuyumculuk geleneğini modern dijital deneyimle buluşturur. Uygulama üzerinden eriştiğiniz her ürün, mağazada gördüğünüz aynı kalite güvencesiyle sunulur.</p>
      </div>
      <div className="app-trust-cards">
        <article><ShieldCheck/><div><small>GARANTİ</small><strong>Sertifikalı ürünler</strong></div><Check/></article>
        <article><Store/><div><small>MAĞAZA</small><strong>Türkiye geneli</strong></div><Check/></article>
        <article><Globe2/><div><small>DİJİTAL</small><strong>Online katalog</strong></div><Check/></article>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="app-final-download app-final-gold section">
      <div>
        <p className="eyebrow">APP STORE</p>
        <h2>Altıncı Kuyumculuk<br/>App Store&apos;da.</h2>
      </div>
      <a href="https://apps.apple.com/tr/app/bizim-6nc%C4%B1-kuyumculuk/id6760553574?l=tr" target="_blank" rel="noreferrer">
        <Sparkles/> App Store&apos;dan indir
      </a>
    </section>

  </main><SiteFooter/></>;
}
