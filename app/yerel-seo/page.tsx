import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Yerel SEO Hizmeti | Google Haritalar ve Bölgesel Görünürlük | Türkiye",
  description: "Yerel SEO ile bölgenizde birinci olun. Google Business Profile optimizasyonu, yerel anahtar kelime stratejisi, harita sıralaması ve NAP tutarlılığı. Dromocob.",
  path: "/yerel-seo",
  keywords: ["yerel SEO", "yerel SEO hizmeti", "Google Business Profile", "Google Haritalar SEO", "bölgesel SEO", "yerel arama optimizasyonu", "Google İşletme Profili", "NAP tutarlılığı", "yerel SEO ajansı", "yerel SEO fiyatları", "İstanbul yerel SEO", "Türkiye yerel SEO"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/yerel-seo#service`, name: "Yerel SEO Hizmeti — Google Haritalar ve Bölgesel Görünürlük", serviceType: "Yerel SEO, Google Business Profile optimizasyonu ve bölgesel arama stratejisi", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/yerel-seo"), description: "Google Business Profile, yerel anahtar kelimeler, harita sıralaması ve NAP tutarlılığı ile bölgesel görünürlük.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function YerelSeoPage() {
  return <ServiceLanding quoteService="web" path="/yerel-seo" breadcrumbLabel="Yerel SEO" eyebrow="Yerel SEO · Google Haritalar · Türkiye" title="Bölgende" accent="ilk sen görün." intro="Google Business Profile optimizasyonu, yerel anahtar kelime stratejisi, NAP tutarlılığı ve bölgesel yapılandırılmış veri çalışmalarıyla işletmenizi yerel aramalarda üst sıralara taşıyoruz." schema={schema} faqs={[
    { question: "Yerel SEO nedir?", answer: "Yerel SEO, belirli bir bölgede hizmet veren işletmelerin Google Haritalar ve yerel arama sonuçlarında görünürlüğünü artırmak için yapılan optimizasyon çalışmalarıdır." },
    { question: "Google Business Profile neden önemli?", answer: "Google Business Profile (eski adıyla Google My Business), yerel aramalarda ve Google Haritalar'da görünmenizi sağlar. Doğru ve güncel profil, potansiyel müşterilerin sizi bulmasını kolaylaştırır." },
    { question: "Yerel SEO ne kadar sürede sonuç verir?", answer: "Yerel SEO sonuçları genellikle 1–3 ay içinde görülmeye başlar. Google Business Profile optimizasyonu hızlı etki gösterirken, organik yerel sıralama daha uzun vadeli çalışma gerektirir." },
    { question: "Birden fazla lokasyon için yerel SEO yapılabilir mi?", answer: "Evet. Her lokasyon için ayrı Google Business Profile ve lokasyon bazlı içerik stratejisi oluşturulabilir." },
    { question: "NAP tutarlılığı nedir?", answer: "NAP (Name, Address, Phone), işletmenizin adı, adresi ve telefon numarasının tüm dijital platformlarda tutarlı olmasıdır. Google bu tutarlılığı güven sinyali olarak değerlendirir." },
    { question: "Yerel SEO ile genel SEO arasındaki fark nedir?", answer: "Yerel SEO, belirli bir coğrafi bölgeyi hedeflerken genel SEO ülke veya dünya genelindeki aramalar için çalışır. Yerel SEO, Google Haritalar, yerel anahtar kelimeler ve işletme profili optimizasyonuna odaklanır." },
  ]} mediaEyebrow="Local SEO stack" mediaTitle="Yerel SEO araçlarımız." media={[
    { src: "/images/services/web-software-infrastructure.webp", title: "Google Business Profile", detail: "İşletme profili optimizasyonu ve yerel görünürlük yönetimi.", alt: "Google Business Profile yerel SEO optimizasyonu" },
    { src: "/images/services/web-design-system.webp", title: "Yerel İçerik Stratejisi", detail: "Bölgesel anahtar kelimeler ve lokasyon bazlı sayfa yapıları.", alt: "Yerel SEO içerik stratejisi ve anahtar kelime haritası" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Adana"]} services={[
    { title: "Google Business Profile optimizasyonu", description: "İşletme profili kurulumu, kategori seçimi, açıklama, görseller, çalışma saatleri ve özellik optimizasyonu." },
    { title: "Yerel anahtar kelime stratejisi", description: "Bölgesel arama niyeti analizi, yerel anahtar kelime araştırması ve içerik haritası." },
    { title: "NAP tutarlılığı ve alıntılar", description: "İşletme bilgilerinin tüm dijital platformlarda tutarlı olmasını sağlayan düzenleme ve izleme." },
    { title: "Yerel yapılandırılmış veri", description: "LocalBusiness, GeoCoordinates ve areaServed şemaları ile bölgesel sinyal güçlendirme." },
  ]} process={[
    { title: "Yerel audit", description: "Google Business Profile, yerel sıralama, rakip ve NAP durumunu analiz ederiz." },
    { title: "Profil optimizasyonu", description: "İşletme profilini eksiksiz, doğru ve çekici hale getiririz." },
    { title: "İçerik ve şema", description: "Yerel anahtar kelime hedefli sayfalar ve yapılandırılmış veri ekleriz." },
    { title: "İzleme ve büyüme", description: "Yerel sıralama, arama ve müşteri aksiyonlarını izleyerek stratejik iyileştirmeler yaparız." },
  ]}/>;
}
