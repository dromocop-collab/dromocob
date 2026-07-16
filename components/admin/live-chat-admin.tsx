"use client";

import { FormEvent, useEffect, useState } from "react";
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Send } from "lucide-react";

type Session = { id: string; lastMessage?: string; status?: string };
type Message = { id: string; sender: "visitor" | "admin"; text: string };

export default function LiveChatAdmin() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => onSnapshot(collection(db, "chat_sessions"), snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session)))), []);
  useEffect(() => {
    if (!active) return;
    return onSnapshot(query(collection(db, "chat_sessions", active, "messages"), orderBy("createdAt")), snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message))));
  }, [active]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active) return;
    const fd = new FormData(e.currentTarget);
    const text = String(fd.get("text") || "").trim();
    if (!text) return;
    await addDoc(collection(db, "chat_sessions", active, "messages"), { sender: "admin", text, createdAt: serverTimestamp() });
    await updateDoc(doc(db, "chat_sessions", active), { lastMessage: text, updatedAt: serverTimestamp() });
    e.currentTarget.reset();
  }

  return <div className="support-console">
    <aside>{sessions.map(s => <button key={s.id} onClick={() => setActive(s.id)} className={active === s.id ? "active" : ""}><span>{s.id.slice(0, 7)}</span><small>{s.lastMessage || "Yeni görüşme"}</small><i>{s.status || "open"}</i></button>)}{!sessions.length && <div className="empty-state">Açık görüşme yok.</div>}</aside>
    <section>{active ? <><div className="support-messages">{messages.map(m => <div className={`message ${m.sender === "admin" ? "admin-message" : "visitor-message"}`} key={m.id}>{m.text}</div>)}</div><form onSubmit={send}><input name="text" placeholder="Yanıt yaz..." autoComplete="off"/><button><Send size={17}/></button></form></> : <div className="support-placeholder">Bir görüşme seç.</div>}</section>
  </div>;
}
