import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Teknik SEO Hizmeti | Site Hızı ve Altyapı Optimizasyonu | Türkiye",
  description: "Teknik SEO ile sitenizin altyapısını güçlendirin. Core Web Vitals, site hızı, crawl optimizasyonu, yapılandırılmış veri ve indeksleme kontrolü. Dromocob.",
  path: "/teknik-seo",
  keywords: ["teknik SEO", "teknik SEO hizmeti", "site hızı optimizasyonu", "Core Web Vitals", "crawl optimizasyonu", "yapılandırılmış veri", "indeksleme", "sayfa hızı", "teknik SEO ajansı", "teknik SEO analizi", "SEO altyapı", "İstanbul teknik SEO", "Türkiye teknik SEO"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/teknik-seo#service`, name: "Teknik SEO Hizmeti — Site Hızı ve Altyapı Optimizasyonu", serviceType: "Teknik SEO, Core Web Vitals optimizasyonu ve crawl yönetimi", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/teknik-seo"), description: "Core Web Vitals, site hızı, crawl bütçesi, yapılandırılmış veri ve indeksleme optimizasyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function TeknikSeoPage() {
  return <ServiceLanding quoteService="web" path="/teknik-seo" breadcrumbLabel="Teknik SEO" eyebrow="Teknik SEO · Altyapı optimizasyonu · Türkiye" title="Altyapı güçlüyse" accent="sıralama gelir." intro="Site hızı, Core Web Vitals, crawl bütçesi, yapılandırılmış veri, canonical yapı ve indeksleme kontrolü ile web sitenizin teknik altyapısını Google'ın tam olarak anlayacağı ve ödüllendireceği seviyeye taşıyoruz." schema={schema} faqs={[
    { question: "Teknik SEO nedir?", answer: "Teknik SEO, arama motorlarının sitenizi doğru tarayabilmesi, anlayabilmesi ve indeksleyebilmesi için yapılan altyapı çalışmalarıdır. Site hızı, mobil uyumluluk, yapılandırılmış veri, canonical yapı, robots.txt ve sitemap gibi konuları kapsar." },
    { question: "Core Web Vitals nedir ve neden önemli?", answer: "Core Web Vitals, Google'ın sayfa deneyimini ölçen üç temel metriktir: LCP (yükleme hızı), INP (etkileşim hızı) ve CLS (görsel kararlılık). Bu metrikler Google sıralama faktörleri arasındadır." },
    { question: "Teknik SEO ne kadar sürede sonuç verir?", answer: "Teknik iyileştirmeler genellikle Google tarafından haftalar içinde fark edilir. Crawl ve indeksleme sorunları hızlı çözülebilirken, site hızı iyileştirmeleri birkaç hafta içinde metriklere yansır." },
    { question: "Mevcut siteme teknik SEO uygulanabilir mi?", answer: "Evet. Önce kapsamlı bir teknik SEO audit yapılır, sorunlar önceliklendirilir ve adım adım iyileştirme planı uygulanır." },
    { question: "Teknik SEO audit neleri kapsar?", answer: "Site hızı, Core Web Vitals, mobil uyumluluk, crawl hataları, indeksleme sorunları, canonical yapı, yapılandırılmış veri, robots.txt, sitemap, HTTPS, duplicate content ve yönlendirme kontrollerini kapsar." },
    { question: "Yapılandırılmış veri (Schema) neden önemli?", answer: "Yapılandırılmış veri, arama motorlarına sayfanızın içeriğini daha iyi anlatır. Zengin sonuçlar (rich snippets) elde etmenizi ve tıklama oranınızı artırmanızı sağlar." },
  ]} mediaEyebrow="Technical SEO stack" mediaTitle="Teknik SEO araçlarımız." media={[
    { src: "/images/services/web-software-infrastructure.webp", title: "Crawl ve İndeksleme", detail: "Robots.txt, sitemap, canonical ve crawl bütçesi optimizasyonu.", alt: "Teknik SEO crawl ve indeksleme optimizasyonu altyapısı" },
    { src: "/images/services/web-design-system.webp", title: "Hız ve Core Web Vitals", detail: "LCP, INP, CLS optimizasyonu ve performans izleme.", alt: "Core Web Vitals ve sayfa hızı optimizasyonu" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Konya", "Adana", "Gaziantep", "Kayseri"]} services={[
    { title: "Core Web Vitals optimizasyonu", description: "LCP, INP ve CLS metriklerini Google'ın 'iyi' eşiğine taşıyan performans iyileştirmeleri." },
    { title: "Crawl ve indeksleme yönetimi", description: "Robots.txt, sitemap, canonical yapı, crawl bütçesi ve indeksleme kontrolü." },
    { title: "Yapılandırılmış veri", description: "Organization, LocalBusiness, Service, FAQ, Breadcrumb ve Article şemaları." },
    { title: "Site hızı optimizasyonu", description: "Görsel optimizasyon, font preload, critical CSS, lazy load ve sunucu taraflı render." },
  ]} process={[
    { title: "Teknik audit", description: "Sitenin tüm teknik SEO boyutlarını ayrıntılı olarak analiz ederiz." },
    { title: "Önceliklendirme", description: "Bulunan sorunları etki ve uygulama kolaylığına göre önceliklendiririz." },
    { title: "Uygulama", description: "Teknik iyileştirmeleri adım adım uygular ve her adımda doğrularız." },
    { title: "İzleme", description: "Search Console, PageSpeed ve crawl verilerini izleyerek sürekli iyileştirme yaparız." },
  ]}/>;
}
