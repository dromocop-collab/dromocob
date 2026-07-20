"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { db } from "@/lib/firebase";
import type { CustomerSiteRecord } from "@/lib/customer-sites";

type Activation = Record<string, unknown> & { id: string };
type Stage = "new" | "reviewing" | "contacted" | "quoted" | "won" | "lost";

const stages: Array<{ id: Stage; label: string }> = [
  { id: "new", label: "Yeni talep" },
  { id: "reviewing", label: "Teknik inceleme" },
  { id: "contacted", label: "Müşteri görüşmesi" },
  { id: "quoted", label: "Ödeme bekliyor" },
  { id: "won", label: "Aktif / Tamamlandı" },
  { id: "lost", label: "İptal edildi" },
];

function millis(item: Activation) {
  const value = item.createdAt as { toMillis?: () => number; seconds?: number } | undefined;
  return value?.toMillis?.() || Number(value?.seconds || 0) * 1000;
}

function dateLabel(item: Activation) {
  const value = millis(item);
  return value ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(value) : "Tarih yok";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export default function SiteActivationsPage() {
  const [requests, setRequests] = useState<Activation[]>([]);
  const [sites, setSites] = useState<CustomerSiteRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [stage, setStage] = useState<"all" | Stage>("all");
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(collection(db, "quotes"), snapshot => {
    const next = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Activation)).filter(item => item.quoteVersion === "site-activation-v1").sort((a, b) => millis(b) - millis(a));
    setRequests(next);
    setSelectedId(current => current && next.some(item => item.id === current) ? current : next[0]?.id || "");
    setError("");
  }, snapshotError => setError(snapshotError.message || "Aktivasyon talepleri okunamadı.")), []);

  useEffect(() => onSnapshot(collection(db, "customer_sites"), snapshot => {
    setSites(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as CustomerSiteRecord)));
  }, snapshotError => setError(snapshotError.message || "Müşteri siteleri okunamadı.")), []);

  const selected = requests.find(item => item.id === selectedId) || null;
  const selectedAnswers = record(selected?.answers);
  const selectedContact = record(selected?.contact);
  const selectedSite = sites.find(site => site.id === String(selectedAnswers.siteId || "")) || null;

  useEffect(() => {
    queueMicrotask(() => setNote(String(selected?.adminNote || "")));
  }, [selected]);

  const filtered = useMemo(() => requests.filter(item => {
    if (stage !== "all" && String(item.status || "new") !== stage) return false;
    const answers = record(item.answers);
    const contact = record(item.contact);
    return [item.id, item.serviceLabel, answers.plan, answers.subdomain, contact.name, contact.company, contact.email].join(" ").toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"));
  }), [requests, search, stage]);

  async function updateStage(nextStage: Stage) {
    if (!selected) return;
    try {
      await updateDoc(doc(db, "quotes", selected.id), { status: nextStage, updatedAt: serverTimestamp() });
      setNotice("Aktivasyon aşaması güncellendi.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Aşama güncellenemedi.");
    }
  }

  async function saveNote() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "quotes", selected.id), { adminNote: note.trim(), updatedAt: serverTimestamp() });
      setNotice("Operasyon notu kaydedildi.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Not kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const newCount = requests.filter(item => item.status === "new").length;
  const pipelineValue = requests.filter(item => !["won", "lost"].includes(String(item.status))).reduce((total, item) => total + Number(item.estimatedPrice || 0), 0);
  const liveCount = requests.filter(item => item.status === "won").length;

  return <div className="activation-admin">
    <div className="admin-title activation-admin-title"><div><p className="admin-kicker">DROMOCOB SITES / REVENUE OPERATIONS</p><h1>Site Aktivasyonları</h1><p>Müşteri seçimini, tasarımını, ödeme ve yayın sürecini tek operasyon ekranında yönet.</p></div><div className="activation-admin-live"><i /> OPERASYON CANLI</div></div>
    {error && <div className="admin-alert">{error}</div>}{notice && <div className="activation-admin-notice"><Check size={14} /> {notice}</div>}
    <section className="activation-admin-metrics"><article><span><Rocket /></span><div><small>YENİ AKTİVASYON</small><strong>{newCount}</strong><p>İşlem bekleyen talep</p></div></article><article><span><CircleDollarSign /></span><div><small>AÇIK PIPELINE</small><strong>₺{pipelineValue.toLocaleString("tr-TR")}</strong><p>Seçilen dönem toplamı</p></div></article><article><span><Activity /></span><div><small>CANLIYA ALINAN</small><strong>{liveCount}</strong><p>Tamamlanan aktivasyon</p></div></article><article><span><BarChart3 /></span><div><small>DÖNÜŞÜM</small><strong>{requests.length ? `%${Math.round(liveCount / requests.length * 100)}` : "%0"}</strong><p>Talep → aktif site</p></div></article></section>

    <section className="activation-command"><div className="activation-stage-filter"><button className={stage === "all" ? "active" : ""} onClick={() => setStage("all")}>Tümü <b>{requests.length}</b></button>{stages.map(item => <button key={item.id} className={stage === item.id ? "active" : ""} onClick={() => setStage(item.id)}>{item.label}</button>)}</div><label><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Müşteri, site, plan veya referans ara" /></label></section>

    <div className="activation-ops-grid">
      <section className="activation-request-list">{filtered.length ? filtered.map(item => { const answers = record(item.answers); const contact = record(item.contact); const status = String(item.status || "new"); return <button key={item.id} className={selectedId === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><div className="activation-request-icon"><Rocket size={17} /></div><div><span>{String(answers.plan || "Plan")}</span><strong>{String(contact.company || contact.name || "Müşteri")}</strong><small>{String(answers.subdomain || "site")}.dromocob.tr · {dateLabel(item)}</small></div><aside><b>₺{Number(item.estimatedPrice || 0).toLocaleString("tr-TR")}</b><span className={`activation-stage stage-${status}`}>{stages.find(entry => entry.id === status)?.label || status}</span></aside><ArrowRight size={16} /></button>; }) : <div className="empty-state">Bu görünümde aktivasyon talebi yok.</div>}</section>

      <section className="activation-workbench">{selected ? <>
        <header><div><p>AKTİVASYON DOSYASI / {selected.id}</p><h2>{String(selectedContact.company || selectedContact.name || "Müşteri")}</h2><span><Clock3 size={13} /> {dateLabel(selected)}</span></div><label>Aşama<select value={String(selected.status || "new")} onChange={event => updateStage(event.target.value as Stage)}>{stages.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></header>
        <div className="activation-workbench-body">
          <section className="activation-client-card"><div><UserRound /><span>Müşteri</span><strong>{String(selectedContact.name || "—")}</strong><small>{String(selectedContact.company || "Firma belirtilmedi")}</small></div><div><Mail /><span>E-posta</span><a href={`mailto:${String(selectedContact.email || "")}`}>{String(selectedContact.email || "—")}</a></div><div><Phone /><span>Telefon</span><a href={`tel:${String(selectedContact.phone || "")}`}>{String(selectedContact.phone || "—")}</a></div><div><MapPin /><span>Şehir</span><strong>{String(selectedContact.city || "—")}</strong></div></section>
          <section className="activation-commercial-card"><div><p>SEÇİLEN YAYIN PLANI</p><h3>{String(selectedAnswers.plan || "—")}</h3><span>{String(selectedAnswers.billing || "monthly") === "annual" ? "Yıllık ödeme · 2 ay avantaj" : "Aylık ödeme"}</span></div><div><small>TALEP DEĞERİ</small><strong>₺{Number(selected.estimatedPrice || 0).toLocaleString("tr-TR")} <i>+ KDV</i></strong></div></section>
          {selectedSite ? <section className="activation-site-file"><header><div><p>MÜŞTERİNİN OLUŞTURDUĞU SİTE</p><h3>{selectedSite.businessName}</h3><a href={`https://${selectedSite.subdomain}.dromocob.tr`} target="_blank" rel="noreferrer"><Globe2 size={13} /> {selectedSite.subdomain}.dromocob.tr <ExternalLink size={12} /></a></div><span className="activation-template-badge">{selectedSite.template.toUpperCase()}</span></header><div className={`activation-site-preview activation-site-${selectedSite.template}`} style={{ "--activation-accent": selectedSite.accent } as React.CSSProperties}><nav><strong>{selectedSite.businessName}</strong><span /><span /><button /></nav><section><small>DROMOCOB SITES</small><h4>{selectedSite.headline}</h4><i /></section></div><div className="activation-site-facts"><article><FileText /><span><strong>{selectedSite.pages?.length || 3}</strong> sayfa</span></article><article><LayoutDashboard /><span><strong>{selectedSite.pages?.reduce((total, page) => total + page.sections.length, 0) || 0}</strong> bölüm</span></article><article><ShieldCheck /><span><strong>{selectedSite.siteSettings?.cookieBanner ? "Aktif" : "Kapalı"}</strong> KVKK</span></article><article><BarChart3 /><span><strong>{selectedSite.siteSettings?.analytics ? "Aktif" : "Kapalı"}</strong> Analytics</span></article></div><div className="activation-pages"><p>SİTE MİMARİSİ</p>{(selectedSite.pages || []).map(page => <span key={page.id}><FileText size={13} /><strong>{page.title}</strong><small>{page.slug} · {page.sections.length} bölüm</small></span>)}</div></section> : <section className="activation-site-missing"><Globe2 /><h3>Site kaydı eşleştirilemedi.</h3><p>Talepteki site kimliği mevcut müşteri siteleri arasında bulunamadı.</p></section>}
          <section className="activation-operator-note"><div><p>OPERASYON NOTU</p><span>Ödeme, alan adı veya müşteri görüşmesiyle ilgili ekip içi not.</span></div><textarea rows={4} value={note} onChange={event => setNote(event.target.value)} placeholder="Örn. Müşteri yıllık Business planı onayladı. Ödeme bağlantısı gönderilecek…" /><button onClick={saveNote} disabled={saving}><Save size={15} /> {saving ? "Kaydediliyor" : "Notu kaydet"}</button></section>
        </div>
      </> : <div className="activation-empty-workbench"><Sparkles /><h2>Bir aktivasyon dosyası seç.</h2><p>Müşteri, plan ve site detayları burada açılacak.</p></div>}</section>
    </div>
  </div>;
}
