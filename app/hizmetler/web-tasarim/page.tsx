import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Web Tasarım ve Web Yazılım Ajansı | Türkiye Geneli",
  description: "Türkiye genelinde kurumsal web tasarım, Next.js web yazılım, e-ticaret, yönetim paneli ve teknik SEO çözümleri. Dromocob ile hızlı ve dönüşüm odaklı web sitesi.",
  path: "/hizmetler/web-tasarim",
  keywords: ["web tasarım", "web tasarım ajansı", "kurumsal web tasarım", "web yazılım", "Türkiye web tasarım", "Next.js ajansı", "SEO uyumlu web sitesi"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/hizmetler/web-tasarim#service`, name: "Web Tasarım ve Web Yazılım", serviceType: "Kurumsal web tasarım ve web yazılım", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/hizmetler/web-tasarim"), description: "Kurumsal web tasarım, özel web yazılım, e-ticaret, yönetim paneli, performans ve teknik SEO hizmetleri.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function WebDesignPage() {
  return <ServiceLanding eyebrow="Web tasarım · Web yazılım · Türkiye" title="Markanı büyüten" accent="web deneyimleri." intro="Sadece güzel görünen değil; hızlı açılan, Google tarafından anlaşılabilen ve ziyaretçiyi müşteriye dönüştüren kurumsal web siteleri ve özel dijital ürünler tasarlıyoruz." schema={schema} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Konya", "Adana", "Gaziantep", "Kayseri"]} services={[
    { title: "Kurumsal web tasarım", description: "Marka stratejisine uygun, mobil öncelikli ve dönüşüm hedefli özgün arayüzler." },
    { title: "Özel web yazılım", description: "Next.js tabanlı üyelik, teklif, rezervasyon, müşteri paneli ve operasyon sistemleri." },
    { title: "E-ticaret ve entegrasyon", description: "Ödeme, CRM, ERP ve pazarlama araçlarıyla entegre satış altyapıları." },
    { title: "Teknik SEO ve performans", description: "Core Web Vitals, semantik içerik, yapılandırılmış veri ve ölçüm altyapısı." },
  ]} process={[
    { title: "Keşif", description: "Hedefleri, müşteriyi, rakipleri ve teknik gereksinimleri netleştiririz." },
    { title: "UX ve tasarım", description: "Bilgi mimarisini, kullanıcı akışlarını ve görsel sistemi prototipleriz." },
    { title: "Geliştirme", description: "Performanslı, güvenli ve yönetilebilir ürünü modern teknolojiyle geliştiririz." },
    { title: "Yayın ve büyüme", description: "Teknik kontrolleri tamamlar, ölçer ve gerçek veriye göre iyileştiririz." },
  ]}/>;
}
