"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronLeft, ChevronRight, CircleCheck, Loader2, Send, X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { advancedQuoteConfig, type AdvancedQuoteQuestion, type AdvancedQuoteService } from "@/lib/advanced-quote-config";
import { db } from "@/lib/firebase";

type Answers = Record<string, string | string[]>;
type Contact = { name: string; company: string; email: string; phone: string; city: string; preferredContact: string };

const emptyContact: Contact = { name: "", company: "", email: "", phone: "", city: "", preferredContact: "Telefon / WhatsApp" };

export default function AdvancedQuoteWizard({ service, buttonLabel = "Projen için teklif al", initiallyOpen = false, hideTrigger = false, onClose }: { service: AdvancedQuoteService; buttonLabel?: string; initiallyOpen?: boolean; hideTrigger?: boolean; onClose?: () => void }) {
  const [questionOverrides, setQuestionOverrides] = useState<Array<AdvancedQuoteQuestion & { storedKey: string }>>([]);
  const [open, setOpen] = useState(initiallyOpen);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(
    query(collection(db, "quote_questions"), where("active", "==", true)),
    snapshot => {
      const prefix = `${service}__`;
      setQuestionOverrides(snapshot.docs.map(item => item.data()).filter(item => String(item.key || "").startsWith(prefix)).map(item => ({
        storedKey: String(item.key),
        key: String(item.key).slice(prefix.length),
        title: String(item.title || ""),
        subtitle: String(item.subtitle || ""),
        type: ["single", "multi", "text", "textarea"].includes(String(item.type)) ? item.type as AdvancedQuoteQuestion["type"] : "single",
        options: Array.isArray(item.options) ? item.options.map(option => ({
          label: String(option?.label || ""),
          value: String(option?.value || ""),
          priceDelta: Number(option?.priceDelta || 0),
        })).filter(option => option.label && option.value) : [],
      })));
    },
    () => setQuestionOverrides([])
  ), [service]);

  const config = useMemo(() => {
    const base = advancedQuoteConfig[service];
    const overrideMap = new Map(questionOverrides.map(item => [item.key, item]));
    return {
      ...base,
      questions: base.questions.map(question => {
        const override = overrideMap.get(question.key);
        if (!override) return question;
        return {
          ...question,
          title: override.title || question.title,
          subtitle: override.subtitle || question.subtitle,
          type: override.type,
          options: override.options?.length ? override.options.map(option => ({
            ...option,
            hint: question.options?.find(item => item.value === option.value)?.hint,
          })) : question.options,
        };
      }),
    };
  }, [questionOverrides, service]);

  const isContactStep = step === config.questions.length;
  const question = config.questions[step];
  const totalSteps = config.questions.length + 1;

  const close = useCallback(() => {
    setOpen(false);
    onClose?.();
    window.setTimeout(() => { setStep(0); setAnswers({}); setContact(emptyContact); setConsent(false); setSent(false); setReferenceId(""); setError(""); setSaving(false); }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKeyDown); };
  }, [open, close]);

  const estimatedPrice = useMemo(() => config.basePrice + config.questions.reduce((total, item) => {
    const answer = answers[item.key];
    const values = Array.isArray(answer) ? answer : answer ? [answer] : [];
    return total + values.reduce((sum, value) => sum + Number(item.options?.find(option => option.value === value)?.priceDelta || 0), 0);
  }, 0), [answers, config]);

  const completedCount = config.questions.filter(item => {
    const value = answers[item.key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
  }).length;

  function select(value: string) {
    if (!question) return;
    if (question.type === "multi") {
      const current = Array.isArray(answers[question.key]) ? answers[question.key] as string[] : [];
      setAnswers(current.includes(value)
        ? { ...answers, [question.key]: current.filter(item => item !== value) }
        : { ...answers, [question.key]: [...current, value] });
      return;
    }
    setAnswers({ ...answers, [question.key]: value });
  }

  function canContinue() {
    if (isContactStep) return contact.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(contact.email) && contact.phone.replace(/\D/g, "").length >= 10 && consent;
    if (question.optional) return true;
    const value = answers[question.key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
  }

  function answerSelections() {
    return config.questions.map(item => {
      const raw = answers[item.key];
      const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
      return {
        key: item.key,
        title: item.title,
        values,
        labels: values.map(value => item.options?.find(option => option.value === value)?.label || value),
      };
    }).filter(item => item.values.length > 0);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canContinue()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          website,
          service,
          serviceLabel: config.shortLabel,
          contact,
          answers,
          answerSelections: answerSelections(),
          estimatedPrice,
          quoteVersion: "advanced-v1",
          sourcePath: window.location.pathname,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Teklif talebi gönderilemedi.");
      setReferenceId(String(result.referenceId || ""));
      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Teklif talebi gönderilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return <>
    {!hideTrigger && <button type="button" className="button" onClick={() => setOpen(true)}>{buttonLabel} <ArrowRight size={18}/></button>}
    {open && <div className="advanced-quote-backdrop" role="dialog" aria-modal="true" aria-label={config.label}>
      <div className={`advanced-quote-shell quote-${service}`}>
        <header className="advanced-quote-head"><div><Image className="advanced-quote-logo" src="/logo.svg" alt="" width={34} height={34}/><div><small>DROMOCOB / SCOPE INTELLIGENCE</small><strong>{config.label}</strong></div></div><button type="button" onClick={close} aria-label="Teklif motorunu kapat"><X/></button></header>
        <div className="advanced-quote-progress"><span style={{ width: `${((step + 1) / totalSteps) * 100}%` }}/></div>
        {!sent ? <form onSubmit={submit} className="advanced-quote-layout">
          <main className="advanced-quote-main">
            <div className="advanced-step-meta"><span>ADIM {String(step + 1).padStart(2, "0")}</span><span>{String(totalSteps).padStart(2, "0")}</span></div>
            {!isContactStep && question ? <>
              <p className="advanced-quote-kicker">{config.shortLabel} kapsam analizi</p>
              <h2>{question.title}</h2><p className="advanced-quote-subtitle">{question.subtitle}</p>
              {(question.type === "single" || question.type === "multi") && <div className="advanced-option-grid">{question.options?.map(item => {
                const current = answers[question.key];
                const active = Array.isArray(current) ? current.includes(item.value) : current === item.value;
                return <button type="button" key={item.value} className={active ? "selected" : ""} onClick={() => select(item.value)}><span><strong>{item.label}</strong>{item.hint && <small>{item.hint}</small>}</span><i>{active ? <Check/> : question.type === "multi" ? "+" : "○"}</i></button>;
              })}</div>}
              {(question.type === "text" || question.type === "textarea") && <div className="advanced-text-answer">{question.type === "textarea" ? <textarea rows={8} value={String(answers[question.key] || "")} onChange={event => setAnswers({ ...answers, [question.key]: event.target.value })} placeholder={question.placeholder}/> : <input value={String(answers[question.key] || "")} onChange={event => setAnswers({ ...answers, [question.key]: event.target.value })} placeholder={question.placeholder}/>}<small>{question.optional ? "Bu alan isteğe bağlıdır." : "Bu alan gereklidir."}</small></div>}
            </> : <>
              <p className="advanced-quote-kicker">Son adım / iletişim</p><h2>Teklifi kime hazırlıyoruz?</h2><p className="advanced-quote-subtitle">Kapsam analizin Firestore&apos;a kaydedilecek ve proje ekibimize e-posta bildirimi gönderilecek.</p>
              <div className="advanced-contact-grid"><label>Ad soyad *<input value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} required/></label><label>Firma / marka<input value={contact.company} onChange={event => setContact({ ...contact, company: event.target.value })}/></label><label>E-posta *<input type="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} required/></label><label>Telefon *<input type="tel" value={contact.phone} onChange={event => setContact({ ...contact, phone: event.target.value })} placeholder="05xx xxx xx xx" required/></label><label>Şehir<input value={contact.city} onChange={event => setContact({ ...contact, city: event.target.value })}/></label><label>Tercih edilen iletişim<select value={contact.preferredContact} onChange={event => setContact({ ...contact, preferredContact: event.target.value })}><option>Telefon / WhatsApp</option><option>E-posta</option><option>Google Meet</option></select></label></div>
              <input className="hp-field" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)}/>
              <label className="advanced-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span>Teklif talebimin değerlendirilmesi için bilgilerimin işlenmesini ve benimle iletişime geçilmesini kabul ediyorum.</span></label>
            </>}
            {error && <div className="advanced-quote-error">{error}</div>}
            <footer className="advanced-quote-actions"><button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ChevronLeft/> Geri</button>{!isContactStep ? <button type="button" className="primary" disabled={!canContinue()} onClick={() => setStep(step + 1)}>{question?.optional && !answers[question.key] ? "Atla" : "Devam"} <ChevronRight/></button> : <button type="submit" className="primary" disabled={!canContinue() || saving}>{saving ? <Loader2 className="spin"/> : <Send/>} Teklif talebini gönder</button>}</footer>
          </main>
          <aside className="advanced-quote-summary"><p>KAPSAM ÖZETİ</p><div><span>Tamamlanan</span><strong>{completedCount}/{config.questions.length}</strong></div><div><span>Modül</span><strong>{config.shortLabel}</strong></div><div><span>Ön kapsam değeri</span><strong>{estimatedPrice.toLocaleString("tr-TR")} TL+</strong></div><small>Bu değer otomatik kapsam analizidir; resmî fiyat değildir. Nihai teklif ihtiyaç, takvim ve üretim planı doğrulandıktan sonra hazırlanır.</small><div className="summary-track"><span style={{ width: `${(completedCount / config.questions.length) * 100}%` }}/></div></aside>
        </form> : <div className="advanced-quote-success"><CircleCheck/><p className="advanced-quote-kicker">Talep başarıyla alındı</p><h2>Kapsam masamızda.</h2><p>Tüm seçimlerin admin paneline kaydedildi ve <strong>info@dromocob.tr</strong> adresine bildirim oluşturuldu. İnceleyip seninle iletişime geçeceğiz.</p>{referenceId && <code>REFERANS / {referenceId}</code>}<button className="button" onClick={close}>Tamamla</button></div>}
      </div>
    </div>}
  </>;
}
