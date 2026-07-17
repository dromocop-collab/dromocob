import { Camera, Code2, Layers3, MoveUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Hakkımda",
  description:
    "Cihat Erdem'in film prodüksiyonu, web geliştirme, operasyon ve dijital büyüme alanlarını birleştiren Dromocob yaklaşımı.",
  path: "/hakkimda",
  keywords: ["Cihat Erdem", "videographer", "web geliştirici"],
});

export default function AboutPage() {
  return (
    <>
      <section className="page-hero section">
        <p className="eyebrow">Hakkımda / Cihat Erdem</p>
        <h1>Ben sadece kamera<br/>kullanmıyorum. <span>Sistem kuruyorum.</span></h1>
      </section>
      <section className="section about-grid">
        <div className="portrait-placeholder"><span>CE</span><small>Visual storyteller<br/>Digital builder</small></div>
        <div className="about-copy">
          <p className="lead">Videographer, video editor ve dijital ürün geliştiricisiyim. Görsel hikâye anlatımıyla teknolojiyi aynı masada buluşturuyorum.</p>
          <p>Mağaza tanıtımlarından sinematik marka filmlerine, e-ticaret altyapılarından mobil uygulamalara kadar projeleri yalnızca üretmekle kalmıyor; operasyonun nasıl yönetileceğini de tasarlıyorum.</p>
          <p>Benim için iyi iş, yalnızca güzel görünmez. Hızlıdır, anlaşılırdır, yönetilebilir ve sonuç üretir.</p>
          <div className="signature">Cihat Erdem</div>
        </div>
      </section>
      <section className="section capability-grid">
        {[
          [Camera, "01", "Film & Production", "Sony FX3 merkezli sinematik çekim, drone, gimbal ve profesyonel post-prodüksiyon."],
          [Code2, "02", "Web & Mobile", "Next.js, Firebase ve modern ürün mimarileriyle dinamik dijital deneyimler."],
          [Layers3, "03", "Operations", "Admin paneller, otomasyon, içerik ve iş akışı yönetimi."],
          [MoveUpRight, "04", "Growth", "SEO, kreatif strateji ve dönüşüm odaklı dijital büyüme."]
        ].map(([Icon, no, title, desc]) => {
          const C = Icon as typeof Camera;
          return <article className="capability-card" key={String(no)}><C/><span>{String(no)}</span><h3>{String(title)}</h3><p>{String(desc)}</p></article>;
        })}
      </section>
    </>
  );
}
