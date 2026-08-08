"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, BadgeCheck, CalendarClock, Crown, RefreshCw, Save, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { auth } from "@/lib/firebase";

type Entitlement = {
  active: boolean;
  status: "inactive" | "active" | "scheduled" | "expired" | "revoked";
  plan: "free" | "premium" | "premium_plus" | "lifetime";
  source: "admin" | "app_store" | "promotion" | "support" | "migration";
  startsAt: string | null;
  expiresAt: string | null;
  features: string[];
  note: string;
  updatedAt?: string;
  updatedByEmail?: string;
};

type Account = {
  uid: string;
  email: string | null;
  displayName: string | null;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSignInAt: string | null;
  entitlement: Entitlement | null;
};

const featureOptions = [
  ["ai_scan_unlimited", "Sınırsız AI tarama"],
  ["advanced_reports", "Gelişmiş raporlar"],
  ["cloud_sync", "Bulut senkronizasyon"],
  ["data_export", "Veri dışa aktarma"],
  ["early_access", "Erken erişim"],
  ["priority_support", "Öncelikli destek"],
  ["ad_free", "Reklamsız kullanım"],
] as const;

const emptyForm: Entitlement & { reason: string } = {
  active: true,
  status: "active",
  plan: "premium",
  source: "admin",
  startsAt: null,
  expiresAt: null,
  features: featureOptions.map(([key]) => key),
  note: "",
  reason: "",
};

function dateInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function labelDate(value: string | null) {
  return value ? new Date(value).toLocaleString("tr-TR") : "Süresiz";
}

