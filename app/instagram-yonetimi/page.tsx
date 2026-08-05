import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Instagram Yönetimi | Profesyonel Sosyal Medya Yönetimi | Türkiye",
  description: "Profesyonel Instagram hesap yönetimi. İçerik stratejisi, Reels üretimi, paylaşım planı, topluluk yönetimi ve performans analizi. Dromocob.",
  path: "/instagram-yonetimi",
  keywords: ["Instagram yönetimi", "Instagram hesap yönetimi", "sosyal medya yönetimi", "Instagram içerik üretimi", "Instagram Reels", "Instagram danışmanlığı", "sosyal medya ajansı", "Instagram takipçi artırma", "Instagram stratejisi", "İstanbul Instagram yönetimi", "Türkiye Instagram yönetimi"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/instagram-yonetimi#service`, name: "Instagram Yönetimi — Profesyonel Sosyal Medya Yönetimi", serviceType: "Instagram hesap yönetimi, içerik üretimi ve topluluk yönetimi", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/instagram-yonetimi"), description: "İçerik stratejisi, Reels üretimi, paylaşım planı ve topluluk yönetimi ile profesyonel Instagram yönetimi.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function InstagramYonetimiPage() {
  return <ServiceLanding quoteService="web" path="/instagram-yonetimi" breadcrumbLabel="Instagram Yönetimi" eyebrow="Instagram yönetimi · Sosyal medya · Türkiye" title="Markayı" accent="Instagram'da büyüt." intro="İçerik stratejisi, Reels ve kısa video üretimi, paylaşım planı, topluluk yönetimi ve performans analizi ile markanızın Instagram hesabını profesyonelce yönetiyoruz." schema={schema} faqs={[
    { question: "Instagram yönetimi neleri kapsar?", answer: "İçerik stratejisi, görsel ve video üretimi, Reels prodüksiyonu, paylaşım planı, hashtag araştırması, topluluk yönetimi (yorum ve DM), raporlama ve performans analizini kapsar." },
    { question: "Instagram yönetimi fiyatları ne kadar?", answer: "Fiyat; aylık içerik sayısı, video prodüksiyon kapsamı, reklam yönetimi dahil mi değil mi ve topluluk yönetimi yoğunluğuna göre değişir." },
    { question: "Reels ve video içerik üretiliyor mu?", answer: "Evet. Profesyonel kamera, ışık ve kurgu sistemiyle Instagram Reels, Story ve feed videoları üretiyoruz." },
    { question: "İçerik takvimi nasıl belirleniyor?", answer: "Marka hedefleri, sektör trendleri ve performans verilerine göre aylık içerik takvimi hazırlanır ve onayınıza sunulur." },
    { question: "Mevcut Instagram hesabımı devralabilir misiniz?", answer: "Evet. Mevcut hesabınızın performansını analiz eder, içerik stratejisi oluşturur ve profesyonel yönetimi başlatırız." },
    { question: "Reklam yönetimi de dahil mi?", answer: "Instagram reklam yönetimi ayrı bir hizmet olarak sunulur. Meta Reklamları hizmetimizle birlikte entegre çalışabilir." },
  ]} mediaEyebrow="Social media production" mediaTitle="İçerik üretim altyapımız." media={[
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Video Prodüksiyon", detail: "Reels ve kısa video formatlarında profesyonel içerik üretimi.", alt: "Instagram Reels video prodüksiyon sistemi" },
    { src: "/images/services/dji-mic-2-wireless.webp", title: "Ses ve Anlatım", detail: "Voiceover ve seslendirme ile desteklenen içerikler.", alt: "Instagram içerik üretimi ses kayıt sistemi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Gaziantep"]} services={[
    { title: "İçerik stratejisi", description: "Marka hedeflerine uygun içerik sütunları, format matrisi ve paylaşım ritmi." },
    { title: "Reels ve video üretimi", description: "Profesyonel ekipmanla çekilen, kurgulanan ve platforma optimize edilen kısa videolar." },
    { title: "Topluluk yönetimi", description: "Yorum, DM, mention ve etkileşim yönetimi ile marka iletişimi." },
    { title: "Performans analizi", description: "Erişim, etkileşim, takipçi büyümesi ve içerik performans raporları." },
  ]} process={[
    { title: "Hesap analizi", description: "Mevcut hesabın performansını, hedef kitlesini ve rakiplerini analiz ederiz." },
    { title: "Strateji ve planlama", description: "İçerik sütunları, format sistemi ve aylık paylaşım takvimi oluştururuz." },
    { title: "Üretim ve yayın", description: "İçerikleri üretir, onayınızı alır ve planlı şekilde yayınlarız." },
    { title: "Raporlama ve iterasyon", description: "Performans verilerini analiz eder, bir sonraki dönem stratejisini geliştiririz." },
  ]}/>;
}
