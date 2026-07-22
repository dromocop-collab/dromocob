import ServiceLanding from "@/components/service-landing";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Drone Çekimi | Profesyonel Hava Görüntüleme | Türkiye",
  description: "Profesyonel drone çekimi ve havadan video hizmeti. Gayrimenkul, tesis, etkinlik, marka filmi ve kurumsal projeler için sinematik drone ve FPV çekimi. Türkiye geneli Dromocob.",
  path: "/drone-cekimi",
  keywords: ["drone çekimi", "drone video çekimi", "havadan çekim", "profesyonel drone çekimi", "kurumsal drone çekimi", "gayrimenkul drone çekimi", "drone çekim hizmeti", "drone ile video çekimi", "havadan görüntüleme", "FPV drone çekimi", "sinematik drone", "drone çekim fiyatları", "İstanbul drone çekimi", "Fethiye drone çekimi", "Muğla drone çekimi", "Antalya drone çekimi", "Türkiye drone çekimi"],
});

const schema = { "@context": "https://schema.org", "@type": "Service", "@id": `${siteUrl}/drone-cekimi#service`, name: "Profesyonel Drone Çekimi ve Hava Görüntüleme", serviceType: "Drone çekimi, havadan video çekimi ve FPV drone hizmeti", provider: { "@type": "ProfessionalService", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl }, areaServed: { "@type": "Country", name: "Türkiye" }, url: absoluteUrl("/drone-cekimi"), description: "Gayrimenkul, tesis, etkinlik ve marka filmi için profesyonel drone çekimi ve sinematik hava görüntüleme hizmeti.", availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" } };

export default function DroneCekimiPage() {
  return <ServiceLanding quoteService="video" path="/drone-cekimi" breadcrumbLabel="Drone Çekimi" eyebrow="Drone çekimi · Hava görüntüleme · Türkiye" title="Markanı havadan" accent="göster." intro="Gayrimenkul, tesis, etkinlik, marka filmi ve kurumsal projeleriniz için sinematik drone ve FPV çekimi ile profesyonel hava görüntüleme hizmeti sunuyoruz. Fethiye merkezli, Türkiye genelinde operasyon." schema={schema} faqs={[
    { question: "Drone çekimi hangi projeler için yapılıyor?", answer: "Gayrimenkul tanıtımı, tesis ve fabrika çekimi, otel ve tatil köyü, şantiye takibi, etkinlik ve lansman, marka filmi, sosyal medya içerikleri ve kurumsal tanıtım projeleri için drone çekimi yapıyoruz." },
    { question: "Drone çekimi için hangi ekipmanlar kullanılıyor?", answer: "DJI Mini 5 Pro ile yüksek kaliteli sinematik hava görüntüleri, DJI Avata 2 FPV ile mekânın içine giren dinamik planlar çekiyoruz. Proje ihtiyacına göre iki sistem birlikte kullanılabilir." },
    { question: "Drone çekimi fiyatları neye göre belirlenir?", answer: "Fiyat; çekim süresi, lokasyon sayısı, uçuş koşulları, post-prodüksiyon kapsamı ve teslim formatına göre değişir. Projenizin detaylarını paylaştığınızda size özel teklif hazırlarız." },
    { question: "Drone çekimi için uçuş izni gerekiyor mu?", answer: "Lokasyona ve bölgeye göre uçuş izni gerekebilir. Çekim öncesinde uçuş uygunluğunu, hava koşullarını ve gerekli izin süreçlerini değerlendirerek operasyon planını netleştiriyoruz." },
    { question: "Fethiye dışında drone çekimi yapıyor musunuz?", answer: "Evet. Fethiye merkezli çalışıyor, Türkiye genelinde kurumsal drone çekimi için seyahat ediyoruz. İstanbul, Ankara, İzmir, Antalya ve diğer illerde operasyon planlayabiliyoruz." },
    { question: "Drone çekimi sonrası teslim süreci nasıl oluyor?", answer: "Çekim sonrası renk düzeltme, stabilizasyon ve kurgu yapılır. İhtiyaca göre 4K yatay video, dikey Reels/Shorts formatları ve ham görüntü teslimi dahil edilebilir." },
  ]} mediaEyebrow="Aerial production fleet" mediaTitle="Drone ve hava çekim sistemlerimiz." media={[
    { src: "/images/services/dji-mini-5-pro-drone.webp", title: "DJI Mini 5 Pro", detail: "Kompakt yapıda 4K sinematik hava görüntüleme ve çevik operasyon.", alt: "DJI Mini 5 Pro drone ile profesyonel havadan video çekimi" },
    { src: "/images/services/dji-avata-2-fpv-drone.webp", title: "DJI Avata 2 FPV", detail: "Mekânın içine giren sürükleyici ve dinamik FPV drone planları.", alt: "DJI Avata 2 FPV drone ile sinematik dinamik çekim" },
    { src: "/images/services/sony-fx3-cinema-camera.webp", title: "Sony FX3 Cinema Line", detail: "Drone görüntüleriyle birleşen yer seviyesi sinematik çekimler.", alt: "Sony FX3 sinema kamerası ile profesyonel video prodüksiyon" },
    { src: "/images/services/dji-rs3-gimbal.webp", title: "DJI RS 4 Gimbal", detail: "Havadan yere geçiş planları için akıcı kamera hareketi.", alt: "DJI RS 4 gimbal ile akıcı video çekimi" },
  ]} cities={["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Fethiye", "Muğla", "Kocaeli", "Adana", "Trabzon"]} services={[
    { title: "Sinematik drone çekimi", description: "4K çözünürlükte, renkçi ile renk düzeltmesi yapılmış sinematik hava görüntüleri ve profesyonel kadrajlar." },
    { title: "FPV drone çekimi", description: "Mekânın içinde süzülen, dinamik ve sürükleyici FPV planlarla fark yaratan görsel anlatı." },
    { title: "Gayrimenkul ve mekân çekimi", description: "Otel, villa, proje sahası ve ticari mekânları havadan konumlandıran tanıtım görüntüleri." },
    { title: "Kurumsal ve etkinlik çekimi", description: "Tesis, fabrika, lansman ve etkinlikleri güçlü bir hava perspektifiyle belgeleyen drone operasyonu." },
  ]} process={[
    { title: "Proje değerlendirme", description: "Lokasyon, amaç, uçuş koşulları ve teslim beklentisini netleştiririz." },
    { title: "Uçuş planı", description: "Güzergâh, yükseklik, kamera açıları ve güvenlik kontrollerini planlayarak operasyonu hazırlarız." },
    { title: "Drone çekimi", description: "Planlanan rota üzerinde sinematik veya FPV çekimleri kontrollü ve güvenli şekilde gerçekleştiririz." },
    { title: "Post-prodüksiyon ve teslim", description: "Renk düzeltme, stabilizasyon, kurgu ve platform adaptasyonlarıyla yayın paketini tamamlarız." },
  ]} />;
}
