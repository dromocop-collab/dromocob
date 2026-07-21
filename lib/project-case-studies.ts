export type ProjectCaseStudy = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  category: string;
  eyebrow: string;
  summary: string;
  description: string;
  coverUrl: string;
  coverAlt: string;
  year: number;
  service: string;
  location: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  services: string[];
  process: { title: string; description: string }[];
  deliverables: string[];
  relatedServiceUrl: string;
  relatedServiceLabel: string;
  keywords: string[];
  faq: { question: string; answer: string }[];
  liveUrl?: string;
};

const websiteCaseStudies: ProjectCaseStudy[] = [
  {
    id: "6nci-kuyumculuk", slug: "6nci-kuyumculuk-e-ticaret", title: "6'ncı Kuyumculuk", seoTitle: "6'ncı Kuyumculuk Premium E-Ticaret Projesi", category: "Luxury E-Commerce", eyebrow: "Premium kuyumculuk · E-ticaret · Fethiye", year: 2026,
    summary: "Altın ve mücevher alışverişini güven, zarafet ve kişisel danışmanlık ekseninde yeniden kurgulayan premium e-ticaret deneyimi.",
    description: "Sertifikalı ürün, güvenli ödeme, sigortalı gönderim ve uzman danışmanlık katmanlarını modern bir dijital mağazada birleştiren 6'ncı Kuyumculuk web projesi.",
    coverUrl: "/images/projects/6nci-kuyumculuk.jpg", coverAlt: "6'ncı Kuyumculuk premium altın ve mücevher e-ticaret deneyimi", service: "E-ticaret, UX/UI ve özel web geliştirme", location: "Fethiye, Muğla",
    challenge: "Yüksek değerli ürünlerde fiziksel mağaza güvenini dijital ortama taşırken geniş koleksiyonu mobilde hızlı, anlaşılır ve satın almaya hazır hâle getirmek.",
    solution: "Lüks görsel dil; bütçe bazlı keşif, koleksiyon filtreleri, ürün güvence katmanları, randevu ve WhatsApp danışmanlığıyla tek bir müşteri yolculuğunda birleştirildi.",
    outcomes: ["Premium marka algısını taşıyan dijital vitrin", "Güven unsurlarıyla güçlendirilmiş satın alma akışı", "Mağaza, randevu ve danışmanlığı bağlayan çok kanallı deneyim"],
    services: ["E-ticaret bilgi mimarisi", "Premium UI tasarım sistemi", "Ürün ve koleksiyon deneyimi", "Güvenli ödeme akışı", "Üyelik, favoriler ve randevu", "Teknik SEO ve performans"],
    process: [{ title: "Marka keşfi", description: "Kuyumculukta güven, ürün keşfi ve mağaza deneyiminin dijital karşılıkları tanımlandı." }, { title: "Deneyim tasarımı", description: "Mobil öncelikli katalog, filtre, ürün ve danışmanlık akışları prototiplendi." }, { title: "E-ticaret geliştirme", description: "Yönetilebilir ürün altyapısı, ödeme ve müşteri özellikleri geliştirildi." }, { title: "Yayın ve optimizasyon", description: "Performans, SEO, yasal sayfalar ve dönüşüm temasları yayına hazırlandı." }],
    deliverables: ["Responsive premium mağaza", "Ürün ve koleksiyon yönetimi", "Bütçeye göre alışveriş", "Güvenli ödeme altyapısı", "Randevu ve canlı destek", "SEO ve analitik katmanı"],
    relatedServiceUrl: "/hizmetler/web-tasarim", relatedServiceLabel: "E-ticaret ve web sistemlerini incele", liveUrl: "https://6nci.com", keywords: ["6'ncı Kuyumculuk", "kuyumculuk e-ticaret", "premium web tasarım", "mücevher e-ticaret sitesi"],
    faq: [{ question: "Bu projede hangi deneyimler öne çıkıyor?", answer: "Koleksiyon keşfi, bütçe bazlı yönlendirme, güvenli ödeme, sertifika ve sigortalı gönderim bilgileri ile kişisel danışmanlık tek yapıda buluşuyor." }, { question: "Siteyi canlı inceleyebilir miyim?", answer: "Evet. Sayfadaki Canlı Site bağlantısıyla 6nci.com deneyimini doğrudan açabilirsiniz." }],
  },
  {
    id: "kilic-spot", slug: "kilic-spot-dijital-donusum", title: "Kılıç Spot", seoTitle: "Kılıç Spot İkinci El Eşya Dijital Dönüşüm Projesi", category: "Local Commerce", eyebrow: "İkinci el · Lead sistemi · İstanbul", year: 2025,
    summary: "İkinci el eşya alım-satımını üç net adıma indiren; arama, WhatsApp ve yerel güven sinyallerini birleştiren dönüşüm odaklı web deneyimi.",
    description: "Kılıç Spot'un İstanbul'daki alım-satım ve nakliye operasyonunu müşterinin hızlı teklif alabileceği sade bir dijital akışa dönüştüren web projesi.",
    coverUrl: "/images/projects/kilic-spot.jpg", coverAlt: "Kılıç Spot mobilya ve beyaz eşya dijital teklif sistemi", service: "Kurumsal web, yerel SEO ve lead tasarımı", location: "Büyükçekmece, İstanbul",
    challenge: "Farklı ürün kategorileri ve geniş hizmet bölgesini ziyaretçiyi yormadan anlatmak; fotoğraf gönderme ve teklif alma aksiyonunu hızlandırmak.",
    solution: "Fotoğraf gönder, teklif al ve ücretsiz teslimat adımlarını merkeze alan; kategori, WhatsApp ve bölgesel arama niyetlerini aynı yapıda buluşturan bir deneyim tasarlandı.",
    outcomes: ["Üç adımda anlaşılır eşya satış yolculuğu", "Mobilde tek dokunuşla WhatsApp ve arama", "Yerel arama görünürlüğünü destekleyen içerik mimarisi"],
    services: ["Dönüşüm odaklı UX", "Mobil web tasarımı", "WhatsApp teklif akışı", "Hizmet kategorileri", "Yerel SEO altyapısı", "İletişim ve harita entegrasyonu"],
    process: [{ title: "Arama niyeti", description: "Bölgesel müşteri sorguları ve en hızlı iletişim senaryoları haritalandı." }, { title: "Akış tasarımı", description: "Alım süreci üç basit adım ve güçlü aksiyonlarla sadeleştirildi." }, { title: "İçerik sistemi", description: "Mobilya, beyaz eşya ve ev aletleri kategorileri yönetilebilir yapıya alındı." }, { title: "Yerel yayın", description: "Mobil hız, harita, iletişim ve yerel SEO kontrolleri tamamlandı." }],
    deliverables: ["Responsive kurumsal site", "WhatsApp teklif yönlendirmesi", "Kategori landing alanları", "Yerel SEO sayfa yapısı", "İletişim formu ve harita", "Performans optimizasyonu"],
    relatedServiceUrl: "/hizmetler/web-tasarim", relatedServiceLabel: "Dönüşüm odaklı web hizmetini incele", liveUrl: "https://kilicspot.tr", keywords: ["Kılıç Spot", "spotçu web sitesi", "yerel SEO", "ikinci el eşya web tasarım"],
    faq: [{ question: "Projenin ana dönüşüm hedefi neydi?", answer: "Ziyaretçinin eşya fotoğraflarını WhatsApp üzerinden hızla iletmesi, teklif alması ve nakliye sürecini net biçimde anlamasıydı." }, { question: "Site hangi bölgeye odaklanıyor?", answer: "Büyükçekmece, Esenyurt, Beylikdüzü ve İstanbul çevresindeki yerel müşteri taleplerine odaklanıyor." }],
  },
  {
    id: "mase-group", slug: "mase-group-kurumsal-platform", title: "Mase Group", seoTitle: "Mase Group Kurumsal Web ve Ürün Katalog Projesi", category: "Corporate Platform", eyebrow: "Dekoratif boya · Katalog · Kurumsal", year: 2025,
    summary: "Dekoratif boya, gayrimenkul, medya ve turizm yetkinliklerini güçlü bir malzeme dili ve kapsamlı ürün kataloğuyla buluşturan kurumsal platform.",
    description: "Mase Group'un çok disiplinli yapısını, dekoratif boya uzmanlığını ve teknik ürün bilgisini tek bir keşif ve teklif ekosisteminde birleştiren web deneyimi.",
    coverUrl: "/images/projects/mase-group.jpg", coverAlt: "Mase Group dekoratif boya ve çok disiplinli kurumsal web platformu", service: "Kurumsal web, ürün kataloğu ve içerik mimarisi", location: "İstanbul · Muğla",
    challenge: "Birden fazla faaliyet alanını marka bütünlüğünü bozmadan anlatmak ve teknik boya ürünlerini hem profesyonellere hem son kullanıcıya anlaşılır sunmak.",
    solution: "Faaliyet alanları güçlü bir kurumsal anlatıda toplandı; ürün kategorileri, teknik detaylar, uygulama süreçleri ve teklif temasları modüler katalog yapısına bağlandı.",
    outcomes: ["Çok disiplinli yapıyı birleştiren marka mimarisi", "Detaylı ve ölçeklenebilir dijital ürün kataloğu", "Keşiften teklife uzanan yönetilebilir içerik sistemi"],
    services: ["Kurumsal bilgi mimarisi", "Özgün görsel yön", "Ürün katalog sistemi", "Teknik ürün detayları", "Lead ve teklif formları", "SEO içerik altyapısı"],
    process: [{ title: "Marka mimarisi", description: "Gayrimenkul, dekoratif boya, medya ve turizm alanlarının dijital hiyerarşisi kuruldu." }, { title: "Malzeme dili", description: "Renk, doku ve uygulama uzmanlığını taşıyan görsel sistem geliştirildi." }, { title: "Katalog", description: "Kategori, ürün, teknik bilgi ve benzer ürün ilişkileri yapılandırıldı." }, { title: "Büyüme altyapısı", description: "Teklif, iletişim, SEO içerikleri ve ölçüm temasları yayına alındı." }],
    deliverables: ["Kurumsal marka sitesi", "Dinamik ürün kataloğu", "Teknik ürün sayfaları", "Hizmet ve süreç anlatımı", "Teklif ve iletişim formları", "SEO içerik şablonları"],
    relatedServiceUrl: "/hizmetler/web-tasarim", relatedServiceLabel: "Kurumsal platform hizmetini incele", liveUrl: "https://masegroup.com.tr", keywords: ["Mase Group", "dekoratif boya web sitesi", "ürün katalog yazılımı", "kurumsal web tasarım"],
    faq: [{ question: "Platform hangi alanları bir araya getiriyor?", answer: "Gayrimenkul, dekoratif boya, medya ve turizm faaliyetleri tek kurumsal yapı altında sunuluyor." }, { question: "Ürün kataloğu yönetilebilir mi?", answer: "Evet. Kategori, ürün, açıklama, uygulama bilgisi ve benzer ürün ilişkileri genişleyebilen bir içerik yapısıyla kurgulandı." }],
  },
  {
    id: "ugurbey-spot", slug: "ugurbey-spot-web-platformu", title: "Uğurbey Spot", seoTitle: "Uğurbey Spot İkinci El Eşya Web Platformu", category: "Circular Commerce", eyebrow: "Spot eşya · Mobil deneyim · Dönüşüm", year: 2025,
    summary: "Mobilya, beyaz eşya ve elektronik ürünlerin ikinci yaşamını güvenilir, hızlı ve mobil öncelikli bir müşteri deneyimine dönüştüren web platformu.",
    description: "Uğurbey Spot için ürün keşfi ile eşya satma talebini aynı sade arayüzde buluşturan, iletişim odaklı dijital mağaza deneyimi.",
    coverUrl: "/images/projects/ugurbey-spot.jpg", coverAlt: "Uğurbey Spot ikinci el mobilya ve beyaz eşya web deneyimi", service: "Web tasarım, içerik sistemi ve lead akışları", location: "Türkiye",
    challenge: "Hızla değişen ürün envanterini yönetilebilir kılarken satın almak ve eşya satmak isteyen iki farklı kullanıcı grubuna net yol sunmak.",
    solution: "Kategori odaklı ürün keşfi, mobil iletişim aksiyonları ve hızlı değerlendirme talebi; sıcak, güvenilir ve yalın bir tasarım sistemi içinde birleştirildi.",
    outcomes: ["Alıcı ve satıcı için ayrışan net kullanıcı yolları", "Mobil öncelikli hızlı iletişim deneyimi", "Değişken envantere uyumlu içerik mimarisi"],
    services: ["UX stratejisi", "Responsive UI tasarımı", "Ürün kategori sistemi", "Eşya satma akışı", "WhatsApp entegrasyonu", "Teknik SEO"],
    process: [{ title: "Kullanıcı yolları", description: "Ürün arayan ve eşya satmak isteyen kullanıcıların ihtiyaçları ayrıştırıldı." }, { title: "Mobil tasarım", description: "Kategori keşfi ve hızlı iletişim küçük ekranlar için önceliklendirildi." }, { title: "Yönetim sistemi", description: "Değişken ürün ve içeriklerin güncellenebileceği yapı kuruldu." }, { title: "Yayın", description: "SEO, performans ve dönüşüm noktaları doğrulanarak canlıya alındı." }],
    deliverables: ["Mobil öncelikli web sitesi", "Ürün kategori yapısı", "Hızlı teklif akışı", "WhatsApp ve telefon aksiyonları", "Yönetilebilir içerik alanları", "SEO temel kurulumu"],
    relatedServiceUrl: "/hizmetler/web-tasarim", relatedServiceLabel: "Web tasarım sistemlerini incele", liveUrl: "https://ugurbeyspot.com", keywords: ["Uğurbey Spot", "ikinci el eşya sitesi", "spot mağaza web tasarım", "mobil web deneyimi"],
    faq: [{ question: "Platform kimlere hitap ediyor?", answer: "İkinci el ürün satın almak isteyenlerle elindeki mobilya, beyaz eşya veya elektroniği değerlendirmek isteyen kullanıcıları aynı platformda buluşturuyor." }, { question: "Mobil iletişim nasıl kolaylaştırıldı?", answer: "Telefon ve WhatsApp gibi yüksek niyetli aksiyonlar sayfa akışında görünür ve kolay erişilebilir konumlandırıldı." }],
  },
  {
    id: "akc-oto-kilif", slug: "akc-oto-kilif-dijital-katalog", title: "AKC Oto Kılıf", seoTitle: "AKC Oto Kılıf Otomotiv Dijital Katalog Projesi", category: "Automotive Commerce", eyebrow: "Otomotiv · Ürün kataloğu · Özel üretim", year: 2025,
    summary: "Araç içi işçilik, malzeme kalitesi ve model uyumluluğunu güçlü ürün keşfiyle birleştiren performans odaklı otomotiv web deneyimi.",
    description: "AKC Oto Kılıf'ın ürün çeşitliliğini, özel dikim yaklaşımını ve araç uyumluluğunu dijital katalog ve hızlı teklif akışına dönüştüren proje.",
    coverUrl: "/images/projects/akc-oto-kilif.jpg", coverAlt: "AKC Oto Kılıf özel dikim otomotiv koltuk tasarımı ve dijital katalog", service: "Otomotiv e-ticaret, katalog ve UX/UI", location: "Türkiye",
    challenge: "Araç marka-model çeşitliliği içinde doğru ürünü bulmayı kolaylaştırmak; malzeme ve dikiş kalitesini dijital ekranda güven verici biçimde hissettirmek.",
    solution: "Araç uyumluluğu, kategori ve ürün keşfi; detay odaklı otomotiv görsel dili, teklif aksiyonları ve teknik güven bilgileriyle tek sistemde toplandı.",
    outcomes: ["Araç uyumluluğuna göre hızlanan ürün keşfi", "İşçilik ve malzeme kalitesini öne çıkaran sunum", "Katalogdan teklife kesintisiz müşteri yolculuğu"],
    services: ["Otomotiv UX araştırması", "Ürün katalog mimarisi", "Marka-model filtreleme", "Ürün detay tasarımı", "Teklif ve iletişim akışı", "Mobil performans"],
    process: [{ title: "Katalog analizi", description: "Araç, model, malzeme ve ürün varyasyonlarının ilişki yapısı çıkarıldı." }, { title: "Ürün deneyimi", description: "Uyumluluk ve işçilik detaylarını öne çıkaran arayüz tasarlandı." }, { title: "Teklif sistemi", description: "Ürün keşfinden talebe geçişi hızlandıran temas noktaları geliştirildi." }, { title: "Optimizasyon", description: "Mobil hız, taranabilirlik ve katalog kullanılabilirliği doğrulandı." }],
    deliverables: ["Responsive otomotiv kataloğu", "Marka-model filtreleri", "Ürün detay şablonları", "Teklif alma akışı", "Yönetilebilir kategori sistemi", "Teknik SEO altyapısı"],
    relatedServiceUrl: "/hizmetler/web-tasarim", relatedServiceLabel: "Katalog ve e-ticaret hizmetini incele", liveUrl: "https://akcotokilif.com", keywords: ["AKC Oto Kılıf", "oto kılıf web sitesi", "otomotiv ürün kataloğu", "araç uyumluluk filtresi"],
    faq: [{ question: "Dijital katalog nasıl çalışıyor?", answer: "Ürünler araç ve kategori mantığıyla ayrıştırılarak ziyaretçinin uyumlu seçeneğe daha hızlı ulaşması hedefleniyor." }, { question: "Teklif süreci katalogla bağlantılı mı?", answer: "Evet. Kullanıcı incelediği kapsamdan kopmadan uygun iletişim veya teklif kanalına ilerleyebiliyor." }],
  },
];

