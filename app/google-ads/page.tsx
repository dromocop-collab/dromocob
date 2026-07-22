import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Google Ads Yönetimi | Reklam Danışmanlığı | Türkiye Geneli",
  description: "Google Ads hesap kurulumu, anahtar kelime stratejisi, reklam metni optimizasyonu, dönüşüm takibi ve A/B test ile reklam bütçenizden maksimum verim. Dromocob ile ölçülebilir dijital reklam.",
  path: "/google-ads",
  keywords: ["Google Ads yönetimi", "Google Ads ajansı", "Google reklam yönetimi", "Google Ads danışmanlığı", "PPC yönetimi", "Google Ads optimizasyonu", "anahtar kelime reklamı", "dönüşüm takibi", "reklam bütçesi optimizasyonu", "Google Ads kampanya yönetimi", "İstanbul Google Ads", "Türkiye Google Ads"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/google-ads#service`, name: "Google Ads Yönetimi ve Reklam Danışmanlığı", serviceType: "Google Ads hesap yönetimi, kampanya optimizasyonu ve dönüşüm takibi", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/google-ads"), description: "Google Ads hesap kurulumu, anahtar kelime stratejisi, reklam metni, dönüşüm takibi ve performans optimizasyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function GoogleAdsPage() {
  return <ServiceLanding quoteService="web" path="/google-ads" breadcrumbLabel="Google Ads" eyebrow="Google Ads yönetimi · Dijital reklam · Türkiye" title="Reklam bütçen" accent="sonuç üretsin." intro="Google Ads hesap kurulumu, anahtar kelime stratejisi, reklam metni optimizasyonu ve dönüşüm takibi ile her harcanan TL'den ölçülebilir geri dönüş sağlıyoruz." schema={schema} faqs={[
    { question: "Google Ads yönetimi neleri kapsar?", answer: "Hesap yapılandırması, kampanya ve reklam grubu oluşturma, anahtar kelime araştırması ve negatif kelime yönetimi, reklam metni yazımı, teklif stratejisi, dönüşüm takibi kurulumu, A/B test ve düzenli performans raporlamasını kapsar." },
    { question: "Google Ads bütçesi ne kadar olmalı?", answer: "Minimum bütçe sektöre, rekabete ve hedef coğrafyaya göre değişir. Doğru anahtar kelime stratejisi ve kalite puanı optimizasyonuyla daha düşük bütçelerle bile etkili sonuçlar alınabilir. Bütçe önerisini audit sonrası paylaşırız." },
    { question: "Mevcut Google Ads hesabımı yönetebilir misiniz?", answer: "Evet. Önce mevcut hesabınızın performansını, kampanya yapısını, kalite puanlarını ve dönüşüm takibini analiz ederiz. Audit sonuçlarına göre optimizasyon planı hazırlanır." },
    { question: "Raporlama nasıl yapılıyor?", answer: "Haftalık veya aylık periyotlarla tıklama, gösterim, dönüşüm, maliyet ve ROI verilerini içeren şeffaf performans raporları paylaşılır. Raporlar, bir sonraki dönemin strateji kararlarını destekler." },
  ]} mediaEyebrow="Ads & analytics stack" mediaTitle="Reklam ve ölçüm altyapımız." media={[
    { src: "/images/services/web-design-system.webp", title: "Landing Page Optimizasyonu", detail: "Reklam trafiğini dönüşüme çeviren hedefli açılış sayfaları.", alt: "Google Ads için optimize edilmiş dönüşüm odaklı landing page" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Dönüşüm ve Ölçüm", detail: "GA4, Google Tag Manager ve dönüşüm takip altyapısı.", alt: "Google Ads dönüşüm takibi ve ölçüm altyapısı" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Konya", "Adana", "Gaziantep", "Kayseri"]} services={[
    { title: "Google Ads hesap yönetimi", description: "Hesap yapılandırması, kampanya oluşturma, teklif stratejisi ve günlük optimizasyon." },
    { title: "Anahtar kelime stratejisi", description: "Arama niyeti analizi, anahtar kelime araştırması, negatif kelime yönetimi ve eşleme stratejisi." },
    { title: "Reklam metni ve A/B test", description: "Dönüşüm odaklı reklam metinleri, uzantılar ve sürekli A/B test döngüsü." },
    { title: "Dönüşüm takibi ve raporlama", description: "GA4, GTM, dönüşüm etiketleri ve şeffaf performans raporları ile ölçülebilir sonuçlar." },
  ]} process={[
    { title: "Hesap audit", description: "Mevcut hesap yapısını, kalite puanlarını, dönüşüm takibini ve bütçe verimliliğini analiz ederiz." },
    { title: "Strateji ve kurulum", description: "Hedef, bütçe ve rekabet analizine göre kampanya yapısını ve anahtar kelime planını oluştururuz." },
    { title: "Yayın ve optimizasyon", description: "Kampanyaları yayına alır, teklif stratejisi, reklam metni ve hedeflemeyi sürekli optimize ederiz." },
    { title: "Raporlama ve büyüme", description: "Performans verilerini analiz eder, ROI'yi artıracak stratejik kararlarla büyümeyi sürdürürüz." },
  ]}/>;
}
