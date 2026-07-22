import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";

import { adminDb } from "@/lib/firebase-admin";
import { resolveCustomerSection, type CustomerSitePage, type CustomerSiteRecord } from "@/lib/customer-sites";

export const dynamic = "force-dynamic";

const defaults: CustomerSitePage[] = [
  { id: "home", title: "Anasayfa", slug: "/", type: "home", visible: true, sections: ["hero", "features", "gallery"] },
  { id: "about", title: "Hakkımızda", slug: "/hakkimizda", type: "standard", visible: true, sections: ["hero", "text"] },
  { id: "contact", title: "İletişim", slug: "/iletisim", type: "contact", visible: true, sections: ["hero", "contact"] },
];

export default async function CustomerSitePreview({ params }: { params: Promise<{ id: string; slug?: string[] }> }) {
  const { id, slug = [] } = await params;
  const [siteSnapshot, controlSnapshot] = await Promise.all([
    adminDb.collection("customer_sites").doc(id).get(),
    adminDb.collection("customer_site_admin").doc(id).get(),
  ]);
  if (!siteSnapshot.exists) notFound();

  const site = { id: siteSnapshot.id, ...siteSnapshot.data() } as CustomerSiteRecord;
  const control = controlSnapshot.data() || {};
  const path = slug.length ? `/${slug.join("/")}` : "/";
  const pages = site.pages?.length ? site.pages : defaults;
  const page = pages.find(item => item.slug === path) || pages[0];

  if (control.status === "suspended") return <main className="customer-preview-gate"><ShieldCheck /><p>DROMOCOB SITES</p><h1>Bu site geçici olarak kullanılamıyor.</h1><span>Site sahibi destek ekibiyle iletişime geçebilir.</span></main>;
  if (control.status === "maintenance" || site.siteSettings?.maintenance) return <main className="customer-preview-gate"><span className="live-dot" /><p>PLANLI BAKIM</p><h1>{site.businessName} kısa bir güncelleme molasında.</h1><span>Çok yakında yeniden buradayız.</span></main>;

  return <main className={`customer-public-site public-${site.template}`} style={{ "--public-accent": site.accent } as React.CSSProperties}>
    <nav className="customer-public-nav"><Link href={`/site-onizleme/${id}`} className="customer-public-brand">{site.businessName}</Link><div>{pages.filter(item => item.visible).map(item => <Link key={item.id} className={item.id === page.id ? "active" : ""} href={`/site-onizleme/${id}${item.slug === "/" ? "" : item.slug}`}>{item.title}</Link>)}</div><Link href={`/site-onizleme/${id}/iletisim`}>İletişime geç <ArrowRight size={14} /></Link></nav>
    {page.sections.map((sectionValue, index) => {
      const section = resolveCustomerSection(sectionValue, `${page.id}-${index}`);
      if (section.type === "hero") return <section className="public-hero" key={section.id} style={section.images?.[0] ? { backgroundImage: `linear-gradient(90deg,rgba(7,12,8,.94),rgba(7,12,8,.4)),url(${section.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><p>{section.eyebrow} · FETHİYE · 2026</p><h1>{section.title}</h1><div><span>{section.description}</span><i><ArrowRight /></i></div><b /></section>;
      if (["features", "services", "stats", "pricing", "team", "timeline", "logos", "faq"].includes(section.type)) return <section className={`public-features public-collection public-${section.type}`} key={section.id}><p>{section.eyebrow}</p><h2>{section.title}</h2><span>{section.description}</span><div>{section.items.map((item, itemIndex) => <article key={`${item}-${itemIndex}`} style={section.images?.[itemIndex] ? { backgroundImage: `linear-gradient(rgba(17,23,17,.76),rgba(17,23,17,.94)),url(${section.images[itemIndex]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span>0{itemIndex + 1}</span><h3>{item}</h3><p>{section.type === "faq" ? "Detaylı bilgi için bizimle iletişime geçebilirsiniz." : section.description}</p></article>)}</div></section>;
      if (section.type === "gallery") return <section className="public-gallery" key={section.id}><header><p>{section.eyebrow}</p><span>01 — {String(section.items.length).padStart(2, "0")}</span></header><h2>{section.title}</h2><div>{section.items.map((item, itemIndex) => <article key={`${item}-${itemIndex}`} style={section.images?.[itemIndex] ? { backgroundImage: `linear-gradient(180deg,rgba(5,9,6,.08),rgba(5,9,6,.82)),url(${section.images[itemIndex]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span>0{itemIndex + 1}</span><h3>{item}</h3></article>)}</div></section>;
      if (section.type === "contact") return <section className="public-contact" key={section.id}><div><p>{section.eyebrow}</p><h2>{section.title}</h2><span>{section.description}</span></div><form>{section.items.slice(0, 3).map((item, itemIndex) => <label key={item}>{item}{itemIndex === 2 ? <textarea rows={4}/> : <input type={itemIndex === 1 ? "email" : "text"}/>}</label>)}<button type="button">{section.ctaLabel || "Mesaj gönder"} <ArrowRight size={15} /></button></form></section>;
      if (section.type === "video") return <section className="public-video" key={section.id}><p>{section.eyebrow}</p><h2>{section.title}</h2><span>{section.description}</span>{section.mediaUrl ? <video controls preload="metadata" src={section.mediaUrl} poster={section.images?.[0]}/> : <div style={section.images?.[0] ? { backgroundImage: `linear-gradient(rgba(5,10,7,.36),rgba(5,10,7,.75)),url(${section.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><i>▶</i><b>{section.ctaLabel || "Videoyu oynat"}</b></div>}</section>;
      if (section.type === "cta") return <section className="public-cta" key={section.id}><p>{section.eyebrow}</p><h2>{section.title}</h2><span>{section.description}</span><a href={section.ctaUrl || "/iletisim"}>{section.ctaLabel || "Projeyi başlat"}<ArrowRight size={15}/></a></section>;
      return <section className="public-content" key={section.id}><span>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.description}</p><div>{section.items.flatMap((item) => [<Check key={`${item}-icon`} />, <b key={item}>{item}</b>])}</div></section>;
    })}
    <footer className="customer-public-footer"><strong>{site.businessName}</strong><span>{site.subdomain}.dromocob.tr</span><a href="mailto:info@dromocob.tr"><Mail size={13} /> Dromocob Sites ile oluşturuldu</a></footer>
  </main>;
}
