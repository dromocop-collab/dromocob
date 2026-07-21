"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Camera, Code2, Sparkles, X } from "lucide-react";
import AdvancedQuoteWizard from "@/components/advanced-quote-wizard";
import type { AdvancedQuoteService } from "@/lib/advanced-quote-config";

export default function QuoteLauncher({ children, className = "button", ariaLabel = "Teklif motorunu aç" }: { children?: ReactNode; className?: string; ariaLabel?: string }) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [service, setService] = useState<AdvancedQuoteService | null>(null);

  useEffect(() => {
    if (!chooserOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setChooserOpen(false);
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [chooserOpen]);

  function choose(nextService: AdvancedQuoteService) {
    setChooserOpen(false);
    setService(nextService);
  }

  return <>
    <button type="button" className={className} aria-label={ariaLabel} onClick={() => setChooserOpen(true)}>{children || <>Teklif motorunu aç <ArrowRight size={18}/></>}</button>
    {chooserOpen && <div className="quote-entry-backdrop" role="dialog" aria-modal="true" aria-labelledby="quote-entry-title" onMouseDown={event => event.target === event.currentTarget && setChooserOpen(false)}>
      <section className="quote-entry-shell">
        <header><div><Sparkles/><span><small>DROMOCOB / PROJECT INTAKE</small><strong>Kapsam zekâsı aktif</strong></span></div><button type="button" onClick={() => setChooserOpen(false)} aria-label="Kapat"><X/></button></header>
        <div className="quote-entry-copy"><p>YENİ PROJE / 01</p><h2 id="quote-entry-title">Neyi birlikte<br/><em>inşa ediyoruz?</em></h2><span>Doğru sorularla kapsamı çıkaralım, yaklaşık yatırım aralığını hesaplayalım ve talebini doğrudan proje masasına ulaştıralım.</span></div>
        <div className="quote-entry-options">
          <button type="button" onClick={() => choose("web")}><i><Code2/></i><span><small>01 / DIGITAL PRODUCT</small><strong>Web & Yazılım</strong><p>Kurumsal site, e-ticaret, özel yazılım, portal ve otomasyon.</p></span><b><ArrowRight/></b></button>
          <button type="button" onClick={() => choose("video")}><i><Camera/></i><span><small>02 / PRODUCTION</small><strong>Film & Video</strong><p>Marka filmi, reklam, ürün, etkinlik ve sosyal video serileri.</p></span><b><ArrowRight/></b></button>
        </div>
        <footer><span><i/> Ortalama 3–5 dakika</span><span>İletişim bilgileri yalnızca son adımda istenir.</span></footer>
      </section>
    </div>}
    {service && <AdvancedQuoteWizard key={service} service={service} initiallyOpen hideTrigger onClose={() => setService(null)}/>} 
  </>;
}
