"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import QuoteWizard from "@/components/quote-wizard";
import { packageQuoteServiceById } from "@/lib/package-details";

export default function PackageQuoteLauncher({ packageId, children, className = "button", ariaLabel = "Bu paketin teklif akışını başlat" }: { packageId: string; children: ReactNode; className?: string; ariaLabel?: string }) {
  const [open, setOpen] = useState(false);
  const service = packageQuoteServiceById[packageId] || "software";

  return <>
    <button type="button" className={className} aria-label={ariaLabel} onClick={() => setOpen(true)}>{children}</button>
    {open && createPortal(<QuoteWizard open initialService={service} onClose={() => setOpen(false)} />, document.body)}
  </>;
}
