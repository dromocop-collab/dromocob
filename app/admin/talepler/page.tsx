"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Item = Record<string, unknown> & { id: string };

export default function RequestsPage() {
  const [contacts, setContacts] = useState<Item[]>([]);
  const [quotes, setQuotes] = useState<Item[]>([]);
  useEffect(() => onSnapshot(collection(db, "contacts"), s => setContacts(s.docs.map(d => ({ id:d.id, ...d.data() })))), []);
  useEffect(() => onSnapshot(collection(db, "quotes"), s => setQuotes(s.docs.map(d => ({ id:d.id, ...d.data() })))), []);
  return <>
    <div className="admin-title"><div><p className="admin-kicker">LEADS & INTAKE</p><h1>Form & Talepler</h1><p>İletişim ve otomatik teklif talepleri.</p></div></div>
    <div className="admin-dashboard-grid">
      <section className="admin-panel"><h2>İletişim talepleri</h2><div className="request-list">{contacts.map(x => <article key={x.id}><strong>{String(x.name || "İsimsiz")}</strong><small>{String(x.email || "")}</small><p>{String(x.message || "")}</p></article>)}</div></section>
      <section className="admin-panel"><h2>Otomatik teklifler</h2><div className="request-list">{quotes.map(x => <article key={x.id}><strong>{Number(x.estimatedPrice || 0).toLocaleString("tr-TR")} TL</strong><small>Durum: {String(x.status || "new")}</small><pre>{JSON.stringify(x.answers, null, 2)}</pre></article>)}</div></section>
    </div>
  </>;
}
