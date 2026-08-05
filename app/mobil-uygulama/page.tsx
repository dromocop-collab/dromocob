import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobil Uygulama Geliştirme | iOS & Android | Türkiye",
  description: "iOS ve Android için profesyonel mobil uygulama geliştirme. React Native, cross-platform ve native uygulama çözümleri. Tasarımdan yayına Dromocob.",
  path: "/mobil-uygulama",
  keywords: ["mobil uygulama", "mobil uygulama geliştirme", "iOS uygulama", "Android uygulama", "mobil uygulama yapımı", "mobil uygulama fiyatları", "React Native", "cross-platform uygulama", "mobil yazılım", "uygulama geliştirme ajansı", "İstanbul mobil uygulama", "Türkiye mobil uygulama"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/mobil-uygulama#service`, name: "Mobil Uygulama Geliştirme — iOS & Android", serviceType: "iOS ve Android mobil uygulama geliştirme, cross-platform çözümler", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/mobil-uygulama"), description: "iOS ve Android için profesyonel mobil uygulama tasarım ve geliştirme hizmeti.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function MobilUygulamaPage() {
  return <ServiceLanding quoteService="web" path="/mobil-uygulama" breadcrumbLabel="Mobil Uygulama" eyebrow="Mobil uygulama · iOS & Android · Türkiye" title="Fikrinizi" accent="uygulamaya dönüştürün." intro="iOS ve Android platformları için kullanıcı deneyimi odaklı, performanslı ve ölçeklenebilir mobil uygulamalar tasarlıyoruz. Konseptten App Store yayınına kadar uçtan uca geliştirme." schema={schema} faqs={[
    { question: "Mobil uygulama geliştirme fiyatları ne kadar?", answer: "Fiyat; uygulama kapsamı, platform sayısı (iOS/Android), özel modüller, API entegrasyonları ve tasarım kapsamına göre değişir. Detaylarınızı paylaştığınızda bütçeye uygun teklif hazırlıyoruz." },
    { question: "Hem iOS hem Android için aynı anda geliştirilebilir mi?", answer: "Evet. React Native veya cross-platform teknolojilerle tek kod tabanından her iki platform için uygulama geliştirilebilir." },
    { question: "Uygulama ne kadar sürede hazır olur?", answer: "Basit uygulamalar 1–2 ay, kapsamlı projeler 2–4 ay arasında tamamlanır. Kesin takvim proje kapsamıyla birlikte netleştirilir." },
    { question: "App Store ve Google Play yayını dahil mi?", answer: "Evet. Uygulama mağazası hesap kurulumu, görseller, açıklamalar ve yayın süreci dahil olarak yönetilir." },
    { question: "Mevcut web sistemimle entegre olabilir mi?", answer: "Evet. Mevcut web siteniz, API'leriniz ve veri tabanınızla entegreli çalışan mobil uygulama geliştirebiliriz." },
    { question: "Yayın sonrası güncelleme desteği var mı?", answer: "Evet. Yayın sonrası bakım, güncelleme ve yeni özellik geliştirme paketleri sunuyoruz." },
  ]} mediaEyebrow="Mobile development stack" mediaTitle="Mobil uygulama altyapımız." media={[
    { src: "/images/services/web-design-system.webp", title: "Mobil UX Tasarımı", detail: "iOS ve Android tasarım standartlarına uygun kullanıcı deneyimi.", alt: "Mobil uygulama UX/UI tasarım sistemi" },
    { src: "/images/services/web-software-infrastructure.webp", title: "Cross-Platform Altyapı", detail: "React Native, Firebase ve bulut servisleriyle ölçeklenebilir mobil altyapı.", alt: "Cross-platform mobil uygulama geliştirme altyapısı" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Gaziantep"]} services={[
    { title: "iOS uygulama geliştirme", description: "App Store standartlarına uygun, performanslı ve kullanıcı dostu iPhone ve iPad uygulamaları." },
    { title: "Android uygulama geliştirme", description: "Google Play standartlarına uygun, farklı ekran boyutlarına optimize Android uygulamaları." },
    { title: "Cross-platform çözümler", description: "React Native ile tek kod tabanından hem iOS hem Android uygulamaları." },
    { title: "API ve entegrasyon", description: "Mevcut sistemler, ödeme, harita, bildirim ve üçüncü parti servis entegrasyonları." },
  ]} process={[
    { title: "Keşif ve planlama", description: "Uygulama fikrinizi, hedef kitlenizi ve teknik gereksinimleri analiz ederiz." },
    { title: "UX/UI tasarımı", description: "Kullanıcı akışları, wireframe ve yüksek kaliteli tasarım prototiplerini hazırlarız." },
    { title: "Geliştirme", description: "Uygulamayı iteratif sprintlerle geliştirip düzenli demo ve geri bildirim alırız." },
    { title: "Test ve yayın", description: "Kapsamlı test, mağaza hazırlığı ve yayın sürecini yönetiriz." },
  ]}/>;
}