export default function MobileAccountControlCenter() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Account | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/mobile-accounts", { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error(`Hesaplar alınamadı (${response.status}).`);
      const data = await response.json() as { accounts: Account[] };
      setAccounts(data.accounts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Hesaplar alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return accounts.filter(account => !query || account.uid.toLowerCase().includes(query) || (account.email || "").toLocaleLowerCase("tr-TR").includes(query) || (account.displayName || "").toLocaleLowerCase("tr-TR").includes(query));
  }, [accounts, search]);

  const activeCount = accounts.filter(item => item.entitlement?.status === "active").length;
  const scheduledCount = accounts.filter(item => item.entitlement?.status === "scheduled").length;

  function open(account: Account) {
    const entitlement = account.entitlement;
    setSelected(account);
    setForm({
      ...emptyForm,
      ...(entitlement || {}),
      startsAt: entitlement?.startsAt || null,
      expiresAt: entitlement?.expiresAt || null,
      reason: "",
    });
    setError("");
    setNotice("");
  }

  async function save() {
    if (!selected || !form.reason.trim()) {
      setError("Denetim kaydı için değişiklik sebebi zorunlu.");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/mobile-accounts", {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid: selected.uid, entitlement: form }),
      });
      const data = await response.json() as { ok: boolean; entitlement?: Entitlement; error?: string };
      if (!response.ok || !data.entitlement) throw new Error(data.error || "Premium durumu kaydedilemedi.");
      setAccounts(items => items.map(item => item.uid === selected.uid ? { ...item, entitlement: data.entitlement! } : item));
      setSelected(account => account ? { ...account, entitlement: data.entitlement! } : null);
      setForm(current => ({ ...current, ...data.entitlement!, reason: "" }));
      setNotice("Premium yetkisi güncellendi. Uygulama bir sonraki oturum yenilemesinde yeni erişimi alacak.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Premium durumu kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mobile-accounts-admin">
    <header className="admin-title"><div><p className="admin-kicker">CALORIEVISION / ACCOUNT ENTITLEMENTS</p><h1>Mobil hesaplar</h1><p>Premium erişim, süre, plan ve özellikleri hesap bazında güvenli şekilde yönet.</p></div><button className="admin-action" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "spin" : ""} size={17}/> Yenile</button></header>
    {error && <div className="admin-alert">{error}</div>}
    {notice && <div className="mobile-account-notice"><BadgeCheck size={17}/>{notice}</div>}
    <section className="mobile-account-metrics">
      <article><span><UserRound/></span><div><small>TOPLAM HESAP</small><strong>{accounts.length}</strong></div></article>
      <article><span><Crown/></span><div><small>AKTİF PREMIUM</small><strong>{activeCount}</strong></div></article>
      <article><span><CalendarClock/></span><div><small>PLANLANAN</small><strong>{scheduledCount}</strong></div></article>
      <article><span><Activity/></span><div><small>DÖNÜŞÜM</small><strong>{accounts.length ? `%${Math.round(activeCount / accounts.length * 100)}` : "%0"}</strong></div></article>
    </section>
    <section className="mobile-account-panel">
      <div className="mobile-account-toolbar"><div><h2>Hesap dizini</h2><small>{filtered.length} hesap gösteriliyor</small></div><label><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="E-posta, ad veya UID ara"/></label></div>
      <div className="mobile-account-table"><div className="mobile-account-table-head"><span>Hesap</span><span>Durum</span><span>Plan</span><span>Bitiş</span><span/></div>{filtered.map(account => <button key={account.uid} onClick={() => open(account)}><span><i>{(account.displayName || account.email || "?").slice(0, 2).toUpperCase()}</i><b>{account.displayName || "İsimsiz hesap"}<small>{account.email || account.uid}</small></b></span><span><em className={`entitlement-status ${account.entitlement?.status || "inactive"}`}>{account.entitlement?.status || "free"}</em>{account.disabled && <small>Askıda</small>}</span><span>{account.entitlement?.plan || "free"}</span><span>{labelDate(account.entitlement?.expiresAt || null)}</span><span>Yönet</span></button>)}{!loading && !filtered.length && <p className="mobile-account-empty">Eşleşen hesap bulunamadı.</p>}</div>
    </section>

    {selected && <div className="mobile-account-drawer-backdrop" onClick={() => setSelected(null)}><aside className="mobile-account-drawer" onClick={event => event.stopPropagation()}><header><div><p className="admin-kicker">ENTITLEMENT CONTROL</p><h2>{selected.displayName || selected.email || "Mobil hesap"}</h2><small>{selected.uid}</small></div><button onClick={() => setSelected(null)} aria-label="Kapat"><X/></button></header>
      <div className="mobile-account-identity"><ShieldCheck/><div><strong>{selected.email || "E-posta yok"}</strong><small>{selected.emailVerified ? "E-posta doğrulandı" : "E-posta doğrulanmadı"} · Kayıt: {labelDate(selected.createdAt)}</small></div></div>
      <label className="premium-switch"><input type="checkbox" checked={form.active} onChange={event => setForm(current => ({ ...current, active: event.target.checked }))}/><span/><div><strong>Premium erişim</strong><small>Hesabın premium yetkisini aç veya kapat</small></div></label>
      <div className="mobile-account-form-grid"><label>Plan<select value={form.plan} onChange={event => setForm(current => ({ ...current, plan: event.target.value as Entitlement["plan"] }))}><option value="free">Free</option><option value="premium">Premium</option><option value="premium_plus">Premium Plus</option><option value="lifetime">Lifetime</option></select></label><label>Kaynak<select value={form.source} onChange={event => setForm(current => ({ ...current, source: event.target.value as Entitlement["source"] }))}><option value="admin">Admin</option><option value="app_store">App Store</option><option value="promotion">Kampanya</option><option value="support">Destek</option><option value="migration">Taşıma</option></select></label><label>Başlangıç<input type="datetime-local" value={dateInput(form.startsAt)} onChange={event => setForm(current => ({ ...current, startsAt: event.target.value ? new Date(event.target.value).toISOString() : null }))}/></label><label>Bitiş<input type="datetime-local" value={dateInput(form.expiresAt)} onChange={event => setForm(current => ({ ...current, expiresAt: event.target.value ? new Date(event.target.value).toISOString() : null }))}/></label></div>
      <section className="premium-feature-grid"><h3>Özellik erişimleri</h3>{featureOptions.map(([key, label]) => <label key={key}><input type="checkbox" checked={form.features.includes(key)} onChange={event => setForm(current => ({ ...current, features: event.target.checked ? [...current.features, key] : current.features.filter(item => item !== key) }))}/><span>{label}</span></label>)}</section>
      <label className="mobile-account-textarea">İç not<textarea value={form.note} maxLength={1000} onChange={event => setForm(current => ({ ...current, note: event.target.value }))} placeholder="Destek ekibinin göreceği not"/></label>
      <label className="mobile-account-textarea required">Değişiklik sebebi<textarea value={form.reason} maxLength={300} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} placeholder="Audit geçmişi için zorunlu"/></label>
      <button className="mobile-account-save" onClick={() => void save()} disabled={saving}><Save size={17}/>{saving ? "Kaydediliyor…" : "Yetkiyi kaydet"}</button>
    </aside></div>}
  </div>;
}
