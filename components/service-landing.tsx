import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import AdvancedQuoteWizard from "@/components/advanced-quote-wizard";
import type { AdvancedQuoteService } from "@/lib/advanced-quote-config";

type ServiceLandingProps = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  services: Array<{ title: string; description: string }>;
  process: Array<{ title: string; description: string }>;
  cities: string[];
  schema: Record<string, unknown>;
  media: Array<{ src: string; title: string; detail: string; alt: string }>;
  mediaEyebrow: string;
  mediaTitle: string;
  path: string;
  breadcrumbLabel: string;
  faqs: Array<{ question: string; answer: string }>;
  quoteService: AdvancedQuoteService;
};

export default function ServiceLanding({ eyebrow, title, accent, intro, services, process, cities, schema, media, mediaEyebrow, mediaTitle, path, breadcrumbLabel, faqs, quoteService }: ServiceLandingProps) {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://dromocob.tr/" },
    { "@type": "ListItem", position: 2, name: "Hizmetler", item: "https://dromocob.tr/hizmetler" },
    { "@type": "ListItem", position: 3, name: breadcrumbLabel, item: `https://dromocob.tr${path}` },
  ] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })) };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}/>
    <section className="service-hero section">
      <nav className="service-breadcrumb" aria-label="Sayfa yolu"><Link href="/">Ana Sayfa</Link><span>/</span><Link href="/hizmetler">Hizmetler</Link><span>/</span><strong>{breadcrumbLabel}</strong></nav>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}<br/><span>{accent}</span></h1>
      <p>{intro}</p>
      <div className="service-actions"><AdvancedQuoteWizard service={quoteService}/><Link className="text-link" href="/projeler">Çalışmaları incele</Link></div>
    </section>
    <section className="service-grid section" aria-labelledby="service-scope"><div><p className="eyebrow">Uçtan uca hizmet</p><h2 id="service-scope">Stratejiden teslimata<br/>tek yaratıcı sistem.</h2></div><div className="service-cards">{services.map((service, index) => <article key={service.title}><span>0{index + 1}</span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></section>
    <section className="service-media section" aria-labelledby="service-media-title">
      <div className="service-media-head"><div><p className="eyebrow">{mediaEyebrow}</p><h2 id="service-media-title">{mediaTitle}</h2></div><span>{String(media.length).padStart(2, "0")} / SELECTED SYSTEMS</span></div>
      <div className={`service-media-grid media-count-${media.length}`}>{media.map((item, index) => <figure key={item.src}>
        <div className="service-media-image"><Image src={item.src} alt={item.alt} width={1200} height={1200} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"/></div>
        <figcaption><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></figcaption>
      </figure>)}</div>
    </section>
    <section className="service-process section"><p className="eyebrow">Nasıl çalışıyoruz?</p><h2>Net kapsam. Şeffaf süreç.<br/>Ölçülebilir sonuç.</h2><div>{process.map((step, index) => <article key={step.title}><CheckCircle2/><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>
    <section className="service-faq section"><div><p className="eyebrow">Sık sorulan sorular</p><h2>Başlamadan önce<br/>netleşmesi gerekenler.</h2></div><div>{faqs.map(item => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></section>
    <section className="service-turkiye section"><div><p className="eyebrow">Türkiye geneli hizmet</p><h2>Fethiye&apos;den<br/>81 ile üretim.</h2></div><div><p>Keşif, strateji ve proje yönetimini çevrim içi; çekim ve saha üretimini ihtiyaca göre yerinde yürütüyoruz. Türkiye&apos;nin her yerindeki markalarla çalışabilecek üretim ve teslim altyapısına sahibiz.</p><p className="city-list">{cities.join(" · ")} ve tüm Türkiye</p><AdvancedQuoteWizard service={quoteService} buttonLabel="Projenin kapsamını konuşalım"/></div></section>
  </>;
}
