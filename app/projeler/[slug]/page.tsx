import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { getProjectCaseStudy, projectCaseStudies, type ProjectCaseStudy } from "@/lib/project-case-studies";
import { adminDb } from "@/lib/firebase-admin";
import { absoluteUrl, pageMetadata, siteName } from "@/lib/seo";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return projectCaseStudies.map(project => ({ slug: project.slug }));
}

async function getProject(slug: string): Promise<ProjectCaseStudy | undefined> {
  const fallback = getProjectCaseStudy(slug);
  if (fallback) return fallback;

  try {
    const snapshot = await adminDb.collection("projects").where("slug", "==", slug).where("active", "==", true).limit(1).get();
    const data = snapshot.docs[0]?.data();
    if (!data) return undefined;
    const list = (value: unknown) => Array.isArray(value) ? value.map(String).filter(Boolean) : [];
    const title = String(data.title || "Proje");
    const category = String(data.category || "Dromocob projesi");
    const summary = String(data.summary || data.subtitle || data.description || "Dromocob tarafından tasarlanan ve üretilen proje.");
    const services = list(data.services);

    return {
      id: snapshot.docs[0].id,
      slug,
      title,
      seoTitle: String(data.seoTitle || `${title} | Dromocob Projesi`),
      category,
      eyebrow: String(data.eyebrow || `${category} · Dromocob`),
      summary,
      description: String(data.description || summary),
      coverUrl: String(data.coverUrl || data.coverImage || "/images/projects/digital-commerce-system.jpg"),
      coverAlt: String(data.coverAlt || `${title} proje kapak görseli`),
      year: Number(data.year || new Date().getFullYear()),
      service: String(data.service || services.join(", ") || category),
      location: String(data.location || "Türkiye geneli"),
      challenge: String(data.challenge || "Projenin hedeflerini net, güçlü ve sürdürülebilir bir dijital deneyime dönüştürmek."),
      solution: String(data.solution || data.description || summary),
      outcomes: list(data.outcomes).length ? list(data.outcomes) : ["Markaya özel yaratıcı yaklaşım", "Ölçeklenebilir ve yönetilebilir teslim sistemi", "Yayın sonrası kullanıma hazır proje çıktıları"],
      services: services.length ? services : [category],
      process: Array.isArray(data.process) ? data.process.map((item: Record<string, unknown>) => ({ title: String(item.title || "Proje adımı"), description: String(item.description || "Planlanan kapsam kontrollü biçimde tamamlandı.") })) : [
        { title: "Keşif", description: "Hedefler, ihtiyaçlar ve proje kapsamı netleştirildi." },
        { title: "Tasarım", description: "Yaratıcı ve teknik yön proje hedeflerine göre geliştirildi." },
        { title: "Üretim", description: "Onaylanan sistem planlı üretim akışıyla tamamlandı." },
        { title: "Yayın", description: "Son kontroller ve teslim süreci tamamlandı." },
      ],
      deliverables: list(data.deliverables).length ? list(data.deliverables) : services,
      relatedServiceUrl: String(data.relatedServiceUrl || "/iletisim"),
      relatedServiceLabel: String(data.relatedServiceLabel || "Benzer bir proje için iletişime geç"),
      keywords: list(data.keywords).length ? list(data.keywords) : [title, category, "Dromocob"],
      faq: Array.isArray(data.faq) ? data.faq.map((item: Record<string, unknown>) => ({ question: String(item.question || "Proje hakkında bilgi alabilir miyim?"), answer: String(item.answer || "Detaylı bilgi için bizimle iletişime geçebilirsiniz.") })) : [],
    };
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
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
  const project = await getProject(slug);
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
