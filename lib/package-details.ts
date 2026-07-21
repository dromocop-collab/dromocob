export type PackageDetail = {
  slug: string;
  packageId: string;
  title: string;
  eyebrow: string;
  description: string;
  priceFrom: number;
  deliveryTime: string;
  supportWindow: string;
  revisions: string;
  idealFor: string[];
  outcomes: string[];
  phases: Array<{ number: string; title: string; description: string; deliverables: string[] }>;
  included: string[];
  collaboration: string[];
  faqs: Array<{ question: string; answer: string }>;
  keywords: string[];
};

export const packageDetails: PackageDetail[] = [
  {
    slug: "web-application",
    packageId: "web-application",
    title: "Web Application",
    eyebrow: "Kurumsal platform · Özel yazılım",
    description: "Satış, müşteri deneyimi ve operasyonu aynı dijital üründe birleştiren; yönetilebilir, ölçülebilir ve büyümeye hazır web uygulaması sistemi.",
    priceFrom: 65000,
    deliveryTime: "5–9 hafta",
    supportWindow: "90 gün stabilizasyon desteği",
    revisions: "5 kapsamlı tasarım revizyon turu",
    idealFor: ["B2B hizmet şirketleri", "Kurumsal platform ihtiyacı olan markalar", "Üyelik, teklif veya operasyon yazılımı kuran ekipler"],
    outcomes: ["Nitelikli lead ve talep toplama", "Daha az manuel operasyon", "Yönetilebilir içerik ve kullanıcı deneyimi"],
    phases: [
      { number: "01", title: "Keşif ve ürün mimarisi", description: "Hedef kullanıcılar, iş akışları, içerik hiyerarşisi ve teknik sınırlar netleştirilir.", deliverables: ["Kapsam dokümanı", "Kullanıcı akışları", "Teknik yol haritası"] },
      { number: "02", title: "UX ve arayüz sistemi", description: "Marka diliyle uyumlu, mobil öncelikli ekranlar ve tekrar kullanılabilir component yapısı tasarlanır.", deliverables: ["Wireframe", "UI tasarım sistemi", "Tıklanabilir prototip"] },
      { number: "03", title: "Geliştirme ve entegrasyon", description: "Web uygulaması, yönetim paneli, veri yapısı ve gerekli üçüncü taraf bağlantıları geliştirilir.", deliverables: ["Next.js uygulaması", "Yönetim paneli", "Entegrasyonlar"] },
      { number: "04", title: "Yayın ve stabilizasyon", description: "Performans, erişilebilirlik, analitik, güvenlik ve kritik kullanıcı yolları doğrulanarak yayın yapılır.", deliverables: ["Yayın kontrol listesi", "Analitik kurulumu", "90 gün destek"] },
    ],
    included: ["Stratejik UX ve özgün arayüz tasarımı", "Next.js tabanlı web uygulaması", "Gelişmiş yönetim paneli", "Üyelik, rol ve yetki yapısı", "CRM, ERP veya API entegrasyon planı", "Teknik SEO, analitik ve performans altyapısı"],
    collaboration: ["Tek proje lideri ve haftalık durum ritmi", "Kapsamı netleştiren yazılı karar kayıtları", "Staging ortamında kontrollü onay akışı", "Yayın sonrası hata/iyileştirme takip kanalı"],
    faqs: [
      { question: "Bu paket e-ticaret veya SaaS için uygun mu?", answer: "Evet. Ürün kataloğu, ödeme, üyelik, teklif, rezervasyon veya müşteri paneli gibi modüller keşif aşamasında önceliklendirilerek sisteme eklenebilir." },
      { question: "Yönetim panelini ekibimiz kullanabilir mi?", answer: "Evet. Panel, içerik ve operasyonu teknik ekibe bağımlı kalmadan yönetebilmeniz için kullanıcı rollerine göre yapılandırılır." },
      { question: "Proje sonunda kaynak ve erişimler bize devredilir mi?", answer: "Teslim modeli proje başlangıcında yazılı olarak netleştirilir; gerekli erişimler, dokümantasyon ve yönetim yetkileri kapsam dahilinde devredilir." },
    ],
    keywords: ["özel web yazılım", "kurumsal web uygulaması", "yönetim panelli web sitesi", "B2B portal", "Next.js web uygulaması"],
  },
  {
    slug: "video-production",
    packageId: "video-production",
    title: "Video Production",
    eyebrow: "Sinematik marka · Kampanya filmi",
    description: "Kreatif fikirden yayın masterına kadar reklam, marka ve kurumsal tanıtım filmlerini tek üretim planında birleştiren sinematik prodüksiyon paketi.",
    priceFrom: 45000,
    deliveryTime: "3–6 hafta",
    supportWindow: "45 gün teslim ve yayın desteği",
    revisions: "3 kapsamlı kurgu revizyon turu",
    idealFor: ["Marka veya ürün lansmanları", "Kurumsal tanıtım ihtiyacı olan şirketler", "Kampanya ve sosyal medya film seti kuran ekipler"],
    outcomes: ["Güçlü marka algısı", "Çok kanallı yayın paketi", "Tekrarlanabilir içerik kütüphanesi"],
    phases: [
      { number: "01", title: "Kreatif keşif", description: "Hedef, izleyici, ana mesaj, yayın kanalları ve üretim ölçeği ortak briefte birleştirilir.", deliverables: ["Kreatif brief", "Referans yönü", "Bütçe ve takvim çerçevesi"] },
      { number: "02", title: "Pre-prodüksiyon", description: "Konsept, senaryo, storyboard, lokasyon, ekip ve çekim günü planı hazırlanır.", deliverables: ["Senaryo", "Shot list", "Prodüksiyon planı"] },
      { number: "03", title: "Çekim", description: "Kamera, ışık, ses ve hareket sistemleri onaylanan görsel dile göre sahada yönetilir.", deliverables: ["Saha üretimi", "Kamera/ışık/ses", "Görüntü güvenliği"] },
      { number: "04", title: "Post-prodüksiyon", description: "Kurgu, renk, ses, grafik ve kanal adaptasyonları yayın standardına göre tamamlanır.", deliverables: ["Ana film", "Dikey/yatay versiyonlar", "Arşiv masterları"] },
    ],
    included: ["Kreatif konsept ve senaryo geliştirme", "Storyboard ve ayrıntılı çekim planı", "Sinematik kamera, ışık ve ses ekibi", "Drone veya hareketli kamera planlaması", "Kurgu, color grading ve ses tasarımı", "Dikey, yatay ve sosyal medya teslim formatları"],
    collaboration: ["Ön prodüksiyonda tek onay noktası", "Çekim günü için paylaşılan call sheet", "Kurgu revizyonlarında zaman kodlu geri bildirim", "Platformlara uygun teslim matrisi"],
    faqs: [
      { question: "Reklam filmi ve kurumsal tanıtım filmi aynı pakette planlanabilir mi?", answer: "Evet. Ana anlatıdan farklı süre ve kadrajlarda versiyonlar türetilerek hem kurumsal hem kampanya kullanımı için tek üretim planı kurulabilir." },
      { question: "Çekim İstanbul dışında yapılabilir mi?", answer: "Evet. Lokasyon, ekip, ulaşım ve izin ihtiyacı keşif aşamasında planlanır; Türkiye genelinde saha prodüksiyonu organize edilebilir." },
      { question: "Teslim formatları nelerdir?", answer: "İhtiyaca göre 16:9, 9:16, 1:1, kısa cutdown, altyazılı veya sessiz yayın masterları hazırlanabilir." },
    ],
    keywords: ["kurumsal tanıtım filmi", "video prodüksiyon", "reklam filmi çekimi", "marka filmi", "ürün tanıtım videosu"],
  },
  {
    slug: "acil-drone-operasyon",
    packageId: "emergency-drone",
    title: "Acil Drone Operasyon",
    eyebrow: "Kurumsal hava görüntüleme · Hızlı planlama",
    description: "Etkinlik, tesis, şantiye, gayrimenkul ve kampanya ihtiyaçlarında; çekim kararını hız, operasyon uygunluğu ve kullanım amacını tek kurumsal akışta birleştiren drone çekim paketi.",
    priceFrom: 18000,
    deliveryTime: "Uygunluğa göre hızlı operasyon planı",
    supportWindow: "Teslim sonrası 14 gün dosya desteği",
    revisions: "1 teslim yönü ve format kontrolü",
    idealFor: ["Zaman kritik kurumsal çekim ihtiyacı olan markalar", "Tesis, şantiye veya proje sunumu hazırlayan ekipler", "Etkinlik, lansman veya satış filmi için hava görüntüsü isteyen kurumlar"],
    outcomes: ["Hızlı ve kontrollü kurumsal hava görüntüleme", "Kullanım amacına uygun teslim formatı", "Operasyon öncesi net lokasyon ve uçuş planı"],
    phases: [
      { number: "01", title: "Hızlı brief ve ön değerlendirme", description: "Çekim amacı, kullanım kanalı, tarih, lokasyon ve kritik kareler netleştirilir.", deliverables: ["Acil çekim briefi", "Teslim hedefi", "Zaman çizelgesi"] },
      { number: "02", title: "Uygunluk ve operasyon planı", description: "Lokasyon, hava koşulları, uçuş uygunluğu ve erişim detayları değerlendirilerek uygulanabilir plan oluşturulur.", deliverables: ["Lokasyon kontrolü", "Operasyon akışı", "Alternatif plan"] },
      { number: "03", title: "Saha çekimi", description: "Onaylanan rota ve görüntü hedeflerine göre kurumsal çekim akışı sahada yönetilir.", deliverables: ["Hava görüntüleri", "Kontrollü çekim akışı", "Dosya güvenliği"] },
      { number: "04", title: "Teslim ve kanal adaptasyonu", description: "İhtiyaca göre seçilen görüntüler kurumsal film, web, sunum veya sosyal medya kullanımına hazırlanır.", deliverables: ["Teslim klasörü", "Format planı", "14 gün dosya desteği"] },
    ],
    included: ["Acil proje ve lokasyon briefi", "Operasyon uygunluğu kontrolü", "Kurumsal drone çekim planı", "Hedef kare ve rota yönlendirmesi", "Seçilen teslim formatları", "Güvenli dosya teslim ve arşiv düzeni"],
    collaboration: ["Tek iletişim noktası ve hızlı karar akışı", "Çekim öncesi yazılı operasyon teyidi", "Lokasyon ve kullanım amacına göre teslim planı", "Teslim sonrası dosya erişim desteği"],
    faqs: [
      { question: "Aynı gün acil drone çekimi mümkün mü?", answer: "Takvim, lokasyon, hava koşulları ve gerekli operasyon kontrolleri uygun olduğunda en hızlı uygulanabilir plan paylaşılır. Kesin operasyon teyidi değerlendirme sonrasında verilir." },
      { question: "Paket hangi kurumsal ihtiyaçlar için uygundur?", answer: "Tesis, şantiye, gayrimenkul, etkinlik, lansman, marka filmi ve satış sunumu gibi hava perspektifinin iş değerini artırdığı kurumsal ihtiyaçlar için hazırlanmıştır." },
      { question: "Drone görüntüleri video prodüksiyonuna eklenebilir mi?", answer: "Evet. Talebe göre bu paket, ana film veya sosyal medya prodüksiyonunun hava görüntüleme katmanı olarak planlanabilir." },
    ],
    keywords: ["acil drone çekimi", "kurumsal drone çekimi", "İstanbul drone çekimi", "hava görüntüleme paketi", "şantiye drone çekimi", "etkinlik drone çekimi"],
  },
  {
    slug: "digital-flagship",
    packageId: "digital-flagship",
    title: "Digital Flagship",
    eyebrow: "Web application + video production",
    description: "Dijital ürün, sinematik marka anlatısı ve ölçüm altyapısını tek kreatif-teknoloji ekibinde birleştiren, lansmana hazır amiral dönüşüm sistemi.",
    priceFrom: 125000,
    deliveryTime: "8–14 hafta",
    supportWindow: "120 gün optimizasyon ve danışmanlık",
    revisions: "6 kapsamlı tasarım/kurgu revizyon turu",
    idealFor: ["Yeni nesil kurumsal dönüşüm", "Marka ve ürün lansmanı", "Kategori liderliği hedefleyen ekipler"],
    outcomes: ["Marka otoritesi", "Dönüşüm ve talep kalitesi", "Dijital operasyon ile içerik performansının birleşmesi"],
    phases: [
      { number: "01", title: "Strateji ve flagship mimarisi", description: "İş hedefi, hedef kitle, dijital ürün, içerik ve lansman kararları tek yol haritasında birleştirilir.", deliverables: ["Flagship brief", "Kanal matrisi", "Entegre yol haritası"] },
      { number: "02", title: "Marka deneyimi ve içerik yönü", description: "Web deneyimi ile marka filminin ortak görsel dili, mesaj hiyerarşisi ve üretim sistemi kurulur.", deliverables: ["UX/UI sistemi", "Kreatif yön", "İçerik planı"] },
      { number: "03", title: "Eş zamanlı üretim", description: "Web uygulaması, yönetim sistemi, fotoğraf/video kütüphanesi ve bağlantılar paralel üretim takvimiyle ilerler.", deliverables: ["Web platformu", "Marka filmi", "İçerik kütüphanesi"] },
      { number: "04", title: "Lansman ve optimizasyon", description: "Yayın, ölçüm, kanal adaptasyonları ve ilk 120 günlük performans iyileştirme döngüsü yönetilir.", deliverables: ["Lansman planı", "Analitik dashboard", "Optimizasyon ritmi"] },
    ],
    included: ["Özel web uygulaması ve yönetim sistemi", "Marka filmi veya kampanya prodüksiyonu", "Fotoğraf ve dijital içerik kütüphanesi", "CRM, analitik ve otomasyon entegrasyonları", "Lansman stratejisi ve kanal adaptasyonları", "120 günlük optimizasyon ve danışmanlık"],
    collaboration: ["Tek proje lideri ve ortak üretim takvimi", "Haftalık karar/ilerleme oturumları", "Web ve prodüksiyon ekipleri için tek kaynak brief", "Lansman sonrası veri temelli iyileştirme ritmi"],
    faqs: [
      { question: "Flagship paketi hangi projeler için doğru seçimdir?", answer: "Web sitesi veya uygulama yenilenirken aynı anda marka anlatısı, içerik kütüphanesi ve lansman altyapısının da güçlenmesi gereken dönüşüm projeleri için tasarlanmıştır." },
      { question: "Web ve video üretimi aynı takvimde nasıl yönetiliyor?", answer: "İki üretim hattı ortak strateji, mesaj sistemi ve onay ritmi üzerinden ilerler. Böylece lansmanda kullanılan her varlık aynı marka deneyimini taşır." },
      { question: "Paket tek seferlik teslimden sonra devam eder mi?", answer: "İlk lansman sonrasında 120 gün boyunca ölçüm, içerik adaptasyonu ve öncelikli iyileştirme kararları için danışmanlık desteği sunulur." },
    ],
    keywords: ["dijital dönüşüm paketi", "kurumsal web sitesi ve tanıtım filmi", "marka lansmanı", "dijital flagship", "entegre dijital pazarlama altyapısı"],
  },
];

export function getPackageDetail(slug: string) {
  return packageDetails.find(item => item.slug === slug);
}

export const packageDetailPathById = Object.fromEntries(packageDetails.map(item => [item.packageId, `/paketler/${item.slug}`]));

export const packageQuoteServiceById: Record<string, "software" | "video" | "hybrid"> = {
  "web-application": "software",
  "video-production": "video",
  "digital-flagship": "hybrid",
  "emergency-drone": "video",
};
