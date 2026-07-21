"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { fetchQuoteEngine } from "@/lib/data";
import { calculateQuote } from "@/lib/quote-engine";
import type { QuoteQuestion, QuoteRule } from "@/lib/types";

const fallbackQuestions: QuoteQuestion[] = [
  { id: "q1", key: "service", title: "Ne yaptırmak istiyorsun?", type: "single", active: true, order: 1, options: [
    { label: "Kurumsal web sitesi", value: "web", priceDelta: 12000 },
    { label: "E-ticaret / özel yazılım", value: "software", priceDelta: 38000 },
    { label: "Video prodüksiyon paketi", value: "video", priceDelta: 15000 },
    { label: "Web + video birleşik dönüşüm", value: "hybrid", priceDelta: 45000 },
    { label: "Sosyal medya sistemi", value: "social", priceDelta: 18000 }
  ]},
  { id: "web-goal", key: "webGoal", title: "Web sitenin öncelikli iş hedefi ne?", subtitle: "Tasarımı değil, oluşturacağımız sistemi belirler.", type: "single", active: true, order: 2, serviceTypes: ["web", "software", "hybrid"], options: [
    { label: "Nitelikli müşteri başvurusu toplamak", value: "lead", priceDelta: 7000 },
    { label: "Kurumsal güven ve marka prestiji", value: "authority", priceDelta: 4000 },
    { label: "Online satış ve ödeme almak", value: "commerce", priceDelta: 18000 },
    { label: "Dijital operasyonu otomatikleştirmek", value: "automation", priceDelta: 24000 }
  ]},
  { id: "web-scope", key: "webScope", title: "İçerik ve sayfa kapsamı ne kadar geniş?", type: "single", active: true, order: 3, serviceTypes: ["web", "software", "hybrid"], options: [
    { label: "Odaklı landing page / tek sayfa", value: "landing", priceDelta: 0 },
    { label: "5–8 sayfalı kurumsal yapı", value: "corporate", priceDelta: 12000 },
    { label: "10+ sayfa ve gelişmiş içerik mimarisi", value: "extended", priceDelta: 26000 },
    { label: "Çok dilli / çok markalı platform", value: "enterprise", priceDelta: 42000 }
  ]},
  { id: "web-capabilities", key: "webCapabilities", title: "Sistemde hangi yetenekler olmalı?", subtitle: "İhtiyacın olan tüm modülleri seçebilirsin.", type: "multi", active: true, order: 4, serviceTypes: ["web", "software", "hybrid"], options: [
    { label: "Gelişmiş admin ve içerik paneli", value: "admin", priceDelta: 14000 },
    { label: "Üyelik, profil ve yetkilendirme", value: "membership", priceDelta: 18000 },
    { label: "Ödeme / e-ticaret altyapısı", value: "payment", priceDelta: 25000 },
    { label: "CRM, ERP veya API entegrasyonu", value: "integration", priceDelta: 22000 },
    { label: "Teklif, rezervasyon veya randevu akışı", value: "workflow", priceDelta: 16000 },
    { label: "Çok dilli yayın altyapısı", value: "multilingual", priceDelta: 9000 }
  ]},
  { id: "web-content", key: "webContent", title: "İçerik üretiminde nasıl ilerleyelim?", type: "single", active: true, order: 5, serviceTypes: ["web", "software", "hybrid"], options: [
    { label: "Tüm metin ve görseller hazır", value: "ready", priceDelta: 0 },
    { label: "Metinleri profesyonelce yeniden yazalım", value: "copy", priceDelta: 9000 },
    { label: "Fotoğraf, video ve metni birlikte üretelim", value: "full", priceDelta: 24000 }
  ]},
  { id: "video-format", key: "videoFormat", title: "Nasıl bir video paketi planlıyoruz?", subtitle: "Prodüksiyon ekibi ve anlatım dili buna göre şekillenir.", type: "single", active: true, order: 6, serviceTypes: ["video", "hybrid"], options: [
    { label: "Kurumsal tanıtım / marka filmi", value: "brand", priceDelta: 18000 },
    { label: "Reklam ve kampanya filmi", value: "commercial", priceDelta: 28000 },
    { label: "Ürün veya hizmet tanıtımı", value: "product", priceDelta: 12000 },
    { label: "Etkinlik / lansman çekimi", value: "event", priceDelta: 16000 },
    { label: "Sosyal medya video serisi", value: "social-series", priceDelta: 22000 }
  ]},
  { id: "video-output", key: "videoOutput", title: "Teslim paketinde kaç ana video olsun?", type: "single", active: true, order: 7, serviceTypes: ["video", "hybrid"], options: [
    { label: "1 ana film", value: "one", priceDelta: 0 },
    { label: "1 ana film + 3 kısa versiyon", value: "campaign", priceDelta: 14000 },
    { label: "4–6 bölümlük video serisi", value: "series", priceDelta: 30000 },
    { label: "Aylık düzenli prodüksiyon", value: "monthly", priceDelta: 45000 }
  ]},
  { id: "video-production", key: "videoProduction", title: "Çekim ölçeği nasıl olmalı?", type: "single", active: true, order: 8, serviceTypes: ["video", "hybrid"], options: [
    { label: "Yarım gün / tek lokasyon", value: "half-day", priceDelta: 0 },
    { label: "Tam gün / 1–2 lokasyon", value: "full-day", priceDelta: 12000 },
    { label: "2–3 çekim günü / çoklu lokasyon", value: "multi-day", priceDelta: 35000 },
    { label: "Kapsamı birlikte keşfedelim", value: "discovery", priceDelta: 10000 }
  ]},
  { id: "video-extras", key: "videoExtras", title: "Prodüksiyona hangi katmanları ekleyelim?", subtitle: "Birden fazla seçebilirsin.", type: "multi", active: true, order: 9, serviceTypes: ["video", "hybrid"], options: [
    { label: "Konsept, senaryo ve storyboard", value: "concept", priceDelta: 12000 },
    { label: "Drone çekimi", value: "drone", priceDelta: 8000 },
    { label: "Oyuncu / model casting", value: "casting", priceDelta: 15000 },
    { label: "Profesyonel seslendirme", value: "voice", priceDelta: 7000 },
    { label: "Motion graphics / 2D animasyon", value: "motion", priceDelta: 14000 },
    { label: "Stüdyo ve dekor kurulumu", value: "studio", priceDelta: 18000 }
  ]},
  { id: "social-scope", key: "socialScope", title: "Sosyal medya operasyonunun kapsamı ne olsun?", type: "single", active: true, order: 2, serviceTypes: ["social"], options: [
    { label: "Strateji ve aylık içerik planı", value: "strategy", priceDelta: 5000 },
    { label: "Tasarım + metin + yayın yönetimi", value: "management", priceDelta: 16000 },
    { label: "Reels çekimi dahil tam üretim", value: "production", priceDelta: 32000 },
    { label: "Reklam ve büyüme operasyonu", value: "performance", priceDelta: 40000 }
  ]},
  { id: "growth-stack", key: "growthStack", title: "Yayın sonrasında hangi büyüme katmanları gerekli?", subtitle: "Teknik teslimin ötesinde yapabildiğimiz operasyonları seç.", type: "multi", active: true, order: 80, options: [
    { label: "SEO ve içerik büyüme sistemi", value: "seo-growth", priceDelta: 12000 },
    { label: "Google / Meta reklam ölçüm altyapısı", value: "ads", priceDelta: 9000 },
    { label: "Gelişmiş analitik ve dönüşüm panosu", value: "analytics", priceDelta: 10000 },
    { label: "Aylık kreatif ve teknik optimizasyon", value: "optimization", priceDelta: 18000 },
    { label: "E-posta / CRM otomasyonları", value: "automation", priceDelta: 14000 },
    { label: "Şimdilik yalnız proje teslimi", value: "delivery-only", priceDelta: 0 }
  ]},
  { id: "collaboration", key: "collaboration", title: "Proje ekibinle nasıl çalışalım?", type: "single", active: true, order: 85, options: [
    { label: "Tüm süreci Dromocob yönetsin", value: "managed", priceDelta: 12000 },
    { label: "İç ekibimizle ortak üretelim", value: "collaborative", priceDelta: 5000 },
    { label: "Teknik ve kreatif danışmanlık yeterli", value: "consulting", priceDelta: 0 },
    { label: "Önce keşif toplantısında netleştirelim", value: "discovery", priceDelta: 2500 }
  ]},
  { id: "urgency", key: "urgency", title: "Teslim ve başlangıç beklentin nedir?", type: "single", active: true, order: 90, options: [
    { label: "Esnek", value: "flexible", priceDelta: 0 },
    { label: "30 gün içinde", value: "30d", priceDelta: 5000 },
    { label: "Acil / öncelikli", value: "urgent", priceDelta: 15000 }
  ]}
];