export const projectCaseStudies: ProjectCaseStudy[] = [
  ...websiteCaseStudies,
  {
    id: "cinematic-brand",
    slug: "cinematic-brand-film",
    title: "Sinematik Marka Filmi",
    seoTitle: "Sinematik Marka Filmi ve Reklam Filmi Prodüksiyonu",
    category: "Film Prodüksiyonu",
    eyebrow: "Marka filmi · Reklam filmi · Türkiye",
    summary: "Marka hikâyesini sinematografi, kontrollü ışık ve güçlü post-prodüksiyonla tek bir kampanya anlatısında birleştiren film sistemi.",
    description: "Konsept geliştirmeden çekim planına; kamera, ışık, ses ve drone üretiminden kurgu ile renk tasarımına uzanan uçtan uca marka filmi yaklaşımı.",
    coverUrl: "/images/projects/cinematic-brand-film.jpg",
    coverAlt: "Sinematik marka filmi prodüksiyonu için profesyonel kamera ve ışık seti",
    year: 2026,
    service: "Uçtan uca video ve film prodüksiyonu",
    location: "İstanbul merkezli, Türkiye geneli",
    challenge: "Markanın değerini birkaç saniye içinde hissettiren; web, sosyal medya ve dijital reklam kanallarında tutarlı çalışabilen güçlü bir görsel anlatı kurmak.",
    solution: "Ana film etrafında şekillenen modüler bir prodüksiyon planı oluşturduk. Kreatif yön, senaryo, çekim dili ve teslim formatları aynı sistem içinde ele alındı.",
    outcomes: ["Tek ana fikir etrafında tutarlı marka anlatısı", "Yatay, dikey ve kısa reklam formatlarına uyarlanabilir kurgu", "Arşivlenebilir görüntü ve yayın master yapısı"],
    services: ["Kreatif konsept ve senaryo", "Storyboard ve çekim planı", "Sinematik kamera, gimbal ve ışık", "Drone ve FPV çekim opsiyonları", "Kurgu, color grading ve ses tasarımı", "Sosyal medya format adaptasyonları"],
    process: [
      { title: "Keşif ve anlatı", description: "Marka konumu, hedef kitle, kampanya hedefi ve yayın kanalları tek briefte netleştirilir." },
      { title: "Pre-prodüksiyon", description: "Senaryo, storyboard, lokasyon, ekipman, çekim planı ve prodüksiyon takvimi hazırlanır." },
      { title: "Çekim", description: "Kamera, hareket, ışık ve ses katmanları planlanan görsel dile göre sahada yönetilir." },
      { title: "Post-prodüksiyon", description: "Kurgu, renk, ses, grafik ve platform varyasyonları kontrollü revizyon akışıyla tamamlanır." },
    ],
    deliverables: ["Ana marka filmi", "15–30 saniyelik cutdown", "Dikey Reels / Shorts versiyonları", "Altyazılı yayın masterları", "Kapak ve thumbnail kareleri", "Teslim ve arşiv klasörü"],
    relatedServiceUrl: "/hizmetler/video-film-produksiyon",
    relatedServiceLabel: "Video ve film prodüksiyon hizmetini incele",
    keywords: ["marka filmi prodüksiyonu", "reklam filmi çekimi", "İstanbul video prodüksiyon", "Türkiye film prodüksiyon", "kurumsal tanıtım filmi"],
    faq: [
      { question: "Marka filmi prodüksiyonu ne kadar sürer?", answer: "Kapsama göre değişmekle birlikte keşif, pre-prodüksiyon, çekim ve post-prodüksiyon birlikte planlanır. Kesin takvim senaryo ve teslim sayısı netleştiğinde paylaşılır." },
      { question: "Türkiye genelinde çekim yapıyor musunuz?", answer: "Evet. Proje yönetimi İstanbul merkezli yürütülür; lokasyon ve ekip planına göre Türkiye'nin farklı şehirlerinde çekim organize edilebilir." },
    ],
  },
  {
    id: "digital-commerce",
    slug: "digital-commerce-system",
    title: "Dijital Ticaret Sistemi",
    seoTitle: "E-Ticaret Web Tasarım ve Özel Yazılım Sistemi",
    category: "Web Tasarım & Yazılım",
    eyebrow: "E-ticaret · Next.js · Yönetim paneli",
    summary: "Ürün deneyimi, satış akışı, yönetim operasyonu ve ölçüm altyapısını aynı hızlı dijital üründe birleştiren ticaret sistemi.",
    description: "SEO uyumlu bilgi mimarisi, dönüşüm odaklı arayüz, gelişmiş yönetim paneli ve ölçeklenebilir Next.js altyapısıyla tasarlanan modern e-ticaret yaklaşımı.",
    coverUrl: "/images/projects/digital-commerce-system.jpg",
    coverAlt: "Masaüstü ve mobil cihazlarda e-ticaret web tasarım ve analitik sistemi",
    year: 2026,
    service: "Web tasarım, e-ticaret ve özel yazılım",
    location: "Türkiye geneli uzaktan proje yönetimi",
    challenge: "Müşteri tarafında hızlı ve güven veren bir alışveriş deneyimi sunarken ürün, içerik, sipariş ve kampanya operasyonlarını ekip için sadeleştirmek.",
    solution: "Arama niyetine göre sayfa yapısı, yeniden kullanılabilir tasarım sistemi, yönetilebilir katalog ve ölçülebilir dönüşüm akışı tek ürün mimarisinde birleştirildi.",
    outcomes: ["Mobil öncelikli ve hızlı alışveriş deneyimi", "Tek panelden yönetilebilen ürün ve içerik operasyonu", "SEO, analitik ve dönüşüm ölçümü için hazır altyapı"],
    services: ["Strateji ve kullanıcı deneyimi", "Özgün UI tasarım sistemi", "Next.js geliştirme", "Firebase / veritabanı mimarisi", "Ödeme ve operasyon entegrasyonları", "Teknik SEO ve analitik kurulumu"],
    process: [
      { title: "İş ve arama analizi", description: "Ürün yapısı, hedef kitle, rakip görünürlüğü ve dönüşüm hedefleri birlikte değerlendirilir." },
      { title: "UX ve tasarım sistemi", description: "Katalog, ürün detayı, sepet ve ödeme akışları mobil öncelikli prototiplerle tasarlanır." },
      { title: "Geliştirme", description: "Ön yüz, yönetim paneli, veri modeli ve entegrasyonlar performans odaklı olarak geliştirilir." },
      { title: "SEO ve yayın", description: "Teknik kontroller, yapılandırılmış veri, ölçüm, yönlendirme ve yayın sonrası izleme tamamlanır." },
    ],
    deliverables: ["Responsive e-ticaret arayüzü", "Ürün ve içerik yönetim paneli", "Sepet ve ödeme akışı", "SEO sayfa şablonları", "GA4 ve dönüşüm olayları", "Teknik teslim dokümantasyonu"],
    relatedServiceUrl: "/hizmetler/web-tasarim",
    relatedServiceLabel: "Web tasarım ve yazılım hizmetini incele",
    keywords: ["e-ticaret web tasarım", "özel e-ticaret yazılımı", "Next.js e-ticaret", "kurumsal web tasarım Türkiye", "yönetim panelli web sitesi"],
    faq: [
      { question: "E-ticaret sitesi SEO uyumlu hazırlanabilir mi?", answer: "Evet. Kategori ve ürün bilgi mimarisi, teknik metadata, yapılandırılmış veri, hız ve taranabilirlik geliştirme sürecinin parçası olarak ele alınabilir." },
      { question: "Yönetim panelinden içerikleri değiştirebilir miyiz?", answer: "Evet. Proje kapsamına göre ürün, kategori, içerik, sipariş, kampanya ve medya alanları ekip tarafından yönetilebilecek şekilde tasarlanabilir." },
    ],
  },
  {
    id: "social-growth",
    slug: "social-growth-direction",
    title: "Sosyal Büyüme Sistemi",
    seoTitle: "Sosyal Medya İçerik Üretimi ve Dijital Büyüme Sistemi",
    category: "İçerik & Growth",
    eyebrow: "Reels · İçerik sistemi · Performans",
    summary: "Kreatif yön, kısa video üretimi, yayın ritmi ve performans öğrenimini sürdürülebilir bir büyüme operasyonunda birleştiren sistem.",
    description: "Markanın her ay ne anlatacağını, nasıl üreteceğini ve hangi verilerle geliştireceğini netleştiren sosyal içerik ve büyüme yaklaşımı.",
    coverUrl: "/images/projects/social-growth-direction.jpg",
    coverAlt: "Sosyal medya içerik üretimi, Reels planlama ve performans analitiği çalışma masası",
    year: 2026,
    service: "Sosyal medya içerik üretimi ve growth",
    location: "İstanbul ve Türkiye geneli",
    challenge: "Tek seferlik paylaşımlar yerine marka dilini koruyan, düzenli üretilebilen ve performans verisinden öğrenen bir içerik sistemi kurmak.",
    solution: "İçerik sütunları, format matrisi, çekim düzeni, yayın takvimi ve aylık değerlendirmeyi tek operasyon döngüsünde topladık.",
    outcomes: ["Tekrarlanabilir içerik üretim düzeni", "Marka diliyle uyumlu Reels ve kısa video sistemi", "Kreatif kararları besleyen ölçüm ve öğrenim döngüsü"],
    services: ["Kreatif yön ve içerik sütunları", "Aylık çekim planı", "Reels / Shorts prodüksiyonu", "Kurgu ve motion grafik", "Yayın takvimi ve kanal adaptasyonu", "Performans değerlendirme notları"],
    process: [
      { title: "Yön ve hedef", description: "Marka karakteri, hedef kitle, kanal rolü ve ticari hedefler içerik stratejisine çevrilir." },
      { title: "Format sistemi", description: "Seriler, Reels yapıları, görsel dil ve tekrar kullanılabilir yaratıcı şablonlar belirlenir." },
      { title: "Toplu üretim", description: "İçerikler verimli çekim günleri ve planlı post-prodüksiyon akışıyla hazırlanır." },
      { title: "Yayın ve öğrenim", description: "İçerik performansı izlenir; sonraki üretim döngüsü izleyici sinyallerine göre geliştirilir." },
    ],
    deliverables: ["İçerik stratejisi ve format matrisi", "Aylık Reels / Shorts paketi", "Dikey kurgu ve altyazılar", "Kapak görsel sistemi", "Yayın planı", "Aylık performans değerlendirmesi"],
    relatedServiceUrl: "/kurumsal",
    relatedServiceLabel: "Dromocob çalışma modelini incele",
    keywords: ["sosyal medya içerik üretimi", "Reels video çekimi", "dijital büyüme ajansı", "İstanbul sosyal medya prodüksiyon", "marka içerik stratejisi"],
    faq: [
      { question: "Sosyal medya içerikleri toplu üretilebilir mi?", answer: "Evet. İçerik formatları önceden planlanarak tek veya birkaç çekim gününde aylık üretim yapılabilir; kurgu ve yayın varyasyonları sonrasında hazırlanır." },
      { question: "Sadece video üretimi alabilir miyiz?", answer: "Evet. İhtiyaca göre yalnız prodüksiyon veya strateji, prodüksiyon, yayın planı ve performans değerlendirmesini kapsayan bütünleşik model oluşturulabilir." },
    ],
  },
];

export function getProjectCaseStudy(slug: string) {
  return projectCaseStudies.find(project => project.slug === slug);
}
