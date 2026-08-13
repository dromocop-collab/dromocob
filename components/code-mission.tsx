"use client";

import { ArrowRight, Check, Clapperboard, Code2, Cpu, Gauge, Layers3, Play, RotateCcw, ShieldCheck, Sparkles, Target, Terminal, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import AdvancedQuoteWizard from "@/components/advanced-quote-wizard";
import type { AdvancedQuoteService } from "@/lib/advanced-quote-config";

const modules = [
  {
    id: "strategy",
    label: "01 / STRATEGY",
    title: "Sinyali çöz",
    command: "scan --brand --intent",
    output: ["> Hedef kitle sinyalleri taranıyor…", "> Marka çekirdeği bulundu", "✓ STRATEGY_MODULE ONLINE"],
    icon: Cpu,
  },
  {
    id: "experience",
    label: "02 / EXPERIENCE",
    title: "Deneyimi derle",
    command: "build --web --cinematic",
    output: ["> Bileşen grafiği oluşturuluyor…", "> Motion layer bağlandı", "✓ EXPERIENCE_ENGINE ONLINE"],
    icon: Code2,
  },
  {
    id: "growth",
    label: "03 / GROWTH",
    title: "Sistemi yayınla",
    command: "deploy --measure --scale",
    output: ["> Production ortamı doğrulanıyor…", "> Analytics stream aktif", "✓ GROWTH_LOOP ONLINE"],
    icon: Zap,
  },
] as const;

export default function CodeMission() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<"digital" | "film" | "flagship">("flagship");
  const [quoteService, setQuoteService] = useState<AdvancedQuoteService | null>(null);
  const current = modules[active];
  const finished = completed.length === modules.length;
  const progress = Math.round((completed.length / modules.length) * 100);
  const log = useMemo(() => modules.flatMap(module => completed.includes(module.id) ? module.output : []), [completed]);

  function runModule() {
    if (running || finished || completed.includes(current.id)) return;
    setRunning(true);
    window.setTimeout(() => {
      setCompleted(previous => [...previous, current.id]);
      setRunning(false);
      setActive(index => Math.min(index + 1, modules.length - 1));
    }, 760);
  }

  function reset() {
    setCompleted([]);
    setActive(0);
    setRunning(false);
  }

  return (
    <section className="section code-mission" data-cinematic aria-labelledby="code-mission-title">
      <div className="code-mission-head">
        <div><p className="eyebrow"><Terminal/> Interactive build lab</p><h2 id="code-mission-title">Fikrini çalıştır.<br/><em>Sistemi aktive et.</em></h2></div>
        <p>Üç modülü sırayla çalıştır. Dromocob&apos;un strateji, deneyim ve büyüme katmanlarının tek sistemde nasıl birleştiğini keşfet.</p>
      </div>

      <div className={`code-game ${finished ? "is-complete" : ""}`}>
        <div className="code-game-topbar"><span><i/> DROMOCOB_BUILD_OS</span><div><b>SESSION 0X26</b><small>{progress}% COMPLETE</small></div></div>

        <aside className="code-module-map" aria-label="Görev modülleri">
          <span className="code-map-line"><i style={{ height: `${progress}%` }}/></span>
          {modules.map((module, index) => {
            const Icon = module.icon;
            const done = completed.includes(module.id);
            return <button key={module.id} type="button" className={`${active === index ? "is-active" : ""} ${done ? "is-done" : ""}`} onClick={() => !running && setActive(index)} disabled={!done && index > completed.length}>
              <i>{done ? <Check/> : <Icon/>}</i><span><small>{module.label}</small><strong>{module.title}</strong></span><b>{done ? "ONLINE" : active === index ? "READY" : "LOCKED"}</b>
            </button>;
          })}
        </aside>

        <div className="code-terminal-panel">
          <header><span/><span/><span/><b>mission-control.ts</b><small>UTF-8&nbsp;&nbsp; TYPESCRIPT</small></header>
          <div className="code-editor">
            <span className="code-lines">01<br/>02<br/>03<br/>04<br/>05<br/>06<br/>07</span>
            <pre><code><em>import</em> &#123; createExperience &#125; <em>from</em> <q>&quot;@dromocob/core&quot;</q>;

<em>const</em> mission = createExperience(&#123;
  module: <q>&quot;{current.id}&quot;</q>,
  command: <q>&quot;{current.command}&quot;</q>,
  status: <b>{finished ? "COMPLETE" : running ? "COMPILING" : "READY"}</b>
&#125;);</code></pre>
            <div className="code-orbit" aria-hidden="true"><i/><i/><i/><span><Code2/></span></div>
          </div>
          <div className="code-console" aria-live="polite">
            <div><Terminal/> OUTPUT <span>{running ? "PROCESSING" : "STANDBY"}</span></div>
            <pre>{log.length ? log.join("\n") : "> Başlatmak için RUN MODULE komutunu çalıştır."}{running ? "\n> compiling █" : ""}</pre>
          </div>
        </div>

        <div className="code-game-action">
          <div className="code-health"><span>SYSTEM INTEGRITY</span><div><i style={{ width: `${Math.max(12, progress)}%` }}/></div><b>{Math.max(12, progress)}%</b></div>
          {finished ? <button type="button" onClick={() => document.querySelector(".mission-result")?.scrollIntoView({ behavior: "smooth", block: "center" })}><ShieldCheck/> Sonuç merkezini aç <ArrowRight/></button> : <button type="button" onClick={runModule} disabled={running || completed.includes(current.id)}><Play/> {running ? "COMPILING…" : completed.includes(current.id) ? "MODULE ONLINE" : "RUN MODULE"}<span>⌘↵</span></button>}
          <button className="code-reset" type="button" onClick={reset} aria-label="Görevi sıfırla"><RotateCcw/></button>
        </div>
      </div>

      {finished && <div className="mission-result">
        <header className="mission-result-head"><div><span><Check/> MISSION COMPLETE</span><h3>Sistem hazır.<br/><em>Şimdi doğru yatırım rotasını seç.</em></h3><p>Genel iletişim formu yok. Seçimine göre kapsam, yatırım ve teslim planını çıkaran profesyonel proje motoruna geçeceksin.</p></div><aside><small>BUILD SCORE</small><strong>100</strong><span>/100</span><b><i/> HIGH POTENTIAL</b></aside></header>

        <div className="mission-route-grid" role="radiogroup" aria-label="Proje rotası">
          <button type="button" role="radio" aria-checked={selectedRoute === "digital"} className={selectedRoute === "digital" ? "is-selected" : ""} onClick={() => setSelectedRoute("digital")}><i><Code2/></i><span><small>ROUTE 01 / DIGITAL</small><strong>Web & Yazılım Sistemi</strong><p>Kurumsal site, e-ticaret, portal, otomasyon veya özel web ürünü.</p></span><b>{selectedRoute === "digital" ? <Check/> : "+"}</b></button>
          <button type="button" role="radio" aria-checked={selectedRoute === "film"} className={selectedRoute === "film" ? "is-selected" : ""} onClick={() => setSelectedRoute("film")}><i><Clapperboard/></i><span><small>ROUTE 02 / PRODUCTION</small><strong>Film & İçerik Sistemi</strong><p>Marka filmi, reklam prodüksiyonu ve çok formatlı içerik motoru.</p></span><b>{selectedRoute === "film" ? <Check/> : "+"}</b></button>
          <button type="button" role="radio" aria-checked={selectedRoute === "flagship"} className={selectedRoute === "flagship" ? "is-selected" : ""} onClick={() => setSelectedRoute("flagship")}><i><Layers3/></i><span><small>ROUTE 03 / RECOMMENDED</small><strong>Digital Flagship</strong><p>Web, film ve büyümeyi tek lansman sistemi altında birleştiren premium rota.</p></span><b>{selectedRoute === "flagship" ? <Check/> : "+"}</b></button>
        </div>

        <div className="mission-blueprint">
          <div className="blueprint-main"><p><Sparkles/> DROMOCOB SCOPE INTELLIGENCE</p><h4>{selectedRoute === "digital" ? "Dönüşüm odaklı dijital ürün" : selectedRoute === "film" ? "Sinematik marka iletişimi" : "Uçtan uca dijital amiral gemisi"}</h4><div className="blueprint-flow"><span><i><Target/></i><b>Keşif</b><small>Hedef + fırsat</small></span><em/><span><i><Layers3/></i><b>Üretim</b><small>Tasarım + build</small></span><em/><span><i><Gauge/></i><b>Büyüme</b><small>Ölçüm + scale</small></span></div></div>
          <aside><div><small>ÖNERİLEN BAŞLANGIÇ</small><strong>{selectedRoute === "digital" ? "Web scope analizi" : selectedRoute === "film" ? "Prodüksiyon briefi" : "Hibrit keşif sprinti"}</strong></div><div><small>TAHMİNİ PLAN</small><strong>{selectedRoute === "digital" ? "4–10 hafta" : selectedRoute === "film" ? "2–6 hafta" : "8–14 hafta"}</strong></div><div><small>SONRAKİ ADIM</small><strong>3–5 dk kapsam motoru</strong></div><button type="button" onClick={() => setQuoteService(selectedRoute === "film" ? "video" : "web")}><span><small>İLETİŞİM FORMU DEĞİL</small>Akıllı proje kapsamını başlat</span><ArrowRight/></button></aside>
        </div>
      </div>}
      {quoteService && <AdvancedQuoteWizard service={quoteService} initiallyOpen hideTrigger onClose={() => setQuoteService(null)}/>} 
    </section>
  );
}
