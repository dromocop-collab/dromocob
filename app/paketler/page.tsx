import PackageGrid from "@/components/package-grid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Paketler ve Teklif",
  description:
    "Web sitesi, özel yazılım, video prodüksiyon ve büyüme sistemleri için dinamik paketler ve akıllı teklif akışı.",
  path: "/paketler",
  keywords: ["web sitesi paketi", "video prodüksiyon paketi", "teklif al"],
});

export default function PackagesPage() {
  return (
    <>
      <section className="packages-hero section" id="teklif">
        <div className="packages-hero-copy">
          <p className="eyebrow">Dromocob / Capability systems</p>
          <h1>Hizmet değil,<br/><span>büyüme sistemi.</span></h1>
          <p className="hero-description">Strateji, tasarım ve teknolojiyi tek bir operasyon modelinde birleştiren kurumsal çözüm paketleri. Her kapsam ölçülebilir hedeflere göre yeniden yapılandırılabilir.</p>
        </div>
        <div className="packages-hero-panel">
          <span>Kurumsal çalışma modeli</span>
          <strong>01 — Keşif & strateji</strong>
          <strong>02 — Tasarım & üretim</strong>
          <strong>03 — Yayın & optimizasyon</strong>
          <small>Tek muhatap · Şeffaf kapsam · Ölçülebilir çıktı</small>
        </div>
      </section>
      <section className="packages-section section">
        <div className="packages-section-head">
          <div><p className="eyebrow">Solution portfolio</p><h2>Doğru kapsam.<br/>Net iş sonucu.</h2></div>
          <p>Başlangıç seviyesinden kurumsal dönüşüme uzanan esnek çözüm mimarisi.</p>
        </div>
        <PackageGrid />
      </section>
    </>
  );
}
