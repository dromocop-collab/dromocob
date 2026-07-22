import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gizlilik Politikası",
  description: "Dromocob gizlilik politikası ve veri güvenliği yaklaşımı.",
  path: "/gizlilik-politikasi",
});

export default function PrivacyPolicyPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Kurumsal / Hukuki</p>
      <h1>Gizlilik Politikası</h1>
      <p className="legal-lead">
        Dromocob, ziyaretçi ve müşteri verilerinin gizliliğini korumayı temel prensip kabul eder.
        Bu politika, hangi verilerin hangi koşullarda toplandığını ve nasıl korunduğunu açıklar.
      </p>

      <div className="legal-block">
        <h2>1. Toplanan bilgiler</h2>
        <p>İletişim formları, teklif formları ve temel teknik günlük verileri toplanabilir.</p>
      </div>

      <div className="legal-block">
        <h2>2. Kullanım amacı</h2>
        <p>
          İletişim talebini yanıtlamak, teklif sürecini yönetmek, hizmet kalitesini artırmak ve
          güvenlik kontrolleri sağlamak.
        </p>
      </div>

      <div className="legal-block">
        <h2>3. Veri güvenliği</h2>
        <p>
          Veriler, yetkisiz erişime karşı teknik ve idari önlemlerle korunur. Kritik alanlarda
          doğrulama ve sınırlama mekanizmaları uygulanır.
        </p>
      </div>

      <div className="legal-block">
        <h2>4. Saklama süresi</h2>
        <p>
          Mevzuat ve iş süreçlerinin gerektirdiği süre boyunca saklanır; süre dolduğunda silme,
          yok etme veya anonimleştirme işlemleri uygulanır.
        </p>
      </div>

      <div className="legal-block">
        <h2>5. İletişim</h2>
        <p>Gizlilik talepleri için info@dromocob.tr adresi üzerinden bize ulaşabilirsiniz.</p>
      </div>
    </section>
  );
}
