export type AdvancedQuoteService = "web" | "video" | "web-quick" | "video-quick" | "drone-quick" | "growth-quick" | "apps-quick" | "project-quick" | "fethiye-quick" | "equipment-quick";

export type AdvancedQuoteOption = {
  label: string;
  value: string;
  hint?: string;
  priceDelta?: number;
};

export type AdvancedQuoteQuestion = {
  key: string;
  title: string;
  subtitle: string;
  type: "single" | "multi" | "text" | "textarea";
  options?: AdvancedQuoteOption[];
  optional?: boolean;
  placeholder?: string;
};

const option = (label: string, value: string, priceDelta = 0, hint?: string): AdvancedQuoteOption => ({ label, value, priceDelta, hint });

export const advancedQuoteConfig: Record<AdvancedQuoteService, {
  label: string;
  shortLabel: string;
  basePrice: number;
  questions: AdvancedQuoteQuestion[];
}> = {
  web: {
    label: "Web Tasarım & Yazılım Teklif Motoru",
    shortLabel: "Web & Yazılım",
    basePrice: 10000,
    questions: [
      { key: "projectType", title: "Hangi dijital ürünü planlıyoruz?", subtitle: "Kurumsal web sitesi 10.000 TL başlangıçtır; seçtiğin özellik, içerik, entegrasyon ve teslim hızı yatırımı kademeli artırır.", type: "single", options: [option("Kurumsal web sitesi", "corporate", 0, "10.000 TL başlangıç · Marka, hizmet ve lead odaklı"), option("Landing page / kampanya sitesi", "landing", 0, "Tek hedefli dönüşüm sayfası"), option("E-ticaret platformu", "commerce", 35000, "Ürün, ödeme ve operasyon"), option("Özel web uygulaması / SaaS", "web-app", 55000, "İş mantığı ve kullanıcı rolleri"), option("Pazar yeri / ilan platformu", "marketplace", 75000), option("Rezervasyon / randevu sistemi", "booking", 35000), option("Portal / intranet / müşteri paneli", "portal", 50000), option("Mevcut siteyi yeniden tasarlama", "redesign", 12000), option("Bakım, hız ve teknik iyileştirme", "optimization", 8000), option("Henüz emin değilim", "discovery", 5000)] },
      { key: "goals", title: "Projenin iş hedefleri neler?", subtitle: "Birden fazla hedef seçebilirsin.", type: "multi", options: [option("Nitelikli müşteri başvurusu", "lead", 5000), option("Online satış ve ödeme", "sales", 18000), option("Marka güveni ve prestij", "authority", 4000), option("Operasyonu dijitalleştirme", "operations", 22000), option("Üyelik / topluluk oluşturma", "community", 14000), option("Rezervasyon veya talep toplama", "booking", 12000), option("Yurt dışı pazarlara açılma", "international", 10000), option("SEO görünürlüğünü büyütme", "seo", 12000), option("Veri ve raporlama", "analytics", 9000), option("Diğer / keşifte netleşsin", "other", 0)] },
      { key: "currentState", title: "Şu an hangi aşamadasınız?", subtitle: "Devir ve içerik planını doğru kurmamıza yardım eder.", type: "single", options: [option("Sıfırdan başlıyoruz", "new"), option("Aktif bir sitemiz var", "existing", 3000), option("Tasarım hazır, geliştirme gerekli", "design-ready"), option("Yazılım var, yeniden yapılandırılacak", "rebuild", 12000), option("Alan adı / hosting hazır", "infra-ready"), option("Önce teknik analiz gerekli", "audit", 6000)] },
      { key: "audiences", title: "Kimler kullanacak?", subtitle: "Kullanıcı grupları yetki, deneyim ve içerik mimarisini belirler.", type: "multi", options: [option("Bireysel müşteriler (B2C)", "b2c"), option("Kurumsal müşteriler (B2B)", "b2b"), option("Bayiler / iş ortakları", "dealers", 8000), option("Çalışanlar / iç ekip", "employees", 8000), option("Satıcılar / tedarikçiler", "vendors", 12000), option("Üyeler / aboneler", "members", 14000), option("Yönetici ve operasyon ekipleri", "admins", 7000), option("Çoklu kullanıcı rolleri", "roles", 16000)] },
      { key: "contentScale", title: "İçerik ve sayfa ölçeği nedir?", subtitle: "Yaklaşık kapsam yeterli; bilgi mimarisini birlikte kesinleştiririz.", type: "single", options: [option("Tek sayfa / landing page", "one", 0), option("5–8 sayfa", "small", 10000), option("9–20 sayfa", "medium", 22000), option("20+ sayfa", "large", 38000), option("Yüzlerce dinamik içerik / ürün", "dynamic", 50000), option("Henüz belli değil", "unknown", 4000)] },
      { key: "capabilities", title: "Sistemde hangi modüller olmalı?", subtitle: "İhtiyacınız olan her şeyi seçin; bu adım teknik kapsamın merkezidir.", type: "multi", options: [option("Gelişmiş yönetim paneli / CMS", "admin", 18000), option("Üyelik, giriş ve profil", "auth", 18000), option("Rol ve yetki yönetimi", "roles", 14000), option("Ürün / katalog yönetimi", "catalog", 15000), option("Sepet, ödeme ve sipariş", "checkout", 28000), option("Teklif oluşturma motoru", "quote", 22000), option("Rezervasyon / takvim / randevu", "booking", 22000), option("Form ve lead yönetimi", "leads", 9000), option("Dosya / medya yükleme", "storage", 10000), option("Bildirim ve e-posta sistemi", "notifications", 12000), option("Canlı destek / mesajlaşma", "chat", 14000), option("Abonelik / paket / lisanslama", "subscription", 24000), option("Arama, filtreleme ve listeleme", "search", 12000), option("Harita / konum özellikleri", "maps", 10000), option("Raporlama ve dashboard", "dashboard", 18000), option("Onay ve iş akışları", "workflow", 18000), option("PDF / teklif / fatura üretimi", "documents", 12000), option("Yapay zekâ özellikleri", "ai", 24000), option("Özel bir modül", "custom", 12000)] },
      { key: "integrations", title: "Hangi entegrasyonlar gerekli?", subtitle: "Listede olmayan sistemi son notlarda yazabilirsin.", type: "multi", options: [option("Ödeme sistemi", "payment", 12000), option("CRM", "crm", 12000), option("ERP / muhasebe", "erp", 18000), option("Kargo / lojistik", "shipping", 10000), option("E-fatura / e-arşiv", "invoice", 14000), option("Google Maps", "maps", 5000), option("WhatsApp", "whatsapp", 5000), option("E-posta / SMS", "message", 7000), option("Google / Meta / TikTok ölçümü", "tracking", 8000), option("Sosyal medya hesapları", "social", 4000), option("Harici API / özel servis", "api", 16000), option("Şimdilik entegrasyon yok", "none", 0)] },
      { key: "designDirection", title: "Tasarım yaklaşımı nasıl olmalı?", subtitle: "Marka kimliği ve kullanıcı beklentisine göre tasarım sistemi kurulur.", type: "single", options: [option("Sıfırdan özgün premium tasarım", "custom", 18000), option("Mevcut kurumsal kimliğe uyarlama", "brand", 9000), option("Hazır tasarımı geliştirme", "provided", 0), option("Tasarım sistemi / component library", "design-system", 24000), option("Önce kreatif yön çalışması", "direction", 12000)] },
      { key: "contentProduction", title: "İçerik tarafını nasıl yönetelim?", subtitle: "Metin, görsel ve medya üretim kapsamını seç.", type: "multi", options: [option("İçerikler tamamen hazır", "ready", 0), option("SEO uyumlu metin yazımı", "copy", 12000), option("Ürün / hizmet içerik girişi", "entry", 9000), option("Kurumsal fotoğraf çekimi", "photo", 18000), option("Video prodüksiyon", "video", 28000), option("Görsel tasarım / infografik", "graphics", 12000), option("Çeviri / çok dilli içerik", "translation", 12000), option("İçerik stratejisi", "strategy", 10000)] },
      { key: "growth", title: "Yayın sonrası büyüme katmanları", subtitle: "Teknik teslimin ötesinde yönetmemizi istediğin alanları seç.", type: "multi", options: [option("Teknik SEO", "technical-seo", 10000), option("Yerel SEO", "local-seo", 8000), option("İçerik / blog altyapısı", "content-seo", 12000), option("Google Search Console", "search-console", 3000), option("GA4 ve dönüşüm ölçümü", "analytics", 6000), option("Google / Meta reklam kurulumu", "ads", 10000), option("A/B test ve dönüşüm optimizasyonu", "cro", 14000), option("CRM / e-posta otomasyonu", "automation", 14000), option("Aylık bakım ve büyüme", "monthly", 18000), option("Yalnız proje teslimi", "delivery", 0)] },
      { key: "infrastructure", title: "Teknik işletim ve destek beklentisi", subtitle: "Yayın, güvenlik, bakım ve sahiplik modelini seç.", type: "multi", options: [option("Domain ve DNS kurulumu", "domain", 3000), option("Hosting / cloud kurulumu", "hosting", 6000), option("Firebase / veritabanı", "firebase", 9000), option("Yedekleme ve izleme", "monitoring", 7000), option("Güvenlik sertleştirme", "security", 9000), option("KVKK / cookie consent teknik kurulumu", "privacy", 7000), option("Ekip eğitimi ve dokümantasyon", "training", 8000), option("Yayın sonrası 30 gün destek", "support-30", 6000), option("Aylık teknik bakım", "maintenance", 12000)] },
      { key: "timeline", title: "Ne zaman yayına çıkmak istiyorsunuz?", subtitle: "Gerçekçi takvimi kapsamla birlikte doğrulayacağız.", type: "single", options: [option("Acil / 2–4 hafta", "urgent", 25000), option("1–2 ay", "1-2m", 10000), option("2–4 ay", "2-4m", 0), option("4+ ay / esnek", "flexible", 0), option("Önce keşif ve yol haritası", "roadmap", 5000)] },
      { key: "budget", title: "Planlanan yatırım aralığı nedir?", subtitle: "Doğru çözümü doğru fazlara ayırabilmemiz için gereklidir.", type: "single", options: [option("25.000–50.000 TL", "25-50"), option("50.000–100.000 TL", "50-100"), option("100.000–250.000 TL", "100-250"), option("250.000–500.000 TL", "250-500"), option("500.000 TL+", "500+"), option("Henüz bütçe belirlenmedi", "unknown")] },
      { key: "references", title: "Referans, mevcut site veya doküman bağlantıları", subtitle: "Birden fazla bağlantıyı alt alta yazabilirsin.", type: "textarea", optional: true, placeholder: "Mevcut web sitesi, beğendiğiniz örnekler, brief veya dosya bağlantıları..." },
      { key: "details", title: "Listede olmayan özel ihtiyaçlar", subtitle: "İş modelini, hedefi veya özel modülü kendi cümlelerinle anlat.", type: "textarea", optional: true, placeholder: "Proje hakkında bilmemiz gereken diğer detaylar..." },
    ],
  },
  video: {
    label: "Video & Film Prodüksiyon Teklif Motoru",
    shortLabel: "Video & Film",
    basePrice: 18000,
    questions: [
      { key: "productionTypes", title: "Hangi prodüksiyonları planlıyoruz?", subtitle: "Bir kampanyada birden fazla içerik türü seçebilirsin.", type: "multi", options: [option("Reklam filmi", "commercial", 28000), option("Marka filmi", "brand-film", 26000), option("Kurumsal tanıtım filmi", "corporate", 22000), option("Ürün / hizmet tanıtımı", "product", 16000), option("Sosyal medya Reels / Shorts", "social", 14000), option("Etkinlik / lansman", "event", 18000), option("Röportaj / başarı hikâyesi", "interview", 12000), option("Eğitim / anlatım videosu", "training", 14000), option("Müzik klibi", "music", 24000), option("Gayrimenkul / mekân filmi", "real-estate", 16000), option("Drone / FPV filmi", "drone", 14000), option("Canlı yayın / podcast", "live", 18000), option("Fotoğraf + video hibrit çekim", "hybrid", 24000), option("Diğer özel prodüksiyon", "other", 12000)] },
      { key: "goals", title: "Filmin temel hedefleri neler?", subtitle: "Yaratıcı fikir ve ölçüm planı bu hedeflere göre şekillenir.", type: "multi", options: [option("Marka bilinirliği", "awareness"), option("Satış / dönüşüm", "sales"), option("Ürün veya hizmet anlatımı", "explain"), option("Lansman / kampanya", "launch"), option("İşe alım / işveren markası", "employer"), option("Yatırımcı / kurumsal iletişim", "corporate"), option("Sosyal medya etkileşimi", "engagement"), option("Etkinlik kaydı", "event"), option("Arşiv / belgesel değer", "documentary")] },
      { key: "audience", title: "Kimi etkilemek istiyoruz?", subtitle: "Hedef kitle anlatım dili, tempo ve dağıtım formatını belirler.", type: "multi", options: [option("Son tüketici", "consumer"), option("Kurumsal karar vericiler", "b2b"), option("Genç / sosyal medya kitlesi", "young"), option("Mevcut müşteriler", "customers"), option("Çalışanlar / adaylar", "employees"), option("Yatırımcılar", "investors"), option("Yerel hedef kitle", "local"), option("Uluslararası izleyici", "global")] },
      { key: "channels", title: "İçerikler nerede yayınlanacak?", subtitle: "Her kanal için doğru kadraj, süre ve teslim standardı oluştururuz.", type: "multi", options: [option("Instagram", "instagram"), option("TikTok", "tiktok"), option("YouTube", "youtube"), option("LinkedIn", "linkedin"), option("Web sitesi", "website"), option("Google / Meta reklamları", "ads"), option("TV / sinema", "broadcast", 12000), option("Fuar / LED ekran", "event-screen", 6000), option("Kurumsal sunum / iç iletişim", "internal"), option("Henüz net değil", "unknown")] },
      { key: "deliverables", title: "Teslim paketi nasıl olmalı?", subtitle: "Ana film ve tüm varyasyonları birlikte seç.", type: "multi", options: [option("1 ana film", "main", 0), option("15–30 sn kısa versiyonlar", "short", 8000), option("6–10 sn reklam cutdown'ları", "cutdowns", 7000), option("Dikey Reels / Shorts", "vertical", 7000), option("Yatay 16:9 versiyon", "horizontal", 4000), option("Kare 1:1 versiyon", "square", 4000), option("Teaser / fragman", "teaser", 7000), option("Bölümlü video serisi", "series", 24000), option("Ham görüntü teslimi", "raw", 8000), option("Fotoğraf kareleri / set fotoğrafı", "stills", 12000), option("Altyazılı varyasyonlar", "subtitled", 5000), option("Çok dilli versiyonlar", "multilingual", 10000)] },
      { key: "duration", title: "Ana içeriklerin hedef süresi", subtitle: "Birden fazla süre gerekiyorsa en kapsamlı seçeneği seç.", type: "single", options: [option("6–15 saniye", "6-15"), option("15–30 saniye", "15-30", 3000), option("30–60 saniye", "30-60", 6000), option("1–3 dakika", "1-3", 12000), option("3–10 dakika", "3-10", 22000), option("10+ dakika / seri", "10+", 36000), option("Kreatif öneriye açığım", "recommend")] },
      { key: "productionScale", title: "Çekim ölçeğini nasıl öngörüyorsunuz?", subtitle: "Lokasyon ve gün sayısı bütçe ile ekip planının ana girdisidir.", type: "single", options: [option("2–4 saat / tek lokasyon", "micro", 0), option("Yarım gün / tek lokasyon", "half", 6000), option("Tam gün / 1–2 lokasyon", "full", 14000), option("2–3 çekim günü", "multi", 38000), option("4+ gün / çoklu şehir", "enterprise", 70000), option("Keşif sonrası belirlensin", "discovery", 5000)] },
      { key: "locations", title: "Lokasyon ve seyahat durumu", subtitle: "Stüdyo, saha ve şehir bilgilerini seç; ayrıntıyı son notlarda yazabilirsin.", type: "multi", options: [option("Müşteri lokasyonu", "client"), option("Dış mekân", "outdoor", 4000), option("Stüdyo", "studio", 12000), option("Özel dekor / set", "set", 18000), option("Fethiye / Muğla içi", "istanbul"), option("Muğla dışı", "domestic", 12000), option("Birden fazla şehir", "multi-city", 24000), option("Yurt dışı", "international", 40000), option("Lokasyon bulma gerekli", "scouting", 8000), option("İzin süreçleri gerekli", "permits", 6000)] },
      { key: "creative", title: "Kreatif ve pre-prodüksiyon kapsamı", subtitle: "Hazır olanları değil, Dromocob'un üstlenmesini istediklerini seç.", type: "multi", options: [option("Kreatif konsept", "concept", 10000), option("Senaryo / metin", "script", 9000), option("Storyboard / shot list", "storyboard", 8000), option("Moodboard / görsel dil", "moodboard", 5000), option("Prodüksiyon planı", "plan", 5000), option("Lokasyon keşfi", "scouting", 7000), option("Casting / oyuncu", "casting", 18000), option("Styling / kostüm", "styling", 12000), option("Sanat yönetimi / dekor", "art", 16000), option("Makyaj / saç", "makeup", 8000), option("Hazır brief ve senaryo var", "ready", 0)] },
      { key: "capture", title: "Çekimde hangi üretim katmanları gerekli?", subtitle: "Setin teknik yapısını birlikte kuruyoruz.", type: "multi", options: [option("Sony FX3 sinema kamera sistemi", "cinema-camera", 0), option("Çoklu kamera", "multi-camera", 12000), option("DJI RS 4 gimbal", "gimbal", 4000), option("Sinematik drone", "drone", 8000), option("FPV / Avata 2", "fpv", 10000), option("Profesyonel ışık kurulumu", "lighting", 9000), option("Kablosuz yaka mikrofonu", "wireless-audio", 4000), option("Boom / ortam sesi", "boom", 6000), option("Teleprompter", "teleprompter", 5000), option("Green screen", "green-screen", 10000), option("Ürün masaüstü setup", "tabletop", 9000), option("Time-lapse / özel hareket", "special", 7000)] },
      { key: "postProduction", title: "Post-prodüksiyonda neler olmalı?", subtitle: "Kurgu sonrası tüm yaratıcı ve teknik teslimleri seç.", type: "multi", options: [option("Profesyonel kurgu", "edit", 0), option("Color grading", "color", 6000), option("Ses temizleme ve miksaj", "sound", 5000), option("Müzik lisanslama", "music", 4000), option("Motion graphics", "motion", 12000), option("2D animasyon", "2d", 18000), option("3D / ürün animasyonu", "3d", 35000), option("VFX / compositing", "vfx", 22000), option("Logo animasyonu", "logo", 7000), option("Profesyonel seslendirme", "voiceover", 9000), option("Altyazı", "subtitles", 4000), option("Çeviri / dublaj", "localization", 12000), option("Platformlara yükleme desteği", "publishing", 4000)] },
      { key: "assets", title: "Marka ve içerik hazırlığı ne durumda?", subtitle: "Eksik materyalleri prodüksiyon planına ekleyelim.", type: "multi", options: [option("Logo ve kurumsal kimlik hazır", "brand-ready"), option("Ürün / mekân hazır", "product-ready"), option("Senaryo / brief hazır", "brief-ready"), option("Oyuncular / konuşmacılar hazır", "talent-ready"), option("Referans videolar hazır", "references-ready"), option("Hiçbiri hazır değil", "none", 8000), option("Ön görüşmede paylaşacağım", "later")] },
      { key: "usage", title: "Yayın ve kullanım hakları kapsamı", subtitle: "Medya satın alma, oyuncu ve müzik lisanslarını doğru planlamak için.", type: "multi", options: [option("Organik sosyal medya", "organic"), option("Dijital reklam", "digital-ads", 6000), option("TV / sinema yayını", "broadcast", 15000), option("Web sitesi / kurumsal kullanım", "corporate"), option("Türkiye kullanım hakkı", "turkey"), option("Global kullanım hakkı", "global", 12000), option("Süresiz kullanım", "perpetual", 10000), option("Henüz belirlenmedi", "unknown")] },
      { key: "timeline", title: "Çekim ve teslim beklentisi", subtitle: "Takvim, ekip uygunluğu ve post-prodüksiyon yoğunluğuyla doğrulanır.", type: "single", options: [option("Acil / 7–10 gün", "urgent", 22000), option("2–3 hafta", "2-3w", 9000), option("1–2 ay", "1-2m", 0), option("2+ ay / esnek", "flexible", 0), option("Kampanya tarihi kesin", "fixed", 8000)] },
      { key: "budget", title: "Planlanan prodüksiyon bütçesi", subtitle: "Kreatif fikri uygulanabilir ölçeğe yerleştirebilmek için.", type: "single", options: [option("20.000–40.000 TL", "20-40"), option("40.000–80.000 TL", "40-80"), option("80.000–150.000 TL", "80-150"), option("150.000–300.000 TL", "150-300"), option("300.000 TL+", "300+"), option("Henüz bütçe belirlenmedi", "unknown")] },
      { key: "references", title: "Brief, referans video veya marka bağlantıları", subtitle: "YouTube, Vimeo, Drive veya web bağlantılarını alt alta yazabilirsin.", type: "textarea", optional: true, placeholder: "Referanslar, marka sitesi, mevcut içerikler, brief bağlantısı..." },
      { key: "details", title: "Çekim hakkında bilmemiz gereken diğer detaylar", subtitle: "Şehir, tarih, ürün sayısı, konuşmacılar veya listede olmayan özel talepler.", type: "textarea", optional: true, placeholder: "Projeyi kendi cümlelerinizle anlatın..." },
    ],
  },
  "web-quick": {
    label: "Web Projesi Hızlı Kapsam",
    shortLabel: "Web Projesi",
    basePrice: 10000,
    questions: [
      { key: "type", title: "Ne yapıyoruz?", subtitle: "En yakın seçeneği seç.", type: "single", options: [option("Kurumsal web sitesi", "corporate"), option("E-ticaret", "commerce", 35000), option("Landing page", "landing"), option("Özel web uygulaması", "custom", 55000)] },
      { key: "goal", title: "Ana hedef ne?", subtitle: "Önceliğini seç.", type: "single", options: [option("Müşteri kazanmak", "lead", 5000), option("Online satış", "sales", 18000), option("Markayı güçlendirmek", "brand", 4000), option("İşi dijitalleştirmek", "operation", 22000)] },
      { key: "features", title: "Neler gerekli?", subtitle: "Birden fazla seçebilirsin.", type: "multi", options: [option("Yönetim paneli", "admin", 18000), option("Üyelik", "auth", 18000), option("Ödeme", "payment", 28000), option("Teklif / rezervasyon", "quote", 22000), option("SEO altyapısı", "seo", 10000)] },
      { key: "timeline", title: "Ne zaman hazır olsun?", subtitle: "Yaklaşık süre yeterli.", type: "single", options: [option("2–4 hafta", "urgent", 20000), option("1–2 ay", "normal", 8000), option("2+ ay", "flexible"), option("Henüz net değil", "unknown")] },
      { key: "note", title: "Kısaca anlatır mısın?", subtitle: "Bir iki cümle yeterli.", type: "textarea", optional: true, placeholder: "Projenin en önemli ihtiyacı..." },
    ],
  },
  "video-quick": {
    label: "Prodüksiyon Hızlı Kapsam",
    shortLabel: "Video Prodüksiyon",
    basePrice: 18000,
    questions: [
      { key: "type", title: "Ne çekiyoruz?", subtitle: "İçerik türünü seç.", type: "single", options: [option("Tanıtım filmi", "corporate", 22000), option("Reklam filmi", "commercial", 28000), option("Reels / kısa video", "social", 14000), option("Etkinlik", "event", 18000)] },
      { key: "place", title: "Çekim nerede?", subtitle: "Yaklaşık konum yeterli.", type: "single", options: [option("Fethiye / Muğla", "local"), option("Başka şehir", "domestic", 12000), option("Stüdyo", "studio", 12000), option("Henüz belli değil", "unknown")] },
      { key: "extras", title: "Neler ekleyelim?", subtitle: "İstediğin kadar seç.", type: "multi", options: [option("Drone", "drone", 8000), option("Fotoğraf", "photo", 12000), option("Oyuncu / model", "talent", 18000), option("Motion grafik", "motion", 12000), option("Dikey versiyonlar", "vertical", 7000)] },
      { key: "timeline", title: "Teslim ne zaman?", subtitle: "Takvimi seç.", type: "single", options: [option("7–10 gün", "urgent", 18000), option("2–3 hafta", "normal", 7000), option("1+ ay", "flexible"), option("Net değil", "unknown")] },
      { key: "note", title: "Aklındaki fikir ne?", subtitle: "Kısaca yazabilirsin.", type: "textarea", optional: true, placeholder: "Filmde görmek istediğin ana fikir..." },
    ],
  },
  "drone-quick": {
    label: "Drone Operasyonu Hızlı Kapsam",
    shortLabel: "Drone Çekimi",
    basePrice: 10000,
    questions: [
      { key: "shot", title: "Nasıl bir çekim?", subtitle: "Uçuş stilini seç.", type: "single", options: [option("Sinematik drone", "cinematic"), option("FPV dinamik çekim", "fpv", 8000), option("Haritalama / inceleme", "survey", 12000), option("Emin değilim", "unknown")] },
      { key: "subject", title: "Neyi çekiyoruz?", subtitle: "Ana konuyu seç.", type: "single", options: [option("Otel / villa", "hospitality"), option("Emlak / inşaat", "real-estate"), option("Etkinlik", "event", 5000), option("Marka / ürün", "brand", 7000)] },
      { key: "location", title: "Uçuş nerede?", subtitle: "Bölge yeterli.", type: "single", options: [option("Fethiye", "fethiye"), option("Muğla geneli", "mugla", 3000), option("Başka şehir", "other", 12000), option("Henüz belli değil", "unknown")] },
      { key: "delivery", title: "Ne teslim edelim?", subtitle: "Birden fazla seçebilirsin.", type: "multi", options: [option("Kurgulu film", "edit", 8000), option("Ham görüntü", "raw", 3000), option("Reels versiyonu", "reels", 5000), option("Fotoğraf kareleri", "stills", 4000)] },
      { key: "date", title: "Çekim ne zaman?", subtitle: "Yaklaşık tarih yeterli.", type: "text", placeholder: "Örn. Eylülün ikinci haftası" },
    ],
  },
  "growth-quick": {
    label: "Büyüme Sistemi Hızlı Kapsam",
    shortLabel: "SEO & Reklam",
    basePrice: 10000,
    questions: [
      { key: "channel", title: "Nerede büyüyelim?", subtitle: "Ana kanalı seç.", type: "single", options: [option("Google SEO", "seo"), option("Google Ads", "google", 5000), option("Meta reklamları", "meta", 5000), option("Hepsi birlikte", "all", 15000)] },
      { key: "goal", title: "Hedef ne?", subtitle: "Tek öncelik seç.", type: "single", options: [option("Daha fazla müşteri", "lead"), option("Daha fazla satış", "sales"), option("Yerelde görünürlük", "local"), option("Marka bilinirliği", "brand")] },
      { key: "state", title: "Şu an durum nasıl?", subtitle: "En yakın seçeneği seç.", type: "single", options: [option("Yeni başlıyoruz", "new"), option("Reklamlar aktif", "active"), option("SEO çalışması var", "seo-active"), option("Analiz gerekli", "audit", 5000)] },
      { key: "budget", title: "Aylık bütçe?", subtitle: "Yaklaşık aralık yeterli.", type: "single", options: [option("10–25 bin TL", "10-25"), option("25–50 bin TL", "25-50"), option("50 bin TL+", "50+"), option("Henüz net değil", "unknown")] },
      { key: "site", title: "Web sitesi veya hesap", subtitle: "Varsa bağlantıyı bırak.", type: "text", optional: true, placeholder: "https://... veya @hesap" },
    ],
  },
  "apps-quick": {
    label: "Dijital Ürün Hızlı Kapsam",
    shortLabel: "Uygulama",
    basePrice: 35000,
    questions: [
      { key: "type", title: "Ne geliştiriyoruz?", subtitle: "Ürün türünü seç.", type: "single", options: [option("Mobil uygulama", "mobile", 30000), option("Web uygulaması", "web", 20000), option("Müşteri paneli", "portal", 18000), option("İç operasyon aracı", "internal", 22000)] },
      { key: "users", title: "Kim kullanacak?", subtitle: "Ana kullanıcıyı seç.", type: "single", options: [option("Müşteriler", "customers"), option("Çalışanlar", "team"), option("Bayiler", "dealers", 8000), option("Herkes", "public", 5000)] },
      { key: "core", title: "En önemli özellik?", subtitle: "Birden fazla seçebilirsin.", type: "multi", options: [option("Üyelik", "auth", 10000), option("Ödeme", "payment", 15000), option("Rezervasyon", "booking", 12000), option("Mesajlaşma", "chat", 10000), option("Raporlama", "reports", 12000)] },
      { key: "stage", title: "Hangi aşamadasın?", subtitle: "Mevcut durumu seç.", type: "single", options: [option("Sadece fikir var", "idea"), option("Tasarım hazır", "design"), option("Çalışan ürün var", "existing"), option("Önce keşif gerekli", "discovery", 5000)] },
      { key: "note", title: "Ürünü tek cümleyle anlat", subtitle: "Kısa olması yeterli.", type: "textarea", placeholder: "Kullanıcı ... yapabilecek." },
    ],
  },
  "project-quick": {
    label: "Yeni Proje Hızlı Kapsam",
    shortLabel: "Yeni Proje",
    basePrice: 10000,
    questions: [
      { key: "area", title: "Hangi alanda?", subtitle: "Başlangıç noktasını seç.", type: "single", options: [option("Web & yazılım", "web"), option("Film & video", "video", 8000), option("SEO & reklam", "growth"), option("Hepsi birlikte", "integrated", 30000)] },
      { key: "goal", title: "Ne başarmalı?", subtitle: "Ana sonucu seç.", type: "single", options: [option("Müşteri kazandırmalı", "lead"), option("Satış artırmalı", "sales"), option("Markayı yenilemeli", "brand"), option("Süreci hızlandırmalı", "operation")] },
      { key: "stage", title: "Nereden başlıyoruz?", subtitle: "Mevcut durumu seç.", type: "single", options: [option("Sıfırdan", "new"), option("Mevcut işi geliştiriyoruz", "improve"), option("Fikir hazır", "brief"), option("Keşif gerekli", "discovery", 5000)] },
      { key: "timeline", title: "Ne zaman başlayalım?", subtitle: "Yaklaşık tarih yeterli.", type: "single", options: [option("Hemen", "now", 8000), option("1 ay içinde", "month"), option("1–3 ay", "quarter"), option("Henüz net değil", "unknown")] },
      { key: "note", title: "Projeyi kısaca anlat", subtitle: "Bir iki cümle yeterli.", type: "textarea", optional: true, placeholder: "Hedefin ve en önemli ihtiyacın..." },
    ],
  },
  "fethiye-quick": {
    label: "Fethiye İşletme Hızlı Kapsam",
    shortLabel: "Fethiye Projesi",
    basePrice: 10000,
    questions: [
      { key: "business", title: "İşletmen hangi alanda?", subtitle: "Sektörünü seç.", type: "single", options: [option("Otel / villa", "hotel"), option("Restoran", "restaurant"), option("Tur / aktivite", "tour"), option("Emlak / inşaat", "real-estate"), option("Diğer", "other")] },
      { key: "need", title: "Neye ihtiyacın var?", subtitle: "Birden fazla seçebilirsin.", type: "multi", options: [option("Web sitesi", "web"), option("Drone / video", "video", 8000), option("Google görünürlüğü", "seo", 6000), option("Reklam yönetimi", "ads", 6000)] },
      { key: "goal", title: "Hedefin ne?", subtitle: "Ana hedefi seç.", type: "single", options: [option("Daha fazla rezervasyon", "booking"), option("Daha fazla müşteri", "lead"), option("Yabancı turiste ulaşmak", "tourist", 5000), option("Markayı yenilemek", "brand")] },
      { key: "start", title: "Ne zaman başlayalım?", subtitle: "Yaklaşık süre yeterli.", type: "single", options: [option("Hemen", "now", 5000), option("Bu ay", "month"), option("Sezon öncesi", "season"), option("Henüz net değil", "unknown")] },
      { key: "place", title: "İşletmen nerede?", subtitle: "Bölge veya mahalle yeterli.", type: "text", placeholder: "Örn. Ölüdeniz, Çalış, Göcek" },
    ],
  },
  "equipment-quick": {
    label: "Kamera Ekipmanı Hızlı Plan",
    shortLabel: "Ekipman & Çekim",
    basePrice: 10000,
    questions: [
      { key: "purpose", title: "Ne çekeceksin?", subtitle: "Kullanım alanını seç.", type: "single", options: [option("Reklam / marka filmi", "commercial"), option("Sosyal medya", "social"), option("Etkinlik", "event"), option("Drone çekimi", "drone")] },
      { key: "need", title: "Neye ihtiyacın var?", subtitle: "Birden fazla seçebilirsin.", type: "multi", options: [option("Kamera", "camera"), option("Lens", "lens"), option("Işık", "light"), option("Ses", "audio"), option("Gimbal / drone", "motion", 5000)] },
      { key: "model", title: "Çalışma şekli?", subtitle: "Sana uygun olanı seç.", type: "single", options: [option("Ekiple tam prodüksiyon", "production", 15000), option("Operatör desteği", "operator", 8000), option("Ekipman danışmanlığı", "consulting"), option("Henüz bilmiyorum", "unknown")] },
      { key: "date", title: "Ne zaman gerekli?", subtitle: "Yaklaşık tarih yeterli.", type: "text", placeholder: "Örn. 20–22 Eylül" },
      { key: "note", title: "Özel bir detay var mı?", subtitle: "Varsa kısaca yaz.", type: "textarea", optional: true, placeholder: "Lokasyon, çekim süresi veya özel ekipman..." },
    ],
  },
};
