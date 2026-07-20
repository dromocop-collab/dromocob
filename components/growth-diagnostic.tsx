"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, RotateCcw, Sparkles, Target, Zap } from "lucide-react";

type Answers = {
  goal?: "sales" | "brand" | "system";
  bottleneck?: "trust" | "visibility" | "operation";
  readiness?: "now" | "quarter" | "explore";
};

const questions = [
  {
    key: "goal" as const,
    label: "Öncelikli hedefin ne?",
    options: [
      { value: "sales", label: "Daha fazla nitelikli müşteri", note: "Dönüşüm ve satış odağı" },
      { value: "brand", label: "Markayı daha güçlü konumlamak", note: "Algı ve görünürlük odağı" },
      { value: "system", label: "Operasyonu dijitalleştirmek", note: "Verimlilik ve ölçek odağı" },
    ],
  },
  {
    key: "bottleneck" as const,
    label: "Bugün seni en çok ne yavaşlatıyor?",
    options: [
      { value: "trust", label: "Dijital yüzümüz güven vermiyor", note: "Web deneyimi ve içerik" },
      { value: "visibility", label: "Yeterince görünür değiliz", note: "Film, kampanya ve anlatı" },
      { value: "operation", label: "Süreçler manuel ilerliyor", note: "Yazılım ve otomasyon" },
    ],
  },
  {
    key: "readiness" as const,
    label: "Projeye ne zaman başlamak istiyorsun?",
    options: [
      { value: "now", label: "Mümkün olan en yakın zamanda", note: "Kapsamı hemen netleştirelim" },
      { value: "quarter", label: "Önümüzdeki 1–3 ay içinde", note: "Doğru yol haritasını kuralım" },
      { value: "explore", label: "Önce seçenekleri görmek istiyorum", note: "Fırsat alanlarını keşfedelim" },
    ],
  },
];

const recommendations = {
  web: {
    eyebrow: "Önerilen başlangıç sistemi",
    title: "Web Application",
    reason: "En büyük kaldıraç; güven veren, müşteri toplayan ve operasyonunu destekleyen güçlü bir dijital merkez kurmak.",
    metric: "Dönüşüm + operasyon",
    index: "01",
  },
  video: {
    eyebrow: "Önerilen görünürlük sistemi",
    title: "Video Production",
    reason: "En büyük kaldıraç; markanı birkaç saniyede anlaşılır ve hatırlanır yapan sinematik bir anlatı oluşturmak.",
    metric: "Hatırlanma + etkileşim",
    index: "02",
  },
  flagship: {
    eyebrow: "Önerilen büyüme sistemi",
    title: "Digital Flagship",
    reason: "Web, marka anlatısı ve büyüme altyapısını ayrı işler yerine tek bir dönüşüm sistemi olarak ele almak.",
    metric: "Otorite + dönüşüm",
    index: "03",
  },
};

export default function GrowthDiagnostic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const complete = step >= questions.length;

  const result = useMemo(() => {
    if (answers.goal === "brand" && answers.bottleneck === "visibility") return recommendations.video;
    if (answers.goal === "system" || answers.bottleneck === "operation") return recommendations.web;
    if (answers.goal === "sales" && answers.bottleneck === "trust") return recommendations.web;
    return recommendations.flagship;
  }, [answers]);

  function choose(value: string) {
    const question = questions[step];
    setAnswers(current => ({ ...current, [question.key]: value }));
    window.setTimeout(() => setStep(current => current + 1), 180);
  }

  function reset() {
    setAnswers({});
    setStep(0);
  }

  function goBack() {
    setStep(current => Math.max(0, current - 1));
  }

  function seePackages() {
    document.querySelector("#paket-sistemleri")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const timeline = answers.readiness === "now" ? "Hemen" : answers.readiness === "quarter" ? "1–3 ay" : "Keşif aşaması";

  return (
    <section className="growth-diagnostic section" aria-labelledby="diagnostic-title">
      <div className="diagnostic-intro">
        <p className="eyebrow"><Sparkles size={15}/> 60 saniyelik büyüme teşhisi</p>
        <h2 id="diagnostic-title">Neye ihtiyacın<br/>olduğunu <em>netleştir.</em></h2>
        <p>Üç kısa seçim yap. Sana satış konuşması değil, bugün en fazla değer yaratacak başlangıç noktasını gösterelim.</p>
        <div className="diagnostic-trust">
          <span><Check size={14}/> Ücretsiz</span>
          <span><Check size={14}/> İletişim bilgisi istemez</span>
          <span><Check size={14}/> Anında sonuç</span>
        </div>
      </div>

      <div className={`diagnostic-console ${complete ? "has-result" : ""}`}>
        <header>
          <div><i/><span>DROMOCOB / OPPORTUNITY SCAN</span></div>
          <strong>{complete ? "ANALİZ TAMAMLANDI" : `ADIM ${String(step + 1).padStart(2, "0")} / 03`}</strong>
        </header>
        <div className="diagnostic-progress"><span style={{ width: `${Math.min(step, 3) / 3 * 100}%` }}/></div>

        {!complete ? (
          <div className="diagnostic-question" key={step}>
            <div className="diagnostic-question-meta">
              <span className="diagnostic-number">0{step + 1}</span>
              <div className="diagnostic-step-dots" aria-hidden="true">
                {questions.map((_, index) => <i key={index} className={index <= step ? "active" : ""}/>) }
              </div>
            </div>
            <h3>{questions[step].label}</h3>
            <div className="diagnostic-options">
              {questions[step].options.map(option => (
                <button type="button" key={option.value} onClick={() => choose(option.value)}>
                  <span><strong>{option.label}</strong><small>{option.note}</small></span>
                  <i><ArrowRight size={17}/></i>
                </button>
              ))}
            </div>
            <div className="diagnostic-question-footer">
              <button type="button" onClick={goBack} disabled={step === 0}><ArrowLeft size={15}/> Önceki soru</button>
              <span>Seçimin daha sonra değiştirilebilir.</span>
            </div>
          </div>
        ) : (
          <div className="diagnostic-result">
            <div className="diagnostic-result-orb"><Target/><span>{result.index}</span></div>
            <div className="diagnostic-result-copy">
              <p>{result.eyebrow}</p>
              <h3>{result.title}</h3>
              <p>{result.reason}</p>
              <div className="diagnostic-result-metrics">
                <div className="diagnostic-result-metric"><Zap size={16}/><span>Birincil etki</span><strong>{result.metric}</strong></div>
                <div className="diagnostic-result-metric"><Clock3 size={16}/><span>Başlangıç eğilimi</span><strong>{timeline}</strong></div>
              </div>
            </div>
            <div className="diagnostic-result-actions">
              <button type="button" className="button" onClick={seePackages}>Öneriyi incele <ArrowRight size={17}/></button>
              <button type="button" onClick={reset}><RotateCcw size={15}/> Yeniden başlat</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
