"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dromocob-launch-offer-v1";

export default function LaunchOffer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setVisible(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.body.classList.add("offer-is-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("offer-is-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible]);

  function close() {
    window.sessionStorage.setItem(STORAGE_KEY, "seen");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="launch-offer" role="dialog" aria-modal="true" aria-labelledby="launch-offer-title">
      <button className="launch-offer-backdrop" type="button" onClick={close} aria-label="Kampanya penceresini kapat" />
      <div className="launch-offer-card">
        <div className="launch-offer-grid" aria-hidden="true" />
        <div className="launch-offer-glow" aria-hidden="true" />
        <button className="launch-offer-close" type="button" onClick={close} aria-label="Kapat"><X /></button>

        <div className="launch-offer-topline">
          <span><i /> AĞUSTOS LANSMAN FIRSATI</span>
          <span>2026 / WEB</span>
        </div>

        <div className="launch-offer-copy">
          <p className="launch-offer-kicker"><Sparkles /> Markanı dijitalde öne çıkar</p>
          <h2 id="launch-offer-title">Kurumsal web siten<br/><em>10.000 TL&apos;den</em> başlasın.</h2>
          <p>Mobil uyumlu, hızlı ve markana özel tasarlanan yeni nesil web sitesiyle güven veren bir dijital vitrine sahip ol.</p>
          <div className="launch-offer-features">
            <span><Check /> Özel arayüz tasarımı</span>
            <span><Check /> Mobil uyum + SEO altyapısı</span>
            <span><Check /> Hızlı teslim planı</span>
          </div>
          <div className="launch-offer-actions">
            <Link href="/web-tasarim" onClick={close}>Kampanyayı incele <ArrowRight /></Link>
            <Link href="/iletisim" onClick={close}>Hemen konuşalım</Link>
          </div>
          <small>* Başlangıç fiyatıdır. Kapsama göre proje bütçesi değişebilir.</small>
        </div>

        <div className="launch-offer-visual" aria-hidden="true">
          <div className="offer-orbit offer-orbit-one"><i/><i/></div>
          <div className="offer-orbit offer-orbit-two"><i/></div>
          <div className="offer-price">
            <span>BAŞLAYAN FİYATLARLA</span>
            <strong><b>10.000</b><small>TL</small></strong>
            <em>KURUMSAL WEB SİTESİ</em>
          </div>
          <span className="offer-float offer-float-one">MOBİL UYUMLU <b>✓</b></span>
          <span className="offer-float offer-float-two">SEO READY <b>01</b></span>
          <span className="offer-float offer-float-three">ÖZEL TASARIM <b>∞</b></span>
        </div>
      </div>
    </div>
  );
}
