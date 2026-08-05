import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Web Sitesi, Web Yazılım ve Video Prodüksiyon Hizmetleri",
  description: "Türkiye genelinde kurumsal web tasarım, özel web yazılım, reklam filmi, tanıtım filmi, drone ve video prodüksiyon hizmetleri.",
  path: "/hizmetler",
  keywords: ["kurumsal web sitesi", "web sitesi yaptırma", "e-ticaret sitesi", "özel web yazılım", "kurumsal tanıtım filmi", "tanıtım videosu", "video prodüksiyon ajansı", "İstanbul"],
});

const services = [
  {
    href: "/web-tasarim",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Web design & development",
    title: "Web Tasarım ve Web Yazılım",
    description: "Kurumsal web sitesi, özel yazılım, yönetim paneli, e-ticaret, performans ve teknik SEO altyapıları.",
    alt: "Kurumsal web tasarım ve web yazılım hizmetleri",
  },
  {
    href: "/kurumsal-web-tasarim",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Corporate web design",
    title: "Kurumsal Web Tasarım",
    description: "Marka kimliğine uygun, güven veren, hızlı ve SEO uyumlu profesyonel kurumsal web sitesi.",
    alt: "Kurumsal web tasarım hizmeti",
  },
  {
    href: "/e-ticaret-web-tasarim",
    image: "/images/services/web-software-infrastructure.webp",
    eyebrow: "E-commerce solutions",
    title: "E-Ticaret Web Tasarım",
    description: "Ödeme entegrasyonu, ürün yönetimi, sipariş takibi ve SEO uyumlu altyapıyla satışa hazır dijital mağaza.",
    alt: "E-ticaret web tasarım ve online mağaza hizmeti",
  },
  {
    href: "/landing-page",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Conversion optimization",
    title: "Landing Page",
    description: "Reklam kampanyaları için dönüşüm odaklı, hızlı ve A/B test edilebilir açılış sayfası tasarımı.",
    alt: "Dönüşüm odaklı landing page tasarım hizmeti",
  },
  {
    href: "/mobil-uygulama",
    image: "/images/services/web-software-infrastructure.webp",
    eyebrow: "Mobile development",
    title: "Mobil Uygulama",
    description: "iOS ve Android için kullanıcı deneyimi odaklı, performanslı cross-platform mobil uygulama.",
    alt: "Mobil uygulama geliştirme hizmeti",
  },
  {
    href: "/video-produksiyon",
    image: "/images/services/sony-fx3-cinema-camera.webp",
    eyebrow: "Film & video production",
    title: "Video Prodüksiyon",
    description: "Kurumsal tanıtım filmi, reklam filmi, ürün videosu ve sosyal medya içerik üretimi.",
    alt: "Profesyonel video prodüksiyon hizmetleri",
  },
  {
    href: "/tanitim-filmi",
    image: "/images/services/cinema-lighting-system.webp",
    eyebrow: "Corporate film production",
    title: "Tanıtım Filmi Çekimi",
    description: "Kurumsal tanıtım filmi, şirket tanıtım videosu, ürün tanıtım filmi ve marka filmi prodüksiyonu.",
    alt: "Kurumsal tanıtım filmi çekimi ve prodüksiyonu",
  },
  {
    href: "/drone-cekimi",
    image: "/images/services/dji-mini-5-pro-drone.webp",
    eyebrow: "Aerial cinematography",
    title: "Drone Çekimi",
    description: "Gayrimenkul, tesis, etkinlik ve marka filmi için profesyonel drone ve FPV hava görüntüleme.",
    alt: "Profesyonel drone çekimi ve havadan görüntüleme",
  },
  {
    href: "/kurumsal-fotograf-cekimi",
    image: "/images/services/gm-24-70-lens.webp",
    eyebrow: "Corporate photography",
    title: "Kurumsal Fotoğraf Çekimi",
    description: "Ekip fotoğrafları, kurumsal portreler, mekan ve ürün fotoğrafçılığı.",
    alt: "Kurumsal fotoğraf çekimi hizmeti",
  },
  {
    href: "/magaza-tanitimi",
    image: "/images/services/cinema-lighting-system.webp",
    eyebrow: "Store & venue production",
    title: "Mağaza Tanıtımı",
    description: "Mağaza, showroom, restoran ve kurumsal mekânlar için tanıtım filmi ve sosyal medya adaptasyonları.",
    alt: "Mağaza ve mekân tanıtım filmi prodüksiyonu",
  },
  {
    href: "/villa-tanitimi",
    image: "/images/services/dji-mini-5-pro-drone.webp",
    eyebrow: "Real estate production",
    title: "Villa Tanıtımı",
    description: "Villa ve gayrimenkul projeleri için sinematik tanıtım filmi, drone ve iç mekan çekimi.",
    alt: "Villa tanıtım filmi ve gayrimenkul çekimi",
  },
  {
    href: "/restoran-tanitimi",
    image: "/images/services/sony-fx3-cinema-camera.webp",
    eyebrow: "Food & venue production",
    title: "Restoran Tanıtımı",
    description: "Restoran, kafe ve yeme-içme mekanları için tanıtım filmi ve yemek çekimi.",
    alt: "Restoran tanıtım filmi ve yemek çekimi",
  },
  {
    href: "/otel-tanitimi",
    image: "/images/services/dji-avata-2-fpv-drone.webp",
    eyebrow: "Hospitality production",
    title: "Otel Tanıtımı",
    description: "Otel, tatil köyü ve konaklama tesisleri için sinematik tanıtım filmi ve drone çekimi.",
    alt: "Otel tanıtım filmi ve konaklama çekimi",
  },
  {
    href: "/insaat-firma-tanitimi",
    image: "/images/services/dji-mini-5-pro-drone.webp",
    eyebrow: "Construction production",
    title: "İnşaat Firma Tanıtımı",
    description: "İnşaat firmaları için kurumsal tanıtım filmi, şantiye drone çekimi ve proje videosu.",
    alt: "İnşaat firma tanıtım filmi ve şantiye çekimi",
  },
  {
    href: "/seo",
    image: "/images/services/web-software-infrastructure.webp",
    eyebrow: "Search engine optimization",
    title: "SEO Hizmeti",
    description: "Teknik SEO, yerel SEO, içerik stratejisi, Core Web Vitals ve yapılandırılmış veri ile organik büyüme.",
    alt: "Teknik SEO ve organik büyüme hizmetleri",
  },
  {
    href: "/teknik-seo",
    image: "/images/services/web-software-infrastructure.webp",
    eyebrow: "Technical SEO",
    title: "Teknik SEO",
    description: "Core Web Vitals, site hızı, crawl optimizasyonu, yapılandırılmış veri ve indeksleme kontrolü.",
    alt: "Teknik SEO ve site hızı optimizasyonu",
  },
  {
    href: "/yerel-seo",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Local SEO",
    title: "Yerel SEO",
    description: "Google Business Profile, yerel anahtar kelimeler ve bölgesel görünürlük stratejisi.",
    alt: "Yerel SEO ve Google Haritalar optimizasyonu",
  },
  {
    href: "/google-ads",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Digital advertising",
    title: "Google Ads Yönetimi",
    description: "Google Ads hesap yönetimi, anahtar kelime stratejisi, dönüşüm takibi ve performans optimizasyonu.",
    alt: "Google Ads reklam yönetimi ve optimizasyonu",
  },
  {
    href: "/meta-reklamlari",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Social advertising",
    title: "Meta Reklamları",
    description: "Facebook ve Instagram reklam kampanyaları, hedef kitle analizi ve dönüşüm optimizasyonu.",
    alt: "Facebook ve Instagram reklam yönetimi",
  },
  {
    href: "/instagram-yonetimi",
    image: "/images/services/sony-fx3-cinema-camera.webp",
    eyebrow: "Social media management",
    title: "Instagram Yönetimi",
    description: "İçerik stratejisi, Reels üretimi, paylaşım planı ve topluluk yönetimi.",
    alt: "Instagram hesap yönetimi ve içerik üretimi",
  },
];

export default function ServicesPage() {
  return <>
    <section className="page-hero section"><p className="eyebrow">Dromocob / Türkiye geneli</p><h1>Web, film ve teknoloji.<br/><span>Tek üretim sistemi.</span></h1><p className="hero-description">Markanın dijital deneyimini ve görsel hikâyesini aynı stratejik çerçevede tasarlayan uzmanlık alanları.</p></section>
    <section className="services-index section">{services.map(service => <Link href={service.href} key={`${service.href}-${service.title}`} className="services-index-card"><div><Image src={service.image} alt={service.alt} width={1200} height={1200} sizes="(max-width: 800px) 100vw, 50vw"/></div><article><p className="eyebrow">{service.eyebrow}</p><h2>{service.title}</h2><p>{service.description}</p><span>Hizmeti incele <ArrowRight/></span></article></Link>)}</section>
  </>;
}
