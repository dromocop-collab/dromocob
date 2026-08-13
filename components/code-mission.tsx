"use client";

import { ArrowRight, Check, Clapperboard, Code2, Cpu, Gauge, Layers3, Play, RotateCcw, ShieldCheck, Sparkles, Target, Terminal, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import AdvancedQuoteWizard from "@/components/advanced-quote-wizard";
import type { AdvancedQuoteService } from "@/lib/advanced-quote-config";

const modules = [
  {
    id: "strategy",
    label: "01 / STRATEJİ",
    title: "Hedefi belirle",
    command: "scan --brand --intent",
    output: ["> Hedef kitle analiz ediliyor…", "> Marka fırsatı belirlendi", "✓ STRATEJİ MODÜLÜ HAZIR"],
    icon: Cpu,
  },
  {
    id: "experience",
    label: "02 / DENEYİM",
    title: "Deneyimi oluştur",
    command: "build --web --cinematic",
    output: ["> Sayfa deneyimi oluşturuluyor…", "> Animasyon sistemi bağlandı", "✓ DENEYİM MODÜLÜ HAZIR"],
    icon: Code2,
  },
  {
    id: "growth",
    label: "03 / BÜYÜME",
    title: "Ölçümü bağla",
    command: "deploy --measure --scale",
    output: ["> Yayın kontrolleri yapılıyor…", "> Dönüşüm ölçümü aktif", "✓ BÜYÜME MODÜLÜ HAZIR"],
    icon: Zap,
  },
] as const;

export default function CodeMission() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<"digital" | "film" | "flagship" | null>(null);
  const [quoteService, setQuoteService] = useState<AdvancedQuoteService | null>(null);
  const [finalRunning, setFinalRunning] = useState(false);
  const [systemLaunched, setSystemLaunched] = useState(false);
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
    setFinalRunning(false);
    setSystemLaunched(false);
  }

  function runFinalSystem() {
    if (finalRunning || !selectedRoute) return;
    setFinalRunning(true);
    window.setTimeout(() => setSystemLaunched(true), 1350);
    window.setTimeout(() => {
      setQuoteService(selectedRoute === "film" ? "video" : "web");
      setFinalRunning(false);
      setSystemLaunched(false);
    }, 2450);
  }

  return (
    <section className="section code-mission" data-cinematic aria-labelledby="code-mission-title">
      <div className="code-mission-head">
        <div><p className="eyebrow"><Terminal/> Etkileşimli proje simülasyonu</p><h2 id="code-mission-title">Fikrini çalıştır.<br/><em>Sistemini kur.</em></h2></div>
        <p>Üç adımı sırayla tamamla. Hedef, kullanıcı deneyimi ve ölçüm katmanlarının projen için nasıl tek bir sisteme dönüştüğünü net biçimde gör.</p>
      </div>

      <div className={`code-game ${finished ? "is-complete" : ""}`}>
        <div className="code-game-topbar"><span><i/> DROMOCOB PROJE MOTORU</span><div><b>PROJE OTURUMU</b><small>%{progress} TAMAMLANDI</small></div></div>

        <aside className="code-module-map" aria-label="Görev modülleri">
          <span className="code-map-line"><i style={{ height: `${progress}%` }}/></span>
          {modules.map((module, index) => {
            const Icon = module.icon;
            const done = completed.includes(module.id);
            return <button key={module.id} type="button" className={`${active === index ? "is-active" : ""} ${done ? "is-done" : ""}`} onClick={() => !running && setActive(index)} disabled={!done && index > completed.length}>
              <i>{done ? <Check/> : <Icon/>}</i><span><small>{module.label}</small><strong>{module.title}</strong></span><b>{done ? "HAZIR" : active === index ? "BAŞLAT" : "KİLİTLİ"}</b>
            </button>;
          })}
        </aside>

        <div className="code-terminal-panel">
          <header><span/><span/><span/><b>proje-kontrol-merkezi</b><small>CANLI SİMÜLASYON</small></header>
          <div className="code-editor">
            <span className="code-lines">01<br/>02<br/>03<br/>04<br/>05<br/>06<br/>07</span>
            <pre><code><em>import</em> &#123; createExperience &#125; <em>from</em> <q>&quot;@dromocob/core&quot;</q>;

<em>const</em> mission = createExperience(&#123;
  module: <q>&quot;{current.id}&quot;</q>,
  command: <q>&quot;{current.command}&quot;</q>,
  durum: <b>{finished ? "TAMAMLANDI" : running ? "OLUŞTURULUYOR" : "BAŞLAMAYA HAZIR"}</b>
&#125;);</code></pre>
            <div className="code-orbit" aria-hidden="true"><i/><i/><i/><span><Code2/></span></div>
          </div>
          <div className="code-console" aria-live="polite">
            <div><Terminal/> İŞLEM GÜNLÜĞÜ <span>{running ? "ÇALIŞIYOR" : "BEKLİYOR"}</span></div>
            <pre>{log.length ? log.join("\n") : "> Başlamak için aşağıdaki ADIMI ÇALIŞTIR butonuna bas."}{running ? "\n> sistem hazırlanıyor █" : ""}</pre>
          </div>
        </div>

        <div className="code-game-action">
          <div className="code-health"><span>SİSTEM İLERLEMESİ</span><div><i style={{ width: `${Math.max(12, progress)}%` }}/></div><b>%{Math.max(12, progress)}</b></div>
          {finished ? <button type="button" onClick={() => document.querySelector(".mission-result")?.scrollIntoView({ behavior: "smooth", block: "center" })}><ShieldCheck/> Proje rotanı seç <ArrowRight/></button> : <button type="button" onClick={runModule} disabled={running || completed.includes(current.id)}><Play/> {running ? "HAZIRLANIYOR…" : completed.includes(current.id) ? "ADIM TAMAMLANDI" : "ADIMI ÇALIŞTIR"}<span>⌘↵</span></button>}
          <button className="code-reset" type="button" onClick={reset} aria-label="Görevi sıfırla"><RotateCcw/></button>
        </div>
      </div>

      {finished && <div className="mission-result">
        <header className="mission-result-head"><div><span><Check/> İLK ANALİZ TAMAMLANDI</span><h3>Temel hazır.<br/><em>Şimdi proje türünü seç.</em></h3><p>Sana uygun seçeneği işaretle. Ardından “Sistemi Son Kez Çalıştır” butonu açılacak ve seçimine özel kapsam formuna yönlendirileceksin.</p></div><aside><small>HAZIRLIK PUANI</small><strong>100</strong><span>/100</span><b><i/> YÜKSEK POTANSİYEL</b></aside></header>

        <div className="mission-route-grid" role="radiogroup" aria-label="Proje rotası">
          <button type="button" role="radio" aria-checked={selectedRoute === "digital"} className={selectedRoute === "digital" ? "is-selected" : ""} onClick={() => setSelectedRoute("digital")}><i><Code2/></i><span><small>SEÇENEK 01 / DİJİTAL</small><strong>Web Sitesi & Yazılım</strong><p>Kurumsal site, e-ticaret, müşteri paneli veya özel web yazılımı.</p></span><b>{selectedRoute === "digital" ? <Check/> : "+"}</b></button>
          <button type="button" role="radio" aria-checked={selectedRoute === "film"} className={selectedRoute === "film" ? "is-selected" : ""} onClick={() => setSelectedRoute("film")}><i><Clapperboard/></i><span><small>SEÇENEK 02 / PRODÜKSİYON</small><strong>Film & Video İçerik</strong><p>Marka filmi, drone çekimi, reklam prodüksiyonu ve sosyal medya içeriği.</p></span><b>{selectedRoute === "film" ? <Check/> : "+"}</b></button>
          <button type="button" role="radio" aria-checked={selectedRoute === "flagship"} className={selectedRoute === "flagship" ? "is-selected" : ""} onClick={() => setSelectedRoute("flagship")}><i><Layers3/></i><span><small>SEÇENEK 03 / ÖNERİLEN</small><strong>Web + Film Bütünleşik</strong><p>Web, prodüksiyon ve büyümeyi tek lansman sistemi altında birleştiren premium çözüm.</p></span><b>{selectedRoute === "flagship" ? <Check/> : "+"}</b></button>
        </div>

        <div className="mission-blueprint">
          <div className="blueprint-main"><p><Sparkles/> DROMOCOB SCOPE INTELLIGENCE</p><h4>{selectedRoute === "digital" ? "Dönüşüm odaklı dijital ürün" : selectedRoute === "film" ? "Sinematik marka iletişimi" : "Uçtan uca dijital amiral gemisi"}</h4><div className="blueprint-flow"><span><i><Target/></i><b>Keşif</b><small>Hedef + fırsat</small></span><em/><span><i><Layers3/></i><b>Üretim</b><small>Tasarım + build</small></span><em/><span><i><Gauge/></i><b>Büyüme</b><small>Ölçüm + scale</small></span></div></div>
          <aside><div><small>ÖNERİLEN BAŞLANGIÇ</small><strong>{!selectedRoute ? "Önce proje türünü seç" : selectedRoute === "digital" ? "Web kapsam analizi" : selectedRoute === "film" ? "Prodüksiyon ihtiyaç formu" : "Bütünleşik keşif planı"}</strong></div><div><small>TAHMİNİ PLAN</small><strong>{!selectedRoute ? "Seçim sonrası hesaplanır" : selectedRoute === "digital" ? "4–10 hafta" : selectedRoute === "film" ? "2–6 hafta" : "8–14 hafta"}</strong></div><div><small>SONRAKİ ADIM</small><strong>3–5 dakikalık akıllı form</strong></div><button type="button" className="mission-final-run" onClick={runFinalSystem} disabled={finalRunning || !selectedRoute}><span><small>{selectedRoute ? "SEÇİMİNİ ONAYLA" : "PROJE TÜRÜ BEKLENİYOR"}</small>{finalRunning ? "Sistem hazırlanıyor…" : "Sistemi Son Kez Çalıştır"}</span><Play/></button></aside>
        </div>
      </div>}
      {(finalRunning || systemLaunched) && <div className={`mission-launch ${systemLaunched ? "is-ready" : ""}`} role="status" aria-live="polite"><div className="mission-launch-grid"/><div className="mission-launch-core"><i/><i/><i/><span>{systemLaunched ? <Check/> : <Zap/>}</span></div><p>{systemLaunched ? "PROJE MOTORU HAZIR" : "SEÇİMİN ANALİZ EDİLİYOR"}</p><h3>{systemLaunched ? "Sana özel kapsam açılıyor." : "Strateji · Deneyim · Büyüme"}</h3><div className="mission-launch-track"><span/></div><small>{systemLaunched ? "Şimdi ihtiyaçlarını netleştiriyoruz" : "Lütfen birkaç saniye bekle"}</small></div>}
      {quoteService && <AdvancedQuoteWizard service={quoteService} initiallyOpen hideTrigger onClose={() => setQuoteService(null)}/>} 
    </section>
  );
}
