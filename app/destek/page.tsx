import { pageMetadata, siteEmail, sitePhoneDisplay } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Destek",
  description: "Dromocob uygulamaları ve hizmetleri için destek kanalları.",
  path: "/destek",
});

export default function SupportPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Dromocob / Destek</p>
      <h1>Destek</h1>
      <p className="legal-lead">
        Dromocob uygulamaları ve web ürünleri için teknik destek taleplerinizi bu sayfadaki
        iletişim kanalları üzerinden iletebilirsiniz.
      </p>

      <div className="legal-block">
        <h2>1. E-posta desteği</h2>
        <p>Detaylı destek talepleri için {siteEmail} adresine uygulama adı ve sürüm bilgisiyle yazın.</p>
      </div>

      <div className="legal-block">
        <h2>2. Yanıt süresi</h2>
        <p>İş günlerinde genellikle 24 saat içinde geri dönüş sağlanır.</p>
      </div>

      <div className="legal-block">
        <h2>3. Telefon</h2>
        <p>Gerekli durumlarda {sitePhoneDisplay} numarası üzerinden yönlendirme yapılır.</p>
      </div>
    </section>
  );
}
