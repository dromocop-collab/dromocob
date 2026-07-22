import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Web Tasarım | Kurumsal Web Sitesi Yapımı | Türkiye",
  description: "Profesyonel web tasarım ve kurumsal web sitesi yapımı. Mobil uyumlu, SEO uyumlu, hızlı açılan ve dönüşüm odaklı web siteleri. E-ticaret, özel yazılım ve yönetim paneli. Dromocob.",
  path: "/web-tasarim",
  keywords: ["web tasarım", "web tasarımı", "web sitesi tasarımı", "web sitesi yaptırma", "kurumsal web sitesi", "kurumsal web tasarım", "profesyonel web tasarım", "web tasarım ajansı", "web tasarım fiyatları", "mobil uyumlu web sitesi", "SEO uyumlu web sitesi", "e-ticaret sitesi", "web sitesi yapımı", "İstanbul web tasarım", "Fethiye web tasarım", "Muğla web tasarım", "Türkiye web tasarım"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/web-tasarim#service`, name: "Web Tasarım ve Kurumsal Web Sitesi Yapımı", serviceType: "Profesyonel web tasarım, kurumsal web sitesi ve e-ticaret sitesi yapımı", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/web-tasarim"), description: "Kurumsal web tasarım, e-ticaret sitesi, özel web yazılım ve yönetim paneli ile mobil uyumlu, hızlı ve dönüşüm odaklı web siteleri.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function WebTasarimPage() {
  return <ServiceLanding quoteService="web" path="/web-tasarim" breadcrumbLabel="Web Tasarım" eyebrow="Web tasarım · Web sitesi yapımı · Türkiye" title="Güçlü markalar" accent="güçlü sitelerle başlar." intro="Kurumsal web sitesi, e-ticaret altyapısı ve özel web yazılım projelerinizde; mobil uyumlu, SEO uyumlu, hızlı açılan ve ziyaretçiyi müşteriye dönüştüren profesyonel web tasarım hizmeti sunuyoruz." schema={schema} faqs={[
    { question: "Web tasarım fiyatları ne kadar?", answer: "Web tasarım fiyatları projenin kapsamına, sayfa sayısına, özel modüllere ve entegrasyon ihtiyaçlarına göre değişir. Kurumsal tanıtım sitesinden e-ticaret platformuna kadar farklı ölçeklerde çalışıyoruz. Detayları paylaştığınızda size özel bir teklif hazırlıyoruz." },
    { question: "Web sitesi ne kadar sürede tamamlanır?", answer: "Kurumsal tanıtım siteleri genellikle 2–4 hafta, e-ticaret ve özel yazılım projeleri 1–3 ay arasında tamamlanır. Kesin takvim, kapsam netleştikten sonra yazılı olarak paylaşılır." },
    { question: "Web sitesi mobil uyumlu olur mu?", answer: "Evet. Tüm projelerimiz mobil öncelikli (mobile-first) yaklaşımla tasarlanır. Telefon, tablet ve masaüstünde tutarlı, hızlı ve kullanıcı dostu bir deneyim sunar." },
    { question: "Web sitesi Google'da çıkar mı?", answer: "Evet. Teknik SEO, semantik HTML yapısı, yapılandırılmış veri, performans optimizasyonu ve Core Web Vitals uyumluluğu geliştirme sürecinin standart parçasıdır. Siteniz Google'ın anlayacağı ve sıralayacağı şekilde oluşturulur." },
    { question: "Mevcut web sitemi yenileyebilir misiniz?", answer: "Evet. Mevcut sitenizin tasarımını, altyapısını, hızını ve SEO yapısını analiz eder; yeniden tasarım veya teknik iyileştirme planı sunarız." },
    { question: "Web tasarım sonrası destek var mı?", answer: "Evet. Yayın sonrası 30 günlük teknik destek standart olarak dahildir. İhtiyaca göre aylık bakım, içerik güncellemesi ve performans takibi paketleri sunuyoruz." },
  ]} mediaEyebrow="Design & technology stack" mediaTitle="Web tasarım altyapımız." media={[
    { src: "/images/services/web-design-system.webp", title: "Responsive Design System", detail: "Masaüstü, tablet ve mobilde tutarlı, dönüşüm odaklı arayüz sistemi.", alt: "Kurumsal responsive web tasarım masaüstü ve mobil arayüz sistemi" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Modern Web Altyapısı", detail: "Next.js, Firebase ve bulut teknolojileriyle ölçeklenebilir web yazılım.", alt: "Modern web yazılım sunucu, veri ve yönetim paneli altyapısı" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Gaziantep"]} services={[
    { title: "Kurumsal web tasarım", description: "Marka kimliğine uygun, mobil öncelikli, hızlı ve SEO uyumlu profesyonel web sitesi tasarımı." },
    { title: "E-ticaret sitesi", description: "Ödeme entegrasyonu, ürün yönetimi, sipariş takibi ve pazarlama araçlarıyla satışa hazır e-ticaret altyapısı." },
    { title: "Özel web yazılım", description: "Üyelik sistemi, teklif motoru, rezervasyon, müşteri paneli ve iş akışı otomasyonu gibi özel modüller." },
    { title: "Teknik SEO ve performans", description: "Core Web Vitals, yapılandırılmış veri, site hızı optimizasyonu ve Google uyumlu teknik altyapı." },
  ]} process={[
    { title: "Keşif ve analiz", description: "Hedeflerinizi, müşteri profilinizi ve rakiplerinizi anlayarak projenin kapsamını netleştiririz." },
    { title: "UX ve web tasarım", description: "Kullanıcı akışlarını, bilgi mimarisini ve görsel tasarım sistemini prototipleriz." },
    { title: "Geliştirme", description: "Performanslı, güvenli ve yönetilebilir web sitesini modern teknolojiyle geliştiririz." },
    { title: "Yayın ve büyüme", description: "Teknik kontrolleri tamamlar, Google'a bildirip gerçek veriye göre iyileştirmeye başlarız." },
  ]}/>;
}
