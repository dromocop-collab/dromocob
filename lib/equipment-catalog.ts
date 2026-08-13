export type EquipmentItem = {
  slug: string;
  name: string;
  category: string;
  image: string;
  shortDescription: string;
  description: string;
  capabilities: string[];
  uses: Array<{ title: string; description: string }>;
  workflow: string[];
  relatedServices: Array<{ title: string; href: string }>;
  keywords: string[];
};

export const equipmentCatalog: EquipmentItem[] = [
  {
    slug: "sony-fx3-cinema-line",
    name: "Sony FX3 Cinema Line",
    category: "Sinema kamerası",
    image: "/images/services/sony-fx3-cinema-camera.webp",
    shortDescription: "Kurumsal film, reklam ve düşük ışık prodüksiyonlarında kullandığımız full-frame sinema kamerası.",
    description: "Sony FX3; küçük ekiplerle hızlı çalışırken sinema kamerası görüntü karakterini korumamızı sağlayan ana kamera sistemimizdir. Full-frame sensör, kontrollü düşük ışık performansı ve profesyonel ses bağlantıları sayesinde kurumsal röportajdan hareketli marka filmine kadar aynı üretim hattında kullanılabilir.",
    capabilities: ["Full-frame 4K görüntü sistemi", "Düşük ışıkta temiz ve kontrollü kayıt", "S-Log3 ile geniş renk düzenleme alanı", "Uzun çekimlere uygun aktif soğutma", "Profesyonel XLR ses iş akışı"],
    uses: [
      { title: "Kurumsal tanıtım filmi", description: "Röportaj, ekip, üretim ve mekân planlarında tutarlı bir sinema dili kurar." },
      { title: "Reklam ve ürün filmi", description: "Renk, ışık ve lens seçimleriyle ürünün malzeme karakterini ayrıntılı gösterir." },
      { title: "Etkinlik ve sosyal medya", description: "Kompakt gövdesiyle hızlı plan değişikliklerine ve dikey teslimlere uyum sağlar." },
    ],
    workflow: ["Sahne ve teslim formatını belirleme", "Lens, ışık ve ses setini eşleştirme", "Çekimde pozlama ve renk referansı", "Kurgu, ses miksajı ve renk teslimi"],
    relatedServices: [{ title: "Video prodüksiyon", href: "/video-produksiyon" }, { title: "Tanıtım filmi", href: "/tanitim-filmi" }, { title: "Kurumsal fotoğraf", href: "/kurumsal-fotograf-cekimi" }],
    keywords: ["Sony FX3", "Sony FX3 çekim", "Sony FX3 video prodüksiyon", "Cinema Line kamera", "profesyonel sinema kamerası"],
  },
  {
    slug: "sony-g-master-24-70-lens",
    name: "Sony G Master 24-70mm Lens",
    category: "Profesyonel lens",
    image: "/images/services/gm-24-70-lens.webp",
    shortDescription: "Geniş mekân planından doğal portreye hızlı geçiş sağlayan profesyonel standart zoom lens.",
    description: "24-70mm G Master, prodüksiyon sırasında lens değiştirmeden geniş çevre planı, orta plan ve portre kadrajı üretmemizi sağlar. Hızlı değişen kurumsal çekimlerde süreyi korurken görüntü keskinliği, kontrast ve arka plan ayrımında tutarlı sonuç verir.",
    capabilities: ["24-70mm çok yönlü odak aralığı", "Sabit ve aydınlık diyafram", "Hızlı ve sessiz otomatik netleme", "Portrede kontrollü arka plan ayrımı", "Fotoğraf ve video için ortak kullanım"],
    uses: [{ title: "Mekân anlatımı", description: "Ofis, otel, restoran ve üretim alanını doğal perspektifle gösterir." }, { title: "Ekip ve yönetici portresi", description: "Yüz oranlarını koruyan, profesyonel portre kadrajları sağlar." }, { title: "Ürün ve detay", description: "Üretim detayları ve hizmet anlarını aynı görsel dilde kaydeder." }],
    workflow: ["Kadraj listesini odak aralıklarına ayırma", "Işık ve netlik testi", "Fotoğraf-video ortak çekim", "Renk ve keskinlik optimizasyonu"],
    relatedServices: [{ title: "Kurumsal fotoğraf", href: "/kurumsal-fotograf-cekimi" }, { title: "Otel tanıtımı", href: "/otel-tanitimi" }, { title: "Mağaza tanıtımı", href: "/magaza-tanitimi" }],
    keywords: ["Sony 24-70 GM", "G Master lens", "profesyonel kamera lensi", "kurumsal çekim lensi"],
  },
  {
    slug: "atomos-saha-monitoru",
    name: "Atomos Saha Monitörü",
    category: "Görüntü kontrol sistemi",
    image: "/images/services/atomos-field-monitor.webp",
    shortDescription: "Netlik, pozlama ve müşteri ön izlemesini çekim anında güvenceye alan profesyonel saha monitörü.",
    description: "Atomos saha monitörü, kamera üzerindeki küçük ekrana bağlı kalmadan görüntünün teknik doğruluğunu sette değerlendirmemizi sağlar. Netlik, pozlama ve renk referansını ekip ile müşteri aynı anda takip edebilir; böylece çekim sonrası sürprizleri azaltan kontrollü bir onay süreci kurulur.",
    capabilities: ["Büyük ve parlak saha görüntüsü", "Netlik ve pozlama analiz araçları", "LUT ile çekim anında renk ön izlemesi", "Yönetmen ve müşteri için ortak kontrol", "Kayıt güvenliği için profesyonel bağlantılar"],
    uses: [{ title: "Röportaj kontrolü", description: "Yüz netliği, ten tonu ve arka plan dengesini anlık doğrular." }, { title: "Ürün çekimi", description: "Küçük yüzey ve yansıma hatalarının sette fark edilmesini sağlar." }, { title: "Müşteri onayı", description: "Kadraj ve marka detayları çekim sürerken birlikte kontrol edilir." }],
    workflow: ["Kamera sinyalini kalibre etme", "Pozlama ve renk araçlarını hazırlama", "Sahne bazlı teknik kontrol", "Çekim sonunda dosya doğrulama"],
    relatedServices: [{ title: "Video prodüksiyon", href: "/video-produksiyon" }, { title: "Ürün ve mağaza tanıtımı", href: "/magaza-tanitimi" }],
    keywords: ["Atomos monitör", "kamera saha monitörü", "video çekim monitörü", "profesyonel görüntü kontrolü"],
  },
  {
    slug: "dji-mic-2-kablosuz-mikrofon",
    name: "DJI Mic 2 Kablosuz Mikrofon",
    category: "Profesyonel ses",
    image: "/images/services/dji-mic-2-wireless.webp",
    shortDescription: "Röportaj, sunum ve hareketli içeriklerde temiz konuşma sesi için kablosuz mikrofon sistemi.",
    description: "İyi görüntü, anlaşılmayan sesle değerini kaybeder. DJI Mic 2 sistemini röportaj, tesis gezisi ve sunucu anlatımlarında konuşmayı ortam sesinden ayırmak için kullanıyoruz. Dahili yedek kayıt yaklaşımı, kritik çekimlerde ses hattını daha güvenli hale getirir.",
    capabilities: ["İki kişiye kadar kablosuz kayıt", "Hareketli çekimlerde özgür kullanım", "Dahili yedek ses kaydı", "Kamera ve mobil sistemlerle uyum", "Hızlı kurulum ve seviye takibi"],
    uses: [{ title: "Kurumsal röportaj", description: "Konuşmacının sesini net ve yakın bir karakterle kaydeder." }, { title: "Tesis ve etkinlik", description: "Kamera hareket ederken sunucu sesini kesintisiz taşır." }, { title: "Sosyal medya", description: "Dikey kısa videolarda yayın kalitesinde konuşma sesi sağlar." }],
    workflow: ["Ortam frekans ve gürültü kontrolü", "Mikrofon yerleşimi", "Ana ve yedek kayıt takibi", "Temizleme, miksaj ve ses seviyesi teslimi"],
    relatedServices: [{ title: "Tanıtım filmi", href: "/tanitim-filmi" }, { title: "Video prodüksiyon", href: "/video-produksiyon" }, { title: "Instagram yönetimi", href: "/instagram-yonetimi" }],
    keywords: ["DJI Mic 2", "kablosuz yaka mikrofonu", "profesyonel röportaj sesi", "video çekimi ses sistemi"],
  },
  {
    slug: "dji-rs4-gimbal",
    name: "DJI RS 4 Gimbal",
    category: "Kamera hareket sistemi",
    image: "/images/services/dji-rs3-gimbal.webp",
    shortDescription: "Mekân turları ve hareketli marka filmleri için akıcı, kontrollü kamera hareketi.",
    description: "DJI RS 4, yürüyüş ve takip planlarında elde çekimin doğal enerjisini korurken istenmeyen sarsıntıyı azaltır. Otel, villa, mağaza ve üretim tesisi turlarında izleyiciyi mekânın içinde taşıyan kesintisiz kamera hareketleri üretmek için kullanılır.",
    capabilities: ["Üç eksenli kamera stabilizasyonu", "Hızlı yatay-dikey geçiş", "Takip ve reveal hareketleri", "Düşük açı ve dar alan kullanımı", "Sinema kamerası ve lens dengesi"],
    uses: [{ title: "Mekân turu", description: "İzleyiciyi girişten detaylara taşıyan akıcı rotalar oluşturur." }, { title: "Takip planı", description: "Çalışan, sunucu veya ürün hareketini kontrollü biçimde izler." }, { title: "Dikey reklam", description: "Sosyal medya için dikey kamera hareketini sette doğru kurar." }],
    workflow: ["Kamera-lens dengesini kurma", "Yürüyüş rotası provası", "Hız ve motor ayarı", "Stabilizasyon ve ritim kontrollü kurgu"],
    relatedServices: [{ title: "Otel tanıtımı", href: "/otel-tanitimi" }, { title: "Villa tanıtımı", href: "/villa-tanitimi" }, { title: "Restoran tanıtımı", href: "/restoran-tanitimi" }],
    keywords: ["DJI RS 4", "kamera gimbal", "profesyonel stabilizer", "gimbal video çekimi", "mekan tanıtım çekimi"],
  },
  {
    slug: "profesyonel-sinema-isik-sistemi",
    name: "Profesyonel Sinema Işık Sistemi",
    category: "Işık ve grip",
    image: "/images/services/cinema-lighting-system.webp",
    shortDescription: "Ten tonu, ürün yüzeyi ve mekân atmosferini kontrollü biçimde şekillendiren ışık sistemi.",
    description: "Profesyonel ışık yalnızca sahneyi aydınlatmaz; izleyicinin nereye bakacağını ve markayı nasıl hissedeceğini belirler. Yumuşak ana ışık, dolgu, arka ışık ve renk vurgularını mekânın mevcut ışığıyla dengeleyerek doğal ama tasarlanmış bir görüntü kuruyoruz.",
    capabilities: ["Ayarlanabilir renk sıcaklığı", "Yumuşak ve kontrollü yüz ışığı", "Ürün yüzeyleri için yansıma yönetimi", "Mekân atmosferi ve renk vurgusu", "Taşınabilir güç ve grip çözümleri"],
    uses: [{ title: "Kurumsal portre", description: "Güven veren, doğal ten tonlu ve tutarlı ekip portreleri üretir." }, { title: "Ürün filmi", description: "Malzeme, form ve yüzey detaylarını kontrollü yansımalarla gösterir." }, { title: "Mekân atmosferi", description: "Mevcut mimari ışığı destekleyerek derinlik ve odak oluşturur." }],
    workflow: ["Mevcut ışık ve elektrik keşfi", "Işık planı ve ekipman seçimi", "Kamera ile renk/pozlama eşleştirmesi", "Sahne sürekliliği kontrolü"],
    relatedServices: [{ title: "Kurumsal fotoğraf", href: "/kurumsal-fotograf-cekimi" }, { title: "Tanıtım filmi", href: "/tanitim-filmi" }, { title: "Restoran tanıtımı", href: "/restoran-tanitimi" }],
    keywords: ["profesyonel video ışığı", "sinema ışık sistemi", "ürün çekimi ışığı", "kurumsal çekim ekipmanı"],
  },
  {
    slug: "dji-mini-5-pro-drone",
    name: "DJI Mini 5 Pro Drone",
    category: "Sinematik hava kamerası",
    image: "/images/services/dji-mini-5-pro-drone.webp",
    shortDescription: "Hızlı saha operasyonları ve yüksek kaliteli sinematik hava planları için kompakt drone sistemi.",
    description: "DJI Mini 5 Pro, lokasyonda hızlı hareket etmemiz gereken turizm, gayrimenkul ve kurumsal saha çekimlerinde kullandığımız çevik hava kamerasıdır. Kompakt operasyon yapısı; geniş tanıtım planları, dikey sosyal medya kadrajları ve günün değişen ışığında hızlı tekrarlar için avantaj sağlar.",
    capabilities: ["Yüksek çözünürlüklü sinematik kayıt", "Kompakt ve hızlı saha kurulumu", "Yatay ve dikey teslim seçenekleri", "Kontrollü rota ve takip planları", "Renk düzenlemeye uygun kayıt profili"],
    uses: [{ title: "Gayrimenkul", description: "Yapının konumunu, çevresini ve ölçeğini tek anlatıda birleştirir." }, { title: "Otel ve turizm", description: "Tesis, kıyı ve çevre deneyimini geniş hava planlarıyla gösterir." }, { title: "Kurumsal tesis", description: "Fabrika, şantiye ve üretim alanını üst ölçekten belgeler." }],
    workflow: ["Uçuş bölgesi ve hava kontrolü", "Rota ve kadraj planlaması", "Güvenli çekim operasyonu", "Stabilizasyon, renk ve format teslimi"],
    relatedServices: [{ title: "Drone çekimi", href: "/drone-cekimi" }, { title: "Acil drone çekimi", href: "/acil-drone-cekimi" }, { title: "Villa tanıtımı", href: "/villa-tanitimi" }],
    keywords: ["DJI Mini 5 Pro", "DJI Mini 5 Pro çekim", "profesyonel drone çekimi", "sinematik drone"],
  },
  {
    slug: "dji-avata-2-fpv-drone",
    name: "DJI Avata 2 FPV Drone",
    category: "FPV hava kamerası",
    image: "/images/services/dji-avata-2-fpv-drone.webp",
    shortDescription: "Mekânın içinden dışına kesintisiz ve sürükleyici geçişler üreten FPV drone sistemi.",
    description: "DJI Avata 2, klasik drone kadrajından farklı olarak izleyiciyi mekânın içine alan FPV kamera hareketleri üretir. Otel, fabrika, mağaza, etkinlik ve spor alanlarında tek planda bölümler arası geçiş yaparak ölçeği ve deneyimi daha enerjik bir dille anlatır.",
    capabilities: ["İç ve dış mekân FPV rotaları", "Dar alanlarda dinamik kamera hareketi", "Tek plan mekân geçişleri", "Yüksek çözünürlüklü stabilize kayıt", "Klasik drone ve yer kamerasıyla eşleşen kurgu"],
    uses: [{ title: "Otel ve tesis turu", description: "Giriş, oda, sosyal alan ve çevreyi tek akışta birbirine bağlar." }, { title: "Fabrika ve üretim", description: "Üretim hattının ölçeğini ve bölümler arası ilişkiyi dinamik gösterir." }, { title: "Etkinlik ve spor", description: "Hareketin enerjisini izleyiciye yakın ve sürükleyici aktarır." }],
    workflow: ["Fiziksel rota ve risk keşfi", "Pilot prova ve güvenlik sınırları", "Kontrollü FPV uçuşu", "Hız düzenleme, ses tasarımı ve renk"],
    relatedServices: [{ title: "FPV ve drone çekimi", href: "/drone-cekimi" }, { title: "Video prodüksiyon", href: "/video-produksiyon" }, { title: "İnşaat firma tanıtımı", href: "/insaat-firma-tanitimi" }],
    keywords: ["DJI Avata 2", "FPV drone çekimi", "mekan içi drone çekimi", "sinematik FPV", "profesyonel FPV pilotu"],
  },
];

export function equipmentBySlug(slug: string) {
  return equipmentCatalog.find(item => item.slug === slug);
}
