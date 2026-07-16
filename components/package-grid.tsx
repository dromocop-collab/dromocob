"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
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
        {packages.map(item => (
          <article className={`package-card ${item.featured ? "featured-card" : ""} ${item.theme ? `theme-${item.theme}` : ""}`} key={item.id}>
            {item.image && <div className="package-visual" style={{ backgroundImage: `url(${item.image})` }} />}
            {item.badge && <span className="badge">{item.badge}</span>}
            <p className="eyebrow">{item.subtitle}</p>
            <h3>{item.title}</h3>
            <div className="package-price"><small>₺</small>{item.priceFrom.toLocaleString("tr-TR")}<span>&apos;den</span></div>
            <p className="muted">{item.description}</p>

            {(item.deliveryTime || item.supportWindow || item.maxRevision) && (
              <div className="package-meta">
                {item.deliveryTime && <span>Teslim: <strong>{item.deliveryTime}</strong></span>}
                {item.supportWindow && <span>Destek: <strong>{item.supportWindow}</strong></span>}
                {item.maxRevision && <span>Revizyon: <strong>{item.maxRevision}</strong></span>}
              </div>
            )}

            <ul className="feature-list">
              {item.features.map(feature => <li key={feature}><Check size={17} />{feature}</li>)}
            </ul>

            {!!item.idealFor?.length && <p className="package-target">İdeal: {item.idealFor.join(" · ")}</p>}
            {!!item.kpiFocus?.length && <p className="package-target">KPI: {item.kpiFocus.join(" · ")}</p>}
            {item.guarantee && <p className="package-guarantee">{item.guarantee}</p>}

            <button className="button button-full" onClick={() => setQuoteOpen(true)}>{item.cta || "Paketi Özelleştir"} <ArrowUpRight size={18} /></button>
          </article>
        ))}
      </div>
      <QuoteWizard open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}
