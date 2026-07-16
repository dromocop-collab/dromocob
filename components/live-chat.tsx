"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ChatMessage = { id: string; sender: "visitor" | "admin"; text: string };

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const current = localStorage.getItem("dromocob-chat-id");
    if (current) return current;
    const id = crypto.randomUUID();
    localStorage.setItem("dromocob-chat-id", id);
    return id;
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const ref = collection(db, "chat_sessions", sessionId, "messages");
   return onSnapshot(
  ref,

  (snap) => {
    const data = snap.docs
      .map(
        (document) =>
          ({
            id: document.id,
            ...document.data(),
          }) as ChatMessage & {
            createdAt?: {
              toMillis(): number;
            };
          }
      )
      .sort(
        (a, b) =>
          (
            a.createdAt?.toMillis?.() ||
            0
          ) -
          (
            b.createdAt?.toMillis?.() ||
            0
          )
      );

    setMessages(data);
  },

  (error) => {
    console.error(
      "[DROMOCOB CHAT] Snapshot error:",
      error.code,
      error.message
    );

    setMessages([]);
  }
);
  }, [sessionId]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || !sessionId) return;
    setText("");
    await setDoc(doc(db, "chat_sessions", sessionId), {
      status: "open",
      updatedAt: serverTimestamp(),
      lastMessage: clean
    }, { merge: true });
    await addDoc(collection(db, "chat_sessions", sessionId, "messages"), {
      sender: "visitor",
      text: clean,
      createdAt: serverTimestamp()
    });
  }

  return (
    <>
      <button className="chat-launcher" onClick={() => setOpen(!open)} aria-label="Canlı destek">
        {open ? <X /> : <MessageCircle />}
      </button>
      {open && (
        <aside className="chat-panel">
          <div className="chat-head">
            <div><strong>Dromocob Canlı Destek</strong><span><i /> Çevrimiçi</span></div>
            <button className="icon-button" onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div className="chat-body">
            <div className="message admin-message">Selam 👋 Projen için buradayım. Ne inşa etmek istiyorsun?</div>
            {messages.map(m => (
              <div key={m.id} className={`message ${m.sender === "visitor" ? "visitor-message" : "admin-message"}`}>{m.text}</div>
            ))}
          </div>
          <form className="chat-form" onSubmit={send}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Mesajını yaz..." maxLength={1000} />
            <button className="icon-button" aria-label="Gönder"><Send size={18} /></button>
          </form>
        </aside>
      )}
    </>
  );
}
