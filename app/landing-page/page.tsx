import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Landing Page Tasarımı | Dönüşüm Odaklı Açılış Sayfası | Türkiye",
  description: "Reklam kampanyalarınız için dönüşüm odaklı landing page tasarımı. A/B test, hızlı yükleme, mobil uyumlu ve form optimizasyonlu açılış sayfası. Dromocob.",
  path: "/landing-page",
  keywords: ["landing page", "landing page tasarımı", "açılış sayfası", "dönüşüm odaklı tasarım", "landing page yapımı", "reklam açılış sayfası", "landing page fiyatları", "Google Ads landing page", "lead toplama sayfası", "İstanbul landing page", "Türkiye landing page"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/landing-page#service`, name: "Landing Page Tasarımı — Dönüşüm Odaklı Açılış Sayfası", serviceType: "Landing page tasarımı, dönüşüm optimizasyonu ve açılış sayfası geliştirme", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/landing-page"), description: "Google Ads ve sosyal medya kampanyaları için dönüşüm odaklı, hızlı ve A/B test edilebilir landing page.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function LandingPagePage() {
  return <ServiceLanding quoteService="web" path="/landing-page" breadcrumbLabel="Landing Page" eyebrow="Landing page · Dönüşüm odaklı · Türkiye" title="Her tıklama" accent="dönüşüme dönüşsün." intro="Google Ads, Meta ve sosyal medya kampanyalarınız için özel tasarlanmış, hızlı yüklenen, A/B test edilebilir ve dönüşüm odaklı landing page (açılış sayfası) tasarlayıp geliştiriyoruz." schema={schema} faqs={[
    { question: "Landing page nedir?", answer: "Landing page, reklam kampanyalarından gelen trafiği belirli bir aksiyona yönlendirmek için tasarlanmış özel açılış sayfasıdır. Form doldurma, arama, WhatsApp veya satın alma gibi tek bir hedefe odaklanır." },
    { question: "Landing page fiyatları ne kadar?", answer: "Fiyat; tasarım kapsamı, form entegrasyonu, A/B test varyasyonları ve kampanya hedeflerine göre değişir. Detaylarınızı paylaştığınızda özel teklif hazırlıyoruz." },
    { question: "Landing page ne kadar sürede hazır olur?", answer: "Tek sayfalık bir landing page genellikle 3–7 iş gününde teslim edilir. Çoklu varyasyonlar ve entegrasyonlar süreyi uzatabilir." },
    { question: "Google Ads ile uyumlu mu?", answer: "Evet. Google Ads kalite puanını yükselten hız, mobil uyumluluk ve içerik tutarlılığı standart olarak dahildir." },
    { question: "Form verileri nereye gidiyor?", answer: "Form verileri e-posta bildirimi, CRM entegrasyonu, Google Sheets veya özel yönetim paneline yönlendirilebilir." },
    { question: "A/B test desteği var mı?", answer: "Evet. Farklı başlık, görsel ve CTA varyasyonlarıyla A/B test yapılabilir ve en yüksek dönüşümlü versiyon belirlenir." },
  ]} mediaEyebrow="Conversion technology stack" mediaTitle="Landing page altyapımız." media={[
    { src: "/images/services/web-design-system.webp", title: "Dönüşüm Odaklı Tasarım", detail: "Tek hedefe odaklanan, dikkat dağıtmayan açılış sayfası tasarımı.", alt: "Dönüşüm odaklı landing page tasarımı" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Hız ve Ölçüm", detail: "Hızlı yükleme, GA4 dönüşüm takibi ve A/B test altyapısı.", alt: "Landing page hız ve dönüşüm ölçüm altyapısı" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Gaziantep"]} services={[
    { title: "Landing page tasarımı", description: "Tek hedefe odaklanan, görsel olarak güçlü ve mobil öncelikli açılış sayfası tasarımı." },
    { title: "Form ve lead optimizasyonu", description: "Temas formu, telefon, WhatsApp ve CRM entegrasyonuyla lead toplama optimizasyonu." },
    { title: "A/B test ve varyasyonlar", description: "Farklı başlık, görsel ve CTA kombinasyonlarıyla dönüşüm oranı optimizasyonu." },
    { title: "Hız ve dönüşüm takibi", description: "Core Web Vitals uyumlu hız, GA4 olay takibi ve dönüşüm raporlama." },
  ]} process={[
    { title: "Kampanya analizi", description: "Reklam hedefi, hedef kitle ve dönüşüm aksiyonunu netleştiririz." },
    { title: "Tasarım", description: "Tek hedefe odaklanan, dikkat dağıtmayan güçlü bir açılış sayfası tasarlarız." },
    { title: "Geliştirme", description: "Hızlı, mobil uyumlu ve ölçüm altyapısı entegreli landing page'i geliştiririz." },
    { title: "Test ve yayın", description: "Hız, form ve dönüşüm takibi testlerini tamamlayıp yayına alırız." },
  ]}/>;
}
