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
    href: "/hizmetler/web-tasarim",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Web design & development",
    title: "Web Tasarım ve Web Yazılım",
    description: "Kurumsal web sitesi, özel yazılım, yönetim paneli, e-ticaret, performans ve teknik SEO altyapıları.",
    alt: "Kurumsal web tasarım ve web yazılım hizmetleri",
  },
  {
    href: "/hizmetler/video-film-produksiyon",
    image: "/images/services/sony-fx3-cinema-camera.webp",
    eyebrow: "Film & video production",
    title: "Video ve Film Prodüksiyon",
    description: "Reklam filmi, marka filmi, kurumsal tanıtım, ürün videosu, drone, FPV ve sosyal medya prodüksiyonu.",
    alt: "Profesyonel video ve film prodüksiyon hizmetleri",
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
    href: "/magaza-tanitimi",
    image: "/images/services/cinema-lighting-system.webp",
    eyebrow: "Store & venue production",
    title: "Mağaza Tanıtımı",
    description: "Mağaza, showroom, restoran ve kurumsal mekânlar için tanıtım filmi, iç mekân çekimi ve sosyal medya adaptasyonları.",
    alt: "Mağaza ve mekân tanıtım filmi prodüksiyonu",
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
    href: "/google-ads",
    image: "/images/services/web-design-system.webp",
    eyebrow: "Digital advertising",
    title: "Google Ads Yönetimi",
    description: "Google Ads hesap yönetimi, anahtar kelime stratejisi, dönüşüm takibi ve performans optimizasyonu.",
    alt: "Google Ads reklam yönetimi ve optimizasyonu",
  },
];

export default function ServicesPage() {
  return <>
    <section className="page-hero section"><p className="eyebrow">Dromocob / Türkiye geneli</p><h1>Web, film ve teknoloji.<br/><span>Tek üretim sistemi.</span></h1><p className="hero-description">Markanın dijital deneyimini ve görsel hikâyesini aynı stratejik çerçevede tasarlayan uzmanlık alanları.</p></section>
    <section className="services-index section">{services.map(service => <Link href={service.href} key={service.href} className="services-index-card"><div><Image src={service.image} alt={service.alt} width={1200} height={1200} sizes="(max-width: 800px) 100vw, 50vw"/></div><article><p className="eyebrow">{service.eyebrow}</p><h2>{service.title}</h2><p>{service.description}</p><span>Hizmeti incele <ArrowRight/></span></article></Link>)}</section>
  </>;
}
