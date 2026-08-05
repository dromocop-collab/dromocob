import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "E-Ticaret Web Tasarım | Online Mağaza Kurulumu | Türkiye",
  description: "Satışa hazır e-ticaret sitesi tasarımı. Ödeme entegrasyonu, ürün yönetimi, sipariş takibi, SEO uyumlu altyapı ve mobil uyumlu dijital mağaza. Dromocob.",
  path: "/e-ticaret-web-tasarim",
  keywords: ["e-ticaret web tasarım", "e-ticaret sitesi", "online mağaza", "e-ticaret sitesi kurulumu", "e-ticaret yazılımı", "e-ticaret tasarımı", "e-ticaret web sitesi", "dijital mağaza", "e-ticaret sitesi fiyatları", "İstanbul e-ticaret", "Türkiye e-ticaret sitesi"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/e-ticaret-web-tasarim#service`, name: "E-Ticaret Web Tasarım ve Online Mağaza Kurulumu", serviceType: "E-ticaret sitesi tasarımı, online mağaza kurulumu ve dijital ticaret altyapısı", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/e-ticaret-web-tasarim"), description: "Ödeme entegrasyonu, ürün yönetimi, sipariş takibi ve SEO altyapısıyla satışa hazır e-ticaret sitesi.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function ETicaretWebTasarimPage() {
  return <ServiceLanding quoteService="web" path="/e-ticaret-web-tasarim" breadcrumbLabel="E-Ticaret Web Tasarım" eyebrow="E-ticaret sitesi · Online mağaza · Türkiye" title="Satışa hazır" accent="dijital mağazan." intro="Ödeme altyapısı, ürün yönetimi, sipariş takibi, kampanya araçları ve SEO uyumlu altyapıyla satışa hazır e-ticaret sitesi tasarlayıp geliştiriyoruz." schema={schema} faqs={[
    { question: "E-ticaret sitesi fiyatları ne kadar?", answer: "Fiyat; ürün sayısı, ödeme entegrasyonları, özel modüller, tasarım kapsamı ve kargo entegrasyonuna göre değişir. Projenizin detaylarını paylaştığınızda size özel teklif hazırlıyoruz." },
    { question: "E-ticaret sitesi ne kadar sürede hazır olur?", answer: "Kapsamına göre 1–3 ay arasında tamamlanır. Ürün aktarımı, ödeme entegrasyonu ve test süreçleri dahil kesin takvim proje başında paylaşılır." },
    { question: "Hangi ödeme yöntemleri entegre edilir?", answer: "Kredi kartı, banka havalesi, kapıda ödeme ve popüler ödeme kuruluşları (iyzico, PayTR, Stripe vb.) projenize göre entegre edilebilir." },
    { question: "Kargo entegrasyonu yapılıyor mu?", answer: "Evet. Aras Kargo, Yurtiçi Kargo, MNG ve diğer kargo firmalarıyla API entegrasyonu projenize göre yapılabilir." },
    { question: "Mevcut ürünlerim e-ticaret sitesine aktarılabilir mi?", answer: "Evet. Excel, CSV veya mevcut platformunuzdan ürün aktarımı yapılabilir." },
    { question: "E-ticaret sitesi mobil uyumlu olur mu?", answer: "Evet. Tüm e-ticaret projelerimiz mobil öncelikli (mobile-first) yaklaşımla tasarlanır." },
  ]} mediaEyebrow="E-commerce technology stack" mediaTitle="E-ticaret altyapımız." media={[
    { src: "/images/services/web-design-system.webp", title: "E-Ticaret Arayüzü", detail: "Dönüşüm odaklı ürün listeleme, sepet ve ödeme deneyimi.", alt: "E-ticaret sitesi responsive arayüz tasarımı" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Ödeme ve Yönetim", detail: "Güvenli ödeme, sipariş takibi ve ürün yönetim paneli.", alt: "E-ticaret ödeme ve yönetim paneli altyapısı" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Gaziantep"]} services={[
    { title: "E-ticaret sitesi tasarımı", description: "Ürün keşfi, sepet, ödeme ve müşteri deneyimini optimize eden mobil öncelikli e-ticaret tasarımı." },
    { title: "Ödeme ve kargo entegrasyonu", description: "Güvenli ödeme altyapısı, kargo takibi ve otomatik fatura entegrasyonları." },
    { title: "Ürün ve sipariş yönetimi", description: "Kolay ürün ekleme, stok takibi, sipariş yönetimi ve kampanya araçları." },
    { title: "SEO ve performans", description: "Ürün sayfaları için teknik SEO, yapılandırılmış veri ve hız optimizasyonu." },
  ]} process={[
    { title: "İş analizi", description: "Ürün yapınızı, hedef kitlenizi ve satış hedeflerinizi analiz ederiz." },
    { title: "UX ve tasarım", description: "Ürün keşfi, sepet ve ödeme akışlarını mobil öncelikli prototiplerle tasarlarız." },
    { title: "Geliştirme", description: "E-ticaret altyapısı, ödeme, kargo ve yönetim panelini geliştiririz." },
    { title: "Test ve yayın", description: "Ödeme testleri, SEO kontrolleri ve performans doğrulamasıyla yayına alırız." },
  ]}/>;
}
