import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kurumsal Web Tasarım | Profesyonel Firma Web Sitesi | Türkiye",
  description: "Kurumsal kimliğinizi dijitale taşıyan profesyonel web tasarım. Marka bütünlüğü, mobil uyumluluk, SEO altyapısı ve yönetim paneli ile güven veren kurumsal web sitesi. Dromocob.",
  path: "/kurumsal-web-tasarim",
  keywords: ["kurumsal web tasarım", "kurumsal web sitesi", "firma web sitesi", "kurumsal site tasarımı", "profesyonel web tasarım", "kurumsal web tasarım ajansı", "kurumsal web tasarım fiyatları", "şirket web sitesi", "kurumsal internet sitesi", "İstanbul kurumsal web tasarım", "Fethiye kurumsal web tasarım", "Türkiye kurumsal web tasarım"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/kurumsal-web-tasarim#service`, name: "Kurumsal Web Tasarım ve Firma Web Sitesi", serviceType: "Kurumsal web tasarım, firma web sitesi ve marka odaklı dijital deneyim", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/kurumsal-web-tasarim"), description: "Kurumsal kimliğe uygun, profesyonel, hızlı ve SEO uyumlu firma web sitesi tasarım ve geliştirme.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function KurumsalWebTasarimPage() {
  return <ServiceLanding quoteService="web" path="/kurumsal-web-tasarim" breadcrumbLabel="Kurumsal Web Tasarım" eyebrow="Kurumsal web tasarım · Firma web sitesi · Türkiye" title="Güvenilir markalar" accent="güçlü sitelerle tanınır." intro="Kurumsal kimliğinizi, hizmetlerinizi ve referanslarınızı dijital dünyada profesyonelce sunan; mobil uyumlu, hızlı, SEO uyumlu ve yönetim panelli kurumsal web sitesi tasarımı." schema={schema} faqs={[
    { question: "Kurumsal web tasarım neleri kapsar?", answer: "Marka kimliğine uygun tasarım sistemi, responsive arayüz, hizmet ve referans sayfaları, iletişim formu, blog, yönetim paneli, teknik SEO altyapısı ve performans optimizasyonunu kapsar." },
    { question: "Kurumsal web sitesi fiyatları ne kadar?", answer: "Fiyat, sayfa sayısı, içerik kapsamı, özel modüller ve entegrasyon ihtiyaçlarına göre değişir. Projenizin detaylarını paylaştığınızda size özel teklif hazırlıyoruz." },
    { question: "Mevcut kurumsal sitemizi yenileyebilir misiniz?", answer: "Evet. Mevcut sitenizin tasarımını, altyapısını, hızını ve SEO yapısını analiz eder; yeniden tasarım veya teknik iyileştirme planı sunarız." },
    { question: "Kurumsal web sitesi kaç günde tamamlanır?", answer: "Kurumsal tanıtım siteleri genellikle 2–4 hafta, kapsamlı projeler 1–2 ay arasında tamamlanır. Kesin takvim, kapsam netleştikten sonra yazılı olarak paylaşılır." },
    { question: "Web sitesi yönetim paneli dahil mi?", answer: "Evet. İhtiyaca göre içerik, hizmet, referans, blog ve medya yönetimi yapabileceğiniz özel yönetim paneli geliştiriyoruz." },
    { question: "Kurumsal web sitesi SEO uyumlu olur mu?", answer: "Evet. Teknik SEO, semantik HTML yapısı, yapılandırılmış veri, performans optimizasyonu ve Core Web Vitals uyumluluğu geliştirme sürecinin standart parçasıdır." },
  ]} mediaEyebrow="Design & technology stack" mediaTitle="Kurumsal web altyapımız." media={[
    { src: "/images/services/web-design-system.webp", title: "Responsive Design System", detail: "Masaüstü, tablet ve mobilde tutarlı kurumsal arayüz sistemi.", alt: "Kurumsal responsive web tasarım masaüstü ve mobil arayüz" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Modern Web Altyapısı", detail: "Next.js, Firebase ve bulut teknolojileriyle ölçeklenebilir kurumsal altyapı.", alt: "Kurumsal web yazılım sunucu ve yönetim paneli altyapısı" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Gaziantep"]} services={[
    { title: "Kurumsal marka tasarımı", description: "Marka kimliğine uygun, güven veren ve profesyonel görsel dil ile kurumsal web sitesi tasarımı." },
    { title: "İçerik ve bilgi mimarisi", description: "Hizmetler, referanslar, ekip, blog ve iletişim sayfalarının stratejik organizasyonu." },
    { title: "Yönetim paneli", description: "İçerik, hizmet, referans ve medya yönetimi yapabileceğiniz kullanıcı dostu admin panel." },
    { title: "Teknik SEO ve performans", description: "Core Web Vitals, yapılandırılmış veri, site hızı optimizasyonu ve Google uyumlu teknik altyapı." },
  ]} process={[
    { title: "Keşif ve analiz", description: "Markanızı, hedef kitlenizi ve rakiplerinizi analiz ederek projenin kapsamını netleştiririz." },
    { title: "Tasarım sistemi", description: "Kurumsal kimliğe uygun renk, tipografi ve bileşen sistemini tasarlayıp onay alırız." },
    { title: "Geliştirme", description: "Performanslı, güvenli ve yönetilebilir kurumsal web sitesini modern teknolojiyle geliştiririz." },
    { title: "Yayın ve büyüme", description: "Teknik kontrolleri tamamlar, Google'a bildirip gerçek veriye göre iyileştirmeye başlarız." },
  ]}/>;
}
