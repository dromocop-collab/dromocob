import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";

const services = [
  ["01", "Video Prodüksiyon", "Markanın karakterini görüntü, ses ve ritimle kuran uçtan uca film üretimi.", "/images/services/sony-fx3-cinema-camera.webp", "/video-produksiyon", "MEDIA.PIPELINE", "render(sequence, 4K)"],
  ["02", "Drone Çekimi", "Mekânı ve ölçeği güçlü sinematik kadrajlarla görünür kılan hava prodüksiyonu.", "/images/services/dji-mini-5-pro-drone.webp", "/drone-cekimi", "FLIGHT.SYSTEM", "capture(route, RAW)"],
  ["03", "Web Tasarım", "Hızlı, erişilebilir ve dönüşüm odaklı dijital marka deneyimleri.", "/images/services/web-design-system.webp", "/web-tasarim", "WEB.RUNTIME", "deploy(experience)"],
  ["04", "Mağaza Tanıtımı", "Fiziksel deneyimi dijitalde hissettiren ticari mekân anlatıları.", "/images/home-experience/production-day.png", "/magaza-tanitimi", "BRAND.ENGINE", "map(space, story)"],
  ["05", "SEO", "Teknik altyapı, içerik ve otoriteyi aynı büyüme sisteminde birleştiren görünürlük.", "/images/services/web-software-infrastructure.webp", "/seo", "SEARCH.INDEX", "optimize(authority)"],
  ["06", "Google Ads", "Doğru niyeti ölçülebilir kreatif ve performans optimizasyonuyla talebe dönüştüren reklamlar.", "/images/home-experience/launch-celebration.png", "/google-ads", "GROWTH.LOOP", "scale(conversion)"],
] as const;

export default function PinnedServices() {
  return (
    <section className="pinned-services" data-cinematic data-motion-section="SERVICES" aria-labelledby="services-title">
      <div className="pinned-services-stage">
        <header><p className="eyebrow">Dromocob production timeline</p><h2 id="services-title">Bir vizyon.<br/><em>Altı üretim disiplini.</em></h2></header>
        <div className="service-filmstrip">
          {services.map(([number, title, text, image, href, system, command], index) => (
            <article className="service-frame" key={number} data-active={index === 0 ? "" : undefined} style={{ "--service-index": index, "--frame-visibility": index === 0 ? 1 : 0, "--frame-offset": index === 0 ? "0px" : "36px" } as CSSProperties}>
              <div className="service-frame-media" data-parallax><Image src={image} alt="" fill sizes="(max-width: 900px) 92vw, 48vw" /></div>
              <div className="service-tech-overlay" aria-hidden="true">
                <div className="tech-grid"/><i className="tech-scanner"/>
                <div className="tech-status"><span><i/> SYSTEM ONLINE</span><b>{system}</b><small>DC/{number}/26</small></div>
                <div className="tech-corners"><i/><i/><i/><i/></div>
                <div className="tech-terminal"><small>DROMOCOB_OS / {number}</small><code><em>const</em> output = {command};</code><span><i/> PROCESSING <b>{number}0%</b></span></div>
              </div>
              <div className="service-frame-number"><span>{number}</span><small>/ 06</small></div>
              <div className="service-frame-copy"><small>HİZMET / {number}</small><h3>{title}</h3><p>{text}</p><Link href={href}>Detayları keşfet <ArrowUpRight /></Link></div>
            </article>
          ))}
        </div>
        <div className="service-timeline" aria-hidden="true"><span>00:00</span><i/><span>END</span></div>
      </div>
    </section>
  );
}
