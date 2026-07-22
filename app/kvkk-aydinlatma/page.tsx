import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "KVKK Aydınlatma Metni",
  description: "Dromocob KVKK aydınlatma metni ve kişisel veri işleme esasları.",
  path: "/kvkk-aydinlatma",
});

export default function KvkkPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Kurumsal / Hukuki</p>
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="legal-lead">
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Dromocob
        tarafından elde edilen verilerin hangi amaçla işlendiği ve haklarınızın neler olduğu
        konusunda sizi bilgilendirmek amacıyla hazırlanmıştır.
      </p>

      <div className="legal-block">
        <h2>1. Veri sorumlusu</h2>
        <p>Dromocob, ilgili mevzuat kapsamında veri sorumlusu sıfatıyla hareket eder.</p>
      </div>

      <div className="legal-block">
        <h2>2. İşlenen veri kategorileri</h2>
        <p>Ad-soyad, e-posta, telefon, talep icerigi, teknik erisim verileri ve teklif verileri.</p>
      </div>

      <div className="legal-block">
        <h2>3. İşleme amaçları</h2>
        <p>
          Talebinizi değerlendirmek, sizinle iletişime geçmek, sözleşme süreçlerini yürütmek,
          hizmet kalitesi ve güvenlik süreçlerini sürdürmek.
        </p>
      </div>

      <div className="legal-block">
        <h2>4. Hukuki sebep</h2>
        <p>
          Açık rızanız, sözleşmenin kurulması/ifa edilmesi ve veri sorumlusunun meşru menfaati
          hukuki sebeplerine dayalı olarak veri işlenebilir.
        </p>
      </div>

      <div className="legal-block">
        <h2>5. Haklarınız</h2>
        <p>
          KVKK 11. madde kapsamında; verilerinize erişme, düzeltme, silme, işlemeye itiraz etme
          ve zarar halinde tazmin talep etme haklarına sahipsiniz.
        </p>
      </div>

      <div className="legal-note">
        Başvuru ve talepleriniz için: info@dromocob.tr
      </div>
    </section>
  );
}
