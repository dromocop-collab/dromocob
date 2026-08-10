import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kalori Merkezi",
  description: "Kalori Merkezi uygulamasının resmi ürün, destek ve gizlilik merkezi.",
  path: "/kalori-merkezi",
});

export default function KaloriMerkeziPage() {
  return (
    <main className="calorie-page">
      <section className="section calorie-hero">
        <div className="calorie-copy">
          <p className="eyebrow">DROMOCOB APPS / NUTRITION EXPERIENCE</p>
          <h1>Kalori Merkezi</h1>
          <p>
            Günlük kalori, makro ve besin dengesini takip etmek için tasarlanan hızlı ve sade mobil
            deneyim. Resmi destek ve gizlilik bağlantıları bu merkezde tek noktada sunulur.
          </p>
          <div className="calorie-actions">
            <Link href="/kalori-merkezi/destek">Destek sayfası <ArrowRight size={16} /></Link>
            <Link href="/kalori-merkezi/gizlilik">Gizlilik sayfası <ArrowRight size={16} /></Link>
          </div>
          <div className="calorie-tags">
            <span><BadgeCheck size={14} /> Resmi ürün sayfası</span>
            <span><ShieldCheck size={14} /> App Store uyumlu URL yapısı</span>
            <span><HeartPulse size={14} /> Günlük takip odaklı akış</span>
          </div>
        </div>

        <aside className="calorie-visual" aria-label="Kalori Merkezi uygulama ikonu">
          <div className="calorie-visual-glow" />
          <div className="calorie-icon-frame">
            <Image src="/1024x1024.png" alt="Kalori Merkezi uygulama ikonu" width={220} height={220} priority />
          </div>
          <span className="calorie-chip chip-a"><Sparkles size={14} /> Basit kullanım</span>
          <span className="calorie-chip chip-b"><BadgeCheck size={14} /> Dromocob hesabı</span>
        </aside>
      </section>

      <section className="section calorie-grid">
        <article>
          <h2>Resmi bağlantılar</h2>
          <p>App Store inceleme ve kullanıcı yönlendirmeleri için aşağıdaki kanonik adresleri kullanın.</p>
          <div className="calorie-link-list">
            <Link href="/kalori-merkezi">dromocob.tr/kalori-merkezi</Link>
            <Link href="/kalori-merkezi/destek">dromocob.tr/kalori-merkezi/destek</Link>
            <Link href="/kalori-merkezi/gizlilik">dromocob.tr/kalori-merkezi/gizlilik</Link>
          </div>
        </article>

        <article>
          <h2>Genel uygulama merkezi</h2>
          <p>Dromocob ekosistemindeki tüm uygulamalar için genel politikalar ve iletişim kanalları.</p>
          <div className="calorie-link-list">
            <Link href="/uygulamalar">dromocob.tr/uygulamalar</Link>
            <Link href="/destek">dromocob.tr/destek</Link>
            <Link href="/gizlilik">dromocob.tr/gizlilik</Link>
          </div>
        </article>
      </section>

      <section className="section calorie-band">
        <p>Kalori Merkezi</p>
        <h3>Basit arayüz, hızlı takip, tek merkezden resmi destek.</h3>
        <Link href="/kalori-merkezi/destek">Destek ekibine ulaş <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
