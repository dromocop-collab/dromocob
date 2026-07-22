"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Building2, CalendarClock, Check, CircleCheck, Clock3, Globe2, Loader2, Mail, MapPin, MessageSquareText, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { siteEmail, sitePhone, sitePhoneDisplay } from "@/lib/seo";
import QuoteLauncher from "@/components/quote-launcher";

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
            company: data.get("company"),
            subject: data.get("subject"),
            budget: data.get("budget"),
            timeline: data.get("timeline"),
            preferredContact: data.get("preferredContact"),
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

  return <main className="contact-hq">
    <section className="contact-hq-hero section">
      <div className="contact-hq-copy">
        <p className="eyebrow"><span/> Dromocob / Project Desk</p>
        <h1>Doğru proje,<br/><em>doğru soruyla</em><br/>başlar.</h1>
        <p>Yeni bir dijital ürün, marka filmi veya büyüme sistemi planlıyorsanız; hedefi, kapsamı ve doğru üretim modelini birlikte netleştirelim.</p>
        <div className="contact-hq-actions"><QuoteLauncher>Akıllı teklif oluştur <Sparkles size={17}/></QuoteLauncher><a href="#proje-formu" className="contact-hq-text-link">Doğrudan mesaj bırak <ArrowRight size={16}/></a></div>
        <div className="contact-hq-trust"><span><ShieldCheck/> Bilgileriniz korunur</span><span><Clock3/> 1 iş günü içinde dönüş</span><span><Globe2/> Türkiye geneli üretim</span></div>
      </div>
      <aside className="contact-command-card">
        <header><span><i/> PROJECT DESK ONLINE</span><small>UTC+3 / FETHİYE</small></header>
        <div className="contact-command-core"><span><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></span><i/><i/><i/></div>
        <div className="contact-command-metrics"><div><small>İlk değerlendirme</small><strong>&lt; 24 saat</strong></div><div><small>Çalışma modeli</small><strong>Uçtan uca</strong></div><div><small>Proje alanı</small><strong>TR / Global</strong></div><div><small>Durum</small><strong className="is-live">Yeni proje açık</strong></div></div>
        <footer><Sparkles/><span>Kapsam · Takvim · Yatırım · Ekip</span></footer>
      </aside>
    </section>

    <section className="contact-channel-strip">
      <a href={`mailto:${siteEmail}`}><Mail/><span><small>E-posta</small><strong>{siteEmail}</strong></span><ArrowUpRight/></a>
      <a href={`tel:${sitePhone}`}><Phone/><span><small>Telefon / WhatsApp</small><strong>{sitePhoneDisplay}</strong></span><ArrowUpRight/></a>
      <div><MapPin/><span><small>Üretim merkezi</small><strong>Fethiye · Türkiye geneli</strong></span></div>
      <div><CalendarClock/><span><small>Toplantı modeli</small><strong>Online / Yerinde</strong></span></div>
    </section>

    <section className="contact-brief section" id="proje-formu">
      <div className="contact-brief-intro"><p className="eyebrow">Direct brief / 02</p><h2>Mesaj değil,<br/><em>sağlam bir başlangıç.</em></h2><p>Detayları bildiğiniz kadar paylaşın. İlk değerlendirmede hedef, uygulanabilirlik, tahmini takvim ve bir sonraki adımı netleştiririz.</p><div className="contact-response-standard"><strong>İlk dönüş standardı</strong>{["Talebin manuel olarak incelenir", "Doğru uzmanlık ve üretim modeli belirlenir", "Net bir sonraki adım iletilir"].map(item => <span key={item}><Check/>{item}</span>)}</div></div>
      {sent ? <div className="contact-success-panel"><CircleCheck/><p className="eyebrow">Brief başarıyla iletildi</p><h2>Proje masamızda.</h2><p>Detayları inceleyip en geç bir iş günü içinde belirttiğiniz kanaldan dönüş yapacağız.</p><button className="button" onClick={() => setSent(false)}>Yeni mesaj oluştur</button></div> :
      <form className="contact-enterprise-form" onSubmit={submit}>
        <div className="contact-form-head"><div><MessageSquareText/><span><small>SECURE PROJECT BRIEF</small><strong>Projenizi anlatın</strong></span></div><b>SSL / KVKK</b></div>
        {error && <div className="auth-error">{error}</div>}
        <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hp-field" aria-hidden="true" />
        <div className="contact-field-grid"><label><span>Ad soyad *</span><input name="name" required placeholder="Adınız ve soyadınız" /></label><label><span>Firma / marka</span><div><Building2/><input name="company" placeholder="Markanızın adı" /></div></label></div>
        <div className="contact-field-grid"><label><span>Kurumsal e-posta *</span><input name="email" required type="email" placeholder="isim@marka.com" /></label><label><span>Telefon</span><input name="phone" type="tel" placeholder="+90 5xx xxx xx xx" /></label></div>
        <div className="contact-field-grid"><label><span>Proje türü *</span><select name="subject" required><option value="">Seçiniz</option><option>Web sitesi / yeniden tasarım</option><option>E-ticaret / özel yazılım</option><option>Video / film prodüksiyonu</option><option>Web + video dönüşüm sistemi</option><option>Sosyal medya / büyüme</option><option>Kurumsal iş birliği / diğer</option></select></label><label><span>Planlanan yatırım</span><select name="budget"><option>Henüz net değil</option><option>50.000 — 100.000 TL</option><option>100.000 — 250.000 TL</option><option>250.000 — 500.000 TL</option><option>500.000 TL ve üzeri</option></select></label></div>
        <div className="contact-field-grid"><label><span>Başlangıç beklentisi</span><select name="timeline"><option>Önce keşif yapalım</option><option>Mümkün olan en yakın zamanda</option><option>1 — 3 ay içinde</option><option>3 — 6 ay içinde</option></select></label><label><span>Tercih edilen dönüş</span><select name="preferredContact"><option>Telefon / WhatsApp</option><option>E-posta</option><option>Google Meet</option></select></label></div>
        <label className="contact-message-field"><span>Proje özeti *</span><textarea name="message" required minLength={10} rows={7} placeholder="Hedefiniz, mevcut durumunuz, beklediğiniz çıktılar ve varsa önemli teslim tarihiniz..." /></label>
        <div className="contact-form-submit"><p>Göndererek <Link href="/kvkk-aydinlatma">KVKK Aydınlatma Metni</Link> ve <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>&apos;nı kabul edersiniz.</p><button className="button" disabled={loading}>{loading ? <Loader2 className="spin"/> : <>Güvenli gönder <ArrowUpRight size={18}/></>}</button></div>
      </form>}
    </section>

    <section className="contact-operating section"><div className="section-head"><div><p className="eyebrow">İlk temastan üretime</p><h2>Kurumsal ve<br/><em>öngörülebilir süreç.</em></h2></div><p>Her talebi aynı gün satış görüşmesine çevirmiyoruz. Önce ihtiyacı değerlendiriyor, doğru eşleşme varsa net bir keşif süreci öneriyoruz.</p></div><div>{[["01","Değerlendirme","Brief, hedef ve mevcut durum incelenir."],["02","Keşif","Kapsam, kullanıcı, teknik ihtiyaç ve başarı kriterleri netleşir."],["03","Yol haritası","Takvim, teslimler, sorumluluklar ve yatırım çerçevesi hazırlanır."],["04","Kickoff","Onay sonrası proje alanı açılır ve üretim başlar."]].map(([number,title,copy]) => <article key={number}><span>{number}</span><i/><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  </main>;
}
