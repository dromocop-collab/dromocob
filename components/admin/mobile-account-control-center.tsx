"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, BadgeCheck, Crown, Dumbbell, Infinity, RefreshCw, Save, Search, ShieldCheck, Smartphone, Sparkles, UserRound, X } from "lucide-react";
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
  app: "calorievision" | "dromocob";
  apps: Array<"calorievision" | "dromocob">;
  entitlement: Entitlement | null;
  professionalRole: "customer" | "dietitian" | "trainer";
};

type AppFilter = "all" | "calorievision" | "dromocob";
type RoleFilter = "all" | Account["professionalRole"];

const featureOptions = [
  ["ai_scan_unlimited", "Sınırsız AI tarama"],
  ["advanced_reports", "Gelişmiş raporlar"],
  ["cloud_sync", "Bulut senkronizasyon"],
  ["data_export", "Veri dışa aktarma"],
  ["early_access", "Erken erişim"],
  ["priority_support", "Öncelikli destek"],
  ["ad_free", "Reklamsız kullanım"],
] as const;

const roleOptions = [
  { value: "customer", label: "Kullanıcı", detail: "Standart uygulama deneyimi", icon: UserRound },
  { value: "dietitian", label: "Diyetisyen", detail: "Beslenme koçluğu araçları", icon: ShieldCheck },
  { value: "trainer", label: "Antrenör", detail: "Antrenman koçluğu araçları", icon: Dumbbell },
] as const;

