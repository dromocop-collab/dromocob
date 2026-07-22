import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tanıtım Filmi Çekimi | Kurumsal Tanıtım Videosu | Türkiye",
  description: "Profesyonel tanıtım filmi çekimi ve kurumsal tanıtım videosu prodüksiyonu. Şirket tanıtım filmi, ürün tanıtım videosu ve marka filmi. Konseptten teslime Dromocob.",
  path: "/tanitim-filmi",
  keywords: ["tanıtım filmi", "tanıtım filmi çekimi", "kurumsal tanıtım filmi", "kurumsal tanıtım videosu", "tanıtım videosu", "şirket tanıtım filmi", "firma tanıtım filmi", "ürün tanıtım videosu", "tanıtım filmi yapımı", "tanıtım filmi fiyatları", "profesyonel tanıtım filmi", "marka tanıtım filmi", "fabrika tanıtım filmi", "otel tanıtım filmi", "İstanbul tanıtım filmi", "Fethiye tanıtım filmi", "Türkiye tanıtım filmi"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/tanitim-filmi#service`, name: "Tanıtım Filmi Çekimi ve Kurumsal Tanıtım Videosu", serviceType: "Kurumsal tanıtım filmi çekimi, şirket tanıtım videosu ve marka filmi prodüksiyonu", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/tanitim-filmi"), description: "Kurumsal tanıtım filmi, şirket tanıtım videosu, ürün tanıtım filmi ve marka filmi prodüksiyonu.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function TanitimFilmiPage() {
  return <ServiceLanding quoteService="video" path="/tanitim-filmi" breadcrumbLabel="Tanıtım Filmi" eyebrow="Tanıtım filmi çekimi · Kurumsal video · Türkiye" title="Markanızı anlatan" accent="tanıtım filmi." intro="Şirketinizi, ürünlerinizi, tesisinizi ve ekibinizi profesyonel bir tanıtım filmiyle anlatıyoruz. Konsept, senaryo, çekim, kurgu ve renk tasarımına kadar uçtan uca tanıtım filmi prodüksiyonu." schema={schema} faqs={[
    { question: "Tanıtım filmi çekimi ne kadar sürer?", answer: "Tanıtım filmi projeleri genellikle pre-prodüksiyon (konsept, senaryo, planlama) dahil 2–4 haftada tamamlanır. Çekim süresi tek lokasyonda yarım günden, çoklu lokasyonlarda birkaç güne kadar değişebilir. Kesin takvim proje kapsamıyla birlikte netleştirilir." },
    { question: "Tanıtım filmi fiyatları neye göre belirlenir?", answer: "Fiyat; filmin süresi, çekim günü sayısı, lokasyon, ekip büyüklüğü, özel ekipman ihtiyacı, oyuncu/seslendirme ve post-prodüksiyon kapsamına göre değişir. Projenizin detaylarını paylaştığınızda bütçeye uygun bir teklif hazırlıyoruz." },
    { question: "Hangi sektörler için tanıtım filmi çekiyorsunuz?", answer: "Üretim ve sanayi, gayrimenkul, otelcilik ve turizm, sağlık, eğitim, teknoloji, gıda, perakende ve hizmet sektörü dahil her alanda kurumsal tanıtım filmi çekiyoruz." },
    { question: "Tanıtım filminde drone çekimi dahil mi?", answer: "Tesis, fabrika ve açık alan projelerinde sinematik drone planları büyük fark yaratır. Proje kapsamına göre DJI Mini 5 Pro ve DJI Avata 2 FPV drone çekimleri prodüksiyona eklenebilir." },
    { question: "Tanıtım filmi sosyal medyada da kullanılabilir mi?", answer: "Evet. Ana filmin yanı sıra Instagram Reels, TikTok, YouTube Shorts ve LinkedIn için dikey (9:16), kare (1:1) ve kısa versiyon adaptasyonları da teslim paketine eklenebilir." },
    { question: "Tanıtım filmi için senaryo hazırlıyor musunuz?", answer: "Evet. Markanızın hedeflerine, mesajına ve hedef kitlesine uygun konsept ve senaryo yazımı hizmetimizin standart parçasıdır. Mevcut bir briefiniz varsa onu da temel alabiliriz." },
  ]} mediaEyebrow="Production toolkit" mediaTitle="Tanıtım filmi üretim setimiz." media={[
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Full-frame sinematik görüntü kalitesi ve profesyonel renk bilimi.", alt: "Sony FX3 sinema kamerası ile profesyonel tanıtım filmi çekimi" },
    { src: "/images/services/gm-24-70-lens.webp", title: "Sony 24–70mm G Master", detail: "Geniş açıdan portre planına kadar çok yönlü optik sistem.", alt: "Sony 24-70mm G Master profesyonel kamera lensi" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Cinema Lighting System", detail: "COB, softbox ve RGB ışıklarla kontrollü sinematik atmosfer.", alt: "Profesyonel sinema ışık sistemi ile tanıtım filmi aydınlatma" },
    { src: "/images/services/dji-mic-2-wireless.webp", title: "DJI Mic 2", detail: "Röportaj ve anlatım çekimlerinde kristal netliğinde kablosuz ses.", alt: "DJI Mic 2 kablosuz mikrofon tanıtım filmi ses kaydı" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Tesis turu ve ürün çekimlerinde akıcı kamera hareketleri.", alt: "DJI RS 4 gimbal ile akıcı tanıtım filmi çekimi" },
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Tesis ve çevre çekimlerinde sinematik hava görüntüleme.", alt: "DJI Mini 5 Pro drone ile tanıtım filmi havadan çekim" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Adana", "Trabzon"]} services={[
    { title: "Kurumsal tanıtım filmi", description: "Şirketinizi, tesisinizi, üretim gücünüzü ve ekibinizi güven veren sinematik bir hikâyeyle anlatırız." },
    { title: "Ürün tanıtım videosu", description: "Ürününüzün değerini, kullanımını ve farkını net gösteren satış odaklı tanıtım içerikleri üretiriz." },
    { title: "Marka ve reklam filmi", description: "Marka konumlandırmanızı güçlü bir fikir, sinematografi ve akılda kalıcı anlatıyla buluştururuz." },
    { title: "Sosyal medya adaptasyonları", description: "Ana tanıtım filminden Reels, Shorts ve Story formatlarında platform odaklı kısa içerikler türetiriz." },
  ]} process={[
    { title: "Kreatif keşif", description: "Markayı, hedef kitleyi, ana mesajı ve tanıtım filminin kullanılacağı kanalları belirleriz." },
    { title: "Pre-prodüksiyon", description: "Konsept, senaryo, storyboard, lokasyon keşfi ve çekim planını hazırlarız." },
    { title: "Çekim", description: "Sinema kalitesinde görüntü, profesyonel ışık ve ses kaydıyla çekimi kontrollü bir set akışında tamamlarız." },
    { title: "Post-prodüksiyon", description: "Kurgu, renk düzeltme, ses tasarımı, müzik ve platform adaptasyonlarıyla tanıtım filmini teslim ederiz." },
  ]}/>;
}
