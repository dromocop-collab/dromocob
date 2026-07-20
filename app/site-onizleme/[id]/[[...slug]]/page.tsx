import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";

import { adminDb } from "@/lib/firebase-admin";
import type { CustomerSitePage, CustomerSiteRecord } from "@/lib/customer-sites";

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
    {page.sections.map((section, index) => {
      if (section === "hero") return <section className="public-hero" key={`${section}-${index}`}><p>{page.title.toUpperCase()} · İSTANBUL · 2026</p><h1>{page.type === "home" ? site.headline : `${page.title}, markamızın hikâyesini anlatır.`}</h1><div><span>Strateji, tasarım ve teknolojiyle sınırları aşan dijital deneyimler üretiyoruz.</span><i><ArrowRight /></i></div><b /></section>;
      if (section === "features") return <section className="public-features" key={`${section}-${index}`}><p>YETKİNLİKLERİMİZ</p><h2>İşinizi ileri taşıyan sistemler.</h2><div>{["Strateji", "Tasarım", "Teknoloji"].map((item, itemIndex) => <article key={item}><span>0{itemIndex + 1}</span><h3>{item}</h3><p>Markanızı büyüten, ölçülebilir ve sürdürülebilir bir yaklaşım.</p></article>)}</div></section>;
      if (section === "gallery") return <section className="public-gallery" key={`${section}-${index}`}><header><p>SEÇİLİ İŞLER</p><span>01 — 03</span></header><div><article><span>01</span><h3>Marka deneyimi</h3></article><article><span>02</span><h3>Dijital ürün</h3></article><article><span>03</span><h3>Büyüme sistemi</h3></article></div></section>;
      if (section === "contact") return <section className="public-contact" key={`${section}-${index}`}><div><p>BİRLİKTE ÇALIŞALIM</p><h2>Yeni bir şey<br/>başlatalım.</h2></div><form><label>Ad soyad<input /></label><label>E-posta<input type="email" /></label><label>Mesajınız<textarea rows={4} /></label><button type="button">Mesaj gönder <ArrowRight size={15} /></button></form></section>;
      return <section className="public-content" key={`${section}-${index}`}><span>{section === "testimonials" ? "MÜŞTERİLERİMİZ" : "YAKLAŞIMIMIZ"}</span><h2>{section === "testimonials" ? "İş ortaklarımız anlatıyor." : "Net fikirler. Güçlü sonuçlar."}</h2><p>Her projeyi iş hedefi, kullanıcı deneyimi ve teknik sürdürülebilirlik ekseninde tasarlıyoruz.</p><div><Check /> Stratejik planlama <Check /> Kurumsal tasarım <Check /> Ölçeklenebilir teknoloji</div></section>;
    })}
    <footer className="customer-public-footer"><strong>{site.businessName}</strong><span>{site.subdomain}.dromocob.tr</span><a href="mailto:info@dromocob.tr"><Mail size={13} /> Dromocob Sites ile oluşturuldu</a></footer>
  </main>;
}
