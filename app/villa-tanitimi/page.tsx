import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Villa Tanıtım Filmi | Gayrimenkul Video Çekimi | Türkiye",
  description: "Villa, rezidans ve gayrimenkul projeleri için profesyonel tanıtım filmi. Drone çekimi, iç mekân videosu ve sinematik gayrimenkul tanıtımı. Dromocob.",
  path: "/villa-tanitimi",
  keywords: ["villa tanıtım filmi", "villa tanıtım videosu", "gayrimenkul video çekimi", "villa çekimi", "rezidans tanıtım filmi", "gayrimenkul drone çekimi", "villa iç mekân çekimi", "emlak video çekimi", "villa tanıtım fiyatları", "İstanbul villa çekimi", "Fethiye villa çekimi", "Antalya villa tanıtımı"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/villa-tanitimi#service`, name: "Villa Tanıtım Filmi ve Gayrimenkul Video Çekimi", serviceType: "Villa tanıtım filmi, gayrimenkul video çekimi ve drone hava görüntüleme", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/villa-tanitimi"), description: "Villa, rezidans ve gayrimenkul projeleri için sinematik tanıtım filmi, drone çekimi ve iç mekân video prodüksiyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function VillaTanitimiPage() {
  return <ServiceLanding quoteService="video" path="/villa-tanitimi" breadcrumbLabel="Villa Tanıtımı" eyebrow="Villa tanıtımı · Gayrimenkul çekimi · Türkiye" title="Villayı" accent="satışa hazırla." intro="Villa, rezidans ve gayrimenkul projelerinizi sinematik tanıtım filmi, profesyonel drone çekimi ve atmosfer odaklı iç mekân videosuyla potansiyel alıcılara en güçlü şekilde sunuyoruz." schema={schema} faqs={[
    { question: "Villa tanıtım filmi çekimi ne kadar sürer?", answer: "Tek villalık bir çekim genellikle yarım veya tam gün sürer. Çoklu villa ve geniş proje sahası projelerinde süre uzayabilir. Kesin takvim proje başında paylaşılır." },
    { question: "Drone ile dış çekim yapılıyor mu?", answer: "Evet. DJI Mini 5 Pro ile villanın konumunu, bahçesini, çevresini ve manzarasını gösteren sinematik hava görüntüleri çekiyoruz." },
    { question: "Villa tanıtım filmi fiyatları ne kadar?", answer: "Fiyat; villa sayısı, çekim süresi, drone dahil mi, post-prodüksiyon kapsamı ve teslim formatına göre değişir." },
    { question: "Gece çekimi yapılıyor mu?", answer: "Evet. Villanın gece aydınlatmasını, havuz ve peyzaj atmosferini gösteren gece çekimleri sinematik ışık sistemiyle yapılabilir." },
    { question: "Sosyal medya formatları da teslim ediliyor mu?", answer: "Evet. Ana filmin yanı sıra Instagram Reels, TikTok ve YouTube Shorts formatlarında dikey adaptasyonlar teslim edilebilir." },
    { question: "Hangi bölgelerde çekim yapıyorsunuz?", answer: "Fethiye, Muğla, Antalya başta olmak üzere Türkiye genelinde villa ve gayrimenkul çekimi yapıyoruz." },
  ]} mediaEyebrow="Real estate production" mediaTitle="Villa çekim ekipmanlarımız." media={[
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Villa konumu, manzarası ve çevresini gösteren havadan çekim.", alt: "DJI Mini 5 Pro drone ile villa havadan çekim" },
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "İç mekân ve detay planları için sinematik görüntü kalitesi.", alt: "Sony FX3 ile villa iç mekân sinematik çekim" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Cinema Lighting", detail: "İç mekân atmosferini koruyan kontrollü ışık düzeni.", alt: "Villa iç mekân profesyonel ışık sistemi" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Villa turu planları için akıcı kamera hareketi.", alt: "DJI RS 4 gimbal ile villa iç tur çekimi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Bodrum", "Alanya", "Kuşadası"]} services={[
    { title: "Sinematik villa tanıtım filmi", description: "Villanın mimarisi, iç tasarımı, bahçesi ve yaşam alanlarını anlatan sinematik film." },
    { title: "Drone ile hava çekimi", description: "Villanın konumunu, manzarasını ve çevresini gösteren profesyonel drone planları." },
    { title: "İç mekân ve detay çekimi", description: "Odalar, mutfak, banyo, havuz ve yaşam alanlarının atmosfer odaklı videosu." },
    { title: "Sosyal medya adaptasyonları", description: "Ana filmden Reels, Shorts ve Story formatlarında satış odaklı kısa içerikler." },
  ]} process={[
    { title: "Mülk keşfi", description: "Villanın konumunu, iç düzenini, ışık koşullarını ve çekim noktalarını değerlendiririz." },
    { title: "Çekim planı", description: "Drone rotası, iç mekân sırası, golden hour zamanlaması ve kare listesi hazırlarız." },
    { title: "Prodüksiyon", description: "Gündüz ve gerekirse gece çekimlerini profesyonel ekipmanla tamamlarız." },
    { title: "Teslim", description: "Kurgu, renk, müzik ve platform adaptasyonlarıyla yayın paketini hazırlarız." },
  ]}/>;
}
