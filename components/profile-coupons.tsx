"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, Loader2, TicketCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { MemberCoupon } from "@/lib/promo-wheel";

export default function ProfileCoupons() {
  const [coupons, setCoupons] = useState<MemberCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch("/api/coupons/me", { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
        const payload = await response.json();
        if (!cancelled && response.ok) setCoupons(payload.coupons || []);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  async function copy(code: string) { await navigator.clipboard.writeText(code); setCopied(code); window.setTimeout(() => setCopied(""), 1800); }
  return <section className="profile-card profile-coupons-card"><div className="profile-card-head"><TicketCheck/><div><h2>Kuponlarım</h2><p>Çarktan kazandığın teklif avantajları.</p></div></div>
    {loading ? <div className="profile-coupon-empty"><Loader2 className="spin"/> Kuponlar yükleniyor</div> : coupons.length ? <div className="profile-coupon-list">{coupons.map(coupon => <article key={coupon.id} className={`is-${coupon.status}`}><span className="profile-coupon-icon"><Gift/></span><div><small>{coupon.status === "active" ? "KULLANIMA HAZIR" : coupon.status === "used" ? "KULLANILDI" : "SÜRESİ DOLDU"}</small><strong>{coupon.label}</strong><p>{coupon.description}</p><code>{coupon.code}</code><em>{coupon.expiresAt ? `${new Intl.DateTimeFormat("tr-TR").format(new Date(coupon.expiresAt))} tarihine kadar` : ""}</em></div>{coupon.status === "active" && <button type="button" onClick={() => copy(coupon.code)} aria-label="Kupon kodunu kopyala">{copied === coupon.code ? <Check/> : <Copy/>}</button>}</article>)}</div> : <div className="profile-coupon-empty"><Gift/><span><strong>Henüz kuponun yok.</strong><small>Sitedeki hediye çarkı seni bekliyor.</small></span></div>}
  </section>;
}
