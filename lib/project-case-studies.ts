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
};

export const projectCaseStudies: ProjectCaseStudy[] = [
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
