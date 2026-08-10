import { pageMetadata, siteEmail } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gizlilik",
  description: "Dromocob uygulamaları için veri gizliliği ve güvenlik ilkeleri.",
  path: "/gizlilik",
});

export default function PrivacyPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Dromocob / Gizlilik</p>
      <h1>Gizlilik</h1>
      <p className="legal-lead">
        Dromocob, kullanıcı verilerinin korunmasını önceliklendirir. Uygulamalarımız minimum veri
        ilkesiyle çalışır ve yalnızca hizmetin sağlanması için gerekli verileri işler.
      </p>

      <div className="legal-block">
        <h2>1. Toplanan veriler</h2>
        <p>Hesap kimliği, lisans durumu ve teknik hata kayıtları gibi operasyonel veriler işlenebilir.</p>
      </div>

      <div className="legal-block">
        <h2>2. Veri kullanımı</h2>
        <p>Veriler yalnızca lisans doğrulama, destek süreçleri ve güvenlik kontrolleri amacıyla kullanılır.</p>
      </div>

      <div className="legal-block">
        <h2>3. İletişim</h2>
        <p>Gizlilik talepleri için {siteEmail} adresinden bize ulaşabilirsiniz.</p>
      </div>
    </section>
  );
}
