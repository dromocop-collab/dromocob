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
];

export default function ServicesPage() {
  return <>
    <section className="page-hero section"><p className="eyebrow">Dromocob / Türkiye geneli</p><h1>Web, film ve teknoloji.<br/><span>Tek üretim sistemi.</span></h1><p className="hero-description">Markanın dijital deneyimini ve görsel hikâyesini aynı stratejik çerçevede tasarlayan uzmanlık alanları.</p></section>
    <section className="services-index section">{services.map(service => <Link href={service.href} key={service.href} className="services-index-card"><div><Image src={service.image} alt={service.alt} width={1200} height={1200} sizes="(max-width: 800px) 100vw, 50vw"/></div><article><p className="eyebrow">{service.eyebrow}</p><h2>{service.title}</h2><p>{service.description}</p><span>Hizmeti incele <ArrowRight/></span></article></Link>)}</section>
  </>;
}
