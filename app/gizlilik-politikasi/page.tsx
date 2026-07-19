import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Dromocob gizlilik politikası ve veri güvenliği yaklaşımı.",
  alternates: {
    canonical: absoluteUrl("/gizlilik-politikasi"),
  },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Kurumsal / Hukuki</p>
      <h1>Gizlilik Politikası</h1>
      <p className="legal-lead">
        Dromocob, ziyaretci ve musteri verilerinin gizliligini korumayi temel prensip kabul eder.
        Bu politika, hangi verilerin hangi kosullarda toplandigi ve nasil korundugunu aciklar.
      </p>

      <div className="legal-block">
        <h2>1. Toplanan bilgiler</h2>
        <p>Iletisim formlari, teklif formlari ve temel teknik log verileri toplanabilir.</p>
      </div>

      <div className="legal-block">
        <h2>2. Kullanim amaci</h2>
        <p>
          Iletisim talebini yanitlamak, teklif surecini yonetmek, hizmet kalitesini artirmak ve
          guvenlik kontrolleri saglamak.
        </p>
      </div>

      <div className="legal-block">
        <h2>3. Veri guvenligi</h2>
        <p>
          Veriler, yetkisiz erisime karsi teknik ve idari onlemlerle korunur. Kritik alanlarda
          dogrulama ve sinirlama mekanizmalari uygulanir.
        </p>
      </div>

      <div className="legal-block">
        <h2>4. Saklama suresi</h2>
        <p>
          Mevzuat ve is sureclerinin gerektirdigi sure boyunca saklanir; sure doldugunda silme,
          yok etme veya anonimlestirme islemleri uygulanir.
        </p>
      </div>

      <div className="legal-block">
        <h2>5. Iletisim</h2>
        <p>Gizlilik talepleri için info@dromocob.tr adresi üzerinden bize ulaşabilirsiniz.</p>
      </div>
    </section>
  );
}
