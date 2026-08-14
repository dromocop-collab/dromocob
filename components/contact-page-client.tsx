"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, CalendarClock, Check, CircleCheck, Clock3, FileText, Globe2, Layers3, Loader2, Mail, MapPin, MessageSquareText, Phone, Radar, ShieldCheck, Sparkles, UserRound, Zap } from "lucide-react";
import { siteEmail, sitePhone, sitePhoneDisplay } from "@/lib/seo";
import QuoteLauncher from "@/components/quote-launcher";
import { reportLeadConversion } from "@/lib/client-conversions";

export default function ContactPageClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formStep, setFormStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [formSnapshot, setFormSnapshot] = useState({ subject: "", budget: "Henüz net değil", timeline: "Önce keşif yapalım", preferredContact: "Telefon / WhatsApp" });
  const pageRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = [...page.querySelectorAll<HTMLElement>("[data-contact-reveal]")];
    if (reduceMotion) revealItems.forEach(item => item.classList.add("is-visible"));
    const observer = reduceMotion ? null : new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      (entry.target as HTMLElement).classList.add("is-visible");
      observer?.unobserve(entry.target);
    }), { threshold: .14, rootMargin: "0px 0px -8%" });
    revealItems.forEach(item => observer?.observe(item));

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      page.style.setProperty("--contact-scroll", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateProgress); };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function moveCommandCard(event: React.PointerEvent<HTMLElement>) {
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${((event.clientX - rect.left) / rect.width - .5) * 2}`);
    event.currentTarget.style.setProperty("--pointer-y", `${((event.clientY - rect.top) / rect.height - .5) * 2}`);
  }

  function goToNextStep() {
    const stage = formRef.current?.querySelector<HTMLElement>("[data-form-stage]:not([hidden])");
    const requiredFields = [...(stage?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]") || [])];
    const invalid = requiredFields.find(field => !field.checkValidity());
    if (invalid) return invalid.reportValidity();
    const currentStage = Number(stage?.dataset.formStage || 0);
    const next = Math.min(2, currentStage + 1);
    setFormStep(next);
    setFurthestStep(furthest => Math.max(furthest, next));
  }

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

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.message || "Form gönderilemedi."
        );
      }

      reportLeadConversion({ id: String(result.conversionId || result.referenceId || ""), type: "contact_submit", value: Number(result.conversionValue || 10000), service: String(data.get("subject") || "Genel proje") });
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

  return <main ref={pageRef} className="contact-hq">
    <div className="contact-scroll-progress" aria-hidden="true"><span/></div>
    <section className="contact-hq-hero section" data-contact-reveal>
      <div className="contact-hq-ambient" aria-hidden="true"><i/><i/><i/><span>PROJECT SIGNAL / LIVE</span></div>
      <div className="contact-hq-copy">
        <p className="eyebrow"><span/> Dromocob / Project Desk</p>
        <h1>Doğru proje,<br/><em>doğru soruyla</em><br/>başlar.</h1>
        <p>Yeni bir dijital ürün, marka filmi veya büyüme sistemi planlıyorsanız; hedefi, kapsamı ve doğru üretim modelini birlikte netleştirelim.</p>
        <div className="contact-hq-actions"><QuoteLauncher>Akıllı teklif oluştur <Sparkles size={17}/></QuoteLauncher><a href="#proje-formu" className="contact-hq-text-link">Doğrudan mesaj bırak <ArrowRight size={16}/></a></div>
        <div className="contact-hq-trust"><span><ShieldCheck/> Bilgileriniz korunur</span><span><Clock3/> 1 iş günü içinde dönüş</span><span><Globe2/> Türkiye geneli üretim</span></div>
      </div>
      <aside className="contact-command-card" onPointerMove={moveCommandCard} onPointerLeave={event => { event.currentTarget.style.setProperty("--pointer-x", "0"); event.currentTarget.style.setProperty("--pointer-y", "0"); }}>
        <header><span><i/> PROJECT DESK ONLINE</span><small>UTC+3 / FETHİYE</small></header>
        <div className="contact-command-core"><span><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></span><i/><i/><i/></div>
        <div className="contact-command-metrics"><div><small>İlk değerlendirme</small><strong>&lt; 24 saat</strong></div><div><small>Çalışma modeli</small><strong>Uçtan uca</strong></div><div><small>Proje alanı</small><strong>TR / Global</strong></div><div><small>Durum</small><strong className="is-live">Yeni proje açık</strong></div></div>
        <footer><Sparkles/><span>Kapsam · Takvim · Yatırım · Ekip</span></footer>
      </aside>
    </section>

    <section className="contact-channel-strip" data-contact-reveal>
      <a href={`mailto:${siteEmail}`}><Mail/><span><small>E-posta</small><strong>{siteEmail}</strong></span><ArrowUpRight/></a>
      <a href={`tel:${sitePhone}`}><Phone/><span><small>Telefon / WhatsApp</small><strong>{sitePhoneDisplay}</strong></span><ArrowUpRight/></a>
      <div><MapPin/><span><small>Üretim merkezi</small><strong>Fethiye · Türkiye geneli</strong></span></div>
      <div><CalendarClock/><span><small>Toplantı modeli</small><strong>Online / Yerinde</strong></span></div>
    </section>

    <div className="contact-signal-ticker" aria-label="Aktif proje hizmetleri" data-contact-reveal><div>{["WEB APPLICATION", "FILM PRODUCTION", "BRAND SYSTEM", "GROWTH ENGINE", "E-COMMERCE", "MOBILE EXPERIENCE", "WEB APPLICATION", "FILM PRODUCTION"].map((item,index) => <span key={`${item}-${index}`}><i/>{item}</span>)}</div></div>

    <section className="contact-brief section" id="proje-formu" data-contact-reveal>
      <div className="contact-brief-intro"><p className="eyebrow">Direct brief / 02</p><h2>Mesaj değil,<br/><em>sağlam bir başlangıç.</em></h2><p>Detayları bildiğiniz kadar paylaşın. İlk değerlendirmede hedef, uygulanabilirlik, tahmini takvim ve bir sonraki adımı netleştiririz.</p><div className="contact-response-standard"><strong>İlk dönüş standardı</strong>{["Talebin manuel olarak incelenir", "Doğru uzmanlık ve üretim modeli belirlenir", "Net bir sonraki adım iletilir"].map(item => <span key={item}><Check/>{item}</span>)}</div></div>
      {sent ? <div className="contact-success-panel"><CircleCheck/><p className="eyebrow">Brief başarıyla iletildi</p><h2>Proje masamızda.</h2><p>Detayları inceleyip en geç bir iş günü içinde belirttiğiniz kanaldan dönüş yapacağız.</p><button className="button" onClick={() => setSent(false)}>Yeni mesaj oluştur</button></div> :
      <form ref={formRef} className="contact-enterprise-form" onSubmit={submit} data-contact-reveal onChange={event => {
        const field = event.target;
        if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
        if (["subject", "budget", "timeline", "preferredContact"].includes(field.name)) setFormSnapshot(current => ({ ...current, [field.name]: field.value }));
      }}>
        <div className="contact-form-head"><div><MessageSquareText/><span><small>SECURE PROJECT BRIEF</small><strong>Projenizi anlatın</strong></span></div><b>SSL / KVKK</b></div>
        <div className="contact-form-progress"><span style={{ width: `${((formStep + 1) / 3) * 100}%` }}/></div>
        <nav className="contact-form-system" aria-label="Brief adımları">
          {[{ label: "İletişim", icon: UserRound }, { label: "Kapsam", icon: Layers3 }, { label: "Gönderim", icon: FileText }].map(({ label, icon: Icon }, index) => <button type="button" key={label} className={index === formStep ? "is-active" : index < formStep ? "is-complete" : ""} disabled={index > furthestStep} onClick={() => setFormStep(index)}><i>{index < formStep ? <Check/> : <Icon/>}</i><span><small>0{index + 1}</small><strong>{label}</strong></span></button>)}
          <b><i/> GÜVENLİ BAĞLANTI</b>
        </nav>
        {error && <div className="auth-error">{error}</div>}
        <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hp-field" aria-hidden="true" />
        <div className="contact-form-workspace">
          <div className="contact-form-stage" data-form-stage="0" hidden={formStep !== 0}><header><span>01</span><div><small>KİMLİK / İLETİŞİM</small><h3>Önce tanışalım.</h3><p>Size ulaşabileceğimiz temel bilgileri paylaşın.</p></div></header><div className="contact-field-grid"><label><span>Ad soyad *</span><input name="name" required placeholder="Adınız ve soyadınız" autoComplete="name" /></label><label><span>Firma / marka</span><div><Building2/><input name="company" placeholder="Markanızın adı" autoComplete="organization" /></div></label></div><div className="contact-field-grid"><label><span>Kurumsal e-posta *</span><input name="email" required type="email" placeholder="isim@marka.com" autoComplete="email" /></label><label><span>Telefon</span><input name="phone" type="tel" placeholder="+90 5xx xxx xx xx" autoComplete="tel" /></label></div></div>
          <div className="contact-form-stage" data-form-stage="1" hidden={formStep !== 1}><header><span>02</span><div><small>PROJE / KAPSAM</small><h3>Rotayı belirleyelim.</h3><p>İhtiyaç, yatırım ve zamanlama sinyallerini netleştirin.</p></div></header><div className="contact-field-grid"><label><span>Proje türü *</span><select name="subject" required defaultValue=""><option value="">Seçiniz</option><option>Web sitesi / yeniden tasarım</option><option>E-ticaret / özel yazılım</option><option>Video / film prodüksiyonu</option><option>Web + video dönüşüm sistemi</option><option>Sosyal medya / büyüme</option><option>Kurumsal iş birliği / diğer</option></select></label><label><span>Planlanan yatırım</span><select name="budget"><option>Henüz net değil</option><option>50.000 — 100.000 TL</option><option>100.000 — 250.000 TL</option><option>250.000 — 500.000 TL</option><option>500.000 TL ve üzeri</option></select></label></div><div className="contact-field-grid"><label><span>Başlangıç beklentisi</span><select name="timeline"><option>Önce keşif yapalım</option><option>Mümkün olan en yakın zamanda</option><option>1 — 3 ay içinde</option><option>3 — 6 ay içinde</option></select></label><label><span>Tercih edilen dönüş</span><select name="preferredContact"><option>Telefon / WhatsApp</option><option>E-posta</option><option>Google Meet</option></select></label></div></div>
          <div className="contact-form-stage" data-form-stage="2" hidden={formStep !== 2}><header><span>03</span><div><small>BRIEF / HEDEF</small><h3>Son parçayı ekleyin.</h3><p>Bağlamı sizden dinleyelim; kısa veya detaylı olabilir.</p></div></header><label className="contact-message-field"><span>Proje özeti *</span><textarea name="message" required minLength={10} rows={9} placeholder="Hedefiniz, mevcut durumunuz, beklediğiniz çıktılar ve varsa önemli teslim tarihiniz..." /></label></div>
          <aside className="contact-form-intelligence"><p><i/> BRIEF INTELLIGENCE</p><div className="contact-intelligence-score"><span style={{ "--score": `${(formStep + 1) * 33.333}%` } as React.CSSProperties}/><strong>{String(Math.round((formStep + 1) * 33.333)).padStart(2,"0")}%</strong><small>KAPSAM HAZIRLIĞI</small></div><dl><div><dt>Proje sinyali</dt><dd>{formSnapshot.subject || "Bekleniyor"}</dd></div><div><dt>Yatırım</dt><dd>{formSnapshot.budget}</dd></div><div><dt>Zamanlama</dt><dd>{formSnapshot.timeline}</dd></div><div><dt>Dönüş kanalı</dt><dd>{formSnapshot.preferredContact}</dd></div></dl><small><ShieldCheck/> Bilgileriniz şifreli bağlantı üzerinden iletilir.</small></aside>
        </div>
        <div className="contact-form-submit"><button type="button" className="contact-form-back" onClick={() => setFormStep(step => Math.max(0, step - 1))} disabled={formStep === 0}><ArrowLeft/> Geri</button><p>Göndererek <Link href="/kvkk-aydinlatma">KVKK Aydınlatma Metni</Link> ve <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>&apos;nı kabul edersiniz.</p>{formStep < 2 ? <button type="button" className="button" onClick={goToNextStep}>Devam <ArrowRight/></button> : <button className="button" disabled={loading}>{loading ? <Loader2 className="spin"/> : <>Güvenli gönder <ArrowUpRight size={18}/></>}</button>}</div>
      </form>}
    </section>

    <section className="contact-operating section" data-contact-reveal><div className="section-head"><div><p className="eyebrow"><Radar/> İlk temastan üretime</p><h2>Kurumsal ve<br/><em>öngörülebilir süreç.</em></h2></div><p>Her talebi aynı gün satış görüşmesine çevirmiyoruz. Önce ihtiyacı değerlendiriyor, doğru eşleşme varsa net bir keşif süreci öneriyoruz.</p></div><div>{[["01","Değerlendirme","Brief, hedef ve mevcut durum incelenir."],["02","Keşif","Kapsam, kullanıcı, teknik ihtiyaç ve başarı kriterleri netleşir."],["03","Yol haritası","Takvim, teslimler, sorumluluklar ve yatırım çerçevesi hazırlanır."],["04","Kickoff","Onay sonrası proje alanı açılır ve üretim başlar."]].map(([number,title,copy], index) => <article key={number} data-contact-reveal style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}><span>{number}</span><i/><h3>{title}</h3><p>{copy}</p><b><Zap/> SYSTEM STEP</b></article>)}</div></section>
  </main>;
}
