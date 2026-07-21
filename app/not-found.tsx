import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return <section className="route-state-page section">
    <SearchX aria-hidden="true" />
    <p className="eyebrow">404 / Sayfa bulunamadı</p>
    <h1>Aradığın sayfa<br/><em>burada değil.</em></h1>
    <p>Adres değişmiş olabilir veya sayfa artık yayında olmayabilir. Hizmetlerimizi ve projelerimizi ana sayfadan inceleyebilirsin.</p>
    <div><Link className="button" href="/"><ArrowLeft size={17}/> Ana sayfaya dön</Link><Link className="route-state-link" href="/iletisim">Bizimle iletişime geç</Link></div>
  </section>;
}
