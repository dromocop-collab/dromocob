"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Clapperboard, Code2, MessageCircle, PhoneCall, Sparkles, Target, X } from "lucide-react";
import { sitePhone, sitePhoneDisplay } from "@/lib/seo";

const whatsappNumber = sitePhone.replace(/\D/g, "");
const whatsappMessage = encodeURIComponent("Merhaba Dromocob, bir proje hakkında bilgi almak istiyorum.");
const NOTICE_KEY = "dromocob-concierge-notice-v1";

const intents = [
  { label: "Web sitesi", icon: Code2, message: "Merhaba Dromocob, markam için kurumsal web sitesi hakkında bilgi almak istiyorum." },
  { label: "Film / video", icon: Clapperboard, message: "Merhaba Dromocob, markam için film veya video prodüksiyonu planlıyorum." },
  { label: "Nereden başlamalıyım?", icon: Target, message: "Merhaba Dromocob, projem için doğru başlangıç rotasını birlikte belirlemek istiyorum." },
] as const;

export default function ContactDock() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [intent, setIntent] = useState(2);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.sessionStorage.getItem(NOTICE_KEY)) return;
    let timer = 0;
    const reveal = () => {
      if (document.body.classList.contains("offer-is-open") || document.querySelector('[role="dialog"]')) {
        timer = window.setTimeout(reveal, 3200);
        return;
      }
      setNotice(true);
      window.sessionStorage.setItem(NOTICE_KEY, "shown");
    };
    timer = window.setTimeout(reveal, 4200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const closeOutside = (event: PointerEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  const selectedIntent = intents[intent];
  const selectedMessage = encodeURIComponent(selectedIntent?.message || decodeURIComponent(whatsappMessage));

  return <div ref={dockRef} className={`contact-dock ${open ? "is-open" : ""} ${notice ? "has-notice" : ""}`}>
    {notice && !open && <aside className="contact-dock-notice" role="status">
      <button type="button" className="dock-notice-close" onClick={() => setNotice(false)} aria-label="Bildirimi kapat"><X/></button>
      <div className="dock-notice-avatar"><span>DC</span><i/></div>
      <div><small>DROMOCOB CONCIERGE</small><strong>Size nasıl yardımcı olabiliriz?</strong><p>Projen için doğru başlangıç rotasını birlikte bulalım.</p><button type="button" onClick={() => { setNotice(false); setOpen(true); }}>Seçenekleri keşfet <ArrowUpRight/></button></div>
    </aside>}
    {open && <section className="contact-dock-panel" aria-label="Hızlı iletişim seçenekleri">
      <header><div><span><Sparkles /></span><div><small>DROMOCOB / PROJECT CONCIERGE</small><strong>Projen için doğru kanalı seç.</strong></div></div><button type="button" onClick={() => setOpen(false)} aria-label="İletişim menüsünü kapat"><X /></button></header>
      <div className="contact-dock-status"><i/><span><strong>Proje hattı aktif</strong><small>Genellikle aynı gün dönüş</small></span></div>
      <div className="contact-dock-intents"><small>NE PLANLIYORSUN?</small>{intents.map((item, index) => { const Icon = item.icon; return <button type="button" key={item.label} className={intent === index ? "is-selected" : ""} onClick={() => setIntent(index)}><Icon/><span>{item.label}</span>{intent === index && <Check/>}</button>; })}</div>
      <div className="contact-dock-actions">
        <a href={`https://wa.me/${whatsappNumber}?text=${selectedMessage}`} target="_blank" rel="noreferrer" className="is-whatsapp"><span><MessageCircle /></span><div><small>KİŞİSELLEŞTİRİLMİŞ MESAJ</small><strong>WhatsApp&apos;tan başlat</strong><em>{selectedIntent.label} rotası hazır</em></div><b>↗</b></a>
        <a href={`tel:${sitePhone}`} className="is-phone"><span><PhoneCall /></span><div><small>DOĞRUDAN HAT</small><strong>{sitePhoneDisplay}</strong><em>Tek dokunuşla ara</em></div><b>↗</b></a>
      </div>
      <footer><span><i/> Güvenli doğrudan hat</span><span>Fethiye · Türkiye</span></footer>
    </section>}
    <button type="button" className="contact-dock-trigger" onClick={() => { setNotice(false); setOpen(current => !current); }} aria-label={open ? "İletişim seçeneklerini kapat" : "Telefon ve WhatsApp seçeneklerini aç"} aria-expanded={open}>
      <span className="contact-dock-rings"/><span className="contact-dock-icon">{open ? <X /> : <MessageCircle />}</span><span className="contact-dock-label"><small>PROJECT CONCIERGE</small><strong>Nasıl yardımcı olabiliriz?</strong></span><i/>
    </button>
  </div>;
}
