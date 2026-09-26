"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, Clock3, ExternalLink, HeartPulse, RefreshCw, Rocket, Save, ShieldCheck, Smartphone, Wrench } from "lucide-react";

import { auth } from "@/lib/firebase";

type OperationConfig = {
  appName: string;
  maintenanceEnabled: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  estimatedReturnAt: string;
  minimumVersion: string;
  forceUpdate: boolean;
  updateURL: string;
  supportURL: string;
  incidentId: string;
  updatedAt?: string;
  updatedByEmail?: string | null;
};

const initialConfig: OperationConfig = {
  appName: "Kalori Merkezi",
  maintenanceEnabled: false,
  maintenanceTitle: "Kısa bir bakımdayız",
  maintenanceMessage: "Deneyimi iyileştirmek için sistemi güncelliyoruz. Lütfen kısa süre sonra tekrar deneyin.",
  estimatedReturnAt: "",
  minimumVersion: "1.0.0",
  forceUpdate: false,
  updateURL: "",
  supportURL: "https://dromocob.tr/iletisim",
  incidentId: "",
};

export default function MobileOperationControlCenter() {
  const [config, setConfig] = useState<OperationConfig>(initialConfig);
  const [reason, setReason] = useState("");
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
      const response = await fetch("/api/admin/mobile-operation", { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json() as { config?: OperationConfig; error?: string };
      if (!response.ok || !data.config) throw new Error(data.error || "Uygulama ayarları alınamadı.");
      setConfig(current => ({ ...current, ...data.config }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Uygulama ayarları alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save() {
    if (!reason.trim()) {
      setError("Denetim kaydı için değişiklik sebebi zorunlu.");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/mobile-operation", {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...config, reason }),
      });
      const data = await response.json() as { config?: OperationConfig; error?: string };
      if (!response.ok || !data.config) throw new Error(data.error || "Uygulama ayarları kaydedilemedi.");
      setConfig(current => ({ ...current, ...data.config }));
      setReason("");
      setNotice("Kalori Merkezi operasyon ayarları yayına alındı. Uygulama en geç 5 dakika içinde yeni durumu alacak.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Uygulama ayarları kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const mode = config.maintenanceEnabled ? "maintenance" : config.forceUpdate ? "update" : "online";

  return <div className="mobile-operation-admin">
    <section className={`mobile-operation-hero ${mode}`}>
      <div className="mobile-operation-orb"><Smartphone size={38}/><span><i/></span></div>
      <div><p className="admin-kicker">CALORIEVISION / LIVE OPERATIONS</p><h1>Uygulama Kontrolü</h1><p>Bakım ekranını, zorunlu güncellemeyi ve destek bağlantılarını webden anında yönet.</p></div>
      <div className="mobile-operation-live"><span><i/>{mode === "maintenance" ? "BAKIM MODU" : mode === "update" ? "GÜNCELLEME MODU" : "SİSTEM AKTİF"}</span><small>5 dakikalık otomatik yenileme</small></div>
    </section>

    {error && <div className="admin-alert">{error}</div>}
    {notice && <div className="mobile-account-notice"><BadgeCheck size={17}/>{notice}</div>}

    <section className="mobile-operation-status-grid">
      <article className={config.maintenanceEnabled ? "active danger" : "active success"}><span><Wrench/></span><div><small>BAKIM DURUMU</small><strong>{config.maintenanceEnabled ? "Bakımda" : "Çevrimiçi"}</strong><em>{config.maintenanceEnabled ? "Kullanıcılar bakım ekranını görür" : "Uygulama normal çalışıyor"}</em></div></article>
      <article className={config.forceUpdate ? "active warning" : ""}><span><Rocket/></span><div><small>GÜNCELLEME</small><strong>{config.forceUpdate ? "Zorunlu" : "Opsiyonel"}</strong><em>Minimum sürüm {config.minimumVersion}</em></div></article>
      <article><span><ShieldCheck/></span><div><small>DESTEK MERKEZİ</small><strong>{config.supportURL ? "Bağlı" : "Eksik"}</strong><em>Uygulama içi destek yönlendirmesi</em></div></article>
    </section>

    <div className="mobile-operation-layout">
      <main className="mobile-operation-form">
        <section>
          <div className="operation-section-head"><div><small>01 / ERİŞİM DURUMU</small><h2>Canlı uygulama modu</h2><p>Kritik durumları tek hareketle yönet.</p></div><button type="button" className="operation-refresh" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "spin" : ""} size={16}/> Yenile</button></div>
          <div className="operation-toggle-grid">
            <label className={config.maintenanceEnabled ? "active maintenance" : ""}><input type="checkbox" checked={config.maintenanceEnabled} onChange={event => setConfig(current => ({ ...current, maintenanceEnabled: event.target.checked }))}/><span><Wrench/></span><div><strong>Bakım modu</strong><small>Tüm kullanıcıları özel bakım ekranına yönlendirir.</small></div><i>{config.maintenanceEnabled ? "Açık" : "Kapalı"}</i></label>
            <label className={config.forceUpdate ? "active update" : ""}><input type="checkbox" checked={config.forceUpdate} onChange={event => setConfig(current => ({ ...current, forceUpdate: event.target.checked }))}/><span><Rocket/></span><div><strong>Zorunlu güncelleme</strong><small>Eski sürümlerin kullanıma devam etmesini engeller.</small></div><i>{config.forceUpdate ? "Açık" : "Kapalı"}</i></label>
          </div>
        </section>

        <section>
          <div className="operation-section-head"><div><small>02 / MESAJLAR</small><h2>Bakım ekranı içeriği</h2><p>Kullanıcıya sakin, net ve güven veren bilgi göster.</p></div></div>
          <div className="operation-field-grid">
            <label className="wide">Başlık<input value={config.maintenanceTitle} maxLength={100} onChange={event => setConfig(current => ({ ...current, maintenanceTitle: event.target.value }))}/></label>
            <label className="wide">Açıklama<textarea value={config.maintenanceMessage} maxLength={500} onChange={event => setConfig(current => ({ ...current, maintenanceMessage: event.target.value }))}/></label>
            <label>Tahmini dönüş<input value={config.estimatedReturnAt} maxLength={80} placeholder="Örn. Bugün 23:30" onChange={event => setConfig(current => ({ ...current, estimatedReturnAt: event.target.value }))}/></label>
            <label>Operasyon kodu<input value={config.incidentId} maxLength={80} placeholder="Örn. KM-2026-09" onChange={event => setConfig(current => ({ ...current, incidentId: event.target.value }))}/></label>
          </div>
        </section>

        <section>
          <div className="operation-section-head"><div><small>03 / SÜRÜM VE BAĞLANTILAR</small><h2>Güncelleme güvenliği</h2><p>Minimum sürümü ve kullanıcı yönlendirmelerini kontrol et.</p></div></div>
          <div className="operation-field-grid">
            <label>Minimum sürüm<input value={config.minimumVersion} placeholder="1.1.1" onChange={event => setConfig(current => ({ ...current, minimumVersion: event.target.value }))}/></label>
            <label>App Store bağlantısı<input value={config.updateURL} type="url" placeholder="https://apps.apple.com/..." onChange={event => setConfig(current => ({ ...current, updateURL: event.target.value }))}/></label>
            <label className="wide">Destek bağlantısı<input value={config.supportURL} type="url" onChange={event => setConfig(current => ({ ...current, supportURL: event.target.value }))}/></label>
          </div>
        </section>

        <section className="operation-publish-section">
          <div className="operation-section-head"><div><small>04 / YAYINLA</small><h2>Değişikliği kaydet</h2><p>Her işlem güvenlik günlüğüne kimlik ve gerekçeyle kaydedilir.</p></div></div>
          <label className="operation-reason">Değişiklik sebebi<textarea value={reason} maxLength={300} placeholder="Örn. 1.1.2 sürümü için zorunlu güncelleme açıldı" onChange={event => setReason(event.target.value)}/></label>
          <button className="operation-publish" onClick={() => void save()} disabled={saving || !reason.trim()}><Save size={18}/>{saving ? "Yayınlanıyor…" : "Ayarları yayınla"}</button>
          {config.updatedAt && <small className="operation-last-update"><Clock3 size={13}/> Son kayıt {new Date(config.updatedAt).toLocaleString("tr-TR")}{config.updatedByEmail ? ` · ${config.updatedByEmail}` : ""}</small>}
        </section>
      </main>

      <aside className="operation-phone-preview">
        <div className="operation-preview-title"><div><small>CANLI ÖNİZLEME</small><strong>Kullanıcının göreceği ekran</strong></div><HeartPulse size={18}/></div>
        <div className="operation-phone-shell">
          <span className="operation-phone-island"/>
          <div className="operation-phone-screen">
            <div className="operation-preview-glow"/>
            <div className="operation-preview-icon">{config.forceUpdate && !config.maintenanceEnabled ? <Rocket/> : <Wrench/>}</div>
            <h3>{config.forceUpdate && !config.maintenanceEnabled ? "Yeni sürüm hazır" : config.maintenanceTitle}</h3>
            <p>{config.forceUpdate && !config.maintenanceEnabled ? "Kalori Merkezi’ni güvenli ve sorunsuz kullanmaya devam etmek için uygulamayı güncelleyin." : config.maintenanceMessage}</p>
            {config.estimatedReturnAt && config.maintenanceEnabled && <span className="operation-preview-estimate"><Clock3 size={12}/>{config.estimatedReturnAt}</span>}
            {config.forceUpdate && <button>Şimdi Güncelle <ExternalLink size={13}/></button>}
            <button className="secondary">Durumu Yeniden Kontrol Et</button>
            <small>Destek Merkezi</small>
            {config.incidentId && <em>Operasyon kodu: {config.incidentId}</em>}
          </div>
        </div>
        <div className="operation-preview-note"><AlertTriangle size={16}/><p><strong>Güvenlik notu</strong><span>Bakım modu ve zorunlu güncelleme yalnızca “Ayarları yayınla” ile aktif olur.</span></p></div>
      </aside>
    </div>
  </div>;
}
