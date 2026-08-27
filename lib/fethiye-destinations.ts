export type FethiyeDestination = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  description: string;
  longDescription: string[];
  image: string;
  imageAlt: string;
  coordinates: { latitude: number; longitude: number };
  distance: string;
  idealTime: string;
  duration: string;
  character: string;
  highlights: string[];
  tips: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const fethiyeDestinations: FethiyeDestination[] = [
  {
    slug: "oludeniz",
    name: "Ölüdeniz Gezi Rehberi",
    shortName: "Ölüdeniz",
    eyebrow: "LAGÜN / DENİZ / YAMAÇ PARAŞÜTÜ",
    description: "Turkuaz lagün, Babadağ ve gün boyu değişen Akdeniz mavisiyle Fethiye’nin dünyaya açılan ikonik kıyısı.",
    longDescription: [
      "Ölüdeniz; Kumburnu’nun koruduğu sakin lagünü, Belcekız kıyısı ve Babadağ’dan süzülen yamaç paraşütleriyle Fethiye’nin en tanınan rotasıdır. Deniz, doğa ve yüksekten manzara deneyimini aynı gün içinde birleştirir.",
      "Sabahın erken saatleri daha sakin bir kıyı deneyimi sunar. Gün ortasında deniz renkleri belirginleşir; gün batımına yaklaşırken Babadağ ve kıyı hattı fotoğraf için daha yumuşak bir ışığa kavuşur.",
    ],
    image: "/images/fethiye/oludeniz-cinematic.jpg",
    imageAlt: "Ölüdeniz lagünü ve Babadağ'ın sinematik havadan görünümü",
    coordinates: { latitude: 36.5481, longitude: 29.115 },
    distance: "Fethiye merkezden yaklaşık 14 km",
    idealTime: "Nisan–Ekim · sabah 08.00–10.30",
    duration: "Yarım gün / tam gün",
    character: "İkonik kıyı",
    highlights: ["Kumburnu Tabiat Parkı", "Belcekız Plajı", "Babadağ teleferik ve yamaç paraşütü", "Tekne rotaları"],
    tips: ["Yoğun sezonda erken saatte yola çık.", "Lagün ve açık deniz tarafını birlikte keşfet.", "Rüzgâr ve aktivite koşullarını işletmelerden güncel olarak doğrula."],
    faqs: [
      { question: "Ölüdeniz’e Fethiye merkezden nasıl gidilir?", answer: "Ölüdeniz, Fethiye merkezden kara yoluyla yaklaşık 14 kilometre uzaklıktadır. Minibüs, taksi veya özel araçla ulaşılabilir; yaz sezonunda trafik için ek süre ayırmak iyi olur." },
      { question: "Ölüdeniz için en iyi saat hangisi?", answer: "Daha sakin bir deneyim için sabah erken saatler; fotoğraf ve gün batımı atmosferi için öğleden sonra tercih edilebilir." },
    ],
  },
  {
    slug: "faralya",
    name: "Faralya Gezi Rehberi",
    shortName: "Faralya",
    eyebrow: "LİKYA YOLU / VADİ / GÜN BATIMI",
    description: "Kelebekler Vadisi’nin üzerinde, Likya Yolu ile Akdeniz uçurumlarının birleştiği sakin ve vahşi rota.",
    longDescription: [
      "Faralya, resmî adıyla Uzunyurt; Babadağ’ın güney eteklerinde, Kelebekler Vadisi’nin üzerinde konumlanan dağınık bir kıyı yerleşimidir. Likya Yolu yürüyüşçüleri, gün batımı izleyenler ve doğayla baş başa kalmak isteyenler için güçlü bir duraktır.",
      "Bölgede mesafeler kısa görünse de arazi eğimli ve yollar virajlıdır. Rota planını gün ışığına, mevsime ve yürüyüş deneyimine göre yapmak; sarp patikalarda işaretli güzergâhtan ayrılmamak gerekir.",
    ],
    image: "/images/fethiye/faralya-cinematic.jpg",
    imageAlt: "Faralya kıyıları, Likya Yolu ve Akdeniz uçurumları",
    coordinates: { latitude: 36.4959, longitude: 29.1277 },
    distance: "Fethiye merkezden yaklaşık 25 km",
    idealTime: "Nisan–Haziran / Eylül–Kasım",
    duration: "Tam gün / 1 gece",
    character: "Yavaş keşif",
    highlights: ["Kelebekler Vadisi seyir hattı", "Likya Yolu", "Gün batımı noktaları", "Kabak rotasına geçiş"],
    tips: ["Sarp kenarlarda güvenli mesafeyi koru.", "Yürüyüş için tabanı güçlü ayakkabı ve su taşı.", "Konaklama ve ulaşımı sezonda önceden teyit et."],
    faqs: [
      { question: "Faralya ile Kelebekler Vadisi aynı yer mi?", answer: "Hayır. Faralya, vadinin üst kısmındaki geniş yerleşim bölgesidir; Kelebekler Vadisi ise sarp yamaçların arasında denize açılan ayrı bir doğal alandır." },
      { question: "Faralya günübirlik gezilir mi?", answer: "Evet; ancak manzara, yürüyüş ve gün batımını acele etmeden deneyimlemek için tam gün ayırmak daha uygundur." },
    ],
  },
  {
    slug: "kabak-koyu",
    name: "Kabak Koyu Gezi Rehberi",
    shortName: "Kabak Koyu",
    eyebrow: "KOY / KAMP / DOĞA",
    description: "Çam ormanlarının denize indiği, patika ve koy yaşamının ritmi yavaşlattığı Faralya’nın saklı kıyısı.",
    longDescription: [
      "Kabak Koyu, Faralya hattının güneyinde çam ormanlarıyla çevrili bir vadi tabanında yer alır. Küçük plajı, yürüyüş bağlantıları ve doğa odaklı konaklama kültürüyle kalabalıktan uzaklaşmak isteyenlerin rotasıdır.",
      "Koya erişim koşulları işletme servisi, patika veya deniz ulaşımına göre değişebilir. Yağış, sıcaklık ve yol durumu deneyimi doğrudan etkilediği için hareket etmeden önce güncel ulaşım bilgisini doğrulamak önemlidir.",
    ],
    image: "/images/fethiye/kabak-koyu-cinematic.jpg",
    imageAlt: "Kabak Koyu'nun çam ormanları ve turkuaz denizle çevrili kıyısı",
    coordinates: { latitude: 36.4584, longitude: 29.1255 },
    distance: "Fethiye merkezden yaklaşık 30 km",
    idealTime: "Mayıs–Haziran / Eylül–Ekim",
    duration: "Tam gün / 1–2 gece",
    character: "Doğaya dönüş",
    highlights: ["Kabak Plajı", "Likya Yolu bağlantısı", "Orman içi konaklama", "Gün doğumu ve yıldız gözlemi"],
    tips: ["Hafif seyahat et; iniş-çıkış yorucu olabilir.", "Telefon çekimi ve ödeme seçenekleri için hazırlıklı ol.", "Ateş ve doğa koruma kurallarına kesinlikle uy."],
    faqs: [
      { question: "Kabak Koyu’na araçla inilir mi?", answer: "Ana yerleşimden kıyıya erişim her araç için uygun olmayabilir. İşletme servisleri veya yürüyüş patikaları kullanılabildiği için güncel durumu konaklama işletmesinden teyit edin." },
      { question: "Kabak Koyu’na ne kadar zaman ayrılmalı?", answer: "Günübirlik gezilebilir; koyun sakin ritmini ve çevredeki yürüyüşleri deneyimlemek için en az bir gece daha iyi bir seçenektir." },
    ],
  },
  {
    slug: "kayakoy",
    name: "Kayaköy Gezi Rehberi",
    shortName: "Kayaköy",
    eyebrow: "TARİH / TAŞ DOKU / KÜLTÜR",
    description: "Taş evlerin yamaç boyunca sessizce yükseldiği, Fethiye’nin yakın tarihini açık havada anlatan kültür rotası.",
    longDescription: [
      "Kayaköy, yamaç boyunca uzanan taş evleri, kilise kalıntıları ve patikalarıyla Fethiye’nin en etkileyici kültür duraklarından biridir. Alanı yalnızca fotoğraf noktası olarak değil, korunması gereken bir tarih katmanı olarak gezmek gerekir.",
      "Güneşin daha yatay geldiği sabah ve akşam saatleri taş dokuyu belirginleştirir. Açık alan ve düzensiz zemin nedeniyle rahat ayakkabı, su ve mevsime uygun koruma önemlidir.",
    ],
    image: "/images/fethiye/kayakoy-cinematic.jpg",
    imageAlt: "Kayaköy'ün tarihi taş evleri ve dağ yamacı",
    coordinates: { latitude: 36.5742, longitude: 29.0901 },
    distance: "Fethiye merkezden yaklaşık 8 km",
    idealTime: "Yıl boyu · sabah veya gün batımı öncesi",
    duration: "2–4 saat",
    character: "Açık hava hafızası",
    highlights: ["Tarihi taş evler", "Kilise yapıları", "Panoramik yamaç rotası", "Kayaköy–Ölüdeniz yürüyüş hattı"],
    tips: ["Tarihi yapılara zarar vermeden işaretli rotada kal.", "Yazın öğle sıcağından kaçın.", "Giriş ve ziyaret saatlerini güncel kaynaktan kontrol et."],
    faqs: [
      { question: "Kayaköy’ü gezmek ne kadar sürer?", answer: "Ana rotayı görmek yaklaşık iki saat sürebilir. Fotoğraf, tarih ve çevre yürüyüşleriyle birlikte yarım gün ayırmak daha rahattır." },
      { question: "Kayaköy çocuklarla gezilebilir mi?", answer: "Gezilebilir; ancak zemin yer yer taşlı ve eğimlidir. Çocukların yakın gözetimde olması ve uygun ayakkabı kullanması gerekir." },
    ],
  },
];

export function getFethiyeDestination(slug: string) {
  return fethiyeDestinations.find(destination => destination.slug === slug);
}
