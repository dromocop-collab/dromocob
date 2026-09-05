import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, Film, KeyRound, Layers3, Sparkles, WandSparkles } from "lucide-react";
import "./dromocob-ultra-showcase.css";

const tools = ["Carousel Lab", "Geçişler", "LUT Studio", "3D Metin", "Glow Lab", "SFX Hub"];

export default function DromocobUltraShowcase() {
  return (
    <section className="du-showcase section" data-cinematic data-scroll-scene="dromocob-ultra" aria-labelledby="du-showcase-title">
      <div className="du-showcase-copy">
        <p className="eyebrow"><span /> DROMOCOB ULTRA / AFTER EFFECTS</p>
        <h2 id="du-showcase-title">Yaratıcı fikri<br /><em>tek panelde</em> harekete geçir.</h2>
        <p>Carousel, geçiş, efekt, LUT, 3D metin ve ses araçlarını After Effects içinden yöneten premium yaratıcı komuta merkezi.</p>
        <div className="du-showcase-tools" aria-label="Dromocob Ultra modülleri">
          {tools.map((tool) => <span key={tool}>{tool}</span>)}
        </div>
        <div className="du-showcase-actions">
          <Link href="/uygulamalar/dromocob-ultra">Ürünü keşfet <ArrowRight /></Link>
          <a href="/downloads/Dromocob-Ultra-2.6.0.zxp" download>ZXP indir <Download /></a>
        </div>
        <div className="du-showcase-proof">
          <span><KeyRound /> License Cloud</span>
          <span><Layers3 /> Non-destructive</span>
          <span><Film /> After Effects 2026</span>
        </div>
      </div>

      <div className="du-panel" aria-label="Dromocob Ultra Carousel Lab arayüz önizlemesi">
        <div className="du-panel-glow" />
        <header>
          <span className="du-panel-brand"><Image src="/DromocobLogo.png" alt="" width={48} height={48} /><b>Dromocob Ultra</b></span>
          <span className="du-panel-version">v2.6.0 <i /></span>
        </header>
        <div className="du-panel-body">
          <aside aria-hidden="true">
            <span className="is-active"><Sparkles /></span>
            <span><WandSparkles /></span>
            <span><Film /></span>
            <span><Layers3 /></span>
          </aside>
          <div className="du-panel-content">
            <div className="du-panel-heading"><span><small>CAROUSEL LAB</small><strong>3D Yörünge</strong></span><b><i /> HAZIR</b></div>
            <div className="du-orbit-demo" aria-hidden="true">
              <span className="du-orbit-line" />
              <i className="du-card du-card-one" />
              <i className="du-card du-card-two" />
              <i className="du-card du-card-three" />
              <i className="du-card du-card-four" />
              <i className="du-card du-card-five" />
              <b><Image src="/DromocobLogo.png" alt="" width={92} height={92} /></b>
            </div>
            <div className="du-control-row"><span><small>AKTİF KART</small><strong>04</strong></span><span><small>YARIÇAP</small><strong>860</strong></span><span><small>ODAK</small><strong>%118</strong></span></div>
            <button type="button" tabIndex={-1} aria-hidden="true">CAROUSEL OLUŞTUR <ArrowRight /></button>
          </div>
        </div>
        <footer><span><i /> COMPOSITION CONNECTED</span><b>8 LAYER / 30 FPS</b></footer>
      </div>
    </section>
  );
}
