import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, Cpu, Radio } from "lucide-react";
import { equipmentBySlug, equipmentCatalog } from "@/lib/equipment-catalog";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return equipmentCatalog.map(item => ({ slug: item.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = equipmentBySlug((await params).slug);
  if (!item) return {};
  return pageMetadata({ title: `${item.name} | Profesyonel Çekim Ekipmanlarımız`, description: item.shortDescription, path: `/kamera-ekipmanlari/${item.slug}`, keywords: item.keywords });
}

export default async function EquipmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = equipmentBySlug((await params).slug);
  if (!item) notFound();
  const siblings = equipmentCatalog.filter(entry => entry.slug !== item.slug).slice(0, 3);
  const path = `/kamera-ekipmanlari/${item.slug}`;
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "WebPage", "@id": `${absoluteUrl(path)}#webpage`, name: item.name, description: item.shortDescription, url: absoluteUrl(path), isPartOf: { "@id": `${siteUrl}/#website` }, about: { "@type": "Product", name: item.name, category: item.category, image: absoluteUrl(item.image), description: item.description }, publisher: { "@type": "Organization", name: siteName, url: siteUrl } }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Kamera Ekipmanları", item: absoluteUrl("/kamera-ekipmanlari") }, { "@type": "ListItem", position: 3, name: item.name, item: absoluteUrl(path) }] }] };

  return <main className="equipment-detail">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <div className="equipment-breadcrumb"><Link href="/kamera-ekipmanlari"><ArrowLeft/> Kamera ekipmanları</Link><span>DROMOCOB / {item.category}</span></div>
    <section className="equipment-detail-hero"><div className="equipment-detail-copy"><p className="eyebrow"><Radio/> PRODUCTION SYSTEM / ONLINE</p><h1>{item.name}</h1><p>{item.description}</p><div className="equipment-detail-actions"><Link className="button" href="/iletisim">Bu sistemle proje planla <ArrowUpRight/></Link><Link href={item.relatedServices[0].href}>İlgili hizmeti incele <ChevronRight/></Link></div></div><div className="equipment-detail-visual"><Image src={item.image} alt={`${item.name} ile profesyonel çekim`} fill priority sizes="(max-width: 900px) 100vw, 48vw"/><span><i/> DROMOCOB SET ENVANTERİ</span><b>{item.category}</b></div></section>
    <section className="equipment-spec-layout"><div><p className="eyebrow"><Cpu/> CAPABILITY MATRIX</p><h2>Bu sistemi neden kullanıyoruz?</h2><p>Teknik özellikleri listelemek yerine, bu ekipmanın prodüksiyon sonucuna yaptığı katkıyı ölçüyoruz.</p></div><ul>{item.capabilities.map((capability, index) => <li key={capability}><span>{String(index + 1).padStart(2, "0")}</span><strong>{capability}</strong><Check/></li>)}</ul></section>
    <section className="equipment-use-section"><header><p className="eyebrow">UYGULAMA SENARYOLARI</p><h2>Gerçek projede<br/><em>nasıl çalışır?</em></h2></header><div>{item.uses.map((use, index) => <article key={use.title}><span>0{index + 1}</span><h3>{use.title}</h3><p>{use.description}</p></article>)}</div></section>
    <section className="equipment-workflow"><div><p className="eyebrow">DROMOCOB WORKFLOW</p><h2>Ekipmandan teslimata.</h2></div><ol>{item.workflow.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></section>
    <section className="equipment-links"><div><p className="eyebrow">İLGİLİ HİZMETLER</p><h2>Bu sistemi projene dahil et.</h2></div><div>{item.relatedServices.map(service => <Link href={service.href} key={service.href}>{service.title}<ArrowUpRight/></Link>)}</div></section>
    <section className="equipment-more"><p className="eyebrow">SETİN DİĞER PARÇALARI</p><div>{siblings.map(entry => <Link href={`/kamera-ekipmanlari/${entry.slug}`} key={entry.slug}><Image src={entry.image} alt={entry.name} width={180} height={120}/><span><small>{entry.category}</small><strong>{entry.name}</strong></span><ArrowUpRight/></Link>)}</div></section>
  </main>;
}
