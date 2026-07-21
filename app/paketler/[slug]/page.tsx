import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Headphones, RefreshCw, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import PackageQuoteLauncher from "@/components/package-quote-launcher";
import { getPackageDetail, packageDetails } from "@/lib/package-details";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

type PackagePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return packageDetails.map(item => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const item = getPackageDetail((await params).slug);
  if (!item) return {};
  return pageMetadata({ title: `${item.title} Paket Detayı`, description: item.description, path: `/paketler/${item.slug}`, keywords: item.keywords });
}

export default async function PackageDetailPage({ params }: PackagePageProps) {
  const item = getPackageDetail((await params).slug);
  if (!item) notFound();

  const serviceSchema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/paketler/${item.slug}#service`, name: item.title, description: item.description, url: absoluteUrl(`/paketler/${item.slug}`), provider: { "@id": `${siteUrl}/#organization`, "@type": "ProfessionalService", name: siteName }, areaServed: { "@type": "Country", name: "Türkiye" }, offers: { "@type": "Offer", priceCurrency: "TRY", price: item.priceFrom, description: `Başlangıç yatırımı: ${item.priceFrom.toLocaleString("tr-TR")} TL + KDV` } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: item.faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <section className="package-detail-hero section">
      <Link className="package-back-link" href="/paketler"><ArrowLeft size={16}/> Tüm paketler</Link>
      <div className="package-detail-hero-copy">
        <p className="eyebrow">{item.eyebrow}</p><h1>{item.title}<span>.</span></h1><p>{item.description}</p>
        <div className="package-detail-hero-actions"><PackageQuoteLauncher packageId={item.packageId}>Bu paketi konuşalım <ArrowRight size={17}/></PackageQuoteLauncher><a href="#paket-kapsami">Kapsamı incele <ArrowRight size={16}/></a></div>
      </div>
      <aside><small>Başlangıç yatırımı</small><strong>₺{item.priceFrom.toLocaleString("tr-TR")}<em>+ KDV</em></strong><span>Her paket iş hedefi, mevcut altyapı ve teslim takvimine göre netleştirilir.</span></aside>
    </section>
    <section className="package-detail-facts section" aria-label="Paket bilgileri"><article><Clock3/><small>Teslim aralığı</small><strong>{item.deliveryTime}</strong></article><article><Headphones/><small>Yayın sonrası</small><strong>{item.supportWindow}</strong></article><article><RefreshCw/><small>Revizyon</small><strong>{item.revisions}</strong></article><article><ShieldCheck/><small>Çalışma modeli</small><strong>Tek proje lideri</strong></article></section>
    <section className="package-detail-scope section" id="paket-kapsami"><header><p className="eyebrow">Kapsam haritası</p><h2>Karardan yayına<br/><em>tek akış.</em></h2><p>Her aşama yazılı karar, görünür teslim ve net bir sonraki adımla ilerler.</p></header><div>{item.phases.map(phase => <article key={phase.number}><span>{phase.number}</span><h3>{phase.title}</h3><p>{phase.description}</p><ul>{phase.deliverables.map(deliverable => <li key={deliverable}><Check size={14}/>{deliverable}</li>)}</ul></article>)}</div></section>
    <section className="package-detail-included section"><div><p className="eyebrow">Paket içeriği</p><h2>Hangi teslimler<br/><em>masada?</em></h2></div><div className="package-detail-checklist">{item.included.map((entry, index) => <article key={entry}><span>{String(index + 1).padStart(2, "0")}</span><CheckCircle2/><strong>{entry}</strong></article>)}</div></section>
    <section className="package-detail-fit section"><div><p className="eyebrow">Doğru eşleşme</p><h2>Kimler için<br/><em>tasarlandı?</em></h2><ul>{item.idealFor.map(entry => <li key={entry}><Check size={16}/>{entry}</li>)}</ul></div><div><p className="eyebrow">Başarı odağı</p><h2>Hangi sonucu<br/><em>hedefler?</em></h2><ul>{item.outcomes.map(entry => <li key={entry}><Check size={16}/>{entry}</li>)}</ul></div><aside><p>Çalışma ritmi</p>{item.collaboration.map((entry, index) => <span key={entry}><b>{String(index + 1).padStart(2, "0")}</b>{entry}</span>)}</aside></section>
    <section className="package-detail-faq section"><header><p className="eyebrow">Karar öncesi</p><h2>Sık sorulan<br/><em>sorular.</em></h2></header><div>{item.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
    <section className="package-detail-cta section"><p className="eyebrow">Bir sonraki adım</p><h2>Kapsamı birlikte<br/><em>netleştirelim.</em></h2><p>İhtiyacını paylaş; bu paketin doğru modüllerini, takvimini ve yatırım aralığını birlikte belirleyelim.</p><PackageQuoteLauncher packageId={item.packageId}>Paketi planlamaya başla <ArrowRight size={18}/></PackageQuoteLauncher></section>
    <PackageQuoteLauncher packageId={item.packageId} className="package-detail-quick-start" ariaLabel="Bu paketin teklif akışını başlat">Hemen başla <ArrowRight size={16}/></PackageQuoteLauncher>
  </>;
}
