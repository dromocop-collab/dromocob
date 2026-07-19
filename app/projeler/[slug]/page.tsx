import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { getProjectCaseStudy, projectCaseStudies } from "@/lib/project-case-studies";
import { absoluteUrl, pageMetadata, siteName } from "@/lib/seo";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projectCaseStudies.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectCaseStudy(slug);
  if (!project) return {};

  const base = pageMetadata({
    title: project.seoTitle,
    description: project.description,
    path: `/projeler/${project.slug}`,
    keywords: project.keywords,
  });

  return {
    ...base,
    openGraph: {
      title: project.seoTitle,
      description: project.description,
      url: absoluteUrl(`/projeler/${project.slug}`),
      siteName,
      locale: "tr_TR",
      type: "article",
      images: [{ url: absoluteUrl(project.coverUrl), width: 1200, height: 1500, alt: project.coverAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.seoTitle,
      description: project.description,
      images: [absoluteUrl(project.coverUrl)],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectCaseStudy(slug);
  if (!project) notFound();

  const pageUrl = absoluteUrl(`/projeler/${project.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${pageUrl}#project`,
        name: project.seoTitle,
        headline: project.title,
        description: project.description,
        url: pageUrl,
        image: { "@type": "ImageObject", url: absoluteUrl(project.coverUrl), caption: project.coverAlt },
        dateCreated: String(project.year),
        inLanguage: "tr-TR",
        locationCreated: { "@type": "Country", name: "Türkiye" },
        creator: { "@id": `${absoluteUrl("/")}#organization` },
        about: project.services,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Projeler", item: absoluteUrl("/projeler") },
          { "@type": "ListItem", position: 3, name: project.title, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: project.faq.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <article className="case-study-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className="case-study-hero section">
        <nav className="case-breadcrumb" aria-label="Sayfa yolu">
          <Link href="/">Ana Sayfa</Link><span>/</span><Link href="/projeler">Projeler</Link><span>/</span><strong>{project.title}</strong>
        </nav>
        <p className="eyebrow">{project.eyebrow}</p>
        <h1>{project.title}<br/><em>{project.category}</em></h1>
        <div className="case-study-lead">
          <p>{project.summary}</p>
          <dl>
            <div><dt>Hizmet</dt><dd>{project.service}</dd></div>
            <div><dt>Üretim alanı</dt><dd><MapPin size={14}/>{project.location}</dd></div>
            <div><dt>Yıl</dt><dd>{project.year}</dd></div>
          </dl>
        </div>
      </header>

      <figure className="case-study-cover">
        <Image src={project.coverUrl} alt={project.coverAlt} fill priority sizes="100vw" />
        <figcaption>{project.coverAlt}</figcaption>
      </figure>

      <section className="section case-study-overview">
        <div><p className="eyebrow">Proje özeti</p><h2>Net problem.<br/><em>Doğru sistem.</em></h2></div>
        <div className="case-copy-stack">
          <div><span>01 / İhtiyaç</span><h3>Çözülmesi gereken</h3><p>{project.challenge}</p></div>
          <div><span>02 / Yaklaşım</span><h3>Nasıl ele aldık?</h3><p>{project.solution}</p></div>
        </div>
      </section>

      <section className="case-study-outcomes section">
        <p className="eyebrow">Projenin oluşturduğu değer</p>
        <div className="case-outcome-grid">
          {project.outcomes.map((outcome, index) => <div key={outcome}><span>0{index + 1}</span><h3>{outcome}</h3></div>)}
        </div>
      </section>

      <section className="section case-study-services">
        <div><p className="eyebrow">Kapsam</p><h2>Tek brief,<br/><em>bütünleşik üretim.</em></h2></div>
        <ul>{project.services.map(service => <li key={service}><Check size={18}/>{service}</li>)}</ul>
      </section>

      <section className="case-process section">
        <div className="section-head"><div><p className="eyebrow">Üretim modeli</p><h2>Adım adım<br/><em>kontrollü süreç.</em></h2></div><p>Her aşama bir sonraki kararın daha hızlı ve daha doğru verilmesini sağlayacak şekilde birbirine bağlanır.</p></div>
        <div className="case-process-grid">
          {project.process.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}
        </div>
      </section>

      <section className="section case-deliverables">
        <div><p className="eyebrow">Teslim sistemi</p><h2>Sadece üretim değil,<br/><em>kullanılabilir çıktı.</em></h2></div>
        <div className="case-deliverable-list">{project.deliverables.map(item => <div key={item}><Check size={17}/><span>{item}</span></div>)}</div>
      </section>

      <section className="section case-faq">
        <div><p className="eyebrow">Sık sorulanlar</p><h2>Proje hakkında<br/><em>kısa cevaplar.</em></h2></div>
        <div>{project.faq.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </section>

      <section className="case-next section">
        <Link className="case-back" href="/projeler"><ArrowLeft size={17}/> Tüm projeler</Link>
        <p className="eyebrow">Benzer bir proje mi planlıyorsunuz?</p>
        <h2>Bir sonraki güçlü işi<br/><em>birlikte tasarlayalım.</em></h2>
        <div><Link className="button" href="/iletisim">Projenizi anlatın <ArrowRight size={18}/></Link><Link className="text-link" href={project.relatedServiceUrl}>{project.relatedServiceLabel}</Link></div>
      </section>
    </article>
  );
}
