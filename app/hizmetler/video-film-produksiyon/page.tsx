import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Video Prodüksiyon ve Film Yapım | Türkiye Geneli",
  description: "Türkiye genelinde reklam filmi, marka filmi, kurumsal tanıtım videosu, ürün çekimi ve sosyal medya video prodüksiyonu. Konseptten post prodüksiyona Dromocob.",
  path: "/hizmetler/video-film-produksiyon",
  keywords: ["video prodüksiyon", "film yapım", "reklam filmi çekimi", "tanıtım filmi", "kurumsal video", "marka filmi", "Türkiye video prodüksiyon"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/hizmetler/video-film-produksiyon#service`, name: "Video Prodüksiyon ve Film Yapım", serviceType: "Video prodüksiyon, reklam filmi ve marka filmi yapımı", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/hizmetler/video-film-produksiyon"), description: "Reklam filmi, marka filmi, kurumsal tanıtım videosu, ürün çekimi ve sosyal medya içerik prodüksiyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function VideoProductionPage() {
  return <ServiceLanding quoteService="video" path="/hizmetler/video-film-produksiyon" breadcrumbLabel="Video ve Film Prodüksiyon" eyebrow="Video prodüksiyon · Film yapım · Türkiye" title="İzlenen değil," accent="hatırlanan filmler." intro="Konsept ve senaryodan çekim, kurgu, renk ve ses tasarımına kadar markanızın hikâyesini sinematik, platforma uygun ve iş hedefiyle bağlantılı biçimde üretiyoruz." schema={schema} faqs={[
    { question: "Video prodüksiyon süreci nasıl ilerliyor?", answer: "Hedef ve dağıtım kanalları belirlendikten sonra konsept, senaryo, çekim planı, prodüksiyon ve post-prodüksiyon adımları yazılı kapsamla yürütülür." },
    { question: "Dikey ve yatay video teslim ediyor musunuz?", answer: "Evet. Ana filmin yanında ihtiyaca göre 16:9, 9:16 ve 1:1 platform adaptasyonları hazırlanabilir." },
    { question: "Drone ve FPV çekimi yapılabiliyor mu?", answer: "Projenin lokasyonu, hava koşulları ve yasal uçuş uygunluğu değerlendirildikten sonra sinematik drone veya FPV planları prodüksiyona eklenebilir." },
    { question: "Türkiye'nin farklı şehirlerinde çekim yapıyor musunuz?", answer: "Evet. İstanbul merkezli çalışıyor, prodüksiyon kapsamına göre Türkiye'nin farklı şehirlerinde saha çekimi planlayabiliyoruz." },
  ]} mediaEyebrow="Production toolkit" mediaTitle="Sinematik üretim setimiz." media={[
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Full-frame sinematik görüntü, düşük ışık gücü ve çevik prodüksiyon.", alt: "Sony FX3 sinema kamerası ile profesyonel video prodüksiyon" },
    { src: "/images/services/gm-24-70-lens.webp", title: "Sony 24–70mm G Master", detail: "Keskin, hızlı ve çok yönlü profesyonel optik sistem.", alt: "Sony 24-70mm G Master profesyonel kamera lensi" },
    { src: "/images/services/atomos-field-monitor.webp", title: "Atomos Field Monitor", detail: "Sette hassas kadraj, pozlama ve renk takibi.", alt: "Atomos profesyonel saha monitörü ve video kayıt sistemi" },
    { src: "/images/services/dji-mic-2-wireless.webp", title: "DJI Mic 2", detail: "Röportaj ve hareketli çekimler için temiz kablosuz ses.", alt: "DJI Mic 2 kablosuz mikrofon prodüksiyon ses sistemi" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Akıcı kamera hareketleri ve kontrollü dinamik çekimler.", alt: "DJI RS 4 kamera gimbalı ile akıcı video çekimi" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Cinema Lighting System", detail: "COB, softbox ve RGB ışıklarla kontrollü sinematik atmosfer.", alt: "Profesyonel COB softbox RGB sinema ışık sistemi" },
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Kompakt yapıda yüksek kaliteli ve çevik hava görüntüleme.", alt: "DJI Mini 5 Pro drone ile profesyonel havadan video çekimi" },
    { src: "/images/services/dji-avata-2-fpv-drone.webp", title: "DJI Avata 2 FPV", detail: "Mekânın içine giren sürükleyici ve dinamik FPV planlar.", alt: "DJI Avata 2 FPV drone ile sinematik dinamik çekim" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Muğla", "Kocaeli", "Adana", "Gaziantep", "Trabzon"]} services={[
    { title: "Reklam ve marka filmi", description: "Marka konumlandırmasını güçlü bir fikir, sinematografi ve akılda kalıcı anlatıyla buluştururuz." },
    { title: "Kurumsal tanıtım filmi", description: "Şirketinizi, tesisinizi, ekibinizi ve üretim gücünüzü güven veren bir hikâyeye dönüştürürüz." },
    { title: "Ürün ve hizmet videosu", description: "Ürünün değerini, kullanımını ve farkını net gösteren satış odaklı içerikler üretiriz." },
    { title: "Sosyal medya prodüksiyonu", description: "Reels, kısa video ve kampanya varyasyonlarını dikey-yatay tüm formatlarda teslim ederiz." },
  ]} process={[
    { title: "Kreatif keşif", description: "Markayı, hedef kitleyi, mesajı, kanalları ve başarı ölçütlerini belirleriz." },
    { title: "Pre-prodüksiyon", description: "Konsept, senaryo, storyboard, ekip, mekân ve çekim planını hazırlarız." },
    { title: "Prodüksiyon", description: "Görüntü, ışık, ses ve sanat yönetimini kontrollü bir set akışıyla yürütürüz." },
    { title: "Post-prodüksiyon", description: "Kurgu, renk, ses ve platform adaptasyonlarıyla yayın paketini tamamlarız." },
  ]}/>;
}