const emergencyDroneQuestions: QuoteQuestion[] = [
  { id: "drone-purpose", key: "dronePurpose", title: "Drone çekimini nerede kullanacaksınız?", subtitle: "Uçuş rotası, ekip ve teslim formatını kullanım alanına göre planlarız.", type: "single", active: true, order: 1, options: [
    { label: "Tesis / fabrika / üretim sahası", value: "facility", priceDelta: 0 },
    { label: "Şantiye / inşaat / proje takibi", value: "construction", priceDelta: 2000 },
    { label: "Etkinlik / lansman / organizasyon", value: "event", priceDelta: 3000 },
    { label: "Gayrimenkul / otel / turizm", value: "real-estate", priceDelta: 1500 },
    { label: "Marka filmi / reklam / kampanya", value: "campaign", priceDelta: 4500 }
  ]},
  { id: "drone-timing", key: "droneTiming", title: "Çekim için zaman ihtiyacınız nedir?", subtitle: "Uygunluk, hava koşulları ve lokasyon değerlendirmesini buna göre önceliklendiririz.", type: "single", active: true, order: 2, options: [
    { label: "Bugün / aynı gün uygunluk kontrolü", value: "same-day", priceDelta: 6000 },
    { label: "1–3 gün içinde", value: "three-days", priceDelta: 3000 },
    { label: "Bu hafta içinde", value: "this-week", priceDelta: 1000 },
    { label: "Tarihi birlikte netleştirelim", value: "flexible", priceDelta: 0 }
  ]},
  { id: "drone-location", key: "droneLocation", title: "Çekim lokasyonu nasıl bir alan?", type: "single", active: true, order: 3, options: [
    { label: "Tek lokasyon / erişimi kolay alan", value: "single", priceDelta: 0 },
    { label: "Geniş tesis, şantiye veya açık saha", value: "large-site", priceDelta: 2500 },
    { label: "Şehir içi yoğun alan / etkinlik alanı", value: "urban", priceDelta: 3500 },
    { label: "Birden fazla lokasyon", value: "multi-location", priceDelta: 7000 }
  ]},
  { id: "drone-delivery", key: "droneDelivery", title: "Görüntüleri hangi amaçla teslim edelim?", subtitle: "Ham kayıt yerine, gerçekten kullanacağınız yayın düzenini baştan tanımlarız.", type: "multi", active: true, order: 4, options: [
    { label: "Kurumsal film / sunum için seçili görüntüler", value: "corporate", priceDelta: 0 },
    { label: "Web sitesi ve dijital kampanya kullanımı", value: "web", priceDelta: 1500 },
    { label: "Dikey Reels / Shorts varyasyonları", value: "vertical", priceDelta: 3000 },
    { label: "Kurgu ve renk düzenleme desteği", value: "post-production", priceDelta: 6500 }
  ]},
  { id: "drone-brief", key: "droneBrief", title: "Operasyon için hangi desteğe ihtiyacınız var?", type: "single", active: true, order: 5, options: [
    { label: "Çekim planı ve rota önerisini siz hazırlayın", value: "full-plan", priceDelta: 2000 },
    { label: "Ekibimizde brief ve çekim listesi hazır", value: "ready-brief", priceDelta: 0 },
    { label: "Önce hızlı bir keşif görüşmesi yapalım", value: "discovery", priceDelta: 1000 }
  ]}
];

