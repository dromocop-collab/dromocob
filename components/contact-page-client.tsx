"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { siteEmail, sitePhone, sitePhoneDisplay } from "@/lib/seo";

export default function ContactPageClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        "/api/public/leads",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            type: "contact",
            website: data.get("website"),
            name: data.get("name"),
            email: data.get("email"),
            phone: data.get("phone"),
            subject: data.get("subject"),
            message: data.get("message"),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await response.text()
        );
      }

      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Mesaj gönderilemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section contact-layout">
      <div className="contact-copy">
        <p className="eyebrow">Contact / Let&apos;s build</p>
        <h1>Bir fikrin varsa,<br/><span>masaya koyalım.</span></h1>
        <p>Projenin ne kadar ham olduğu önemli değil. Hedefi birlikte netleştiririz.</p>
        <div className="contact-direct"><a href={`mailto:${siteEmail}`}>{siteEmail} <ArrowUpRight size={18}/></a><a href={`tel:${sitePhone}`}>{sitePhoneDisplay} <ArrowUpRight size={18}/></a></div>
      </div>
      {sent ? <div className="success-panel"><span>✓</span><h2>Mesaj alındı.</h2><p>Proje detaylarını inceleyip dönüş yapacağım.</p></div> :
      <form className="contact-form" onSubmit={submit}>
        {error && <div className="auth-error">{error}</div>}
        <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hp-field" aria-hidden="true" />
        <label>Ad soyad<input name="name" required placeholder="İsmin" /></label>
        <div className="form-row"><label>E-posta<input name="email" required type="email" placeholder="mail@adres.com" /></label><label>Telefon<input name="phone" placeholder="+90..." /></label></div>
        <label>Proje türü<select name="subject"><option>Web sitesi / özel yazılım</option><option>Video prodüksiyon</option><option>Sosyal medya / büyüme</option><option>Diğer</option></select></label>
        <label>Projen<textarea name="message" required rows={7} placeholder="Ne yapmak istiyorsun? Hedefin ne?" /></label>
        <p className="form-legal">Formu göndererek <Link href="/kvkk-aydinlatma">KVKK Aydınlatma Metni</Link> ve <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link> koşullarını kabul etmiş olursun.</p>
        <button className="button" disabled={loading}>{loading ? <Loader2 className="spin"/> : "Mesajı Gönder"} <ArrowUpRight size={18}/></button>
      </form>}
    </section>
  );
}