const accessPresets = [
  { key: "premium-30", title: "30 Gün Premium", detail: "Hızlı deneme veya destek hediyesi", plan: "premium", days: 30, icon: Crown },
  { key: "plus-90", title: "90 Gün Premium+", detail: "Tüm özellikleri 3 ay aç", plan: "premium_plus", days: 90, icon: Sparkles },
  { key: "lifetime", title: "Süresiz", detail: "Bitiş tarihi olmadan tam erişim", plan: "lifetime", days: null, icon: Infinity },
  { key: "free", title: "Ücretsiz", detail: "Premium erişimi güvenle kapat", plan: "free", days: 0, icon: UserRound },
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

function roleLabel(role: Account["professionalRole"]) {
  return role === "dietitian" ? "Diyetisyen" : role === "trainer" ? "Antrenör" : "Kullanıcı";
}

function statusLabel(status?: Entitlement["status"]) {
  if (status === "active") return "Aktif";
  if (status === "scheduled") return "Planlandı";
  if (status === "expired") return "Süresi doldu";
  if (status === "revoked") return "İptal";
  return "Ücretsiz";
}

export default function MobileAccountControlCenter() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [appFilter, setAppFilter] = useState<AppFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selected, setSelected] = useState<Account | null>(null);
  const [form, setForm] = useState({ ...emptyForm, professionalRole: "customer" as Account["professionalRole"] });
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
    return accounts.filter(account => (appFilter === "all" || account.apps?.includes(appFilter)) && (roleFilter === "all" || account.professionalRole === roleFilter) && (!query || account.uid.toLowerCase().includes(query) || (account.email || "").toLocaleLowerCase("tr-TR").includes(query) || (account.displayName || "").toLocaleLowerCase("tr-TR").includes(query)));
  }, [accounts, search, appFilter, roleFilter]);

  const activeCount = accounts.filter(item => item.entitlement?.status === "active").length;
  const scheduledCount = accounts.filter(item => item.entitlement?.status === "scheduled").length;
  const professionalCount = accounts.filter(item => item.professionalRole !== "customer").length;

  function applyPreset(preset: (typeof accessPresets)[number]) {
    const now = new Date();
    const expiresAt = preset.days && preset.days > 0
      ? new Date(now.getTime() + preset.days * 86_400_000).toISOString()
      : null;
    const active = preset.plan !== "free";
    setForm(current => ({
      ...current,
      active,
      status: active ? "active" : "inactive",
      plan: preset.plan,
      startsAt: active ? now.toISOString() : null,
      expiresAt,
      features: active ? featureOptions.map(([key]) => key) : [],
    }));
  }

  function open(account: Account) {
    const entitlement = account.entitlement;
    setSelected(account);
    setForm({
      ...emptyForm,
      ...(entitlement || {}),
      startsAt: entitlement?.startsAt || null,
      expiresAt: entitlement?.expiresAt || null,
      reason: "",
      professionalRole: account.professionalRole || "customer",
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
        body: JSON.stringify({ uid: selected.uid, entitlement: form, professionalRole: form.professionalRole }),
      });
      const data = await response.json() as { ok: boolean; entitlement?: Entitlement; professionalRole?: Account["professionalRole"]; error?: string };
      if (!response.ok || !data.entitlement) throw new Error(data.error || "Premium durumu kaydedilemedi.");
      const savedRole = data.professionalRole || form.professionalRole;
      setAccounts(items => items.map(item => item.uid === selected.uid ? { ...item, entitlement: data.entitlement!, professionalRole: savedRole } : item));
      setSelected(account => account ? { ...account, entitlement: data.entitlement!, professionalRole: savedRole } : null);
      setForm(current => ({ ...current, ...data.entitlement!, reason: "" }));
      setNotice("Premium yetkisi güncellendi. Uygulama bir sonraki oturum yenilemesinde yeni erişimi alacak.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Premium durumu kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mobile-accounts-admin">
    <section className="mobile-account-hero">
      <div>
        <p className="admin-kicker">CALORIEVISION / PREMIUM COMMAND CENTER</p>
        <h1>Üyelik ve uzman rolleri</h1>
        <p>Premium erişimi, diyetisyen ve antrenör rollerini birkaç saniyede yönet.</p>
      </div>
      <button className="admin-action" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "spin" : ""} size={17}/> Verileri yenile</button>
    </section>
    {error && <div className="admin-alert">{error}</div>}
    {notice && <div className="mobile-account-notice"><BadgeCheck size={17}/>{notice}</div>}
    <section className="mobile-account-metrics">
      <article className="metric-blue"><span><UserRound/></span><div><small>TOPLAM HESAP</small><strong>{accounts.length}</strong><em>kayıtlı kullanıcı</em></div></article>
      <article className="metric-gold"><span><Crown/></span><div><small>AKTİF PREMIUM</small><strong>{activeCount}</strong><em>tam erişimli hesap</em></div></article>
      <article className="metric-purple"><span><Dumbbell/></span><div><small>UZMAN HESAPLAR</small><strong>{professionalCount}</strong><em>diyetisyen + antrenör</em></div></article>
      <article className="metric-green"><span><Activity/></span><div><small>PREMIUM ORANI</small><strong>{accounts.length ? `%${Math.round(activeCount / accounts.length * 100)}` : "%0"}</strong><em>{scheduledCount ? `${scheduledCount} planlı erişim` : "anlık durum"}</em></div></article>
    </section>
    <section className="mobile-account-panel">
      <div className="mobile-account-filter-deck">
        <div className="mobile-app-filter" role="tablist" aria-label="Uygulama filtresi">{(["all", "dromocob", "calorievision"] as AppFilter[]).map(item => <button key={item} className={appFilter === item ? "active" : ""} onClick={() => setAppFilter(item)}><Smartphone size={14}/>{item === "all" ? "Tüm uygulamalar" : item === "dromocob" ? "Dromocob" : "Kalori Merkezi"}</button>)}</div>
        <div className="mobile-role-filter" role="tablist" aria-label="Rol filtresi">{(["all", "customer", "dietitian", "trainer"] as RoleFilter[]).map(item => <button key={item} className={roleFilter === item ? "active" : ""} onClick={() => setRoleFilter(item)}>{item === "all" ? "Tüm roller" : roleLabel(item)}</button>)}</div>
      </div>
      <div className="mobile-account-toolbar"><div><h2>Hesap dizini</h2><small>{filtered.length} hesap gösteriliyor</small></div><label><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="E-posta, ad veya UID ara"/></label></div>
      <div className="mobile-account-table">
        <div className="mobile-account-table-head"><span>Hesap</span><span>Rol</span><span>Durum</span><span>Plan / Bitiş</span><span/></div>
        {filtered.map(account => <button key={account.uid} onClick={() => open(account)}>
          <span><i>{(account.displayName || account.email || "?").slice(0, 2).toUpperCase()}</i><b>{account.displayName || "İsimsiz hesap"}<small>{account.email || account.uid}</small><small className="mobile-app-tags">{(account.apps || [account.app]).map(app => <em key={app}>{app === "dromocob" ? "Dromocob" : "Kalori Merkezi"}</em>)}</small></b></span>
          <span><em className={`professional-role ${account.professionalRole}`}>{roleLabel(account.professionalRole)}</em></span>
          <span><em className={`entitlement-status ${account.entitlement?.status || "inactive"}`}>{statusLabel(account.entitlement?.status)}</em>{account.disabled && <small>Askıda</small>}</span>
          <span><b className="plan-name">{account.entitlement?.plan?.replace("_", " ") || "free"}</b><small>{labelDate(account.entitlement?.expiresAt || null)}</small></span>
          <span>Yönet</span>
        </button>)}
        {!loading && !filtered.length && <p className="mobile-account-empty">Eşleşen uygulama hesabı bulunamadı.</p>}
      </div>
    </section>

    {selected && <div className="mobile-account-drawer-backdrop" onClick={() => setSelected(null)}><aside className="mobile-account-drawer" onClick={event => event.stopPropagation()}>
      <header><div><p className="admin-kicker">PREMIUM ACCESS STUDIO</p><h2>{selected.displayName || selected.email || "Mobil hesap"}</h2><small>{selected.uid}</small></div><button onClick={() => setSelected(null)} aria-label="Kapat"><X/></button></header>
      <div className="mobile-account-identity"><ShieldCheck/><div><strong>{selected.email || "E-posta yok"}</strong><small>{selected.emailVerified ? "E-posta doğrulandı" : "E-posta doğrulanmadı"} · Kayıt: {labelDate(selected.createdAt)}</small></div></div>

      <section className="access-preset-section">
        <div className="drawer-section-title"><div><small>HIZLI İŞLEMLER</small><h3>Tek tıkla erişim tanımla</h3></div><Sparkles size={19}/></div>
        <div className="access-preset-grid">{accessPresets.map(preset => { const Icon = preset.icon; return <button key={preset.key} type="button" className={form.plan === preset.plan && form.active === (preset.plan !== "free") ? "active" : ""} onClick={() => applyPreset(preset)}><span><Icon size={18}/></span><strong>{preset.title}</strong><small>{preset.detail}</small></button>; })}</div>
      </section>

      <label className="premium-switch"><input type="checkbox" checked={form.active} onChange={event => setForm(current => ({ ...current, active: event.target.checked, plan: event.target.checked && current.plan === "free" ? "premium" : current.plan }))}/><span/><div><strong>Premium erişim {form.active ? "açık" : "kapalı"}</strong><small>Değişiklik kaydedildiğinde uygulamaya yansır</small></div><b>{form.active ? "AKTİF" : "KAPALI"}</b></label>

      <section className="role-picker-section">
        <div className="drawer-section-title"><div><small>HESAP ROLÜ</small><h3>Kullanıcının uygulamadaki yetkisi</h3></div></div>
        <div className="role-picker">{roleOptions.map(option => { const Icon = option.icon; return <button key={option.value} type="button" className={form.professionalRole === option.value ? `active ${option.value}` : ""} onClick={() => setForm(current => ({ ...current, professionalRole: option.value }))}><Icon size={19}/><strong>{option.label}</strong><small>{option.detail}</small><i>{form.professionalRole === option.value ? "Seçili" : "Seç"}</i></button>; })}</div>
      </section>

      <div className="mobile-account-form-grid"><label>Plan<select value={form.plan} onChange={event => setForm(current => ({ ...current, plan: event.target.value as Entitlement["plan"] }))}><option value="free">Free</option><option value="premium">Premium</option><option value="premium_plus">Premium Plus</option><option value="lifetime">Lifetime</option></select></label><label>Kaynak<select value={form.source} onChange={event => setForm(current => ({ ...current, source: event.target.value as Entitlement["source"] }))}><option value="admin">Admin</option><option value="app_store">App Store</option><option value="promotion">Kampanya</option><option value="support">Destek</option><option value="migration">Taşıma</option></select></label><label>Başlangıç<input type="datetime-local" value={dateInput(form.startsAt)} onChange={event => setForm(current => ({ ...current, startsAt: event.target.value ? new Date(event.target.value).toISOString() : null }))}/></label><label>Bitiş<input type="datetime-local" value={dateInput(form.expiresAt)} onChange={event => setForm(current => ({ ...current, expiresAt: event.target.value ? new Date(event.target.value).toISOString() : null }))}/></label></div>
      <section className="premium-feature-grid"><div className="drawer-section-title"><div><small>ÖZELLİKLER</small><h3>Premium erişim kapsamı</h3></div><button type="button" onClick={() => setForm(current => ({ ...current, features: current.features.length === featureOptions.length ? [] : featureOptions.map(([key]) => key) }))}>{form.features.length === featureOptions.length ? "Tümünü kapat" : "Tümünü aç"}</button></div><div>{featureOptions.map(([key, label]) => <label key={key}><input type="checkbox" checked={form.features.includes(key)} onChange={event => setForm(current => ({ ...current, features: event.target.checked ? [...current.features, key] : current.features.filter(item => item !== key) }))}/><span>{label}</span><em>{form.features.includes(key) ? "Açık" : "Kapalı"}</em></label>)}</div></section>
      <label className="mobile-account-textarea">İç not<textarea value={form.note} maxLength={1000} onChange={event => setForm(current => ({ ...current, note: event.target.value }))} placeholder="Destek ekibinin göreceği not"/></label>
      <label className="mobile-account-textarea required">Değişiklik sebebi<textarea value={form.reason} maxLength={300} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} placeholder="Örn. Destek talebiyle 30 gün Premium tanımlandı"/></label>
      <div className="mobile-account-save-bar"><div><small>KAYDEDİLECEK</small><strong>{roleLabel(form.professionalRole)} · {form.active ? form.plan.replace("_", " ") : "Ücretsiz"}</strong></div><button className="mobile-account-save" onClick={() => void save()} disabled={saving || !form.reason.trim()}><Save size={17}/>{saving ? "Kaydediliyor…" : "Yetkiyi kaydet"}</button></div>
    </aside></div>}
  </div>;
}
