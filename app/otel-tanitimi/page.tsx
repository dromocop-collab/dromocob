import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Otel Tanıtım Filmi | Konaklama Video Çekimi | Türkiye",
  description: "Otel, tatil köyü ve konaklama tesisleri için profesyonel tanıtım filmi. Drone çekimi, oda tanıtımı, tesis videosu ve sosyal medya içerik üretimi. Dromocob.",
  path: "/otel-tanitimi",
  keywords: ["otel tanıtım filmi", "otel tanıtım videosu", "konaklama video çekimi", "tatil köyü tanıtım filmi", "apart otel çekimi", "otel drone çekimi", "otel sosyal medya", "butik otel tanıtımı", "otel reklam filmi", "İstanbul otel çekimi", "Antalya otel çekimi", "Fethiye otel çekimi"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/otel-tanitimi#service`, name: "Otel Tanıtım Filmi ve Konaklama Video Çekimi", serviceType: "Otel tanıtım filmi, konaklama tesis çekimi ve turizm video prodüksiyonu", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/otel-tanitimi"), description: "Otel, tatil köyü ve konaklama tesisleri için sinematik tanıtım filmi, drone çekimi ve sosyal medya prodüksiyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function OtelTanitimiPage() {
  return <ServiceLanding quoteService="video" path="/otel-tanitimi" breadcrumbLabel="Otel Tanıtımı" eyebrow="Otel tanıtımı · Konaklama çekimi · Türkiye" title="Konuğu" accent="ekrandan davet et." intro="Otel, tatil köyü, butik otel ve konaklama tesislerinizi sinematik tanıtım filmi, profesyonel drone çekimi, oda ve tesis videosuyla konuklara en çekici şekilde sunuyoruz." schema={schema} faqs={[
    { question: "Otel tanıtım filmi çekimi ne kadar sürer?", answer: "Tek tesis için genellikle 1–2 gün sürer. Büyük tatil köyleri ve çoklu lokasyonlarda süre uzayabilir. Golden hour ve gece çekimleri dahil kesin takvim proje başında paylaşılır." },
    { question: "Oda tanıtım videosu ayrı mı çekiliyor?", answer: "Otel tanıtım filmi içinde oda planları standart dahildir. İsterseniz her oda tipini ayrı video ile tanıtan detaylı bir paket de oluşturulabilir." },
    { question: "Drone çekimi yapılıyor mu?", answer: "Evet. Otelin konumunu, havuz alanını, plajını, bahçesini ve çevresini gösteren sinematik drone planları çekiyoruz." },
    { question: "Otel açıkken çekim yapılabilir mi?", answer: "Evet. Operasyonu minimum etkileyecek şekilde çekim planı hazırlarız. Erken sabah veya sezon dışı dönemler tercih edilebilir." },
    { question: "Çok dilli tanıtım filmi yapılıyor mu?", answer: "Evet. Farklı dillerde seslendirme veya altyazı ile uluslararası pazarlara yönelik versiyonlar oluşturulabilir." },
    { question: "Sosyal medya formatları da teslim ediliyor mu?", answer: "Evet. Instagram Reels, TikTok, YouTube ve Booking.com gibi platformlar için uyarlanmış formatlar teslim edilebilir." },
  ]} mediaEyebrow="Hospitality production" mediaTitle="Otel çekim ekipmanlarımız." media={[
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Otel, havuz ve çevreyi gösteren sinematik hava çekimi.", alt: "DJI Mini 5 Pro drone ile otel havadan çekim" },
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Oda, lobi ve tesis detayları için sinematik görüntü.", alt: "Sony FX3 ile otel iç mekan sinematik çekim" },
    { src: "/images/services/dji-avata-2-fpv-drone.webp", title: "DJI Avata 2 FPV", detail: "Otel içine giren sürükleyici FPV tur planları.", alt: "DJI Avata 2 FPV drone ile otel iç tur çekimi" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Cinema Lighting", detail: "Oda ve lobi atmosferini koruyan profesyonel ışık.", alt: "Otel çekimi profesyonel sinema ışık sistemi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Bodrum", "Alanya", "Trabzon"]} services={[
    { title: "Otel tanıtım filmi", description: "Tesisin atmosferini, hizmet kalitesini ve konuk deneyimini anlatan sinematik film." },
    { title: "Oda ve tesis videosu", description: "Oda tipleri, restoran, spa, havuz ve ortak alanların detaylı tanıtım çekimi." },
    { title: "Drone ile hava çekimi", description: "Otelin konumunu, plajını, havuzunu ve çevresini gösteren profesyonel drone planları." },
    { title: "Sosyal medya ve platform adaptasyonları", description: "Booking, Airbnb, Instagram ve YouTube için optimize edilmiş video formatları." },
  ]} process={[
    { title: "Tesis keşfi", description: "Otelin mekanlarını, ışık koşullarını, güçlü yönlerini ve çekim noktalarını belirleriz." },
    { title: "Çekim planı", description: "Golden hour, gece, FPV ve iç mekan planlarını zamanlama ile birlikte hazırlarız." },
    { title: "Prodüksiyon", description: "Konuk deneyimini bozmadan profesyonel çekimi tamamlarız." },
    { title: "Teslim", description: "Kurgu, renk, ses, müzik ve platform formatlarıyla yayın paketini tamamlarız." },
  ]}/>;
}
