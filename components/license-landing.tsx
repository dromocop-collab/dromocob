"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AppWindow,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CloudCheck,
  Crown,
  Gauge,
  Infinity as InfinityIcon,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  WifiOff,
  X,
} from "lucide-react";
import "./license-landing.css";

type FAQ = { question: string; answer: string };
type Props = { schema: object; faqs: FAQ[] };
type ProductId =
  | "dromocob-all-apps"
  | "pixel-resizer-pro"
  | "ai-upscaler"
  | "background-remover"
  | "watermark-studio"
  | "image-compressor"
  | "video-converter";

type PlanId = "trial" | "pro" | "business" | "lifetime";

type RequestForm = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  deviceCount: string;
  message: string;
  consent: boolean;
  website: string;
};

const products: Array<{ id: ProductId; name: string; active: boolean }> = [
  { id: "dromocob-all-apps", name: "Dromocob Apps — Tümü", active: true },
  { id: "pixel-resizer-pro", name: "Pixel Resizer PRO", active: true },
  { id: "ai-upscaler", name: "AI Upscaler", active: false },
  { id: "background-remover", name: "Background Remover", active: false },
  { id: "watermark-studio", name: "Watermark Studio", active: false },
  { id: "image-compressor", name: "Image Compressor", active: false },
  { id: "video-converter", name: "Video Converter", active: false },
];

const plans = [
  {
    id: "trial" as const,
    eyebrow: "BAŞLANGIÇ",
    title: "Trial",
    icon: Sparkles,
    accent: "cyan",
    description: "Ürünü ve lisans altyapısını risksiz deneyin.",
    cta: "Trial talebi gönder",
    features: [
      "Ücretsiz deneme süresi",
      "Lisans anahtarı gerektirmeden başlangıç",
      "License Cloud doğrulaması",
    ],
  },
  {
    id: "pro" as const,
    eyebrow: "PROFESYONEL",
    title: "Pro",
    icon: Crown,
    accent: "orange",
    description: "Bireysel üreticiler ve profesyoneller için.",
    cta: "Pro lisansı iste",
    features: [
      "Tam uygulama erişimi",
      "Cihaz kontrollü aktivasyon",
      "Güvenli offline grace",
      "Dromocob hesabına bağlı lisans",
    ],
  },
  {
    id: "business" as const,
    eyebrow: "EKİPLER",
    title: "Business",
    icon: Building2,
    accent: "blue",
    description: "Ajanslar, ekipler ve ticari kullanım için.",
    cta: "Business teklifi al",
    features: [
      "Daha yüksek cihaz limiti",
      "Ticari kullanım",
      "Merkezi lisans kontrolü",
      "Öncelikli destek",
    ],
  },
  {
    id: "lifetime" as const,
    eyebrow: "TEK SEFER",
    title: "Lifetime",
    icon: InfinityIcon,
    accent: "purple",
    description: "Satın alınan ürün için süresiz erişim.",
    cta: "Lifetime lisansı iste",
    features: [
      "Tek seferlik lisans",
      "Satın alınan ürün için süresiz erişim",
      "İmzalı offline receipt",
      "Cloud doğrulama",
    ],
  },
] as const;

const initialForm: RequestForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  deviceCount: "1",
  message: "",
  consent: false,
  website: "",
};

