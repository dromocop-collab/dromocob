import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "SEO Hizmeti | Teknik SEO ve Organik Büyüme | Türkiye Geneli",
  description: "Teknik SEO, yerel SEO, içerik stratejisi, Core Web Vitals optimizasyonu ve yapılandırılmış veri ile Google'da görünürlüğünüzü artırın. Dromocob ile ölçülebilir organik büyüme.",
  path: "/seo",
  keywords: ["SEO hizmeti", "SEO ajansı", "teknik SEO", "yerel SEO", "Google SEO", "SEO danışmanlığı", "SEO optimizasyonu", "anahtar kelime araştırması", "içerik stratejisi", "Core Web Vitals", "yapılandırılmış veri", "organik trafik artırma", "İstanbul SEO", "Türkiye SEO hizmeti", "Google sıralama"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/seo#service`, name: "SEO Hizmeti — Teknik SEO ve Organik Büyüme", serviceType: "Teknik SEO, yerel SEO ve içerik odaklı organik büyüme", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/seo"), description: "Teknik SEO, yerel SEO, içerik stratejisi, Core Web Vitals ve yapılandırılmış veri ile organik büyüme.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function SeoPage() {
  return <ServiceLanding quoteService="web" path="/seo" breadcrumbLabel="SEO" eyebrow="Teknik SEO · Organik büyüme · Türkiye" title="Arama motorlarında" accent="bulunmak yetmez." intro="Teknik altyapı, içerik stratejisi ve veri odaklı optimizasyonla web sitenizi Google'ın anlayabileceği, kullanıcının güveneceği ve iş hedeflerinize hizmet edecek şekilde konumlandırıyoruz." schema={schema} faqs={[
    { question: "SEO çalışmasının sonuçları ne kadar sürede görülür?", answer: "SEO uzun vadeli bir yatırımdır. Teknik iyileştirmeler haftalar içinde etkisini gösterebilirken, organik sıralama ve trafik artışı genellikle 3–6 aylık düzenli çalışma gerektirir. Kesin takvim, sektör rekabeti ve mevcut sitenin durumuna göre değişir." },
    { question: "Teknik SEO ile içerik SEO arasındaki fark nedir?", answer: "Teknik SEO; site hızı, mobil uyumluluk, yapılandırılmış veri, crawl bütçesi ve Core Web Vitals gibi altyapı konularını kapsar. İçerik SEO ise anahtar kelime araştırması, içerik stratejisi, başlık optimizasyonu ve kullanıcı niyetine uygun sayfa yapılarını içerir. İkisi birlikte çalışır." },
    { question: "Mevcut web sitemize SEO uygulanabilir mi?", answer: "Evet. Önce mevcut sitenin teknik durumunu, içerik yapısını ve Google performansını analiz ederiz. Audit sonuçlarına göre öncelikli iyileştirme planı hazırlanır." },
    { question: "Yerel SEO hizmeti veriyor musunuz?", answer: "Evet. Google Business Profile optimizasyonu, yerel anahtar kelime stratejisi, NAP tutarlılığı ve yerel yapılandırılmış veri çalışmalarını kapsayan yerel SEO hizmeti sunuyoruz." },
  ]} mediaEyebrow="SEO & performance stack" mediaTitle="Teknik altyapı ve araçlarımız." media={[
    { src: "/images/services/web-design-system.webp", title: "Performans Odaklı Web", detail: "SEO uyumlu, hızlı ve semantik HTML altyapısı.", alt: "SEO uyumlu performans odaklı web sitesi altyapısı" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Veri ve Ölçüm Altyapısı", detail: "Search Console, GA4 ve yapılandırılmış veri entegrasyonu.", alt: "SEO veri ve ölçüm altyapısı yapılandırılmış veri sistemi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Konya", "Adana", "Gaziantep", "Kayseri"]} services={[
    { title: "Teknik SEO", description: "Site hızı, Core Web Vitals, crawl optimizasyonu, yapılandırılmış veri, canonical yapı ve indeksleme kontrolü." },
    { title: "Anahtar kelime ve içerik stratejisi", description: "Arama niyeti analizi, anahtar kelime araştırması, içerik haritası ve sayfa başlık optimizasyonu." },
    { title: "Yerel SEO", description: "Google Business Profile, yerel anahtar kelimeler, NAP tutarlılığı ve bölgesel görünürlük stratejisi." },
    { title: "SEO audit ve raporlama", description: "Mevcut sitenin teknik durumu, rakip analizi, fırsat alanları ve ölçülebilir ilerleme raporları." },
  ]} process={[
    { title: "SEO audit", description: "Sitenin teknik durumunu, içerik yapısını, backlink profilini ve Google performansını analiz ederiz." },
    { title: "Strateji ve yol haritası", description: "Rekabet, arama hacmi ve iş hedeflerine göre öncelikli optimizasyon planını oluştururuz." },
    { title: "Uygulama", description: "Teknik iyileştirmeler, içerik optimizasyonu ve yapılandırılmış veri entegrasyonunu hayata geçiririz." },
    { title: "Ölçüm ve iterasyon", description: "Sıralama, trafik ve dönüşüm verilerini izler; stratejik iterasyonlarla büyümeyi sürdürürüz." },
  ]}/>;
}
