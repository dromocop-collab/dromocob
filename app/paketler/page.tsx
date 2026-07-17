import PackageGrid from "@/components/package-grid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Paketler ve Teklif",
  description:
    "Web sitesi, özel yazılım, video prodüksiyon ve büyüme sistemleri için dinamik paketler ve akıllı teklif akışı.",
  path: "/paketler",
  keywords: ["web sitesi paketi", "video prodüksiyon paketi", "teklif al"],
});

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
