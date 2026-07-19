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
  return <ServiceLanding eyebrow="Video prodüksiyon · Film yapım · Türkiye" title="İzlenen değil," accent="hatırlanan filmler." intro="Konsept ve senaryodan çekim, kurgu, renk ve ses tasarımına kadar markanızın hikâyesini sinematik, platforma uygun ve iş hedefiyle bağlantılı biçimde üretiyoruz." schema={schema} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Muğla", "Kocaeli", "Adana", "Gaziantep", "Trabzon"]} services={[
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
