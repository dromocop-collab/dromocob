"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { BriefcaseBusiness, CalendarClock, ChevronRight, CircleDollarSign, Mail, MapPin, Phone, Search, UserRound, X } from "lucide-react";
import { db } from "@/lib/firebase";

type Item = Record<string, unknown> & { id: string };
type Selection = { key?: string; title?: string; labels?: string[]; values?: string[] };

function createdMillis(item: Item) {
  const value = item.createdAt as { toMillis?: () => number; seconds?: number } | undefined;
  return value?.toMillis?.() || Number(value?.seconds || 0) * 1000;
}

function dateLabel(item: Item) {
  const millis = createdMillis(item);
  return millis ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(millis) : "Tarih yok";
}

function contactOf(item: Item) {
  return (item.contact && typeof item.contact === "object" ? item.contact : {}) as Record<string, unknown>;
}

const statusLabels: Record<string, string> = {
  new: "Yeni",
  reviewing: "İnceleniyor",
  contacted: "İletişime geçildi",
  quoted: "Teklif gönderildi",
  won: "Kazanıldı",
  lost: "Kaybedildi",
};

export default function RequestsPage() {
  const [contacts, setContacts] = useState<Item[]>([]);
  const [quotes, setQuotes] = useState<Item[]>([]);
  const [subscribers, setSubscribers] = useState<Item[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Item | null>(null);
  const [filter, setFilter] = useState<"all" | "web" | "video">("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(collection(db, "contacts"), snapshot => { setContacts(snapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => createdMillis(b) - createdMillis(a))); setError(""); }, snapshotError => { setContacts([]); setError(snapshotError.message || "İletişim talepleri okunamadı."); }), []);
  useEffect(() => onSnapshot(collection(db, "newsletter_subscribers"), snapshot => { setSubscribers(snapshot.docs.map(item => ({ id: item.id, ...item.data() }))); }, snapshotError => { setSubscribers([]); setError(snapshotError.message || "Abone listesi okunamadı."); }), []);
  useEffect(() => onSnapshot(collection(db, "quotes"), snapshot => { const next = snapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => createdMillis(b) - createdMillis(a)); setQuotes(next); setSelectedQuote(current => current ? next.find(item => item.id === current.id) || null : null); setError(""); }, snapshotError => { setQuotes([]); setError(snapshotError.message || "Teklif talepleri okunamadı."); }), []);

  const filteredQuotes = useMemo(() => quotes.filter(item => {
    if (filter !== "all" && item.service !== filter) return false;
    const contact = contactOf(item);
    const haystack = [item.serviceLabel, contact.name, contact.company, contact.email, contact.phone, item.id].join(" ").toLocaleLowerCase("tr-TR");
    return haystack.includes(search.toLocaleLowerCase("tr-TR"));
  }), [quotes, filter, search]);

  async function changeStatus(item: Item, status: string) {
    try { await updateDoc(doc(db, "quotes", item.id), { status, updatedAt: serverTimestamp() }); }
    catch (statusError) { setError(statusError instanceof Error ? statusError.message : "Durum güncellenemedi."); }
  }

  const selections = (selectedQuote?.answerSelections as Selection[] | undefined) || [];
  const selectedContact = selectedQuote ? contactOf(selectedQuote) : {};

  return <>
    <div className="admin-title"><div><p className="admin-kicker">LEADS & SCOPE INTAKE</p><h1>Teklif Talepleri</h1><p>Web, yazılım ve prodüksiyon kapsamlarını tek merkezde incele.</p></div><div className="request-count-badge"><strong>{quotes.length}</strong><span>toplam teklif</span></div></div>
    {error && <div className="admin-alert">{error}</div>}
    <section className="request-metric-grid"><article><CircleDollarSign/><div><strong>{quotes.filter(item => item.status === "new").length}</strong><span>Yeni talep</span></div></article><article><BriefcaseBusiness/><div><strong>{quotes.filter(item => item.service === "web").length}</strong><span>Web & yazılım</span></div></article><article><CalendarClock/><div><strong>{quotes.filter(item => item.service === "video").length}</strong><span>Video & film</span></div></article><article><Mail/><div><strong>{contacts.length}</strong><span>İletişim formu</span></div></article></section>
    <div className="request-control-bar"><div className="admin-segment"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Tümü</button><button className={filter === "web" ? "active" : ""} onClick={() => setFilter("web")}>Web</button><button className={filter === "video" ? "active" : ""} onClick={() => setFilter("video")}>Video</button></div><label><Search/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="İsim, firma, e-posta veya referans ara"/></label></div>
    <section className="advanced-request-list" aria-label="Teklif talepleri">{filteredQuotes.length ? filteredQuotes.map(item => {
      const contact = contactOf(item);
      const advanced = item.quoteVersion === "advanced-v1";
      const status = String(item.status || "new");
      return <button key={item.id} onClick={() => setSelectedQuote(item)}><div className={`request-service-mark is-${String(item.service || "legacy")}`}>{item.service === "video" ? "VF" : item.service === "web" ? "WW" : "QT"}</div><div className="request-primary"><span>{String(item.serviceLabel || "Genel teklif")} {advanced && <i>GELİŞMİŞ</i>}</span><strong>{String(contact.name || "İletişim bilgisi yok")}{contact.company ? ` / ${String(contact.company)}` : ""}</strong><small>{dateLabel(item)} · {item.id}</small></div><div className="request-price"><strong>{Number(item.estimatedPrice || 0).toLocaleString("tr-TR")} TL+</strong><span className={`request-status status-${status}`}>{statusLabels[status] || status}</span></div><ChevronRight aria-hidden="true"/></button> }) : <div className="empty-state">Bu filtrede teklif bulunamadı.</div>}</section>

    <div className="secondary-request-grid"><section className="admin-panel"><h2>İletişim talepleri <span>{contacts.length}</span></h2><div className="request-list">{contacts.slice(0, 12).map(item => <article key={item.id}><strong>{String(item.name || "İsimsiz")}</strong><small>{String(item.email || "")} · {String(item.phone || "")}</small><p>{String(item.message || "")}</p></article>)}</div></section><section className="admin-panel"><h2>E-posta aboneleri <span>{subscribers.length}</span></h2><div className="request-list">{subscribers.slice(0, 12).map(item => <article key={item.id}><strong>{String(item.email || "")}</strong><small>{String(item.status || "active")} · {String(item.source || "website")}</small></article>)}</div></section></div>

    {selectedQuote && <div className="request-detail-backdrop" onClick={() => setSelectedQuote(null)}><aside className="request-detail-drawer" onClick={event => event.stopPropagation()}><header><div><p className="admin-kicker">SCOPE REQUEST / {selectedQuote.id}</p><h2>{String(selectedQuote.serviceLabel || "Teklif detayı")}</h2><span>{dateLabel(selectedQuote)}</span></div><button onClick={() => setSelectedQuote(null)}><X/></button></header><section className="request-contact-card"><div><UserRound/><span>Ad / Firma</span><strong>{String(selectedContact.name || "—")} {selectedContact.company ? `/ ${String(selectedContact.company)}` : ""}</strong></div><div><Mail/><span>E-posta</span><a href={`mailto:${String(selectedContact.email || "")}`}>{String(selectedContact.email || "—")}</a></div><div><Phone/><span>Telefon</span><a href={`tel:${String(selectedContact.phone || "")}`}>{String(selectedContact.phone || "—")}</a></div><div><MapPin/><span>Şehir / Tercih</span><strong>{String(selectedContact.city || "—")} · {String(selectedContact.preferredContact || "—")}</strong></div></section><section className="request-detail-status"><div><span>Ön kapsam değeri</span><strong>{Number(selectedQuote.estimatedPrice || 0).toLocaleString("tr-TR")} TL+</strong></div><label>Talep durumu<select value={String(selectedQuote.status || "new")} onChange={event => changeStatus(selectedQuote, event.target.value)}><option value="new">Yeni</option><option value="reviewing">İnceleniyor</option><option value="contacted">İletişime geçildi</option><option value="quoted">Teklif gönderildi</option><option value="won">Kazanıldı</option><option value="lost">Kaybedildi</option></select></label></section><section className="request-scope-details"><p className="admin-kicker">TÜM KAPSAM CEVAPLARI / {selections.length}</p>{selections.length ? selections.map((item, index) => <article key={`${item.key}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.labels?.join(" · ") || item.values?.join(" · ")}</p></div></article>) : <pre>{JSON.stringify(selectedQuote.answers, null, 2)}</pre>}</section></aside></div>}
  </>;
}
