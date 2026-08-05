import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Restoran Tanıtım Filmi | Yeme-İçme Mekan Çekimi | Türkiye",
  description: "Restoran, kafe ve yeme-içme mekanları için profesyonel tanıtım filmi. Yemek çekimi, atmosfer videosu, drone ve sosyal medya içerik üretimi. Dromocob.",
  path: "/restoran-tanitimi",
  keywords: ["restoran tanıtım filmi", "restoran tanıtım videosu", "kafe tanıtım filmi", "yemek çekimi", "restoran video çekimi", "mekan tanıtım videosu", "restoran sosyal medya", "yeme içme çekimi", "restoran drone çekimi", "İstanbul restoran çekimi", "Fethiye restoran çekimi"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/restoran-tanitimi#service`, name: "Restoran Tanıtım Filmi ve Yeme-İçme Mekan Çekimi", serviceType: "Restoran tanıtım filmi, yemek çekimi ve mekan video prodüksiyonu", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/restoran-tanitimi"), description: "Restoran, kafe ve yeme-içme mekanları için sinematik tanıtım filmi, yemek çekimi ve sosyal medya prodüksiyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function RestoranTanitimiPage() {
  return <ServiceLanding quoteService="video" path="/restoran-tanitimi" breadcrumbLabel="Restoran Tanıtımı" eyebrow="Restoran tanıtımı · Yemek çekimi · Türkiye" title="Menüyü" accent="ekrana taşı." intro="Restoran, kafe ve yeme-içme mekanlarınızı sinematik tanıtım filmi, profesyonel yemek çekimi, atmosfer videosu ve sosyal medya içerikleriyle müşterilere en iştah açıcı şekilde sunuyoruz." schema={schema} faqs={[
    { question: "Restoran tanıtım filmi çekimi ne kadar sürer?", answer: "Tek lokasyonlu bir çekim genellikle yarım veya tam gün sürer. Yemek hazırlık planları dahil edilirse süre uzayabilir. Kesin takvim proje başında paylaşılır." },
    { question: "Yemek çekimi ayrı mı yapılıyor?", answer: "Restoran tanıtım filmi içinde yemek planları standart olarak dahildir. Ayrıca menü kataloğu için detaylı yemek fotoğrafı ve video çekimi de yapılabilir." },
    { question: "Çekim sırasında restoran açık olabilir mi?", answer: "Evet. İş akışını en az etkileyecek şekilde çekim planı hazırlarız. Gerekirse sessiz saatlerde veya kapanış sonrası çalışabiliriz." },
    { question: "Drone çekimi de yapılıyor mu?", answer: "Evet. Restoranın konumunu, dış mekanını ve çevresini gösteren drone çekimleri prodüksiyona eklenebilir." },
    { question: "Sosyal medya içerikleri de teslim ediliyor mu?", answer: "Evet. Ana filmin yanı sıra Instagram Reels, TikTok, YouTube Shorts ve Story formatlarında kısa içerikler üretilebilir." },
    { question: "Hangi tür mekanlar için çekim yapıyorsunuz?", answer: "Restoran, kafe, bistro, bar, pastane, fırın, otel restoranı ve her türlü yeme-içme mekanı için tanıtım çekimi yapıyoruz." },
  ]} mediaEyebrow="Food & venue production" mediaTitle="Restoran çekim setimiz." media={[
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Yemek detayları ve mekan atmosferi için sinematik görüntü.", alt: "Sony FX3 ile restoran sinematik çekim" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Cinema Lighting", detail: "Restoran atmosferini koruyan kontrollü ışık düzeni.", alt: "Restoran çekimi profesyonel ışık sistemi" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Mekan turu ve servis planları için akıcı kamera hareketi.", alt: "DJI RS 4 gimbal ile restoran iç mekan çekimi" },
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Restoranın dış mekanını ve konumunu gösteren hava çekimi.", alt: "DJI Mini 5 Pro drone ile restoran dış mekan çekimi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Bodrum", "Alanya", "Trabzon"]} services={[
    { title: "Restoran tanıtım filmi", description: "Mekanın atmosferini, mutfağını ve servis deneyimini anlatan sinematik tanıtım filmi." },
    { title: "Profesyonel yemek çekimi", description: "Menü öğelerinin iştah açıcı ve satış odaklı profesyonel video ve fotoğraf çekimi." },
    { title: "Atmosfer ve mekan videosu", description: "Restoranın ambiyansını, iç tasarımını ve müşteri deneyimini gösteren görüntüler." },
    { title: "Sosyal medya adaptasyonları", description: "Reels, Shorts ve Story formatlarında paylaşıma hazır kısa içerikler." },
  ]} process={[
    { title: "Mekan keşfi", description: "Restoranın iç ve dış mekanını, ışık koşullarını ve öne çıkan yemekleri belirleriz." },
    { title: "Çekim planı", description: "Yemek hazırlığı, servis, mekan turu ve drone planlarını zamanlama ile birlikte hazırlarız." },
    { title: "Prodüksiyon", description: "İş akışını bozmadan profesyonel çekimi tamamlarız." },
    { title: "Teslim", description: "Kurgu, renk, müzik ve platform adaptasyonlarıyla yayın paketini hazırlarız." },
  ]}/>;
}