export default function QuoteWizard({ open, onClose, initialService, initialPackageId }: { open: boolean; onClose(): void; initialService?: string; initialPackageId?: string }) {
  const isEmergencyDrone = initialPackageId === "emergency-drone";
  const [questions, setQuestions] = useState<QuoteQuestion[]>(isEmergencyDrone ? emergencyDroneQuestions : fallbackQuestions);
  const [rules, setRules] = useState<QuoteRule[]>([]);
  const [step, setStep] = useState(initialService && !isEmergencyDrone ? 1 : 0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>(
    initialService ? { service: initialService, ...(isEmergencyDrone ? { package: "emergency-drone" } : {}) } : {}
  );
  const [result, setResult] = useState<{ price: number; notes: string[] } | null>(null);
  const [contact, setContact] = useState({ name: "", company: "", email: "", phone: "", city: "", preferredContact: "Telefon" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuoteEngine().then(data => {
      const databaseKeys = new Set(data.questions.map(item => item.key));
      const isLegacyQuestionSet = data.questions.length <= 4 || (databaseKeys.has("service") && databaseKeys.has("extras"));
      if (!isEmergencyDrone && data.questions.length && !isLegacyQuestionSet) setQuestions(data.questions);
      if (!isEmergencyDrone) setRules(data.rules);
    }).catch(() => undefined);
  }, [isEmergencyDrone]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function closeWizard() {
    setStep(initialService && !isEmergencyDrone ? 1 : 0);
    setAnswers(initialService ? { service: initialService, ...(isEmergencyDrone ? { package: "emergency-drone" } : {}) } : {});
    setResult(null);
    setContact({ name: "", company: "", email: "", phone: "", city: "", preferredContact: "Telefon" });
    setError("");
    setSaving(false);
    onClose();
  }

  if (!open) return null;
  const visibleQuestions = questions.filter(item =>
    !item.serviceTypes?.length || item.serviceTypes.includes(String(answers.service || ""))
  );
  const question = visibleQuestions[step];
  const isContactStep = step === visibleQuestions.length;

  function choose(value: string) {
    if (question.type === "multi") {
      const current = Array.isArray(answers[question.key]) ? answers[question.key] as string[] : [];
      setAnswers({ ...answers, [question.key]: current.includes(value) ? current.filter(x => x !== value) : [...current, value] });
    } else {
      if (question.key === "service") {
        setAnswers({ service: value });
      } else {
        setAnswers({ ...answers, [question.key]: value });
      }
    }
  }

  async function finish() {
    setError("");
    const quote = calculateQuote(visibleQuestions, rules, answers, isEmergencyDrone ? 18000 : 15000);
    const answerSelections = visibleQuestions.map(item => {
      const values = Array.isArray(answers[item.key]) ? answers[item.key] as string[] : [String(answers[item.key] || "")];
      return { key: item.key, title: item.title, values, labels: values.map(value => item.options?.find(option => option.value === value)?.label || value) };
    }).filter(item => item.values[0]);
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
          service: initialService === "video" ? "video" : "web",
          serviceLabel: isEmergencyDrone ? "Acil Drone Operasyon" : initialService === "video" ? "Video & Film" : "Web & Yazılım",
          contact,
          answerSelections,
          quoteVersion: "advanced-v1",
          sourcePath: isEmergencyDrone ? "/acil-drone-cekimi" : "/paketler",
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
  const currentAnswer = question ? answers[question.key] : undefined;
  const canContinue = !question || question.type === "multi"
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : currentAnswer !== undefined && currentAnswer !== "";

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="quote-modal">
        <button className="modal-close icon-button" onClick={closeWizard}><X /></button>
        {!result ? (
          <>
            <div className="quote-progress"><span style={{ width: `${((step + 1) / (visibleQuestions.length + 1)) * 100}%` }} /></div>
            <div className="eyebrow">{isEmergencyDrone ? "Acil drone operasyon planlayıcı" : answers.service === "video" ? "Video prodüksiyon planlayıcı" : "Akıllı teklif motoru"} · {step + 1}/{visibleQuestions.length + 1}</div>
            {isContactStep ? <div className="quote-contact-step"><h2>İletişim bilgilerini paylaş.</h2><p className="muted">Talebini ilgili ekibe iletelim; operasyon uygunluğu için sana dönüş yapalım.</p><div className="quote-contact-grid"><label>Ad soyad<input value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} autoComplete="name" placeholder="Adınız soyadınız" /></label><label>Firma <small>Opsiyonel</small><input value={contact.company} onChange={event => setContact({ ...contact, company: event.target.value })} autoComplete="organization" placeholder="Firma adı" /></label><label>E-posta<input type="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} autoComplete="email" placeholder="ornek@firma.com" /></label><label>Telefon<input type="tel" value={contact.phone} onChange={event => setContact({ ...contact, phone: event.target.value })} autoComplete="tel" placeholder="05xx xxx xx xx" /></label><label>Şehir <small>Opsiyonel</small><input value={contact.city} onChange={event => setContact({ ...contact, city: event.target.value })} autoComplete="address-level2" placeholder="İstanbul" /></label><label>Tercih edilen dönüş<select value={contact.preferredContact} onChange={event => setContact({ ...contact, preferredContact: event.target.value })}><option>Telefon</option><option>WhatsApp</option><option>E-posta</option></select></label></div></div> : <><h2>{question.title}</h2>{question.subtitle && <p className="muted">{question.subtitle}</p>}<div className={`option-grid ${question.key === "service" ? "service-option-grid" : ""}`}>{question.options?.map(option => (<button key={option.value} className={`quote-option ${selected(option.value) ? "selected" : ""}`} onClick={() => choose(option.value)}><span>{option.label}</span>{selected(option.value) && <Check size={18} />}</button>))}</div></>}
            <div className="quote-actions">
              <button className="button button-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft size={18} /> Geri</button>
              {!isContactStep ? <button className="button" disabled={!canContinue} onClick={() => setStep(step + 1)}>Devam <ChevronRight size={18} /></button> : <button className="button" disabled={contact.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(contact.email) || contact.phone.replace(/\D/g, "").length < 10 || saving} onClick={finish}>{saving ? <Loader2 className="spin" /> : "Talebi Gönder"}</button>}
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
