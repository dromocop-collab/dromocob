"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Check, Clock3, Headphones, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { fetchActivePackages, fallbackPackages } from "@/lib/data";
import { packageDetailPathById, packageQuoteServiceById } from "@/lib/package-details";
import type { ServicePackage } from "@/lib/types";
import QuoteWizard from "@/components/quote-wizard";

export default function PackageGrid({ compact = false }: { compact?: boolean }) {
  const [packages, setPackages] = useState<ServicePackage[]>(fallbackPackages);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteService, setQuoteService] = useState<ServicePackage["quoteService"]>();
  const [quotePackageId, setQuotePackageId] = useState<string>();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActivePackages().then(setPackages);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".package-card"));
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.14 }
    );

    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [packages]);

  const trackCardLight = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateY = ((x / bounds.width) - 0.5) * 4;
    const rotateX = (0.5 - (y / bounds.height)) * 4;

    card.style.setProperty("--pointer-x", `${x}px`);
    card.style.setProperty("--pointer-y", `${y}px`);
    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
  };

  const resetCardLight = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--rotate-x", "0deg");
    event.currentTarget.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <>
      <div className={`package-grid ${compact ? "package-grid-compact" : ""}`} ref={gridRef}>
        {packages.map((item, index) => (
          <article
            className={`package-card ${item.featured ? "featured-card" : ""} ${item.theme ? `theme-${item.theme}` : ""}`}
            key={item.id}
            onPointerMove={trackCardLight}
            onPointerLeave={resetCardLight}
            style={{ "--card-order": index } as CSSProperties}
          >
            <div className="package-card-aurora" aria-hidden="true" />
            <div className="package-card-orbit" aria-hidden="true"><i /><i /></div>
            <div className="package-card-topline">
              <span>0{index + 1}</span>
              <span className="package-card-status">
                {item.badge && <b className="badge">{item.badge}</b>}
                <i>{compact ? "DC / SELECT" : "DC / SYSTEM"}</i>
              </span>
            </div>
            {item.image && !compact && <div className="package-visual" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(0,0,0,.48)), url(${item.image})` }} />}
            <p className="eyebrow">{item.subtitle}</p>
            <h3>{item.title}</h3>
            <div className="package-price-label">Başlangıç yatırımı</div>
            <div className="package-price"><small>₺</small>{item.priceFrom.toLocaleString("tr-TR")}<span>+ KDV</span></div>
            <p className="muted">{item.description}</p>

            {(item.deliveryTime || item.supportWindow || item.maxRevision) && (
              <div className="package-meta">
                {item.deliveryTime && <span><Clock3 size={15}/><small>Teslim</small><strong>{item.deliveryTime}</strong></span>}
                {item.supportWindow && <span><Headphones size={15}/><small>Destek</small><strong>{item.supportWindow}</strong></span>}
                {item.maxRevision && <span><RefreshCw size={15}/><small>Revizyon</small><strong>{item.maxRevision}</strong></span>}
              </div>
            )}

            <ul className="feature-list">
              {(compact ? item.features.slice(0, 3) : item.features).map(feature => <li key={feature}><Check size={17} />{feature}</li>)}
            </ul>

            {!compact && <div className="package-intelligence">
              {!!item.idealFor?.length && <div><span>İdeal yapı</span><p>{item.idealFor.join(" · ")}</p></div>}
              {!!item.kpiFocus?.length && <div><span>Başarı odağı</span><p>{item.kpiFocus.join(" · ")}</p></div>}
            </div>}
            {!compact && item.guarantee && <p className="package-guarantee"><ShieldCheck size={17}/>{item.guarantee}</p>}

            {compact ? <div className="package-compact-actions">
              {packageDetailPathById[item.id] && <Link className="package-detail-link" href={packageDetailPathById[item.id]}>Detaylar <ArrowUpRight size={16}/></Link>}
              <button className="button button-full" onClick={() => { setQuoteService(packageQuoteServiceById[item.id] || item.quoteService); setQuotePackageId(item.id); setQuoteOpen(true); }}>Teklif al <ArrowUpRight size={18} /></button>
            </div> : <>
              {packageDetailPathById[item.id] && <Link className="package-detail-link" href={packageDetailPathById[item.id]}>Paket detaylarını incele <ArrowUpRight size={16}/></Link>}
              <button className="button button-full" onClick={() => { setQuoteService(packageQuoteServiceById[item.id] || item.quoteService); setQuotePackageId(item.id); setQuoteOpen(true); }}>{item.cta || "Paketi Özelleştir"} <ArrowUpRight size={18} /></button>
            </>}
          </article>
        ))}
      </div>
      {quoteOpen && <QuoteWizard open initialService={quoteService} initialPackageId={quotePackageId} onClose={() => { setQuoteOpen(false); setQuotePackageId(undefined); }} />}
    </>
  );
}
