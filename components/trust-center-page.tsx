import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, FileCheck2, Fingerprint, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { siteEmail } from "@/lib/seo";

export type TrustSection = { id: string; title: string; summary: string; paragraphs?: string[]; items?: string[] };

export default function TrustCenterPage({ eyebrow, title, accent, description, documentCode, updatedAt, sections, note, related = [] }: { eyebrow: string; title: string; accent: string; description: string; documentCode: string; updatedAt: string; sections: TrustSection[]; note?: string; related?: Array<{ title: string; href: string }> }) {
  return <main className="trust-center">
    <section className="trust-hero">
      <div className="trust-hero-grid" aria-hidden="true"/>
      <div className="trust-hero-copy"><p className="eyebrow"><ShieldCheck/> DROMOCOB / {eyebrow}</p><h1>{title}<br/><em>{accent}</em></h1><p>{description}</p><div className="trust-hero-meta"><span><i/> YÜRÜRLÜKTE</span><span><FileCheck2/> {documentCode}</span><span><Clock3/> Güncelleme: {updatedAt}</span></div></div>
      <aside><div className="trust-lock"><i/><i/><span><LockKeyhole/></span></div><small>TRUST PROTOCOL</small><strong>PRIVACY<br/>BY DESIGN</strong><p>Açık · Ölçülü · Güvenli</p></aside>
    </section>

    <section className="trust-layout">
      <aside className="trust-index"><div><span><i/> DOCUMENT MAP</span><strong>{String(sections.length).padStart(2, "0")} BÖLÜM</strong></div><nav>{sections.map((section, index) => <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}</nav><div className="trust-index-contact"><Fingerprint/><span><small>VERİ TALEPLERİ</small><a href={`mailto:${siteEmail}`}>{siteEmail}</a></span></div></aside>
      <div className="trust-document">
        <header><p className="eyebrow">OKUNABİLİR POLİTİKA STANDARDI</p><h2>Bilginin kontrolü<br/>sizde kalır.</h2><p>Her bölüm, hangi verinin neden işlendiğini ve hangi seçeneğe sahip olduğunuzu hızlıca bulabilmeniz için ayrı yapılandırılmıştır.</p></header>
        {sections.map((section, index) => <article id={section.id} className="trust-section" key={section.id}><div className="trust-section-no">{String(index + 1).padStart(2, "0")}</div><div><p className="eyebrow">POLICY MODULE</p><h2>{section.title}</h2><p className="trust-section-summary">{section.summary}</p>{section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{!!section.items?.length && <ul>{section.items.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul>}</div></article>)}
        {note && <div className="trust-callout"><ShieldCheck/><div><small>DROMOCOB GÜVEN NOTU</small><strong>{note}</strong></div></div>}
      </div>
    </section>

    <section className="trust-contact"><div><p className="eyebrow"><Mail/> PRIVACY DESK / ONLINE</p><h2>Sorunuz veya<br/><em>veri talebiniz mi var?</em></h2><p>Talebinizde adınızı, iletişim bilginizi ve talebin konusunu açıkça belirtmeniz değerlendirme sürecini hızlandırır.</p></div><a href={`mailto:${siteEmail}`}><span><small>GÜVENLİ İLETİŞİM KANALI</small><strong>{siteEmail}</strong></span><ArrowUpRight/></a></section>

    {!!related.length && <section className="trust-related"><p className="eyebrow">İLGİLİ GÜVEN BELGELERİ</p><div>{related.map(item => <Link href={item.href} key={item.href}>{item.title}<ArrowUpRight/></Link>)}</div></section>}
  </main>;
}
