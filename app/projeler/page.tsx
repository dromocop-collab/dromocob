import ProjectGrid from "@/components/project-grid";

export const metadata = { title: "Projeler" };

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
