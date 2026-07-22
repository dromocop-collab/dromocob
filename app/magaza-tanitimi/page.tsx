import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mağaza Tanıtım Filmi ve Mekân Çekimi | Türkiye Geneli",
  description: "Mağaza, showroom, restoran, otel ve kurumsal mekânlar için profesyonel tanıtım filmi, iç mekân çekimi, drone ile dış mekân ve sosyal medya video prodüksiyonu.",
  path: "/magaza-tanitimi",
  keywords: ["mağaza tanıtım filmi", "mağaza tanıtım videosu", "showroom çekimi", "mekân tanıtım filmi", "restoran tanıtım videosu", "otel tanıtım filmi", "iç mekân video çekimi", "mağaza açılış videosu", "kurumsal mekân çekimi", "mağaza sosyal medya videosu", "İstanbul mağaza çekimi", "Türkiye mağaza tanıtımı"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/magaza-tanitimi#service`, name: "Mağaza Tanıtım Filmi ve Mekân Çekimi", serviceType: "Mağaza tanıtım filmi, mekân çekimi ve sosyal medya video prodüksiyonu", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/magaza-tanitimi"), description: "Mağaza, showroom, restoran ve kurumsal mekânlar için tanıtım filmi, iç mekân çekimi ve sosyal medya video prodüksiyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function MagazaTanitimiPage() {
  return <ServiceLanding quoteService="video" path="/magaza-tanitimi" breadcrumbLabel="Mağaza Tanıtımı" eyebrow="Mağaza tanıtım filmi · Mekân çekimi · Türkiye" title="Mekânını göster," accent="müşteri getir." intro="Mağaza, showroom, restoran ve kurumsal mekânlar için; atmosferi hissettiren, güven veren ve sosyal medyada paylaşılan profesyonel tanıtım filmleri üretiyoruz." schema={schema} faqs={[
    { question: "Mağaza tanıtım filmi ne kadar sürede tamamlanır?", answer: "Tek lokasyonlu bir çekim genellikle yarım veya tam gün sürer. Post-prodüksiyon süresi teslim paketine ve varyasyon sayısına göre değişir; kesin takvim proje başında yazılı olarak paylaşılır." },
    { question: "Hangi tür mekânlar için tanıtım filmi çekiyorsunuz?", answer: "Mağaza, showroom, restoran, kafe, otel, spa, ofis, fabrika satış noktası ve kurumsal mekânlar dahil her tür ticari alan için çekim yapıyoruz." },
    { question: "Drone ile dış mekân çekimi de dahil mi?", answer: "Evet. Mekânın konumuna, çevresine ve uçuş uygunluğuna göre sinematik drone planları prodüksiyona eklenebilir." },
    { question: "Sosyal medya formatları da teslim ediliyor mu?", answer: "Ana filmin yanı sıra Instagram Reels, TikTok ve YouTube Shorts için dikey (9:16) ve kare (1:1) adaptasyonlar da teslim paketine eklenebilir." },
  ]} mediaEyebrow="Production toolkit" mediaTitle="Mekân çekimi setimiz." media={[
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Düşük ışık ortamlarında bile sinematik iç mekân görüntüleri.", alt: "Sony FX3 sinema kamerası ile mağaza iç mekân çekimi" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Cinema Lighting System", detail: "Mekânın atmosferini koruyan kontrollü ışık düzeni.", alt: "Profesyonel sinema ışık sistemi ile mağaza aydınlatma" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Mağaza içi yürüyüş planları için akıcı kamera hareketi.", alt: "DJI RS 4 gimbal ile mağaza içi akıcı video çekimi" },
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Mekânın çevresini ve konumunu gösteren hava görüntüleme.", alt: "DJI Mini 5 Pro drone ile mağaza dış mekân havadan çekim" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Muğla", "Kocaeli", "Adana", "Gaziantep", "Trabzon"]} services={[
    { title: "Mağaza ve showroom filmi", description: "Mekânın atmosferini, ürün deneyimini ve marka hikâyesini sinematik anlatıyla buluştururuz." },
    { title: "İç mekân ve ürün çekimi", description: "Raf düzeni, vitrin, ürün detayları ve mekân akışını profesyonel ışık ve kadrajla kaydederiz." },
    { title: "Drone ile dış mekân çekimi", description: "Mağazanın konumunu, çevresini ve erişilebilirliğini güçlü bir hava perspektifiyle gösteririz." },
    { title: "Sosyal medya adaptasyonları", description: "Ana filmden Reels, Shorts ve Story formatlarında platform odaklı kısa içerikler üretiriz." },
  ]} process={[
    { title: "Mekân keşfi", description: "Mağazanın fiziksel yapısını, ışık koşullarını ve çekim noktalarını yerinde değerlendiririz." },
    { title: "Çekim planı", description: "Kare listesi, çekim sırası, ekipman ve zamanlama dahil tüm detayları önceden planlarız." },
    { title: "Prodüksiyon", description: "İş akışını bozmadan, kontrollü ve hızlı bir set düzeniyle çekimi tamamlarız." },
    { title: "Teslim", description: "Kurgu, renk, ses ve platform adaptasyonlarıyla yayın paketini hazırlarız." },
  ]}/>;
}
