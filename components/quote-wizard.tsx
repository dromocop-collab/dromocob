"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { fetchQuoteEngine } from "@/lib/data";
import { calculateQuote } from "@/lib/quote-engine";
import type { QuoteQuestion, QuoteRule } from "@/lib/types";

const fallbackQuestions: QuoteQuestion[] = [
  { id: "q1", key: "service", title: "Ne yaptırmak istiyorsun?", type: "single", active: true, order: 1, options: [
    { label: "Kurumsal web sitesi", value: "web", priceDelta: 10000 },
    { label: "E-ticaret / özel yazılım", value: "software", priceDelta: 35000 },
    { label: "Video prodüksiyon", value: "video", priceDelta: 12000 },
    { label: "Sosyal medya yönetimi", value: "social", priceDelta: 15000 }
  ]},
  { id: "q2", key: "urgency", title: "Teslim beklentin nedir?", type: "single", active: true, order: 2, options: [
    { label: "Esnek", value: "flexible", priceDelta: 0 },
    { label: "30 gün içinde", value: "30d", priceDelta: 5000 },
    { label: "Acil / öncelikli", value: "urgent", priceDelta: 15000 }
  ]},
  { id: "q3", key: "extras", title: "Ek olarak neler lazım?", subtitle: "Birden fazla seçebilirsin.", type: "multi", active: true, order: 3, options: [
    { label: "Admin panel", value: "admin", priceDelta: 12000 },
    { label: "SEO altyapısı", value: "seo", priceDelta: 6000 },
    { label: "İçerik üretimi", value: "content", priceDelta: 10000 },
    { label: "Canlı destek", value: "chat", priceDelta: 5000 }
  ]}
];

export default function QuoteWizard({ open, onClose }: { open: boolean; onClose(): void }) {
  const [questions, setQuestions] = useState<QuoteQuestion[]>(fallbackQuestions);
  const [rules, setRules] = useState<QuoteRule[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [result, setResult] = useState<{ price: number; notes: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuoteEngine().then(data => {
      if (data.questions.length) setQuestions(data.questions);
      setRules(data.rules);
    }).catch(() => undefined);
  }, []);

  function closeWizard() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError("");
    setSaving(false);
    onClose();
  }

  if (!open) return null;
  const question = questions[step];

  function choose(value: string) {
    if (question.type === "multi") {
      const current = Array.isArray(answers[question.key]) ? answers[question.key] as string[] : [];
      setAnswers({ ...answers, [question.key]: current.includes(value) ? current.filter(x => x !== value) : [...current, value] });
    } else {
      setAnswers({ ...answers, [question.key]: value });
    }
  }

  async function finish() {
    setError("");
    const quote = calculateQuote(questions, rules, answers);
    setResult(quote);
    setSaving(true);

    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type: "quote",
          answers,
          estimatedPrice: quote.price,
          notes: quote.notes,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Teklif kaydedilemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setSaving(false);
    }
  }

  const selected = (value: string) => {
    const answer = answers[question.key];
    return Array.isArray(answer) ? answer.includes(value) : answer === value;
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="quote-modal">
        <button className="modal-close icon-button" onClick={closeWizard}><X /></button>
        {!result ? (
          <>
            <div className="quote-progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
            <div className="eyebrow">Akıllı teklif motoru · {step + 1}/{questions.length}</div>
            <h2>{question.title}</h2>
            {question.subtitle && <p className="muted">{question.subtitle}</p>}
            <div className="option-grid">
              {question.options?.map(option => (
                <button key={option.value} className={`quote-option ${selected(option.value) ? "selected" : ""}`} onClick={() => choose(option.value)}>
                  <span>{option.label}</span>{selected(option.value) && <Check size={18} />}
                </button>
              ))}
            </div>
            <div className="quote-actions">
              <button className="button button-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft size={18} /> Geri</button>
              {step < questions.length - 1
                ? <button className="button" onClick={() => setStep(step + 1)}>Devam <ChevronRight size={18} /></button>
                : <button className="button" onClick={finish}>{saving ? <Loader2 className="spin" /> : "Teklifimi Hesapla"}</button>}
            </div>
          </>
        ) : (
          <div className="quote-result">
            <div className="result-orb">₺</div>
            <div className="eyebrow">Tahmini proje bütçesi</div>
            <h2>{result.price.toLocaleString("tr-TR")} TL&apos;den başlar</h2>
            <p>Bu otomatik ön analizdir. Final kapsam, teslim süresi ve üretim yoğunluğuna göre net teklif hazırlanır.</p>
            {result.notes.map(note => <div className="note" key={note}>{note}</div>)}
            {error && <div className="auth-error quote-error">{error}</div>}
            <a className="button" href="/iletisim">Projeyi Konuşalım</a>
          </div>
        )}
      </div>
    </div>
  );
}
