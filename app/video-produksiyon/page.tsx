import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Video Prodüksiyon | Profesyonel Video Çekimi | Türkiye Geneli",
  description: "Profesyonel video prodüksiyon hizmeti. Kurumsal tanıtım filmi, reklam filmi, ürün videosu, sosyal medya içerik üretimi ve post-prodüksiyon. Dromocob.",
  path: "/video-produksiyon",
  keywords: ["video prodüksiyon", "video çekimi", "profesyonel video çekimi", "reklam filmi çekimi", "kurumsal video", "ürün videosu", "sosyal medya video", "video prodüksiyon ajansı", "video çekim fiyatları", "İstanbul video prodüksiyon", "Fethiye video prodüksiyon", "Türkiye video prodüksiyon"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/video-produksiyon#service`, name: "Video Prodüksiyon — Profesyonel Video Çekimi ve Post-Prodüksiyon", serviceType: "Video prodüksiyon, reklam filmi, kurumsal video ve sosyal medya içerik üretimi", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/video-produksiyon"), description: "Kurumsal tanıtım filmi, reklam filmi, ürün videosu ve sosyal medya içerik üretimi. Konseptten teslime profesyonel video prodüksiyon.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function VideoProduksiyonPage() {
  return <ServiceLanding quoteService="video" path="/video-produksiyon" breadcrumbLabel="Video Prodüksiyon" eyebrow="Video prodüksiyon · Film çekimi · Türkiye" title="Hikâyeni" accent="görüntüyle anlat." intro="Kurumsal tanıtım filmi, reklam filmi, ürün videosu, sosyal medya içerikleri ve etkinlik çekimlerinde konseptten teslime uçtan uca profesyonel video prodüksiyon hizmeti sunuyoruz." schema={schema} faqs={[
    { question: "Video prodüksiyon neleri kapsar?", answer: "Konsept geliştirme, senaryo, storyboard, çekim planı, profesyonel çekim, kurgu, renk düzeltme (color grading), ses tasarımı, müzik, grafik ve platform adaptasyonlarını kapsar." },
    { question: "Video prodüksiyon fiyatları ne kadar?", answer: "Fiyat; video süresi, çekim günü sayısı, lokasyon, ekip büyüklüğü, özel ekipman, oyuncu/seslendirme ve post-prodüksiyon kapsamına göre değişir." },
    { question: "Hangi ekipmanlar kullanılıyor?", answer: "Sony FX3 sinema kamerası, GM serisi profesyonel lensler, DJI RS 4 gimbal, sinema ışık sistemi, DJI Mic 2 kablosuz mikrofon ve DJI Mini 5 Pro / Avata 2 drone sistemleri kullanıyoruz." },
    { question: "Sosyal medya videosu da üretiliyor mu?", answer: "Evet. Ana videonun yanı sıra Instagram Reels, TikTok, YouTube Shorts ve LinkedIn için dikey ve kısa format adaptasyonları teslim edilebilir." },
    { question: "Fethiye dışında çekim yapılıyor mu?", answer: "Evet. Fethiye merkezli çalışıyor, Türkiye genelinde projeler için seyahat ediyoruz." },
    { question: "Post-prodüksiyon süreci nasıl işliyor?", answer: "Çekim sonrası kurgu, renk düzeltme, ses tasarımı ve müzik entegrasyonu yapılır. Revizyon hakları proje başında belirlenir." },
  ]} mediaEyebrow="Production toolkit" mediaTitle="Video prodüksiyon setimiz." media={[
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Full-frame sinematik görüntü kalitesi ve profesyonel renk bilimi.", alt: "Sony FX3 sinema kamerası ile profesyonel video çekimi" },
    { src: "/images/services/gm-24-70-lens.webp", title: "Sony 24–70mm G Master", detail: "Geniş açıdan portre planına kadar çok yönlü optik sistem.", alt: "Sony 24-70mm G Master profesyonel kamera lensi" },
    { src: "/images/services/cinema-lighting-system.webp", title: "Cinema Lighting System", detail: "COB, softbox ve RGB ışıklarla kontrollü sinematik atmosfer.", alt: "Profesyonel sinema ışık sistemi" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Akıcı kamera hareketleri için profesyonel stabilizasyon.", alt: "DJI RS 4 gimbal ile akıcı video çekimi" },
    { src: "/images/services/dji-mic-2-wireless.webp", title: "DJI Mic 2", detail: "Kablosuz ses kaydı ile kristal netliğinde röportaj ve anlatım.", alt: "DJI Mic 2 kablosuz mikrofon" },
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Sinematik hava görüntüleme ve çevik drone operasyonu.", alt: "DJI Mini 5 Pro drone ile havadan video çekimi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Adana", "Trabzon"]} services={[
    { title: "Kurumsal tanıtım filmi", description: "Şirket, tesis, ürün ve ekip anlatısını sinematik bir hikâyeyle buluşturan tanıtım filmi." },
    { title: "Reklam filmi", description: "Dijital ve geleneksel kanallarda yayınlanacak konsept odaklı reklam filmi prodüksiyonu." },
    { title: "Ürün ve e-ticaret videosu", description: "Ürün özelliklerini, kullanım senaryolarını ve değerini gösteren satış odaklı video." },
    { title: "Sosyal medya içerik üretimi", description: "Reels, Shorts, Story ve feed formatlarında platform odaklı kısa video üretimi." },
  ]} process={[
    { title: "Keşif ve konsept", description: "Markanızı, hedef kitlenizi ve videonun kullanım amacını anlarız." },
    { title: "Pre-prodüksiyon", description: "Senaryo, storyboard, lokasyon keşfi, ekipman ve çekim planını hazırlarız." },
    { title: "Çekim", description: "Profesyonel ekipmanla planlı ve kontrollü bir set akışında çekimi tamamlarız." },
    { title: "Post-prodüksiyon", description: "Kurgu, renk, ses, grafik ve platform adaptasyonlarıyla videoyu teslim ederiz." },
  ]}/>;
}
