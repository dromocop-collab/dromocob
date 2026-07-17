"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { AlertTriangle, Check, Plus, Sparkles, Upload, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { calculateQuote } from "@/lib/quote-engine";
import type { QuoteQuestion, QuoteRule } from "@/lib/types";

type QuestionOption = { label: string; value: string; priceDelta: number };
type RuleCondition = { key: string; operator: "eq" | "includes" | "gte" | "lte"; value: string | number };

type QuestionForm = {
  id?: string;
  key: string;
  title: string;
  subtitle: string;
  type: QuoteQuestion["type"];
  options: QuestionOption[];
  min: number;
  max: number;
  order: number;
  active: boolean;
};

type RuleForm = {
  id?: string;
  name: string;
  conditions: RuleCondition[];
  priceType: QuoteRule["priceType"];
  value: number;
  priority: number;
  note: string;
  enabled: boolean;
};

const QUESTION_EMPTY: QuestionForm = {
  key: "",
  title: "",
  subtitle: "",
  type: "single",
  options: [{ label: "", value: "", priceDelta: 0 }],
  min: 0,
  max: 0,
  order: 1,
  active: true,
};

const RULE_EMPTY: RuleForm = {
  name: "",
  conditions: [{ key: "service", operator: "eq", value: "web" }],
  priceType: "add",
  value: 0,
  priority: 1,
  note: "",
  enabled: true,
};

function parseJsonArray<T>(value: unknown) {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string") return [] as T[];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [] as T[];
  }
}

function normalizeQuestion(id: string, raw: Record<string, unknown>): QuestionForm {
  const typeValue = String(raw.type || "single").trim().toLowerCase();
  const type: QuoteQuestion["type"] = typeValue === "multi" || typeValue === "number" ? typeValue : "single";

  const options = parseJsonArray<QuestionOption>(raw.options || raw.optionsJson)
    .map(item => ({
      label: String(item?.label || "").trim(),
      value: String(item?.value || "").trim(),
      priceDelta: Number(item?.priceDelta || 0),
    }))
    .filter(item => item.label && item.value);

  return {
    id,
    key: String(raw.key || "").trim(),
    title: String(raw.title || "").trim(),
    subtitle: String(raw.subtitle || "").trim(),
    type,
    options: options.length ? options : [{ label: "", value: "", priceDelta: 0 }],
    min: Number(raw.min || 0),
    max: Number(raw.max || 0),
    order: Number(raw.order || 0),
    active: raw.active !== false,
  };
}

function normalizeRule(id: string, raw: Record<string, unknown>): RuleForm {
  const priceTypeValue = String(raw.priceType || "add").trim().toLowerCase();
  const priceType: QuoteRule["priceType"] =
    priceTypeValue === "multiply" || priceTypeValue === "fixed" ? priceTypeValue : "add";

  const conditions = parseJsonArray<RuleCondition>(raw.conditions || raw.conditionsJson)
    .map(item => ({
      key: String(item?.key || "").trim(),
      operator: ["eq", "includes", "gte", "lte"].includes(String(item?.operator || ""))
        ? (String(item?.operator) as RuleCondition["operator"])
        : "eq",
      value: typeof item?.value === "number" ? item.value : String(item?.value || "").trim(),
    }))
    .filter(item => item.key);

  return {
    id,
    name: String(raw.name || "").trim(),
    conditions: conditions.length ? conditions : [{ key: "service", operator: "eq", value: "web" }],
    priceType,
    value: Number(raw.value || 0),
    priority: Number(raw.priority || 0),
    note: String(raw.note || "").trim(),
    enabled: raw.enabled !== false,
  };
}

