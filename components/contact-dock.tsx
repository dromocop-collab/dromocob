"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, PhoneCall, Sparkles, X } from "lucide-react";
import { sitePhone, sitePhoneDisplay } from "@/lib/seo";

const whatsappNumber = sitePhone.replace(/\D/g, "");
const whatsappMessage = encodeURIComponent("Merhaba Dromocob, bir proje hakkında bilgi almak istiyorum.");

export default function ContactDock() {
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

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

  return <div ref={dockRef} className={`contact-dock ${open ? "is-open" : ""}`}>
    {open && <section className="contact-dock-panel" aria-label="Hızlı iletişim seçenekleri">
      <header><div><span><Sparkles /></span><div><small>DROMOCOB / DIRECT LINE</small><strong>Nasıl ulaşmak istersin?</strong></div></div><button type="button" onClick={() => setOpen(false)} aria-label="İletişim menüsünü kapat"><X /></button></header>
      <div className="contact-dock-status"><i/><span><strong>Proje hattı aktif</strong><small>Genellikle aynı gün dönüş</small></span></div>
      <div className="contact-dock-actions">
        <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="is-whatsapp"><span><MessageCircle /></span><div><small>HIZLI MESAJ</small><strong>WhatsApp&apos;tan yaz</strong><em>Hazır mesajla görüşmeyi başlat</em></div><b>↗</b></a>
        <a href={`tel:${sitePhone}`} className="is-phone"><span><PhoneCall /></span><div><small>DOĞRUDAN HAT</small><strong>{sitePhoneDisplay}</strong><em>Tek dokunuşla ara</em></div><b>↗</b></a>
      </div>
      <footer>Film · Web · Growth <span>Fethiye / Türkiye</span></footer>
    </section>}
    <button type="button" className="contact-dock-trigger" onClick={() => setOpen(current => !current)} aria-label={open ? "İletişim seçeneklerini kapat" : "Telefon ve WhatsApp seçeneklerini aç"} aria-expanded={open}>
      <span className="contact-dock-rings"/><span className="contact-dock-icon">{open ? <X /> : <MessageCircle />}</span><span className="contact-dock-label"><small>HIZLI İLETİŞİM</small><strong>Telefon · WhatsApp</strong></span><i/>
    </button>
  </div>;
}