export default function LicenseLanding({ schema, faqs }: Props) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("product") as ProductId | null;
  const initial = products.find((item) => item.id === requested && item.active)?.id ?? "pixel-resizer-pro";

  const [selectedProduct, setSelectedProduct] = useState<ProductId>(initial);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [form, setForm] = useState<RequestForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const selected = useMemo(
    () => products.find((item) => item.id === selectedProduct) ?? products[1],
    [selectedProduct],
  );

  const selectedPlanInfo = useMemo(
    () => plans.find((item) => item.id === selectedPlan) ?? null,
    [selectedPlan],
  );

  useEffect(() => {
    if (!selectedPlan) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) closeModal();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedPlan, submitting]);

  function openModal(plan: PlanId) {
    setSelectedPlan(plan);
    setRequestError("");
    setRequestSuccess(false);
  }

  function closeModal() {
    setSelectedPlan(null);
    setRequestError("");
    setRequestSuccess(false);
    setForm(initialForm);
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan || submitting) return;

    setSubmitting(true);
    setRequestError("");

    try {
      const response = await fetch("/api/license-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productId: selectedProduct,
          plan: selectedPlan,
          source: searchParams.get("source") || "website",
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Lisans talebi gönderilemedi.");
      }

      setRequestSuccess(true);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Lisans talebi gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <main className="license-page">
        <section className="license-hero">
          <div className="license-shell license-hero-grid">
            <div>
              <div className="license-kicker"><ShieldCheck size={15}/> DROMOCOB / LICENSE CLOUD</div>
              <h1>Tek lisans.<span>Bütün yaratıcı gücün.</span></h1>
              <p>
                Pixel Resizer PRO ve Dromocob yaratıcı araçlarını güvenli, cihaz kontrollü ve
                imzalı lisans altyapısıyla kullan.
              </p>
              <div className="license-actions">
                <a className="license-button primary" href="#planlar">Planları Gör <ArrowRight size={16}/></a>
                <button className="license-button secondary" type="button" onClick={() => openModal("pro")}>Lisans Talebi</button>
              </div>
              <div className="license-trust">
                <span><ShieldCheck size={15}/> ES256 signed receipt</span>
                <span><Laptop size={15}/> Device binding</span>
                <span><WifiOff size={15}/> Offline grace</span>
              </div>
            </div>

            <div className="license-console">
              <div className="license-status">
                <div className="license-status-icon"><KeyRound size={24}/></div>
                <div><small>LICENSE STATUS</small><strong>Verified architecture</strong></div>
                <BadgeCheck size={22}/>
              </div>
              <div className="license-code">
                <p><b>product</b><span>{selected.id}</span></p>
                <p><b>signature</b><span>ES256</span></p>
                <p><b>device</b><span>bound</span></p>
                <p><b>offline</b><span>secure grace</span></p>
                <p><b>validation</b><span>cloud verified</span></p>
              </div>
            </div>
          </div>
        </section>

        <section className="license-section">
          <div className="license-shell">
            <div className="license-section-head"><div><p>DROMOCOB APPS</p><h2>Lisanslamak istediğin ürünü seç.</h2></div></div>
            <div className="license-products">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  disabled={!product.active}
                  onClick={() => product.active && setSelectedProduct(product.id)}
                  className={`${selectedProduct === product.id ? "selected" : ""} ${!product.active ? "disabled" : ""}`}
                >
                  <AppWindow size={19}/>
                  <div><strong>{product.name}</strong><small>{product.active ? "Lisanslanabilir" : "Yakında"}</small></div>
                  {selectedProduct === product.id && <Check size={16}/>}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="license-section soft" id="planlar">
          <div className="license-shell">
            <div className="license-section-head">
              <div><p>LICENSE PLANS</p><h2>{selected.name} için planını seç.</h2></div>
              <span>Talebini gönder; ekibimiz lisans kapsamı ve teklif bilgisiyle dönüş yapsın.</span>
            </div>

            <div className="license-plans">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <article key={plan.id} className={`plan-${plan.accent}`}>
                    <div className="plan-icon"><Icon size={23}/></div>
                    <p>{plan.eyebrow}</p>
                    <h3>{plan.title}</h3>
                    <div className="plan-price">Teklif ile</div>
                    <span className="plan-description">{plan.description}</span>
                    <ul>{plan.features.map((feature) => <li key={feature}><Check size={14}/>{feature}</li>)}</ul>
                    <button type="button" onClick={() => openModal(plan.id)}>
                      {plan.cta}<ArrowRight size={14}/>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="license-section">
          <div className="license-shell">
            <div className="license-section-head"><div><p>SECURITY ARCHITECTURE</p><h2>Lisansın sadece bir kod değil.</h2></div></div>
            <div className="license-features">
              <Feature icon={ShieldCheck} title="ES256 Signed Receipt" text="İmzalı lisans makbuzlarıyla doğrulanabilir erişim." />
              <Feature icon={Laptop} title="Device Binding" text="Aktivasyon lisans sahibinin cihazıyla ilişkilendirilir." />
              <Feature icon={WifiOff} title="Secure Offline Grace" text="Geçerli receipt ile çevrimdışı erişim korunur." />
              <Feature icon={CloudCheck} title="Cloud Validation" text="Lisans durumu gerektiğinde yeniden doğrulanır." />
              <Feature icon={LockKeyhole} title="Account Security" text="Dromocob hesabı lisans sahipliğinin merkezindedir." />
              <Feature icon={Gauge} title="Cross-App Ready" text="Desteklenen Dromocob uygulamaları aynı mimaride yönetilir." />
            </div>
          </div>
        </section>

        {selectedProduct === "pixel-resizer-pro" && (
          <section className="license-section">
            <div className="license-shell license-focus">
              <div><p>PIXEL RESIZER PRO</p><h2>Pixel Resizer PRO’yu lisansla.</h2><span>Profesyonel görsel iş akışını License Cloud ile güvenli biçimde etkinleştir.</span></div>
              <button className="license-button primary" type="button" onClick={() => openModal("pro")}>Pixel Resizer PRO Lisansı <ArrowRight size={16}/></button>
            </div>
          </section>
        )}

        <section className="license-section">
          <div className="license-shell">
            <div className="license-section-head"><div><p>FAQ</p><h2>Lisans sistemi hakkında merak edilenler.</h2></div></div>
            <div className="license-faq">
              {faqs.map((item, index) => {
                const open = openFaq === index;
                return (
                  <article key={item.question} className={open ? "open" : ""}>
                    <button type="button" onClick={() => setOpenFaq(open ? null : index)}>
                      <strong>{item.question}</strong><ChevronDown size={18}/>
                    </button>
                    <div><p>{item.answer}</p></div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {selectedPlan && selectedPlanInfo && (
        <div className="license-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target && !submitting) closeModal();
        }}>
          <div className="license-request-modal" role="dialog" aria-modal="true" aria-labelledby="license-request-title">
            <button className="license-modal-close" type="button" onClick={closeModal} disabled={submitting} aria-label="Modalı kapat">
              <X size={18}/>
            </button>

            {!requestSuccess ? (
              <>
                <div className="license-modal-header">
                  <div className="license-modal-icon"><Send size={22}/></div>
                  <div>
                    <small>DROMOCOB / LICENSE REQUEST</small>
                    <h2 id="license-request-title">{selectedPlanInfo.title} lisans talebi</h2>
                    <p>{selected.name} için lisans talebini gönder. Ekibimiz seninle iletişime geçsin.</p>
                  </div>
                </div>

                <div className="license-request-summary">
                  <span><b>Ürün</b>{selected.name}</span>
                  <span><b>Plan</b>{selectedPlanInfo.title}</span>
                </div>

                <form className="license-request-form" onSubmit={submitRequest}>
                  <input
                    className="license-honeypot"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    name="website"
                  />

                  <label>
                    <span>Ad Soyad *</span>
                    <div className="license-input-wrap"><UserRound size={16}/><input required maxLength={120} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Adınız ve soyadınız"/></div>
                  </label>

                  <label>
                    <span>E-posta *</span>
                    <div className="license-input-wrap"><Mail size={16}/><input required type="email" maxLength={180} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ornek@domain.com"/></div>
                  </label>

                  <div className="license-form-grid">
                    <label>
                      <span>Telefon</span>
                      <input maxLength={40} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90 5xx xxx xx xx"/>
                    </label>
                    <label>
                      <span>Şirket / Marka</span>
                      <input maxLength={140} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Opsiyonel"/>
                    </label>
                  </div>

                  <label>
                    <span>Kaç cihazda kullanacaksınız?</span>
                    <select value={form.deviceCount} onChange={(e) => setForm({ ...form, deviceCount: e.target.value })}>
                      <option value="1">1 cihaz</option>
                      <option value="2">2 cihaz</option>
                      <option value="3">3 cihaz</option>
                      <option value="5">4–5 cihaz</option>
                      <option value="10">6–10 cihaz</option>
                      <option value="10+">10+ cihaz</option>
                    </select>
                  </label>

                  <label>
                    <span>Not / İhtiyaç</span>
                    <textarea maxLength={1200} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Kullanım senaryonuzu veya özel ihtiyacınızı yazabilirsiniz."/>
                  </label>

                  <label className="license-consent">
                    <input required type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })}/>
                    <span>Talebimin değerlendirilmesi ve benimle iletişime geçilmesi için gönderdiğim bilgilerin işlenmesini kabul ediyorum.</span>
                  </label>

                  {requestError && <div className="license-form-error">{requestError}</div>}

                  <button className="license-submit" type="submit" disabled={submitting || !form.consent}>
                    {submitting ? "Talep gönderiliyor…" : "Lisans Talebini Gönder"}
                    {!submitting && <ArrowRight size={16}/>}
                  </button>
                </form>
              </>
            ) : (
              <div className="license-request-success">
                <div><BadgeCheck size={34}/></div>
                <small>TALEP ALINDI</small>
                <h2>Lisans talebin bize ulaştı.</h2>
                <p>{selected.name} · {selectedPlanInfo.title} talebini kaydettik. Ekibimiz verdiğin iletişim bilgileri üzerinden dönüş yapacak.</p>
                <button type="button" onClick={closeModal}>Tamam</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return <article><div><Icon size={20}/></div><h3>{title}</h3><p>{text}</p></article>;
}
