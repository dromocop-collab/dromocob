"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { Activity, BarChart3, Check, ExternalLink, FileText, Globe2, LayoutDashboard, Loader2, Search, Settings2, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";

import { db } from "@/lib/firebase";
import type { CustomerSiteRecord, CustomerSiteTemplate } from "@/lib/customer-sites";

type UserRecord = { id: string; displayName?: string; email?: string; company?: string };
type SiteControl = { id: string; status?: "active" | "maintenance" | "suspended"; adminNote?: string; assignedTo?: string };

export default function CustomerSitesAdminPage() {
  const [sites, setSites] = useState<CustomerSiteRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [controls, setControls] = useState<SiteControl[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "maintenance" | "suspended">("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(collection(db, "customer_sites"), snapshot => {
    const next = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as CustomerSiteRecord));
    setSites(next);
    setSelectedId(current => current && next.some(item => item.id === current) ? current : next[0]?.id || "");
  }, snapshotError => setError(snapshotError.message || "Müşteri siteleri okunamadı.")), []);
  useEffect(() => onSnapshot(collection(db, "users"), snapshot => {
    setUsers(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as UserRecord)));
  }), []);
  useEffect(() => onSnapshot(collection(db, "customer_site_admin"), snapshot => {
    setControls(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as SiteControl)));
  }), []);

  const selected = sites.find(site => site.id === selectedId) || null;
  const selectedOwner = users.find(user => user.id === selected?.ownerId);
  const selectedControl = controls.find(control => control.id === selectedId) || { id: selectedId, status: "active", adminNote: "", assignedTo: "" };
  const statusOf = useCallback((siteId: string) => controls.find(control => control.id === siteId)?.status || "active", [controls]);

  const filtered = useMemo(() => sites.filter(site => {
    if (filter !== "all" && statusOf(site.id) !== filter) return false;
    const owner = users.find(user => user.id === site.ownerId);
    return [site.businessName, site.subdomain, site.template, owner?.displayName, owner?.email, owner?.company].join(" ").toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"));
  }), [filter, search, sites, statusOf, users]);

  async function updateControl(update: Partial<SiteControl>) {
    if (!selected) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "customer_site_admin", selected.id), { ...update, updatedAt: serverTimestamp() }, { merge: true });
      setNotice("Site kontrol ayarları güncellendi.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Kontrol ayarı güncellenemedi.");
    } finally { setSaving(false); }
  }

  async function saveSiteDetails(formData: FormData) {
    if (!selected) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "customer_sites", selected.id), {
        businessName: String(formData.get("businessName") || "").trim(),
        headline: String(formData.get("headline") || "").trim(),
        subdomain: String(formData.get("subdomain") || "").trim(),
        accent: String(formData.get("accent") || "#d9ff43"),
        template: String(formData.get("template") || "studio") as CustomerSiteTemplate,
        updatedAt: serverTimestamp(),
      });
      setNotice("Site bilgileri yönetici tarafından güncellendi.");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Site güncellenemedi."); }
    finally { setSaving(false); }
  }

  return <div className="customer-sites-admin">
    <div className="admin-title"><div><p className="admin-kicker">CUSTOMER WEBSITE FLEET / GOVERNANCE</p><h1>Müşteri Siteleri</h1><p>Platformda oluşturulan tüm siteleri incele, düzenle ve operasyonel durumunu yönet.</p></div><div className="customer-fleet-count"><strong>{sites.length}</strong><span>toplam müşteri sitesi</span></div></div>
    {error && <div className="admin-alert">{error}</div>}{notice && <div className="activation-admin-notice"><Check size={14} /> {notice}</div>}
    <section className="customer-fleet-metrics"><article><Globe2 /><span><strong>{sites.length}</strong>Toplam site</span></article><article><Activity /><span><strong>{sites.filter(site => statusOf(site.id) === "active").length}</strong>Aktif</span></article><article><Settings2 /><span><strong>{sites.filter(site => statusOf(site.id) === "maintenance").length}</strong>Bakımda</span></article><article><ShieldAlert /><span><strong>{sites.filter(site => statusOf(site.id) === "suspended").length}</strong>Askıya alınmış</span></article></section>
    <section className="customer-fleet-toolbar"><div>{(["all", "active", "maintenance", "suspended"] as const).map(status => <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{status === "all" ? "Tümü" : status === "active" ? "Aktif" : status === "maintenance" ? "Bakım" : "Askıda"}</button>)}</div><label><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Site, müşteri, e-posta veya alan adı ara" /></label></section>
    <div className="customer-fleet-layout">
      <section className="customer-fleet-list">{filtered.map(site => { const owner = users.find(user => user.id === site.ownerId); const status = statusOf(site.id); return <button key={site.id} className={selectedId === site.id ? "active" : ""} onClick={() => setSelectedId(site.id)}><i style={{ background: site.accent }} /><div><span>{status === "active" ? "AKTİF" : status === "maintenance" ? "BAKIM" : "ASKIDA"}</span><strong>{site.businessName}</strong><small>{site.subdomain}.dromocob.tr</small><em>{owner?.displayName || owner?.email || site.ownerId}</em></div><aside><b>{site.template}</b><small>{site.pages?.length || 3} sayfa</small></aside></button>})}</section>
      <section className="customer-fleet-detail">{selected ? <>
        <header><div><p>SITE DOSYASI / {selected.id}</p><h2>{selected.businessName}</h2><span><UserRound size={13} /> {selectedOwner?.displayName || "Müşteri"} · {selectedOwner?.email || selected.ownerId}</span></div><div><Link href={`/site-onizleme/${selected.id}`} target="_blank" rel="noreferrer">Önizle <ExternalLink size={14} /></Link><Link href={`/site-duzenle/${selected.id}`} target="_blank" rel="noreferrer">Studio <Settings2 size={14} /></Link></div></header>
        <div className={`customer-admin-preview customer-admin-${selected.template}`} style={{ "--customer-admin-accent": selected.accent } as React.CSSProperties}><nav><strong>{selected.businessName}</strong><span /><span /><button /></nav><section><small>DROMOCOB SITES</small><h3>{selected.headline}</h3><i /></section></div>
        <section className="customer-admin-control"><div><p>OPERASYON KONTROLÜ</p><h3>Site erişim durumu</h3><span>Bu kontrol önizleme ve yayın erişimini anında etkiler.</span></div><div>{(["active", "maintenance", "suspended"] as const).map(status => <button key={status} className={selectedControl.status === status ? "active" : ""} onClick={() => updateControl({ status })}>{status === "active" ? <Activity /> : status === "maintenance" ? <Settings2 /> : <ShieldAlert />}<strong>{status === "active" ? "Aktif" : status === "maintenance" ? "Bakım" : "Askıya al"}</strong></button>)}</div></section>
        <form className="customer-admin-edit" key={selected.id} action={saveSiteDetails}><div><p>SİTE BİLGİLERİNE MÜDAHALE</p><span>Değişiklikler müşterinin kayıtlı sitesine uygulanır.</span></div><label>Marka adı<input name="businessName" defaultValue={selected.businessName} required /></label><label>Alt alan adı<input name="subdomain" defaultValue={selected.subdomain} required /></label><label>Şablon<select name="template" defaultValue={selected.template}><option value="studio">Studio</option><option value="restaurant">Restaurant</option><option value="portfolio">Portfolio</option></select></label><label>Vurgu rengi<input name="accent" type="color" defaultValue={selected.accent} /></label><label className="customer-admin-headline">Ana mesaj<textarea name="headline" rows={3} defaultValue={selected.headline} required /></label><button disabled={saving}>{saving ? <Loader2 className="spin" /> : <Check />}{saving ? "Kaydediliyor" : "Değişiklikleri uygula"}</button></form>
        <section className="customer-admin-intelligence"><article><FileText /><span><strong>{selected.pages?.length || 3}</strong>Sayfa</span></article><article><LayoutDashboard /><span><strong>{selected.pages?.reduce((total, page) => total + page.sections.length, 0) || 0}</strong>Bölüm</span></article><article><ShieldCheck /><span><strong>{selected.siteSettings?.cookieBanner ? "Aktif" : "Kapalı"}</strong>KVKK</span></article><article><BarChart3 /><span><strong>{selected.siteSettings?.analytics ? "Aktif" : "Kapalı"}</strong>Analytics</span></article></section>
        <section className="customer-admin-note"><p>YÖNETİCİ NOTU</p><textarea rows={4} value={selectedControl.adminNote || ""} onChange={event => setControls(current => current.some(item => item.id === selected.id) ? current.map(item => item.id === selected.id ? { ...item, adminNote: event.target.value } : item) : [...current, { id: selected.id, status: "active", adminNote: event.target.value }])} placeholder="Siteyle ilgili ekip içi not…" /><button onClick={() => updateControl({ adminNote: selectedControl.adminNote || "" })} disabled={saving}>Notu kaydet</button></section>
      </> : <div className="activation-empty-workbench"><Globe2 /><h2>Bir müşteri sitesi seç.</h2></div>}</section>
    </div>
  </div>;
}
