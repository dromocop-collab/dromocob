"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, Send, ShieldCheck, Star } from "lucide-react";

type Comment = { id: string; name: string; rating: number; message: string; createdAt: string };

export function FethiyeComments({ slug, placeName }: { slug: string; placeName: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/public/fethiye/${slug}/comments`, { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(payload => { if (active) setComments(Array.isArray(payload.comments) ? payload.comments : []); })
      .catch(() => { if (active) setComments([]); });
    return () => { active = false; };
  }, [slug]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch(`/api/public/fethiye/${slug}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, rating, website }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Yorum gönderilemedi.");
      setStatus("success");
      setName(""); setEmail(""); setMessage(""); setRating(5);
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : "Yorum gönderilemedi.");
    }
  }

  return <section className="fethiye-comments" id="yorumlar">
    <div className="fethiye-comments-head"><div><p className="eyebrow"><MessageCircle/> ZİYARETÇİ DEFTERİ</p><h2>{placeName} hakkında<br/><em>deneyimini paylaş.</em></h2></div><p>Gerçek deneyimler rotayı daha iyi yapar. Yorumlar kişisel bilgi ve uygunsuz içerik kontrolünden sonra yayınlanır.</p></div>
    <div className="fethiye-comments-layout">
      <div className="fethiye-comment-list">{comments.length ? comments.map(comment => <article key={comment.id}><div><span>{comment.name.slice(0, 1).toLocaleUpperCase("tr-TR")}</span><div><strong>{comment.name}</strong><small>{comment.createdAt}</small></div></div><div className="fethiye-comment-stars" aria-label={`${comment.rating} yıldız`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={index < comment.rating ? "is-filled" : ""}/>)}</div><p>{comment.message}</p></article>) : <div className="fethiye-comments-empty"><MessageCircle/><strong>İlk notu sen bırak.</strong><p>Bu rota için onaylanmış ziyaretçi yorumu henüz yok.</p></div>}</div>
      <form onSubmit={submit} className="fethiye-comment-form"><div className="fethiye-form-top"><span><ShieldCheck/> MODERASYONLU YORUM</span><small>E-posta adresin yayınlanmaz.</small></div><label><span>Adın</span><input required minLength={2} maxLength={60} value={name} onChange={event => setName(event.target.value)} placeholder="Nasıl görünmek istersin?"/></label><label><span>E-posta</span><input required type="email" maxLength={140} value={email} onChange={event => setEmail(event.target.value)} placeholder="ornek@mail.com"/></label><fieldset><legend>Puanın</legend><div>{[1,2,3,4,5].map(value => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} yıldız`} className={value <= rating ? "is-active" : ""}><Star/></button>)}</div></fieldset><label><span>Deneyimin</span><textarea required minLength={12} maxLength={900} value={message} onChange={event => setMessage(event.target.value)} placeholder={`${placeName} rotasında neleri sevdin, neyi bilmek faydalı olurdu?`}/></label><label className="fethiye-honeypot" aria-hidden="true"><span>Web sitesi</span><input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)}/></label><button className="button" disabled={status === "sending"}>{status === "sending" ? "Gönderiliyor…" : <>Yorumu gönder <Send/></>}</button>{status === "success" && <p className="fethiye-form-success"><CheckCircle2/> Yorumun alındı; kontrolün ardından yayınlanacak.</p>}{status === "error" && <p className="fethiye-form-error">{error}</p>}</form>
    </div>
  </section>;
}
