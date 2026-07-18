"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Clock3, Headphones, RefreshCw, ShieldCheck } from "lucide-react";
import { fetchActivePackages, fallbackPackages } from "@/lib/data";
import type { ServicePackage } from "@/lib/types";
import QuoteWizard from "@/components/quote-wizard";

export default function PackageGrid() {
  const [packages, setPackages] = useState<ServicePackage[]>(fallbackPackages);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    fetchActivePackages().then(setPackages);
  }, []);

  return (
    <>
      <div className="package-grid">
        {packages.map((item, index) => (
          <article className={`package-card ${item.featured ? "featured-card" : ""} ${item.theme ? `theme-${item.theme}` : ""}`} key={item.id}>
            <div className="package-card-topline"><span>0{index + 1}</span><i>DC / SYSTEM</i></div>
            {item.image && <div className="package-visual" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(0,0,0,.48)), url(${item.image})` }} />}
            {item.badge && <span className="badge">{item.badge}</span>}
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
              {item.features.map(feature => <li key={feature}><Check size={17} />{feature}</li>)}
            </ul>

            <div className="package-intelligence">
              {!!item.idealFor?.length && <div><span>İdeal yapı</span><p>{item.idealFor.join(" · ")}</p></div>}
              {!!item.kpiFocus?.length && <div><span>Başarı odağı</span><p>{item.kpiFocus.join(" · ")}</p></div>}
            </div>
            {item.guarantee && <p className="package-guarantee"><ShieldCheck size={17}/>{item.guarantee}</p>}

            <button className="button button-full" onClick={() => setQuoteOpen(true)}>{item.cta || "Paketi Özelleştir"} <ArrowUpRight size={18} /></button>
          </article>
        ))}
      </div>
      <QuoteWizard open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}
