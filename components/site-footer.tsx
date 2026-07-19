"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Clapperboard,
  Code2,
  AtSign,
  ExternalLink,
  Loader2,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";

type SubscribeState = "idle" | "loading" | "success" | "error";

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubscribeState>("idle");
  const [message, setMessage] = useState("");

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          email,
          website: String(form.get("website") || ""),
        }),
      });

      const responseText = await response.text();
      let result: { ok?: boolean; stored?: boolean; message?: string } = {};

      try {
        result = JSON.parse(responseText) as typeof result;
      } catch {
        result = { message: responseText };
      }

      if (!response.ok || result.stored !== true) {
        throw new Error(result.message || "Abonelik kaydı doğrulanamadı. Lütfen tekrar dene.");
      }

      setEmail("");
      setState("success");
      setMessage("Aboneliğin aktif. Yeni üretimleri sana ileteceğiz.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Abonelik tamamlanamadı.");
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-signal"><span><i/> İstanbul’dan dünyaya üretim</span><span>Web Application · Film Production · Growth</span></div>

      <section className="footer-cta">
        <div>
          <p className="eyebrow"><Sparkles size={15}/> Sıradaki büyük fikir</p>
          <h2>Markanı birlikte<br/><em>ileri taşıyalım.</em></h2>
        </div>
        <Link href="/iletisim" className="footer-cta-link"><span>Projeyi<br/>başlat</span><ArrowUpRight/></Link>
      </section>

      <section className="footer-newsletter">
        <div className="footer-newsletter-copy">
          <span><Mail size={18}/></span>
          <div><p className="eyebrow">Dromocob Dispatch</p><h3>Yeni projeler, teknoloji ve prodüksiyon notları.</h3></div>
        </div>
        <form onSubmit={subscribe}>
          <input className="footer-honeypot" name="website" tabIndex={-1} autoComplete="new-password" aria-hidden="true" data-form-type="other" />
          <label><span>E-posta adresin</span><input type="email" name="subscriber_email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="info@markan.com" required disabled={state === "loading"}/></label>
          <button type="submit" disabled={state === "loading"} aria-label="E-posta listesine abone ol">
            {state === "loading" ? <Loader2 className="spin"/> : state === "success" ? <Check/> : <Send/>}
          </button>
        </form>
        <p className={`footer-form-message is-${state}`} aria-live="polite">{message || <>Abone olarak <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>&apos;nı kabul edersin. İstediğin zaman ayrılabilirsin.</>}</p>
      </section>

      <section className="footer-directory">
        <div className="footer-brand-block">
          <Link className="footer-brand" href="/"><span className="brand-dot"/>DROMOCOB</Link>
          <p>Strateji, teknoloji ve sinematik üretimi tek sistemde birleştiren bağımsız dijital stüdyo.</p>
          <div className="footer-status"><i/> Tüm sistemler aktif <small>UTC+3</small></div>
        </div>

        <nav><p>Yetkinlikler</p><Link href="/hizmetler/web-tasarim">Web Tasarım <Code2/></Link><Link href="/hizmetler/video-film-produksiyon">Video & Film <Clapperboard/></Link><Link href="/paketler">Digital Flagship <Sparkles/></Link><Link href="/kurumsal">Growth Systems <ArrowUpRight/></Link></nav>
        <nav><p>Keşfet</p><Link href="/">Anasayfa</Link><Link href="/projeler">Projeler</Link><Link href="/hakkimda">Hakkımda</Link><Link href="/kurumsal">Kurumsal</Link><Link href="/iletisim">İletişim</Link></nav>
        <div className="footer-contact"><p>İletişim</p><a href="mailto:info@dromocob.com">info@dromocob.com <ArrowUpRight/></a><span>İstanbul, Türkiye<br/>Remote worldwide</span><div><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><AtSign/></a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><ExternalLink/></a></div></div>
      </section>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Dromocob. Tüm hakları saklıdır.</span>
        <div><Link href="/kvkk-aydinlatma">KVKK</Link><Link href="/gizlilik-politikasi">Gizlilik</Link><Link href="/admin">Admin</Link></div>
        <span>Designed & engineered by Dromocob</span>
      </div>
    </footer>
  );
}
