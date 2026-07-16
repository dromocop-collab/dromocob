import PackageGrid from "@/components/package-grid";

export const metadata = { title: "Paketler" };

export default function PackagesPage() {
  return (
    <>
      <section className="page-hero section" id="teklif">
        <p className="eyebrow">Services / Dynamic pricing</p>
        <h1>İhtiyacın kadar.<br/><span>Hedefin kadar güçlü.</span></h1>
        <p className="hero-description">Paketler admin panelden dinamik yönetilir. Akıllı teklif akışı seçtiğin kriterlere göre yaklaşık proje bütçesi oluşturur.</p>
      </section>
      <section className="section"><PackageGrid /></section>
    </>
  );
}
