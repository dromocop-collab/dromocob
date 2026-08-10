import { pageMetadata, siteEmail } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kalori Merkezi Destek",
  description: "Kalori Merkezi uygulaması için resmi destek sayfası.",
  path: "/kalori-merkezi/destek",
});

export default function KaloriMerkeziSupportPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Kalori Merkezi / Destek</p>
      <h1>Kalori Merkezi Destek</h1>
      <p className="legal-lead">
        Kalori Merkezi uygulamasıyla ilgili teknik sorunlar, hesap doğrulama veya lisans talepleri
        için bu sayfa resmi destek kaynağıdır.
      </p>

      <div className="legal-block">
        <h2>1. Destek talebi</h2>
        <p>E-posta ile destek: {siteEmail}. Lütfen cihaz modeli, iOS sürümü ve uygulama sürümünü ekleyin.</p>
      </div>

      <div className="legal-block">
        <h2>2. Kapsam</h2>
        <p>Kurulum, hesap erişimi, abonelik doğrulama ve uygulama hataları için destek verilir.</p>
      </div>

      <div className="legal-block">
        <h2>3. Yanıt süresi</h2>
        <p>İş günlerinde mümkün olan en kısa sürede, genellikle 24 saat içinde geri dönüş sağlanır.</p>
      </div>
    </section>
  );
}
