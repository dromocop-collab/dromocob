"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Check, CheckCircle2, Clapperboard, Clock3, Eye, Gift, Globe, LayoutTemplate, Loader2, Mail, Megaphone, Search, Send, Sparkles, Users, XCircle } from "lucide-react";

type Subscriber = { id: string; email: string; status: string; source?: string; consentAt?: Timestamp };
type Campaign = { id: string; subject: string; status: string; recipientCount?: number; createdAt?: Timestamp };

const CAMPAIGN_TEMPLATES = [
  { id: "web-launch", icon: Globe, category: "WEB APPLICATION", title: "Yeni dijital ürün lansmanı", subject: "Yeni nesil dijital deneyim yayında", preheader: "Dromocob'un son web application projesini ve üretim yaklaşımını keşfet.", content: "Yeni projemizi yayına aldık. Strateji, kullanıcı deneyimi ve modern teknolojiyi tek bir dijital sistemde birleştirdik.\n\nProjenin nasıl tasarlandığını, hangi iş hedeflerine odaklandığını ve markaya kazandırdığı yeni yetenekleri inceleyebilirsin.", ctaLabel: "Projeyi incele", ctaUrl: "https://dromocob.tr/projeler" },
  { id: "film-premiere", icon: Clapperboard, category: "FILM PRODUCTION", title: "Yeni marka filmi", subject: "Yeni filmimiz yayında", preheader: "Konseptten renk tasarımına uzanan yeni Dromocob prodüksiyonu.", content: "Yeni marka filmimizin prömiyerini seninle paylaşmak istedik. Kreatif konsept, sinematografi ve post prodüksiyonun aynı anlatıda buluştuğu bu çalışmayı şimdi izleyebilirsin.\n\nYeni bir kampanya veya marka filmi planlıyorsan kapsamı birlikte oluşturabiliriz.", ctaLabel: "Filmi izle", ctaUrl: "https://dromocob.tr/projeler" },
  { id: "flagship", icon: Sparkles, category: "DIGITAL FLAGSHIP", title: "Birleşik dönüşüm paketi", subject: "Web, film ve büyüme tek sistemde", preheader: "Digital Flagship ile markanın tüm dijital yüzünü birlikte dönüştür.", content: "Parçalı ajans ve tedarikçi süreçleri yerine; web application, video prodüksiyon ve büyüme altyapısını tek bir ekipte birleştiren Digital Flagship sistemini oluşturduk.\n\nMarkanın yeni dönemini entegre bir üretim modeliyle planlamak için kapsamı inceleyebilirsin.", ctaLabel: "Flagship'i keşfet", ctaUrl: "https://dromocob.tr/paketler" },
  { id: "offer", icon: Gift, category: "PRIVATE OFFER", title: "Özel dönem teklifi", subject: "Markan için özel bir çalışma alanı açtık", preheader: "Sınırlı proje kontenjanı için Dromocob keşif görüşmesi.", content: "Yeni dönem üretim takvimimizde sınırlı sayıda marka için özel proje alanı açtık. Web application, prodüksiyon veya birleşik dönüşüm ihtiyacını birlikte değerlendirebiliriz.\n\nKısa keşif formunu tamamladığında ihtiyacına uygun kapsamı hazırlayacağız.", ctaLabel: "Teklifini oluştur", ctaUrl: "https://dromocob.tr/paketler#teklif" },
  { id: "dispatch", icon: Mail, category: "EDITORIAL", title: "Aylık Dromocob Dispatch", subject: "Bu ay radarımızda neler var?", preheader: "Teknoloji, prodüksiyon ve dijital büyümeden kısa notlar.", content: "Bu ayın Dromocob Dispatch seçkisinde; dijital ürünlerde dönüşüm tasarımı, marka filmlerinde anlatı yapısı ve sürdürülebilir büyüme sistemleri üzerine notlarımızı derledik.\n\nYeni işler, üretim arkası detaylar ve kullandığımız yöntemler için seçkiyi inceleyebilirsin.", ctaLabel: "Aylık seçkiyi gör", ctaUrl: "https://dromocob.tr/kurumsal" },
  { id: "reactivation", icon: Megaphone, category: "RE-ENGAGEMENT", title: "Yeniden etkileşim", subject: "Bir süredir görüşemedik", preheader: "Dromocob'da yeni sistemler, projeler ve üretim modelleri var.", content: "Bir süredir görüşemedik. Bu sırada Dromocob'u web application, film prodüksiyon ve growth operasyonlarını tek merkezde yöneten daha kapsamlı bir sisteme dönüştürdük.\n\nYeni projeleri ve güncel çalışma modelimizi keşfetmek istersen seni yeniden aramızda görmekten mutluluk duyarız.", ctaLabel: "Neler değişti?", ctaUrl: "https://dromocob.tr/kurumsal" },
];

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [preview, setPreview] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(collection(db, "newsletter_subscribers"), snapshot => {
    setSubscribers(snapshot.docs.map(document => ({ id: document.id, ...(document.data() as Omit<Subscriber, "id">) })));
  }, snapshotError => setError(snapshotError.message)), []);

  useEffect(() => onSnapshot(query(collection(db, "newsletter_campaigns"), orderBy("createdAt", "desc")), snapshot => {
    setCampaigns(snapshot.docs.map(document => ({ id: document.id, ...(document.data() as Omit<Campaign, "id">) })));
  }, snapshotError => setError(snapshotError.message)), []);

  const filtered = useMemo(() => subscribers.filter(item => {
    const matchesSearch = item.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "all" || item.status === filter;
    return matchesSearch && matchesStatus;
  }), [filter, search, subscribers]);

  const activeCount = subscribers.filter(item => item.status === "active").length;
  const selectedEmails = selected.length ? selected : [];

  function toggleAll() {
    const visibleEmails = filtered.map(item => item.email);
    setSelected(visibleEmails.every(email => selected.includes(email)) ? selected.filter(email => !visibleEmails.includes(email)) : [...new Set([...selected, ...visibleEmails])]);
  }

  function applyTemplate(template: (typeof CAMPAIGN_TEMPLATES)[number]) {
    setSubject(template.subject);
    setPreheader(template.preheader);
    setContent(template.content);
    setCtaLabel(template.ctaLabel);
    setCtaUrl(template.ctaUrl);
    setActiveTemplate(template.id);
    setPreview(false);
    setNotice(`“${template.title}” şablonu editöre uygulandı. Göndermeden önce düzenleyebilirsin.`);
  }

  async function sendCampaign(event: FormEvent) {
    event.preventDefault();
    if (!window.confirm(`${selectedEmails.length || activeCount} alıcıya kampanya kuyruğa alınsın mı?`)) return;
    setSending(true); setError(""); setNotice("");
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Admin oturumu bulunamadı.");
      const response = await fetch("/api/admin/newsletter/campaigns", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ subject, preheader, content, ctaLabel, ctaUrl, recipients: selectedEmails }) });
      const result = await response.json() as { ok?: boolean; message?: string; recipientCount?: number };
      if (!response.ok) throw new Error(result.message || "Gönderim başlatılamadı.");
      setNotice(`${result.recipientCount || 0} alıcı için kampanya başarıyla kuyruğa alındı.`);
      setSubject(""); setPreheader(""); setContent(""); setCtaLabel(""); setCtaUrl(""); setSelected([]);
    } catch (sendError) { setError(sendError instanceof Error ? sendError.message : "Gönderim başlatılamadı."); }
    finally { setSending(false); }
  }

  return <div className="audience-page">
    <header className="audience-head"><div><p className="admin-kicker">AUDIENCE & CAMPAIGNS</p><h1>Aboneler & Mail</h1><p>İzinli kitleni yönet, premium kampanyalar oluştur ve gönderim geçmişini izle.</p></div><div className="audience-live"><i/> Trigger Email bağlı</div></header>

    {error && <div className="studio-alert studio-alert-error"><XCircle size={16}/>{error}</div>}
    {notice && <div className="studio-alert studio-alert-success"><CheckCircle2 size={16}/>{notice}</div>}

    <section className="audience-metrics">
      <article><span><Users/></span><div><small>Toplam kitle</small><strong>{subscribers.length}</strong><p>İzinli kayıt</p></div></article>
      <article><span><CheckCircle2/></span><div><small>Aktif aboneler</small><strong>{activeCount}</strong><p>Gönderime uygun</p></div></article>
      <article><span><Mail/></span><div><small>Kampanyalar</small><strong>{campaigns.length}</strong><p>Toplam gönderim</p></div></article>
      <article><span><Clock3/></span><div><small>Kuyruk durumu</small><strong>{campaigns.filter(item => item.status === "queued").length}</strong><p>İşlenmeyi bekliyor</p></div></article>
    </section>

    <section className="campaign-template-library">
      <div className="template-library-head"><div><span><LayoutTemplate/></span><div><p className="admin-kicker">READY-TO-SEND LIBRARY</p><h2>Hazır kampanyalar</h2><small>Şablonu seç, markana göre düzenle ve hedef kitlene gönder.</small></div></div><button onClick={() => setTemplateOpen(!templateOpen)}>{templateOpen ? "Kütüphaneyi daralt" : "Şablonları göster"}</button></div>
      {templateOpen && <div className="campaign-template-grid">{CAMPAIGN_TEMPLATES.map(template => { const TemplateIcon = template.icon; return <button key={template.id} className={activeTemplate === template.id ? "active" : ""} onClick={() => applyTemplate(template)}><div><span><TemplateIcon/></span><i>{template.category}</i>{activeTemplate === template.id && <b><Check/> Seçildi</b>}</div><h3>{template.title}</h3><p>{template.preheader}</p><small>Şablonu kullan <Send/></small></button>; })}</div>}
    </section>

    <div className="audience-layout">
      <section className="audience-list-panel">
        <div className="audience-panel-head"><div><p className="admin-kicker">SUBSCRIBER DIRECTORY</p><h2>Abone veritabanı</h2></div><button onClick={toggleAll}><Check size={15}/>{filtered.length && filtered.every(item => selected.includes(item.email)) ? "Seçimi kaldır" : "Tümünü seç"}</button></div>
        <div className="audience-toolbar"><label><Search/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="E-posta ara..."/></label><select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Tüm durumlar</option><option value="active">Aktif</option><option value="unsubscribed">Ayrılanlar</option></select><span>{selected.length} seçili</span></div>
        <div className="audience-table"><div className="audience-table-head"><span/><span>Abone</span><span>Kaynak</span><span>Durum</span><span>Kayıt</span></div>{filtered.map(item => <label className="audience-row" key={item.id}><input type="checkbox" checked={selected.includes(item.email)} onChange={() => setSelected(current => current.includes(item.email) ? current.filter(email => email !== item.email) : [...current, item.email])}/><span><b>{item.email.slice(0,1).toUpperCase()}</b><strong>{item.email}</strong></span><small>{item.source || "website_footer"}</small><i className={item.status === "active" ? "active" : ""}>{item.status === "active" ? "Aktif" : "Ayrıldı"}</i><time>{item.consentAt?.toDate().toLocaleDateString("tr-TR") || "—"}</time></label>)}</div>
      </section>

      <aside className="campaign-composer">
        <div className="audience-panel-head"><div><p className="admin-kicker">CAMPAIGN COMPOSER</p><h2>Yeni kampanya</h2></div><button className="preview-toggle" type="button" onClick={() => setPreview(!preview)}><Eye size={15}/>{preview ? "Düzenle" : "Önizle"}</button></div>
        {preview ? <div className="campaign-preview"><div>DROMOCOB</div><small>Dromocob Dispatch</small><h3>{subject || "Kampanya başlığı"}</h3><p>{content || "Kampanya içeriğinin önizlemesi burada görünecek."}</p>{ctaLabel && <span>{ctaLabel}</span>}</div> : <form onSubmit={sendCampaign} className="campaign-form"><label>Konu satırı<input value={subject} onChange={event => setSubject(event.target.value)} maxLength={140} placeholder="Okuyucunun dikkatini çekecek başlık" required/></label><label>Önizleme metni<input value={preheader} onChange={event => setPreheader(event.target.value)} maxLength={180} placeholder="Gelen kutusunda görünen kısa açıklama"/></label><label>Mesaj<textarea value={content} onChange={event => setContent(event.target.value)} rows={9} placeholder="Kampanya mesajını yaz..." required/></label><div><label>Buton metni<input value={ctaLabel} onChange={event => setCtaLabel(event.target.value)} placeholder="Projeyi incele"/></label><label>Buton bağlantısı<input value={ctaUrl} onChange={event => setCtaUrl(event.target.value)} placeholder="https://dromocob.tr/..."/></label></div><div className="campaign-audience-summary"><Sparkles/><span><strong>{selectedEmails.length || activeCount} alıcı</strong>{selectedEmails.length ? "Seçili aboneler" : "Tüm aktif aboneler"}</span></div><button className="campaign-send" disabled={sending}>{sending ? <Loader2 className="spin"/> : <Send/>}{sending ? "Kuyruğa alınıyor" : "Kampanyayı gönder"}</button></form>}
      </aside>
    </div>

    <section className="campaign-history"><div className="audience-panel-head"><div><p className="admin-kicker">DELIVERY HISTORY</p><h2>Son kampanyalar</h2></div></div><div>{campaigns.slice(0,8).map(item => <article key={item.id}><span><Mail/></span><div><strong>{item.subject}</strong><small>{item.createdAt?.toDate().toLocaleString("tr-TR") || "Yeni kampanya"}</small></div><b>{item.recipientCount || 0} alıcı</b><i>{item.status === "queued" ? "Kuyrukta" : item.status}</i></article>)}{!campaigns.length && <p className="audience-empty">Henüz gönderilmiş kampanya yok.</p>}</div></section>
  </div>;
}
