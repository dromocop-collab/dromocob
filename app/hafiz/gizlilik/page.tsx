import TrustCenterPage, { type TrustSection } from "@/components/trust-center-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Hafız Yolculuğum Gizlilik Politikası",
  description:
    "Hafız Yolculuğum uygulamasında hesap, eğitim ilerlemesi, ses, bildirim, çocuk modu ve ödüllü reklam verilerinin nasıl işlendiğini açıklayan gizlilik politikası.",
  path: "/hafiz/gizlilik",
  keywords: [
    "Hafız Yolculuğum gizlilik politikası",
    "Hafız uygulaması gizlilik",
    "çocuk modu gizlilik",
    "ödüllü reklam gizlilik",
  ],
});

const sections: TrustSection[] = [
  {
    id: "kapsam",
    title: "Kapsam ve veri sorumlusu",
    summary:
      "Bu politika, Dromocob tarafından sunulan Hafız Yolculuğum iOS uygulamasındaki kişisel veri işleme faaliyetlerini açıklar.",
    paragraphs: [
      "Uygulama; bireysel öğrenme, öğrenci, öğretmen, veli ve kurum yöneticisi deneyimlerini destekler. İşlenen veri, kullanılan hesap türüne ve etkinleştirilen özelliklere göre değişebilir.",
      "Kurum tarafından yönetilen hesaplarda kurum, kendi eğitim ve kullanıcı yönetimi faaliyetleri bakımından ayrıca sorumluluk taşıyabilir.",
    ],
  },
  {
    id: "veriler",
    title: "İşlenebilen veri kategorileri",
    summary:
      "Yalnızca uygulamanın çalışması, öğrenme deneyiminin sunulması, güvenlik ve kullanıcı tarafından seçilen özellikler için gerekli bilgiler işlenir.",
    items: [
      "Hesap açıldığında ad, e-posta adresi, kullanıcı rolü, kurum ve sınıf bağlantıları",
      "Yaşın kendisi yerine seçilen yaş grubu, çocuk modu ve öğrenme seviyesi tercihleri",
      "Dersler, görevler, tekrar sayıları, tamamlanma durumu, seviye, XP ve öğrenme ilerlemesi",
      "Öğretmen değerlendirmeleri, veli görünürlüğü tercihleri ve kurum içi eğitim atamaları",
      "Sesli çalışma özelliği kullanıldığında mikrofon kaydı, teslim edilen ses ve değerlendirme sonucu",
      "Bildirim tercihi ve bildirim göndermek için kullanılan cihaz bildirim belirteci",
      "Cihaz türü, uygulama sürümü, hata, performans, güvenlik ve kötüye kullanım günlükleri",
      "Yetişkin bireysel modda ve izin durumuna göre reklam gösterimi ile ödül teslim bilgisi",
    ],
  },
  {
    id: "amaclar",
    title: "Verilerin kullanım amaçları",
    summary:
      "Bilgiler, kullanıcının seçtiği öğrenme akışını sağlamak ve hesabı güvenli biçimde işletmek amacıyla kullanılır.",
    items: [
      "Kimlik doğrulamak, hesabı ve rol tabanlı erişimi yönetmek",
      "Dersleri, Kur'an sayfalarını, kıraat içeriklerini ve aşamalı görevleri sunmak",
      "İlerlemeyi cihazlar arasında saklamak ve uygun seviyeden devam ettirmek",
      "Öğrenci, öğretmen, veli, sınıf ve kurum ilişkilerini yetki sınırları içinde çalıştırmak",
      "Teslimleri öğretmen değerlendirmesine açmak ve sonuçları yetkili kullanıcıya göstermek",
      "Hatırlatma, görev ve hesap bildirimlerini kullanıcının tercihine göre iletmek",
      "Hataları gidermek, performansı ölçmek ve hesabı kötüye kullanıma karşı korumak",
      "Uygun kullanıcıya ödüllü reklam sunmak ve reklam ödülünün teslimini doğrulamak",
    ],
  },
  {
    id: "cocuk",
    title: "Çocuk modu ve yaşa uygun deneyim",
    summary:
      "Çocuk modu reklamsız tasarlanır ve reklam kişiselleştirmesi amacıyla kullanılmaz.",
    paragraphs: [
      "Uygulama ilk kurulumda yaş grubu sorabilir. Bu seçim, çocuk veya yetişkin deneyimini belirlemek için kullanılır. Çocuk modunda ödüllü reklam gösterilmez; kurumsal öğrenci deneyimi de reklamdan ayrıdır.",
      "Çocuğun hesabı veli, öğretmen veya kurum ilişkisine bağlandığında yalnızca ilgili eğitim işlevleri için gerekli görünürlük sağlanır. Yetkisiz kullanıcıların öğrenci kayıtlarına erişmesine izin verilmez.",
    ],
  },
  {
    id: "ses",
    title: "Mikrofon, ses kayıtları ve Kur'an içerikleri",
    summary:
      "Mikrofon yalnızca kullanıcı sesli çalışma veya teslim özelliğini başlattığında kullanılır.",
    paragraphs: [
      "Ses kaydı için iOS izin ekranı gösterilir. İzin verilmezse sesli teslim gerektiren özellikler çalışmayabilir; diğer uygun özellikler kullanılmaya devam eder. Gönderilen kayıtlar, ilgili görev ve yetkili öğretmen değerlendirmesiyle sınırlandırılır.",
      "Uygulamadaki Kur'an metni, sayfa görselleri ve kıraat sesleri eğitim içeriğidir. Kullanıcının dinleme ilerlemesi kaydedilebilir; cihaz mikrofonu kullanıcı açıkça kayıt başlatmadıkça etkinleştirilmez.",
    ],
  },
  {
    id: "reklam",
    title: "Ödüllü reklamlar ve kullanıcı tercihi",
    summary:
      "Ödüllü reklam yalnızca uygun yetişkin bireysel kullanıcı kendi isteğiyle erişim ödülü almak istediğinde gösterilir.",
    paragraphs: [
      "Google Mobile Ads ve Kullanıcı Mesajlaşma Platformu, uygulanabilir bölgelerde reklam izni ve gizlilik tercihlerini yönetmek için kullanılabilir. Kullanıcı reklamı izlemeyi reddedebilir; zorunlu eğitim görevleri reklam izlemeye bağlanmaz.",
      "İzin durumu, reklam isteği, gösterim ve ödülün tamamlanması gibi teknik olaylar işlenebilir. Kişiselleştirilmiş reklam uygun değilse veya izin verilmezse kişiselleştirilmemiş ya da sınırlı reklam sunulabilir.",
    ],
  },
  {
    id: "saglayicilar",
    title: "Hizmet sağlayıcılar ve aktarım",
    summary:
      "Veriler satılmaz. Teknik hizmet sağlayıcılar yalnızca sundukları hizmet ve kendi yasal yükümlülükleri kapsamında veri işleyebilir.",
    items: [
      "Google Firebase: kimlik doğrulama, veritabanı, dosya saklama, bildirim ve güvenlik altyapısı",
      "Google AdMob ve UMP: uygun yetişkin bireysel modda reklam sunumu, izin yönetimi ve ödül doğrulama",
      "Apple: iOS dağıtımı, cihaz izinleri, bildirim teslimi ve App Store hizmetleri",
      "Dromocob altyapısı: hesap, kurum ilişkileri, içerik, destek, güvenlik ve operasyon hizmetleri",
    ],
    paragraphs: [
      "Hizmet sağlayıcıların sunucuları Türkiye dışında bulunabilir. Böyle bir durumda aktarım, uygulanabilir mevzuat ve sağlayıcının veri koruma koşulları dikkate alınarak yürütülür.",
    ],
  },
  {
    id: "saklama",
    title: "Saklama, hesap kapatma ve silme",
    summary:
      "Veriler yalnızca kullanım amacı, hesap ilişkisi, güvenlik ihtiyacı ve yasal yükümlülükler için gerekli süre boyunca saklanır.",
    paragraphs: [
      "Kullanıcı hesabının, eğitim ilerlemesinin veya uygun diğer kişisel verilerin silinmesini talep edebilir. Kurum tarafından yönetilen kayıtlarda talep, ilgili kurumun saklama yükümlülüğü ve yetkisiyle birlikte değerlendirilebilir.",
      "Saklama ihtiyacı sona eren veriler silinir, yok edilir veya kişiyle ilişkilendirilemeyecek biçimde anonimleştirilir. Güvenlik kayıtları ve yedekler sınırlı ek sürelerle tutulabilir.",
    ],
  },
  {
    id: "guvenlik",
    title: "Güvenlik ve erişim kontrolleri",
    summary:
      "Hesap ve eğitim verileri; kimlik doğrulama, rol tabanlı yetkilendirme, şifreli iletişim ve işlem kayıtlarıyla korunur.",
    items: [
      "Öğrenci, öğretmen, veli ve yönetici rolleri için ayrı erişim sınırları",
      "Kurum ve sınıf bağlantılarında sunucu tarafı yetki denetimi",
      "Aktarım sırasında şifreli bağlantı",
      "Hassas işlemlerde doğrulama, denetim kaydı ve kötüye kullanım kontrolleri",
      "Hizmet sağlayıcı ve uygulama yapılandırmalarının düzenli gözden geçirilmesi",
    ],
  },
  {
    id: "haklar",
    title: "Tercihler ve başvuru hakları",
    summary:
      "Kullanıcı; kişisel verileri hakkında bilgi talep edebilir, uygun kayıtların düzeltilmesini veya silinmesini isteyebilir.",
    items: [
      "iOS Ayarlar üzerinden mikrofon ve bildirim izinlerini yönetme",
      "Uygulamadaki gizlilik seçeneklerinden reklam iznini gözden geçirme veya geri çekme",
      "İşlenen veriler, işleme amacı ve aktarım yapılan taraflar hakkında bilgi isteme",
      "Eksik veya yanlış bilgilerin düzeltilmesini isteme",
      "Uygulanabilir koşullarda silme, kısıtlama veya itiraz talebinde bulunma",
    ],
  },
  {
    id: "degisiklikler",
    title: "Politika değişiklikleri",
    summary:
      "Uygulama özellikleri, hizmet sağlayıcılar veya mevzuat değiştiğinde bu politika güncellenebilir.",
    paragraphs: [
      "Önemli değişiklikler bu sayfada yeni güncelleme tarihiyle yayımlanır. Yürürlükteki sürüm her zaman bu adresteki metindir.",
    ],
  },
];

export default function HafizPrivacyPage() {
  return (
    <TrustCenterPage
      eyebrow="HAFIZ YOLCULUĞUM / GİZLİLİK"
      title="Hafız Yolculuğum"
      accent="Gizlilik Politikası"
      description="Hesap, öğrenme ilerlemesi, sesli çalışma, çocuk modu ve ödüllü reklam süreçlerinde verilerin nasıl korunduğunu açık ve okunabilir biçimde anlatıyoruz."
      documentCode="HAFIZ-PRIVACY / V1.0"
      updatedAt="28 Eylül 2026"
      sections={sections}
      note="Çocuk modu ile kurumsal öğrenci deneyimi reklamsızdır; ödüllü reklam yalnızca uygun yetişkin bireysel kullanıcının açık eylemiyle gösterilir."
      related={[
        { title: "Dromocob Gizlilik Politikası", href: "/gizlilik-politikasi" },
        { title: "KVKK Aydınlatma Metni", href: "/kvkk-aydinlatma" },
        { title: "Destek Merkezi", href: "/destek" },
      ]}
    />
  );
}
