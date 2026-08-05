import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Meta Reklamları | Facebook & Instagram Ads Yönetimi | Türkiye",
  description: "Facebook ve Instagram reklam yönetimi. Hedef kitle analizi, reklam tasarımı, A/B test, dönüşüm takibi ve performans optimizasyonu ile sosyal medya reklamları. Dromocob.",
  path: "/meta-reklamlari",
  keywords: ["Meta reklamları", "Facebook reklamları", "Instagram reklamları", "Facebook Ads", "Instagram Ads", "sosyal medya reklamları", "Meta Ads yönetimi", "Facebook reklam yönetimi", "Instagram reklam fiyatları", "dijital reklam", "sosyal medya reklam ajansı", "İstanbul Meta reklamları", "Türkiye Meta Ads"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/meta-reklamlari#service`, name: "Meta Reklamları — Facebook & Instagram Ads Yönetimi", serviceType: "Facebook ve Instagram reklam yönetimi, hedef kitle analizi ve dönüşüm optimizasyonu", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/meta-reklamlari"), description: "Facebook ve Instagram reklam kampanyaları ile hedef kitlenize ulaşın, dönüşüm elde edin.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function MetaReklamlariPage() {
  return <ServiceLanding quoteService="web" path="/meta-reklamlari" breadcrumbLabel="Meta Reklamları" eyebrow="Meta reklamları · Facebook & Instagram Ads · Türkiye" title="Doğru kitleye" accent="doğru reklam." intro="Facebook ve Instagram reklam kampanyalarınızı hedef kitle analizi, kreatif tasarım, A/B test ve dönüşüm optimizasyonuyla yönetiyoruz. Her reklam harcamasından ölçülebilir geri dönüş." schema={schema} faqs={[
    { question: "Meta reklamları neleri kapsar?", answer: "Facebook ve Instagram platformlarında reklam hesabı kurulumu, hedef kitle oluşturma, reklam tasarımı, A/B test, piksel kurulumu, dönüşüm takibi ve performans raporlamasını kapsar." },
    { question: "Meta reklam bütçesi ne kadar olmalı?", answer: "Minimum bütçe hedef kitleye, sektöre ve kampanya hedefine göre değişir. Doğru hedefleme ve kreatif optimizasyonla küçük bütçelerle bile etkili sonuçlar alınabilir." },
    { question: "Facebook Pixel ve dönüşüm API kurulumu yapılıyor mu?", answer: "Evet. Meta Pixel, Conversions API ve özel dönüşüm olayları kampanya kurulumunun standart parçasıdır." },
    { question: "Reklam görselleri ve videoları hazırlanıyor mu?", answer: "Evet. Reklam kampanyalarına uygun statik görsel, carousel ve video formatlarında kreatif içerikler üretiyoruz." },
    { question: "Instagram Reklamları ayrı mı yönetilir?", answer: "Hayır. Meta Business Suite üzerinden Facebook ve Instagram kampanyaları birlikte yönetilir. Platforma göre format ve hedefleme optimizasyonu yapılır." },
    { question: "Raporlama nasıl yapılıyor?", answer: "Haftalık veya aylık periyotlarla gösterim, tıklama, dönüşüm, maliyet ve ROAS verilerini içeren şeffaf performans raporları paylaşılır." },
  ]} mediaEyebrow="Social advertising stack" mediaTitle="Sosyal medya reklam altyapımız." media={[
    { src: "/images/services/web-design-system.webp", title: "Kreatif Tasarım", detail: "Reklam kampanyalarına özel görsel, carousel ve video içerikler.", alt: "Meta reklamları için kreatif reklam tasarımı" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Piksel ve Dönüşüm", detail: "Meta Pixel, Conversions API ve dönüşüm takip altyapısı.", alt: "Facebook Pixel ve dönüşüm takip altyapısı" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Konya", "Adana", "Gaziantep", "Kayseri"]} services={[
    { title: "Kampanya yönetimi", description: "Hedef belirleme, kitle oluşturma, bütçe dağılımı ve günlük optimizasyon." },
    { title: "Kreatif üretim", description: "Reklam görselleri, video içerikler, carousel ve story formatları." },
    { title: "Hedef kitle ve retargeting", description: "Lookalike kitleler, ilgi alanı hedefleme ve web sitesi retargeting stratejileri." },
    { title: "Dönüşüm takibi ve raporlama", description: "Meta Pixel, Conversions API, özel dönüşüm olayları ve ROAS raporları." },
  ]} process={[
    { title: "Hesap audit", description: "Mevcut reklam hesabı yapısını, piksel kurulumunu ve geçmiş performansı analiz ederiz." },
    { title: "Strateji ve planlama", description: "Hedef, bütçe, kitle ve kreatif planını kampanya hedeflerine göre oluştururuz." },
    { title: "Yayın ve optimizasyon", description: "Kampanyaları yayına alır, A/B test ve hedefleme optimizasyonunu sürekli yaparız." },
    { title: "Raporlama ve büyüme", description: "Performans verilerini analiz eder, ROAS'ı artıracak stratejik kararlarla büyümeyi sürdürürüz." },
  ]}/>;
}
