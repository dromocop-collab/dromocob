import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kurumsal Fotoğraf Çekimi | Profesyonel İş Fotoğrafçılığı | Türkiye",
  description: "Kurumsal fotoğraf çekimi hizmeti. Ekip fotoğrafı, portre, mekan, ürün ve etkinlik fotoğrafçılığı. Marka kimliğinize uygun profesyonel görseller. Dromocob.",
  path: "/kurumsal-fotograf-cekimi",
  keywords: ["kurumsal fotoğraf çekimi", "kurumsal fotoğrafçı", "iş fotoğrafçılığı", "ekip fotoğrafı", "profesyonel portre", "kurumsal portre çekimi", "şirket fotoğraf çekimi", "mekan fotoğraf çekimi", "ürün fotoğraf çekimi", "etkinlik fotoğrafçısı", "İstanbul kurumsal fotoğraf", "Türkiye kurumsal fotoğraf"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/kurumsal-fotograf-cekimi#service`, name: "Kurumsal Fotoğraf Çekimi — Profesyonel İş Fotoğrafçılığı", serviceType: "Kurumsal fotoğraf çekimi, portre, ekip ve mekan fotoğrafçılığı", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/kurumsal-fotograf-cekimi"), description: "Ekip fotoğrafı, kurumsal portre, mekan, ürün ve etkinlik fotoğraf çekimi hizmeti.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function KurumsalFotografCekimiPage() {
  return <ServiceLanding quoteService="video" path="/kurumsal-fotograf-cekimi" breadcrumbLabel="Kurumsal Fotoğraf" eyebrow="Kurumsal fotoğraf · İş fotoğrafçılığı · Türkiye" title="Markanın" accent="görsel kimliği." intro="Ekip fotoğrafları, kurumsal portreler, mekan çekimleri, ürün fotoğrafları ve etkinlik fotoğrafçılığı ile marka kimliğinize uygun profesyonel görseller üretiyoruz." schema={schema} faqs={[
    { question: "Kurumsal fotoğraf çekimi neleri kapsar?", answer: "Ekip fotoğrafları, yönetici portreleri, ofis/mekan çekimi, ürün fotoğrafı, etkinlik fotoğrafçılığı ve web sitesi görselleri çekimini kapsar." },
    { question: "Kurumsal fotoğraf çekimi fiyatları ne kadar?", answer: "Fiyat; çekim süresi, kişi sayısı, lokasyon, ürün sayısı ve teslim kapsamına göre değişir. Detaylarınızı paylaştığınızda özel teklif hazırlıyoruz." },
    { question: "Çekim nerede yapılıyor?", answer: "Ofisinizde, üretim tesisinizde, stüdyoda veya dış mekanda — projenize uygun lokasyonda çekim yapıyoruz." },
    { question: "Kaç fotoğraf teslim ediliyor?", answer: "Teslim edilen fotoğraf sayısı çekim kapsamına göre belirlenir ve proje başında netleştirilir. Tüm fotoğraflar renk düzeltme ve rötuş yapılarak teslim edilir." },
    { question: "Web sitesi ve sosyal medya görselleri de çekiliyor mu?", answer: "Evet. Web sitesi banner, hakkımızda sayfası, sosyal medya profil ve kapak görselleri dahil platform spesifik formatlarda teslim yapılabilir." },
    { question: "Video çekim ile birlikte fotoğraf da çekilebilir mi?", answer: "Evet. Tanıtım filmi veya video prodüksiyon projelerinde fotoğraf çekimi de aynı gün dahil edilebilir." },
  ]} mediaEyebrow="Photography equipment" mediaTitle="Fotoğraf çekim ekipmanlarımız." media={[
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony Full-Frame Sistem", detail: "Portre, mekan ve ürün fotoğrafları için profesyonel kalite.", alt: "Sony full-frame kamera ile kurumsal fotoğraf çekimi" },
    { src: "/images/services/gm-24-70-lens.webp", title: "Sony G Master Lensler", detail: "Geniş açıdan portre planına kadar çok yönlü optik.", alt: "Sony G Master lens ile profesyonel fotoğraf" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Profesyonel Işık", detail: "Kontrollü ışıkla tutarlı ve güven veren portreler.", alt: "Kurumsal fotoğraf çekimi profesyonel ışık sistemi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Konya", "Gaziantep"]} services={[
    { title: "Kurumsal portre çekimi", description: "Yönetici ve ekip üyelerinin profesyonel, güven veren ve marka uyumlu portreleri." },
    { title: "Mekan ve ofis çekimi", description: "Çalışma alanı, üretim tesisi ve kurumsal mekanların profesyonel fotoğrafları." },
    { title: "Ürün fotoğraf çekimi", description: "E-ticaret, katalog ve tanıtım amaçlı profesyonel ürün fotoğrafları." },
    { title: "Etkinlik fotoğrafçılığı", description: "Lansman, toplantı, konferans ve kurumsal etkinliklerin profesyonel belgelenmesi." },
  ]} process={[
    { title: "Briefing", description: "Çekim amacını, görsel yönü, kişi sayısını ve lokasyonu netleştiririz." },
    { title: "Çekim planı", description: "Işık, arka plan, poz ve zamanlama detaylarını planlarız." },
    { title: "Çekim", description: "Profesyonel ekipmanla kontrollü ve verimli bir çekim gerçekleştiririz." },
    { title: "Teslim", description: "Renk düzeltme, rötuş ve platform formatlarıyla görselleri teslim ederiz." },
  ]}/>;
}
