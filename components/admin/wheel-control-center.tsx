"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Gift, Loader2, Plus, RotateCw, Save, Trash2, Trophy } from "lucide-react";
import { auth } from "@/lib/firebase";
import { DEFAULT_WHEEL_CONFIG, type WheelConfig, type WheelReward, type WheelRewardKind } from "@/lib/promo-wheel";

const kinds: Array<{ value: WheelRewardKind; label: string }> = [
  { value: "percent", label: "Yüzde indirim" }, { value: "fixed", label: "Sabit TL indirim" },
  { value: "gift", label: "Hediye / hizmet" }, { value: "none", label: "Kazanamadı" },
];
const newReward = (): WheelReward => ({ id: `reward-${Date.now()}`, label: "Yeni ödül", shortLabel: "ÖDÜL", color: "#d9ff43", textColor: "#10140f", kind: "percent", value: 5, weight: 10, active: true, validityDays: 30, description: "" });

export default function WheelControlCenter() {
  const [config, setConfig] = useState<WheelConfig>(DEFAULT_WHEEL_CONFIG);
  const [stats, setStats] = useState({ spins: 0, coupons: 0, used: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const totalWeight = useMemo(() => config.rewards.filter(item => item.active).reduce((sum, item) => sum + item.weight, 0), [config.rewards]);

  async function request(path: string, init?: RequestInit) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(path, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...init?.headers } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "İşlem tamamlanamadı.");
    return payload;
  }
  useEffect(() => { request("/api/admin/wheel").then(payload => { setConfig(payload.config); setStats(payload.stats); }).catch(error => setNotice(error.message)).finally(() => setLoading(false)); }, []);
  function update(index: number, patch: Partial<WheelReward>) { setConfig(current => ({ ...current, rewards: current.rewards.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })); }
  async function save() { setSaving(true); setNotice(""); try { const payload = await request("/api/admin/wheel", { method: "PUT", body: JSON.stringify(config) }); setConfig(payload.config); setNotice("Çark yayını güncellendi."); } catch (error) { setNotice(error instanceof Error ? error.message : "Kaydedilemedi."); } finally { setSaving(false); } }

  if (loading) return <div className="admin-loading"><Loader2 className="spin"/> Çark sistemi yükleniyor</div>;
  return <div className="wheel-admin">
    <section className="wheel-admin-stats"><article><RotateCw/><span><small>TOPLAM ÇEVİRME</small><strong>{stats.spins}</strong></span></article><article><Gift/><span><small>ÜRETİLEN KUPON</small><strong>{stats.coupons}</strong></span></article><article><Trophy/><span><small>KULLANILAN</small><strong>{stats.used}</strong></span></article></section>
    <section className="admin-panel wheel-admin-settings"><header><div><small>LIVE CAMPAIGN CONTROL</small><h2>Çark yayını</h2></div><label className="wheel-switch"><input type="checkbox" checked={config.active} onChange={event => setConfig({ ...config, active: event.target.checked })}/><span/>{config.active ? "Yayında" : "Kapalı"}</label></header><div className="wheel-admin-copy"><label>Başlık<input value={config.title} onChange={event => setConfig({ ...config, title: event.target.value })}/></label><label>Alt metin<textarea rows={3} value={config.subtitle} onChange={event => setConfig({ ...config, subtitle: event.target.value })}/></label><label>Mini ikon etiketi<input value={config.triggerLabel} onChange={event => setConfig({ ...config, triggerLabel: event.target.value })}/></label></div></section>
    <section className="admin-panel wheel-reward-editor"><header><div><small>PRIZE ENGINE / {totalWeight} WEIGHT</small><h2>Çark dilimleri</h2></div><button type="button" onClick={() => setConfig({ ...config, rewards: [...config.rewards, newReward()] })}><Plus/> Dilim ekle</button></header><div className="wheel-reward-list">{config.rewards.map((reward, index) => <article key={reward.id} className={!reward.active ? "is-passive" : ""}><div className="wheel-reward-index" style={{ background: reward.color, color: reward.textColor }}>{String(index + 1).padStart(2, "0")}</div><div className="wheel-reward-fields"><label>Ödül adı<input value={reward.label} onChange={event => update(index, { label: event.target.value })}/></label><label>Kısa etiket<input value={reward.shortLabel} onChange={event => update(index, { shortLabel: event.target.value })}/></label><label>Tip<select value={reward.kind} onChange={event => update(index, { kind: event.target.value as WheelRewardKind })}>{kinds.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Değer<input type="number" min="0" value={reward.value} onChange={event => update(index, { value: Number(event.target.value) })}/></label><label>Olasılık ağırlığı<input type="number" min="0" value={reward.weight} onChange={event => update(index, { weight: Number(event.target.value) })}/><small>{totalWeight ? `%${Math.round(reward.weight / totalWeight * 100)}` : "%0"}</small></label><label>Geçerlilik (gün)<input type="number" min="1" max="365" value={reward.validityDays} onChange={event => update(index, { validityDays: Number(event.target.value) })}/></label><label>Renk<input type="color" value={reward.color} onChange={event => update(index, { color: event.target.value })}/></label><label className="wheel-reward-description">Açıklama<input value={reward.description} onChange={event => update(index, { description: event.target.value })}/></label></div><div className="wheel-reward-actions"><button type="button" className={reward.active ? "is-active" : ""} onClick={() => update(index, { active: !reward.active })}>{reward.active && <Check/>}{reward.active ? "Aktif" : "Pasif"}</button><button type="button" aria-label="Dilimi sil" disabled={config.rewards.length <= 2} onClick={() => setConfig({ ...config, rewards: config.rewards.filter((_, itemIndex) => itemIndex !== index) })}><Trash2/></button></div></article>)}</div></section>
    <footer className="wheel-admin-save">{notice && <span>{notice}</span>}<button type="button" onClick={save} disabled={saving}>{saving ? <Loader2 className="spin"/> : <Save/>} Değişiklikleri yayınla</button></footer>
  </div>;
}
