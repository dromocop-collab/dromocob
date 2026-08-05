import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "İnşaat Firma Tanıtım Filmi | Şantiye ve Proje Çekimi | Türkiye",
  description: "İnşaat firmaları için profesyonel tanıtım filmi. Şantiye çekimi, proje tanıtımı, tesis videosu, drone hava görüntüleme ve kurumsal film prodüksiyonu. Dromocob.",
  path: "/insaat-firma-tanitimi",
  keywords: ["inşaat firma tanıtım filmi", "inşaat tanıtım videosu", "şantiye çekimi", "inşaat projesi tanıtımı", "müteahhit tanıtım filmi", "inşaat drone çekimi", "kurumsal inşaat filmi", "inşaat firması web sitesi", "proje tanıtım videosu", "İstanbul inşaat çekimi", "Türkiye inşaat tanıtımı"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/insaat-firma-tanitimi#service`, name: "İnşaat Firma Tanıtım Filmi ve Şantiye Çekimi", serviceType: "İnşaat firma tanıtım filmi, şantiye çekimi ve proje tanıtım videosu", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/insaat-firma-tanitimi"), description: "İnşaat firmaları için sinematik tanıtım filmi, şantiye drone çekimi ve proje tanıtım videosu prodüksiyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function InsaatFirmaTanitimiPage() {
  return <ServiceLanding quoteService="video" path="/insaat-firma-tanitimi" breadcrumbLabel="İnşaat Firma Tanıtımı" eyebrow="İnşaat tanıtımı · Şantiye çekimi · Türkiye" title="Projeyi" accent="güçlü göster." intro="İnşaat firmanızı, tamamlanan projelerinizi, devam eden şantiyelerinizi ve üretim gücünüzü sinematik tanıtım filmi, profesyonel drone çekimi ve kurumsal video ile en güçlü şekilde tanıtıyoruz." schema={schema} faqs={[
    { question: "İnşaat tanıtım filmi çekimi ne kadar sürer?", answer: "Tek şantiye veya proje için genellikle 1–2 gün sürer. Çoklu proje ve lokasyonlarda süre uzayabilir. Kesin takvim proje başında paylaşılır." },
    { question: "Şantiye drone çekimi yapılıyor mu?", answer: "Evet. İnşaat sahasını, proje ilerlemesini ve çevreyi gösteren sinematik drone planları çekiyoruz. Şantiye takibi için periyodik drone çekimi de yapılabilir." },
    { question: "Tamamlanan projeler de çekiliyor mu?", answer: "Evet. Hem devam eden şantiyeler hem de tamamlanan projeler (konut, ticari, altyapı) için tanıtım çekimi yapıyoruz." },
    { question: "İnşaat firması tanıtım filmi neleri kapsar?", answer: "Firma tanıtımı, proje portföyü, şantiye görüntüleri, ekip ve ekipman, müşteri referansları ve kurumsal değerler tek bir filmde birleştirilebilir." },
    { question: "Proje takip çekimi yapılıyor mu?", answer: "Evet. Aylık veya belirli aralıklarla drone ve kamera ile şantiye ilerlemesi kaydedilebilir. Time-lapse formatında da teslim yapılabilir." },
    { question: "Sosyal medya formatları da teslim ediliyor mu?", answer: "Evet. LinkedIn, Instagram Reels ve YouTube formatlarında kısa adaptasyonlar teslim edilebilir." },
  ]} mediaEyebrow="Construction production" mediaTitle="İnşaat çekim ekipmanlarımız." media={[
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Şantiye, proje sahası ve çevreyi gösteren drone çekimi.", alt: "DJI Mini 5 Pro drone ile inşaat şantiye çekimi" },
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Proje detayları ve firma tanıtımı için sinematik çekim.", alt: "Sony FX3 ile inşaat firma tanıtım filmi çekimi" },
    { src: "/images/services/dji-avata-2-fpv-drone.webp", title: "DJI Avata 2 FPV", detail: "Proje içine giren sürükleyici FPV tur planları.", alt: "DJI Avata 2 FPV drone ile inşaat projesi iç tur" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Şantiye yürüyüş planları için akıcı kamera hareketi.", alt: "DJI RS 4 gimbal ile şantiye çekim" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Konya", "Gaziantep", "Adana", "Mersin"]} services={[
    { title: "Firma tanıtım filmi", description: "İnşaat firmanızın vizyonunu, projelerini ve üretim gücünü anlatan sinematik kurumsal film." },
    { title: "Proje tanıtım videosu", description: "Tamamlanan veya devam eden inşaat projelerinin detaylı video tanıtımı." },
    { title: "Şantiye drone çekimi", description: "İnşaat sahasını, proje büyüklüğünü ve çevreyi gösteren profesyonel drone planları." },
    { title: "Periyodik proje takibi", description: "Aylık drone ve kamera çekimiyle inşaat ilerlemesinin görsel kaydı ve time-lapse." },
  ]} process={[
    { title: "Proje değerlendirme", description: "İnşaat firmanızın hedeflerini, projelerini ve çekim ihtiyaçlarını belirleriz." },
    { title: "Çekim planı", description: "Şantiye güvenliği, drone rotası, ekipman ve zamanlama detaylarını planlarız." },
    { title: "Prodüksiyon", description: "İş sağlığı ve güvenlik kurallarına uygun şekilde profesyonel çekimi tamamlarız." },
    { title: "Teslim", description: "Kurgu, renk, ses ve platform adaptasyonlarıyla yayın paketini hazırlarız." },
  ]}/>;
}
