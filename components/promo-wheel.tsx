"use client";

import { type CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BadgePercent, Check, Coins, Crown, Gem, Gift, Loader2, LockKeyhole, Mail, Rocket, RotateCw, Sparkles, Star, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { DEFAULT_WHEEL_CONFIG, type WheelConfig, type WheelReward } from "@/lib/promo-wheel";

type SpinResult = { reward: WheelReward; couponCode: string; expiresAt: string; delivery: "email" | "profile" | "none" };

export default function PromoWheel() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<WheelConfig>(DEFAULT_WHEEL_CONFIG);
  const [canSpin, setCanSpin] = useState(true);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const rewards = useMemo(() => config.rewards.filter(item => item.active && item.weight > 0), [config.rewards]);
  const slice = 360 / Math.max(1, rewards.length);
  const wheelBackground = useMemo(() => `conic-gradient(from -90deg, ${rewards.map((reward, index) => `${reward.color} ${index * slice}deg ${(index + 1) * slice}deg`).join(", ")})`, [rewards, slice]);
  function RewardIcon({ reward }: { reward: WheelReward }) { if (reward.kind === "percent") return <BadgePercent/>; if (reward.kind === "fixed") return <Coins/>; if (reward.id.includes("fast")) return <Rocket/>; if (reward.id.includes("mystery")) return <Gem/>; if (reward.id.includes("strategy")) return <Crown/>; return <Star/>; }

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user?.getIdToken();
        const response = await fetch("/api/public/wheel", { headers: token ? { authorization: `Bearer ${token}` } : undefined, cache: "no-store" });
        const payload = await response.json();
        if (!cancelled && response.ok) { setConfig(payload.config); setCanSpin(payload.canSpin); }
      } catch { /* The bundled campaign remains available when config fetch is transiently unavailable. */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [authLoading, user]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => event.key === "Escape" && !spinning && setOpen(false);
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [open, spinning]);

  async function spin(event?: FormEvent) {
    event?.preventDefault();
    if (spinning || (!canSpin && !isAdmin)) return;
    setSpinning(true); setError(""); setResult(null);
    try {
      const token = await user?.getIdToken();
      const response = await fetch("/api/public/wheel", { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ name, email }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Çark çevrilemedi.");
      const index = rewards.findIndex(item => item.id === payload.reward.id);
      const target = 360 - (Math.max(0, index) * slice + slice / 2);
      const nextRotation = rotation + 360 * 7 + ((target - (rotation % 360) + 360) % 360);
      setRotation(nextRotation);
      window.setTimeout(() => { setResult(payload); setCanSpin(isAdmin); setSpinning(false); }, 4800);
    } catch (spinError) {
      setError(spinError instanceof Error ? spinError.message : "Çark çevrilemedi.");
      setSpinning(false);
    }
  }

  if (loading || !config.active || rewards.length < 2) return null;
  return <>
    <button type="button" className="promo-wheel-trigger" onClick={() => setOpen(true)} aria-label="Hediye çarkını aç"><span className="promo-wheel-trigger-orbit"><Gift/></span><span><small>TEK ŞANS</small><strong>{config.triggerLabel}</strong></span><i/></button>
    {open && createPortal(<div className="promo-wheel-backdrop" role="dialog" aria-modal="true" aria-label="Dromocob hediye çarkı">
      <section className="promo-wheel-modal">
        <button type="button" className="promo-wheel-close" onClick={() => !spinning && setOpen(false)} aria-label="Çarkı kapat"><X/></button>
        <div className="promo-wheel-stage">
          <div className="promo-wheel-ambient"/><div className="promo-wheel-skyline"/><div className="promo-wheel-scanline"/><div className="promo-wheel-stage-code"><span>VICE / REWARD DISTRICT</span><b>26° 11&apos; 07.4&quot;N</b></div><div className="promo-wheel-pointer"><span/><b>DROP</b></div>
          <div className="promo-wheel-disc" style={{ background: wheelBackground, transform: `rotate(${rotation}deg)`, "--wheel-turn": `${-rotation}deg` } as CSSProperties}>
            <div className="promo-wheel-grid"/>
            {rewards.map((reward, index) => <span key={reward.id} className="promo-wheel-label" data-kind={reward.kind} style={{ "--label-angle": `${index * slice + slice / 2}deg`, "--label-accent": reward.color } as CSSProperties}><i><RewardIcon reward={reward}/></i><b>{reward.shortLabel}</b></span>)}
            <div className="promo-wheel-core"><span><Gift/><small>DROMOCOB</small></span></div>
          </div>
          <div className="promo-wheel-floor"/><div className="promo-wheel-stage-footer"><span><i/> PRIZE NETWORK ONLINE</span><b>{String(rewards.length).padStart(2,"0")} DROPS LOADED</b></div>
        </div>
        <div className="promo-wheel-copy">
          <p className="promo-wheel-kicker"><i/> LIVE REWARD ENGINE <b>SEASON 01</b></p><h2>{config.title}</h2><p>{config.subtitle}</p><div className="promo-wheel-drop-tags"><span><Gem/> Mystery drop</span><span><Rocket/> Priority lane</span><span><Star/> Creative perks</span></div>
          {!result && !user && canSpin && <form className="promo-wheel-identity" onSubmit={spin}><div><label>Ad soyad<input value={name} onChange={event => setName(event.target.value)} minLength={2} required placeholder="Adın Soyadın"/></label><label>E-posta<input type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="mail@adresin.com"/></label></div><small><LockKeyhole/> Kuponun bu e-posta adresine güvenle gönderilir.</small><button disabled={spinning}>{spinning ? <Loader2 className="spin"/> : <RotateCw/>}{spinning ? "Şansın hesaplanıyor" : "Çarkı çevir"}</button></form>}
          {!result && user && (canSpin || isAdmin) && <button type="button" className="promo-wheel-spin-button" onClick={() => spin()} disabled={spinning}>{spinning ? <Loader2 className="spin"/> : <RotateCw/>}{spinning ? "Çark dönüyor..." : isAdmin ? "Admin olarak çevir" : "Tek hakkımı kullan"}</button>}
          {!result && !canSpin && !isAdmin && <div className="promo-wheel-used"><Check/><div><strong>Çark hakkın kullanıldı.</strong><span>Üye kuponların profilinde; misafir kuponun e-posta kutunda.</span></div></div>}
          {error && <div className="promo-wheel-error">{error}</div>}
          {result && <div className={`promo-wheel-result ${result.reward.kind === "none" ? "is-empty" : ""}`}><Sparkles/><small>ÇARK SONUCU</small><h3>{result.reward.label}</h3><p>{result.reward.description}</p>{result.couponCode && <code>{result.couponCode}</code>}<span>{result.delivery === "profile" ? "Kuponun profilindeki Kuponlarım alanına eklendi." : result.delivery === "email" ? <><Mail/> Kupon kodu e-posta adresine gönderildi.</> : "Yeni kampanyalarda tekrar görüşmek üzere."}</span>{isAdmin && <button type="button" onClick={() => { setResult(null); setError(""); }}>Yeniden çevir</button>}</div>}
          <footer><span>01 / HER ZİYARETÇİYE TEK HAK</span><span>{isAdmin ? "ADMIN / SINIRSIZ MOD" : "SERVER VERIFIED"}</span></footer>
        </div>
      </section>
    </div>, document.body)}
  </>;
}
