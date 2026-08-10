import { pageMetadata, siteEmail } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kalori Merkezi Gizlilik",
  description: "Kalori Merkezi uygulaması için resmi gizlilik bildirimi.",
  path: "/kalori-merkezi/gizlilik",
});

export default function KaloriMerkeziPrivacyPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Kalori Merkezi / Gizlilik</p>
      <h1>Kalori Merkezi Gizlilik</h1>
      <p className="legal-lead">
        Kalori Merkezi, kullanıcı gizliliğini korumak için yalnızca hizmetin sunulması açısından
        gerekli verileri işler ve verileri güvenli şekilde saklar.
      </p>

      <div className="legal-block">
        <h2>1. Veri ilkesi</h2>
        <p>Minimum veri ilkesi uygulanır; kişisel veriler yalnızca hizmet amaçlarıyla kullanılır.</p>
      </div>

      <div className="legal-block">
        <h2>2. Kullanım amacı</h2>
        <p>Hesap işlemleri, abonelik doğrulama, hata analizi ve güvenlik kontrolleri için işlenebilir.</p>
      </div>

      <div className="legal-block">
        <h2>3. Başvuru</h2>
        <p>Gizlilik talepleri için {siteEmail} adresi üzerinden bizimle iletişime geçebilirsiniz.</p>
      </div>
    </section>
  );
}
