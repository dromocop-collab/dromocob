import ProjectGrid from "@/components/project-grid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projeler",
  description:
    "Dromocob tarafından geliştirilen film prodüksiyonu, web sistemi, e-ticaret ve dijital büyüme projelerinden seçili çalışmalar.",
  path: "/projeler",
  keywords: ["portföy", "web projeleri", "marka filmi projeleri"],
});

export default function ProjectsPage() {
  return (
    <>
      <section className="page-hero section">
        <p className="eyebrow">Selected work / 2024—2026</p>
        <h1>İşler konuşsun.<br/><span>Biz sonucu ölçelim.</span></h1>
        <p className="hero-description">Film prodüksiyonu, dijital ürün ve büyüme projelerinden seçilmiş çalışmalar.</p>
      </section>
      <section className="section"><ProjectGrid /></section>
    </>
  );
}
