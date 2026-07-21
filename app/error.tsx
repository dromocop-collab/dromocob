"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[DROMOCOB ROUTE ERROR]", error);
  }, [error]);

  return <section className="route-state-page section">
    <p className="eyebrow">Sistem bildirimi</p>
    <h1>Bir şeyler<br/><em>aksadı.</em></h1>
    <p>Sayfayı yeniden yükleyerek tekrar deneyebilirsin. Sorun devam ederse proje ekibimizle iletişime geç.</p>
    <div><button type="button" className="button" onClick={reset}><RefreshCw size={17}/> Tekrar dene</button><Link className="route-state-link" href="/">Ana sayfaya dön</Link></div>
  </section>;
}
