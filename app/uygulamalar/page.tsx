import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, Cpu, Download, LockKeyhole, MonitorUp, Sparkles, Zap } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Dromocob Apps — Mac için Profesyonel Uygulamalar",
  description: "Tek Dromocob hesabıyla çalışan premium macOS araçlarını keşfedin. PhotoResize ile hızlı, güvenli ve yerel görsel işleme.",
  alternates: { canonical: "/uygulamalar" },
};

const roadmap = [
  ["AI Upscaler", "Yapay zekâ destekli detay ve çözünürlük yükseltme"],
  ["Background Remover", "Yerel ve güvenli arka plan ayırma"],
  ["Watermark Studio", "Toplu marka ve filigran otomasyonu"],
  ["Image Compressor", "Kalite odaklı akıllı sıkıştırma"],
  ["Video Converter", "Profesyonel format ve teslim çıktıları"],
];

export default function AppsPage() {
  return <><SiteNav/><main className="apps-page">
    <section className="apps-hero section">
      <div className="apps-hero-copy"><p className="eyebrow">DROMOCOB / DESKTOP SOFTWARE</p><h1>Üretim araçların.<br/><em>Tek merkezde.</em></h1><p>Mac için tasarlanan hızlı, güvenli ve profesyonel Dromocob uygulamaları. Tek hesap, ortak lisans ve sade bir çalışma akışı.</p><div className="apps-actions"><Link href="/uygulamalar/photoresize">PhotoResize’i keşfet <ArrowRight/></Link><a href="/downloads/PhotoResize-1.0.1.dmg" download>Mac için indir <Download/></a></div><div className="apps-trust"><span><LockKeyhole/> İmzalı lisans</span><span><Cpu/> Apple Silicon</span><span><Zap/> Yerel işlem</span></div></div>
      <div className="apps-orbit" aria-label="Dromocob Apps ürün görseli"><div className="apps-orbit-glow"/><div className="apps-app-icon"><Image src="/logo.svg" alt="Dromocob Apps" width={144} height={144}/></div><span className="orbit-chip chip-one"><BadgeCheck/> License Cloud</span><span className="orbit-chip chip-two"><MonitorUp/> macOS Native</span><span className="orbit-chip chip-three"><Sparkles/> Pro Workflow</span></div>
    </section>

    <section className="apps-featured section"><header><div><p className="eyebrow">ŞİMDİ KULLANILABİLİR</p><h2>PhotoResize<br/><em>for Mac.</em></h2></div><p>Görselleri profesyonel ölçülerde yeniden boyutlandır, formatla ve dışa aktar. Dosyaların cihazından çıkmadan.</p></header><Link className="app-product-card" href="/uygulamalar/photoresize"><div className="app-product-number">01</div><div className="app-product-icon"><Image src="/logo.svg" alt="" width={82} height={82}/></div><div><small>IMAGE PRODUCTION UTILITY</small><h3>PhotoResize</h3><p>Toplu yeniden boyutlandırma · Akıllı format · Yerel performans</p><div><span>macOS 14+</span><span>Apple Silicon</span><span>Dromocob License</span></div></div><i><ArrowRight/></i></Link></section>

    <section className="apps-system section"><div><p className="eyebrow">ONE ACCOUNT / ALL APPS</p><h2>Büyüyen bir<br/><em>uygulama sistemi.</em></h2><p>Bugün PhotoResize, yarın bütün yaratıcı araçların aynı hesap ve lisans mimarisinde.</p></div><div className="apps-roadmap">{roadmap.map(([name,detail],index)=><article key={name}><span>{String(index+2).padStart(2,"0")}</span><div><h3>{name}</h3><p>{detail}</p></div><small>YAKINDA</small></article>)}</div></section>

    <section className="apps-license-band section"><Boxes/><div><small>DROMOCOB ACCOUNT</small><h2>Tek hesap. Tek lisans.<br/>Bütün Dromocob Apps.</h2></div><Link href="/giris">Hesabına giriş yap <ArrowRight/></Link></section>
  </main><SiteFooter/></>;
}