export default function QuoteAdmin() {
  const [tab, setTab] = useState<"questions" | "rules">("questions");

  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [rules, setRules] = useState<RuleForm[]>([]);

  const [questionForm, setQuestionForm] = useState<QuestionForm>(QUESTION_EMPTY);
  const [ruleForm, setRuleForm] = useState<RuleForm>(RULE_EMPTY);

  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string | string[] | number>>({});
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    return onSnapshot(
      collection(db, "quote_questions"),
      snapshot => {
        const data = snapshot.docs
          .map(document => normalizeQuestion(document.id, document.data() as Record<string, unknown>))
          .sort((a, b) => a.order - b.order);

        setQuestions(data);
        setError("");
      },
      snapshotError => {
        setQuestions([]);
        setError(snapshotError.message || "Teklif soruları okunamadı.");
      }
    );
  }, []);

  useEffect(() => {
    return onSnapshot(
      collection(db, "quote_rules"),
      snapshot => {
        const data = snapshot.docs
          .map(document => normalizeRule(document.id, document.data() as Record<string, unknown>))
          .sort((a, b) => a.priority - b.priority);

        setRules(data);
        setError("");
      },
      snapshotError => {
        setRules([]);
        setError(snapshotError.message || "Teklif kuralları okunamadı.");
      }
    );
  }, []);

  const simulatorQuestions = useMemo(
    () => questions.filter(item => item.active && item.key && item.title),
    [questions]
  );

  const simulatorRules = useMemo(
    () => rules.filter(item => item.enabled && item.name).map(item => ({
      id: item.id || item.name,
      name: item.name,
      conditions: item.conditions,
      enabled: item.enabled,
      note: item.note,
      priority: item.priority,
      priceType: item.priceType,
      value: item.value,
    } as QuoteRule)),
    [rules]
  );

  const simulation = useMemo(
    () => calculateQuote(
      simulatorQuestions.map(item => ({
        id: item.id || item.key,
        key: item.key,
        title: item.title,
        subtitle: item.subtitle || undefined,
        type: item.type,
        options: item.options,
        min: item.min || undefined,
        max: item.max || undefined,
        active: item.active,
        order: item.order,
      })),
      simulatorRules,
      previewAnswers
    ),
    [simulatorQuestions, simulatorRules, previewAnswers]
  );

  const engineHealth = useMemo(() => {
    const duplicateKeys: string[] = [];
    const keyCounter = new Map<string, number>();

    for (const question of questions) {
      const key = question.key.trim();
      if (!key) continue;
      keyCounter.set(key, (keyCounter.get(key) || 0) + 1);
    }

    keyCounter.forEach((count, key) => {
      if (count > 1) duplicateKeys.push(key);
    });

    const duplicatePriorities: number[] = [];
    const priorityCounter = new Map<number, number>();

    for (const rule of rules) {
      priorityCounter.set(rule.priority, (priorityCounter.get(rule.priority) || 0) + 1);
    }

    priorityCounter.forEach((count, priority) => {
      if (count > 1) duplicatePriorities.push(priority);
    });

    const activeQuestionKeys = new Set(
      questions
        .filter(question => question.active)
        .map(question => question.key)
    );

    const orphanConditionKeys = new Set<string>();

    for (const rule of rules.filter(item => item.enabled)) {
      for (const condition of rule.conditions) {
        if (!activeQuestionKeys.has(condition.key)) {
          orphanConditionKeys.add(condition.key);
        }
      }
    }

    return {
      duplicateKeys,
      duplicatePriorities,
      orphanConditionKeys: [...orphanConditionKeys],
      inactiveQuestions: questions.filter(item => !item.active).length,
      inactiveRules: rules.filter(item => !item.enabled).length,
    };
  }, [questions, rules]);

  function resetQuestionForm() {
    setQuestionForm({ ...QUESTION_EMPTY, order: Math.max(1, questions.length + 1) });
  }

  function resetRuleForm() {
    setRuleForm({ ...RULE_EMPTY, priority: Math.max(1, rules.length + 1) });
  }

  function editQuestion(item: QuestionForm) {
    setTab("questions");
    setQuestionForm({
      ...item,
      options: item.options.length ? item.options : [{ label: "", value: "", priceDelta: 0 }],
    });
  }

  function editRule(item: RuleForm) {
    setTab("rules");
    setRuleForm({
      ...item,
      conditions: item.conditions.length ? item.conditions : [{ key: "service", operator: "eq", value: "web" }],
    });
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingQuestion(true);
    setError("");

    try {
      const key = questionForm.key.trim();
      const title = questionForm.title.trim();

      if (!key || !title) {
        throw new Error("Sistem anahtarı ve soru zorunludur.");
      }

      const options = questionForm.type === "number"
        ? []
        : questionForm.options
            .map(item => ({
              label: item.label.trim(),
              value: item.value.trim(),
              priceDelta: Number(item.priceDelta || 0),
            }))
            .filter(item => item.label && item.value);

      if (questionForm.type !== "number" && options.length < 2) {
        throw new Error("Single veya multi soru için en az 2 seçenek gir.");
      }

      const payload = {
        key,
        title,
        subtitle: questionForm.subtitle.trim(),
        type: questionForm.type,
        options,
        optionsJson: JSON.stringify(options),
        min: questionForm.type === "number" ? Number(questionForm.min || 0) : 0,
        max: questionForm.type === "number" ? Number(questionForm.max || 0) : 0,
        order: Number(questionForm.order || 0),
        active: questionForm.active,
        updatedAt: serverTimestamp(),
      };

      if (questionForm.id) {
        await updateDoc(doc(db, "quote_questions", questionForm.id), payload);
      } else {
        await addDoc(collection(db, "quote_questions"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetQuestionForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Soru kaydedilemedi.");
    } finally {
      setSavingQuestion(false);
    }
  }

  async function saveRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingRule(true);
    setError("");

    try {
      const name = ruleForm.name.trim();

      if (!name) {
        throw new Error("Kural adı zorunlu.");
      }

      const conditions = ruleForm.conditions
        .map(item => ({
          key: item.key.trim(),
          operator: item.operator,
          value: ["gte", "lte"].includes(item.operator) ? Number(item.value || 0) : String(item.value || "").trim(),
        }))
        .filter(item => item.key);

      if (!conditions.length) {
        throw new Error("En az 1 koşul ekle.");
      }

      const payload = {
        name,
        conditions,
        conditionsJson: JSON.stringify(conditions),
        priceType: ruleForm.priceType,
        value: Number(ruleForm.value || 0),
        priority: Number(ruleForm.priority || 0),
        note: ruleForm.note.trim(),
        enabled: ruleForm.enabled,
        updatedAt: serverTimestamp(),
      };

      if (ruleForm.id) {
        await updateDoc(doc(db, "quote_rules", ruleForm.id), payload);
      } else {
        await addDoc(collection(db, "quote_rules"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetRuleForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kural kaydedilemedi.");
    } finally {
      setSavingRule(false);
    }
  }

  async function removeQuestion(id?: string) {
    if (!id) return;
    if (!window.confirm("Bu soru silinsin mi?")) return;

    try {
      await deleteDoc(doc(db, "quote_questions", id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Soru silinemedi.");
    }
  }

  async function removeRule(id?: string) {
    if (!id) return;
    if (!window.confirm("Bu kural silinsin mi?")) return;

    try {
      await deleteDoc(doc(db, "quote_rules", id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Kural silinemedi.");
    }
  }

  function addQuestionOption() {
    setQuestionForm(current => ({
      ...current,
      options: [...current.options, { label: "", value: "", priceDelta: 0 }],
    }));
  }

  function addRuleCondition() {
    setRuleForm(current => ({
      ...current,
      conditions: [...current.conditions, { key: "", operator: "eq", value: "" }],
    }));
  }

  function updatePreviewAnswer(question: QuestionForm, value: string | string[] | number) {
    setPreviewAnswers(current => ({ ...current, [question.key]: value }));
  }

  async function publishSnapshot() {
    setSavingSnapshot(true);
    setError("");
    setStatus("");

    try {
      const snapshotQuestions = questions.map(item => ({
        key: item.key,
        title: item.title,
        subtitle: item.subtitle,
        type: item.type,
        options: item.options,
        min: item.min,
        max: item.max,
        order: item.order,
        active: item.active,
      }));

      const snapshotRules = rules.map(item => ({
        name: item.name,
        conditions: item.conditions,
        priceType: item.priceType,
        value: item.value,
        priority: item.priority,
        note: item.note,
        enabled: item.enabled,
      }));

      await addDoc(collection(db, "quote_engine_versions"), {
        name: `Snapshot ${new Date().toLocaleString("tr-TR")}`,
        questions: snapshotQuestions,
        rules: snapshotRules,
        stats: {
          totalQuestions: snapshotQuestions.length,
          activeQuestions: snapshotQuestions.filter(item => item.active).length,
          totalRules: snapshotRules.length,
          activeRules: snapshotRules.filter(item => item.enabled).length,
        },
        createdAt: serverTimestamp(),
      });

      setStatus("Konfigürasyon snapshot olarak kaydedildi.");
    } catch (snapshotError) {
      setError(snapshotError instanceof Error ? snapshotError.message : "Snapshot kaydedilemedi.");
    } finally {
      setSavingSnapshot(false);
    }
  }

  return (
    <div className="quote-admin-page">
      <div className="admin-title">
        <div>
          <p className="admin-kicker">QUOTE ENGINE CONTROL CENTER</p>
          <h1>Teklif Motoru Builder</h1>
          <p>JSON yazmadan soru ve fiyat kuralı yönet, anlık simülasyonla sonucu gör.</p>
        </div>

        <button type="button" className="admin-action" onClick={publishSnapshot} disabled={savingSnapshot}>
          <Upload size={15} />
          {savingSnapshot ? "Snapshot alınıyor..." : "Snapshot Yayınla"}
        </button>
      </div>

      <div className="admin-segment quote-builder-tabs">
        <button className={tab === "questions" ? "active" : ""} onClick={() => setTab("questions")}>Sorular</button>
        <button className={tab === "rules" ? "active" : ""} onClick={() => setTab("rules")}>Fiyat Kuralları</button>
      </div>

      {error && <div className="admin-alert">{error}</div>}
      {status && <div className="admin-note">{status}</div>}

      <section className="quote-health-grid">
        <article className="admin-panel quote-health-card"><small>Toplam Soru</small><strong>{questions.length}</strong></article>
        <article className="admin-panel quote-health-card"><small>Toplam Kural</small><strong>{rules.length}</strong></article>
        <article className="admin-panel quote-health-card"><small>Pasif Soru</small><strong>{engineHealth.inactiveQuestions}</strong></article>
        <article className="admin-panel quote-health-card"><small>Pasif Kural</small><strong>{engineHealth.inactiveRules}</strong></article>
      </section>

      {(engineHealth.duplicateKeys.length > 0 || engineHealth.duplicatePriorities.length > 0 || engineHealth.orphanConditionKeys.length > 0) && (
        <section className="admin-panel quote-health-alert">
          <h2><AlertTriangle size={16} /> Motor Sağlık Uyarıları</h2>
          {engineHealth.duplicateKeys.length > 0 && <p>Aynı sistem anahtarını kullanan sorular: {engineHealth.duplicateKeys.join(", ")}</p>}
          {engineHealth.duplicatePriorities.length > 0 && <p>Çakışan kural öncelikleri: {engineHealth.duplicatePriorities.join(", ")}</p>}
          {engineHealth.orphanConditionKeys.length > 0 && <p>Sorularda karşılığı olmayan kural koşul anahtarları: {engineHealth.orphanConditionKeys.join(", ")}</p>}
        </section>
      )}

      <div className="quote-builder-layout">
        <section className="admin-panel quote-builder-form">
          {tab === "questions" ? (
            <form onSubmit={saveQuestion} className="quote-form-grid">
              <h2>Soru düzenle</h2>
              <label>Sistem anahtarı<input value={questionForm.key} onChange={event => setQuestionForm(current => ({ ...current, key: event.target.value }))} placeholder="service" required /></label>
              <label>Soru<input value={questionForm.title} onChange={event => setQuestionForm(current => ({ ...current, title: event.target.value }))} placeholder="Ne yaptırmak istiyorsun?" required /></label>
              <label className="full">Alt açıklama<input value={questionForm.subtitle} onChange={event => setQuestionForm(current => ({ ...current, subtitle: event.target.value }))} placeholder="Birden fazla seçebilirsin." /></label>

              <label>Tip
                <select value={questionForm.type} onChange={event => setQuestionForm(current => ({ ...current, type: event.target.value as QuoteQuestion["type"] }))}>
                  <option value="single">single</option>
                  <option value="multi">multi</option>
                  <option value="number">number</option>
                </select>
              </label>

              <label>Sıra<input type="number" value={questionForm.order} onChange={event => setQuestionForm(current => ({ ...current, order: Number(event.target.value || 0) }))} /></label>

              {questionForm.type === "number" ? (
                <>
                  <label>Minimum<input type="number" value={questionForm.min} onChange={event => setQuestionForm(current => ({ ...current, min: Number(event.target.value || 0) }))} /></label>
                  <label>Maksimum<input type="number" value={questionForm.max} onChange={event => setQuestionForm(current => ({ ...current, max: Number(event.target.value || 0) }))} /></label>
                </>
              ) : (
                <div className="full quote-nested-block">
                  <div className="quote-nested-head">
                    <strong>Seçenekler</strong>
                    <button type="button" className="admin-action" onClick={addQuestionOption}><Plus size={15} /> Seçenek ekle</button>
                  </div>
                  <div className="quote-row-list">
                    {questionForm.options.map((option, index) => (
                      <div className="quote-row" key={`${option.value}-${index}`}>
                        <input placeholder="Label" value={option.label} onChange={event => setQuestionForm(current => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} />
                        <input placeholder="Value" value={option.value} onChange={event => setQuestionForm(current => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) }))} />
                        <input type="number" placeholder="Price Delta" value={option.priceDelta} onChange={event => setQuestionForm(current => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, priceDelta: Number(event.target.value || 0) } : item) }))} />
                        <button type="button" className="icon-button" onClick={() => setQuestionForm(current => ({ ...current, options: current.options.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="quote-check"><input type="checkbox" checked={questionForm.active} onChange={event => setQuestionForm(current => ({ ...current, active: event.target.checked }))} /> Aktif</label>

              <div className="quote-form-actions">
                <button type="button" className="button button-ghost" onClick={resetQuestionForm}>Temizle</button>
                <button className="button" disabled={savingQuestion}>{savingQuestion ? "Kaydediliyor..." : questionForm.id ? "Soruyu Güncelle" : "Soru Ekle"}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={saveRule} className="quote-form-grid">
              <h2>Fiyat kuralı düzenle</h2>
              <label>Kural adı<input value={ruleForm.name} onChange={event => setRuleForm(current => ({ ...current, name: event.target.value }))} placeholder="Acil teslim çarpanı" required /></label>
              <label>Öncelik<input type="number" value={ruleForm.priority} onChange={event => setRuleForm(current => ({ ...current, priority: Number(event.target.value || 0) }))} /></label>
              <label>İşlem
                <select value={ruleForm.priceType} onChange={event => setRuleForm(current => ({ ...current, priceType: event.target.value as QuoteRule["priceType"] }))}>
                  <option value="add">add</option>
                  <option value="multiply">multiply</option>
                  <option value="fixed">fixed</option>
                </select>
              </label>
              <label>Değer<input type="number" value={ruleForm.value} onChange={event => setRuleForm(current => ({ ...current, value: Number(event.target.value || 0) }))} /></label>
              <label className="full">Not<input value={ruleForm.note} onChange={event => setRuleForm(current => ({ ...current, note: event.target.value }))} placeholder="Acil proje primi uygulandı." /></label>

              <div className="full quote-nested-block">
                <div className="quote-nested-head">
                  <strong>Koşullar</strong>
                  <button type="button" className="admin-action" onClick={addRuleCondition}><Plus size={15} /> Koşul ekle</button>
                </div>
                <div className="quote-row-list">
                  {ruleForm.conditions.map((condition, index) => (
                    <div className="quote-row" key={`${condition.key}-${index}`}>
                      <input placeholder="Key" value={condition.key} onChange={event => setRuleForm(current => ({ ...current, conditions: current.conditions.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item) }))} />
                      <select value={condition.operator} onChange={event => setRuleForm(current => ({ ...current, conditions: current.conditions.map((item, itemIndex) => itemIndex === index ? { ...item, operator: event.target.value as RuleCondition["operator"] } : item) }))}>
                        <option value="eq">eq</option>
                        <option value="includes">includes</option>
                        <option value="gte">gte</option>
                        <option value="lte">lte</option>
                      </select>
                      <input placeholder="Value" value={String(condition.value)} onChange={event => setRuleForm(current => ({ ...current, conditions: current.conditions.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) }))} />
                      <button type="button" className="icon-button" onClick={() => setRuleForm(current => ({ ...current, conditions: current.conditions.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="quote-check"><input type="checkbox" checked={ruleForm.enabled} onChange={event => setRuleForm(current => ({ ...current, enabled: event.target.checked }))} /> Aktif</label>

              <div className="quote-form-actions">
                <button type="button" className="button button-ghost" onClick={resetRuleForm}>Temizle</button>
                <button className="button" disabled={savingRule}>{savingRule ? "Kaydediliyor..." : ruleForm.id ? "Kuralı Güncelle" : "Kural Ekle"}</button>
              </div>
            </form>
          )}
        </section>

        <section className="admin-panel quote-builder-list">
          <h2>{tab === "questions" ? "Mevcut sorular" : "Mevcut kurallar"}</h2>
          <div className="quote-list-wrap">
            {tab === "questions"
              ? questions.map(item => (
                  <article key={item.id} className="quote-item-card">
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.key} · {item.type} · sıra {item.order}</small>
                    </div>
                    <div className="quote-item-actions">
                      <button type="button" className="admin-action" onClick={() => editQuestion(item)}>Düzenle</button>
                      <button type="button" className="admin-action" onClick={() => removeQuestion(item.id)}><Trash2 size={15} /> Sil</button>
                    </div>
                  </article>
                ))
              : rules.map(item => (
                  <article key={item.id} className="quote-item-card">
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.priceType} {item.value} · öncelik {item.priority}</small>
                    </div>
                    <div className="quote-item-actions">
                      <button type="button" className="admin-action" onClick={() => editRule(item)}>Düzenle</button>
                      <button type="button" className="admin-action" onClick={() => removeRule(item.id)}><Trash2 size={15} /> Sil</button>
                    </div>
                  </article>
                ))}
          </div>
        </section>
      </div>

      <section className="admin-panel quote-simulator">
        <div className="quote-simulator-head">
          <div>
            <p className="admin-kicker">LIVE SIMULATION</p>
            <h2>Teklif simülatörü</h2>
          </div>
          <button type="button" className="admin-action" onClick={() => setPreviewAnswers({})}><Sparkles size={15} /> Cevapları sıfırla</button>
        </div>

        <div className="quote-sim-grid">
          <div className="quote-sim-questions">
            {simulatorQuestions.map(question => (
              <div className="quote-sim-block" key={question.id || question.key}>
                <strong>{question.title}</strong>
                {question.type === "number" ? (
                  <input
                    type="number"
                    value={Number(previewAnswers[question.key] || 0)}
                    onChange={event => updatePreviewAnswer(question, Number(event.target.value || 0))}
                  />
                ) : question.type === "single" ? (
                  <select
                    value={String(previewAnswers[question.key] || "")}
                    onChange={event => updatePreviewAnswer(question, event.target.value)}
                  >
                    <option value="">Seç</option>
                    {question.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <div className="quote-sim-checks">
                    {question.options.map(option => {
                      const current = Array.isArray(previewAnswers[question.key]) ? (previewAnswers[question.key] as string[]) : [];
                      const checked = current.includes(option.value);

                      return (
                        <label key={option.value}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={event => {
                              const next = event.target.checked
                                ? [...current, option.value]
                                : current.filter(item => item !== option.value);

                              updatePreviewAnswer(question, next);
                            }}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <aside className="quote-sim-result">
            <p className="admin-kicker">Tahmini fiyat</p>
            <h3>₺{simulation.price.toLocaleString("tr-TR")}</h3>
            <div>
              {simulation.notes.length
                ? simulation.notes.map(note => <p key={note}><Check size={14} /> {note}</p>)
                : <p>Kural notu yok. Mevcut cevaplara göre temel fiyat hesaplandı.</p>}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
