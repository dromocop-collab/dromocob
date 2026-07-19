import ProjectGrid from "@/components/project-grid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projectCaseStudies } from "@/lib/project-case-studies";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Web Tasarım, Film Prodüksiyon ve Growth Projeleri",
  description:
    "Dromocob tarafından geliştirilen film prodüksiyonu, web sistemi, e-ticaret ve dijital büyüme projelerinden seçili çalışmalar.",
  path: "/projeler",
  keywords: ["web tasarım projeleri", "film prodüksiyon projeleri", "marka filmi örnekleri", "e-ticaret yazılım projesi", "sosyal medya içerik üretimi"],
});

export default function ProjectsPage() {
  const projectListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/projeler")}#collection`,
    name: "Dromocob web tasarım, film prodüksiyon ve growth projeleri",
    url: absoluteUrl("/projeler"),
    inLanguage: "tr-TR",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projectCaseStudies.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/projeler/${project.slug}`),
        name: project.title,
        image: absoluteUrl(project.coverUrl),
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectListJsonLd).replace(/</g, "\\u003c") }} />
      <section className="page-hero section">
        <p className="eyebrow">Seçili işler / 2024—2026</p>
        <h1>İşler konuşsun.<br/><span>Biz sonucu ölçelim.</span></h1>
        <p className="hero-description">Film prodüksiyonu, web tasarım, özel yazılım ve dijital büyüme alanlarında stratejiyle üretimi birleştiren seçili proje sistemleri.</p>
      </section>
      <section className="section"><ProjectGrid /></section>
      <section className="section project-index-seo">
        <div>
          <p className="eyebrow">Tek ekip · Bütünleşik üretim</p>
          <h2>Fikirden yayına,<br/><em>ölçülebilir sistemler.</em></h2>
        </div>
        <div>
          <p>Her projeyi yalnızca görünen tasarım veya film olarak değil; markanın hedefi, müşterinin yolculuğu, teknik altyapı, içerik üretimi ve yayın sonrası ölçüm katmanlarıyla birlikte ele alıyoruz.</p>
          <p>İstanbul merkezli çalışma modelimizle web ve strateji projelerini Türkiye genelinde uzaktan; prodüksiyonları ise ihtiyaca göre farklı şehirlerde yerinde yürütebiliyoruz.</p>
          <Link className="button" href="/iletisim">Projenin kapsamını konuşalım <ArrowRight size={18}/></Link>
        </div>
      </section>
    </>
  );
}
