import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type ServiceLandingProps = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  services: Array<{ title: string; description: string }>;
  process: Array<{ title: string; description: string }>;
  cities: string[];
  schema: Record<string, unknown>;
};

export default function ServiceLanding({ eyebrow, title, accent, intro, services, process, cities, schema }: ServiceLandingProps) {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}/>
    <section className="service-hero section">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}<br/><span>{accent}</span></h1>
      <p>{intro}</p>
      <div className="service-actions"><Link className="button" href="/iletisim">Projen için teklif al <ArrowRight size={18}/></Link><Link className="text-link" href="/projeler">Çalışmaları incele</Link></div>
    </section>
    <section className="service-grid section" aria-labelledby="service-scope"><div><p className="eyebrow">Uçtan uca hizmet</p><h2 id="service-scope">Stratejiden teslimata<br/>tek yaratıcı sistem.</h2></div><div className="service-cards">{services.map((service, index) => <article key={service.title}><span>0{index + 1}</span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></section>
    <section className="service-process section"><p className="eyebrow">Nasıl çalışıyoruz?</p><h2>Net kapsam. Şeffaf süreç.<br/>Ölçülebilir sonuç.</h2><div>{process.map((step, index) => <article key={step.title}><CheckCircle2/><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>
    <section className="service-turkiye section"><div><p className="eyebrow">Türkiye geneli hizmet</p><h2>İstanbul&apos;dan<br/>81 ile üretim.</h2></div><div><p>Keşif, strateji ve proje yönetimini çevrim içi; çekim ve saha üretimini ihtiyaca göre yerinde yürütüyoruz. Türkiye&apos;nin her yerindeki markalarla çalışabilecek üretim ve teslim altyapısına sahibiz.</p><p className="city-list">{cities.join(" · ")} ve tüm Türkiye</p><Link className="button button-ghost" href="/iletisim">Projenin kapsamını konuşalım <ArrowRight size={18}/></Link></div></section>
  </>;
}
