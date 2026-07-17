import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Dromocob KVKK aydınlatma metni ve kişisel veri işleme esasları.",
  alternates: {
    canonical: absoluteUrl("/kvkk-aydinlatma"),
  },
};

export default function KvkkPage() {
  return (
    <section className="section legal-page">
      <p className="eyebrow">Kurumsal / Hukuki</p>
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="legal-lead">
        Bu metin, 6698 sayili Kisisel Verilerin Korunmasi Kanunu kapsaminda Dromocob
        tarafindan elde edilen verilerin hangi amacla islendigi ve haklarinizin neler oldugu
        konusunda sizi bilgilendirmek amaciyla hazirlanmistir.
      </p>

      <div className="legal-block">
        <h2>1. Veri sorumlusu</h2>
        <p>Dromocob, ilgili mevzuat kapsaminda veri sorumlusu sifatiyla hareket eder.</p>
      </div>

      <div className="legal-block">
        <h2>2. Islenen veri kategorileri</h2>
        <p>Ad-soyad, e-posta, telefon, talep icerigi, teknik erisim verileri ve teklif verileri.</p>
      </div>

      <div className="legal-block">
        <h2>3. Isleme amaclari</h2>
        <p>
          Talebinizi degerlendirmek, sizinle iletisime gecmek, sozlesme sureclerini yurutmek,
          hizmet kalitesi ve guvenlik sureclerini surdurmek.
        </p>
      </div>

      <div className="legal-block">
        <h2>4. Hukuki sebep</h2>
        <p>
          Acik rizaniz, sozlesmenin kurulmasi/ifa edilmesi ve veri sorumlusunun mesru menfaati
          hukuki sebeplerine dayali olarak veri islenebilir.
        </p>
      </div>

      <div className="legal-block">
        <h2>5. Haklariniz</h2>
        <p>
          KVKK 11. madde kapsaminda; verilerinize erisme, duzeltme, silme, islemeye itiraz etme
          ve zarar halinde tazmin talep etme haklarina sahipsiniz.
        </p>
      </div>

      <div className="legal-note">
        Basvuru ve talepleriniz icin: hello@dromocob.com
      </div>
    </section>
  );
}
