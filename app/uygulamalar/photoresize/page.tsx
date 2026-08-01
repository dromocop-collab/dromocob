import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Check, Cpu, Download, FileImage, Gauge, HardDrive, KeyRound, Layers3, LockKeyhole, Monitor, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "PhotoResize for Mac — Profesyonel Görsel Boyutlandırma",
  description: "PhotoResize ile görselleri Mac üzerinde hızlı, toplu ve güvenli şekilde yeniden boyutlandırın. Apple Silicon uyumlu Dromocob uygulaması.",
  alternates: { canonical: "/uygulamalar/photoresize" },
};

const features = [
  [Layers3, "Toplu işleme", "Birden fazla görseli tek akışta hazırla."],
  [Gauge, "Yerel performans", "Dosyaları buluta göndermeden hızlı işle."],
  [FileImage, "Akıllı çıktı", "Oran, kalite ve format kontrolünü yönet."],
  [KeyRound, "Ortak lisans", "Dromocob hesabınla güvenli biçimde etkinleştir."],
  [RefreshCw, "Sürüm kontrolü", "Güncel uygulama ve minimum sürüm bilgisi."],
  [ShieldCheck, "İmzalı receipt", "Cihaza bağlı, çevrimdışı doğrulanabilir lisans."],
];

export default function PhotoResizePage() {
  return <><SiteNav/><main className="app-detail-page">
    <section className="app-detail-hero section"><Link className="app-back" href="/uygulamalar"><ArrowLeft/> Tüm uygulamalar</Link><div className="app-detail-grid"><div className="app-detail-copy"><p className="eyebrow">DROMOCOB APPS / 01</p><div className="app-title-line"><span><Image src="/logo.svg" alt="PhotoResize" width={78} height={78}/></span><div><small>FOR macOS</small><h1>PhotoResize</h1></div></div><h2>Görsel üretiminde<br/><em>hızlı final.</em></h2><p>Yüksek hacimli görselleri profesyonel ölçülere taşıyan, Mac için yerel ve odaklı üretim aracı.</p><div className="app-download-row"><a className="app-primary-download" href="/downloads/PhotoResize.dmg" download><span><Download/><b>Mac için indir</b><small>DMG · macOS 14 ve üzeri</small></span></a><Link href="/giris">Lisans hesabı <KeyRound/></Link></div><div className="app-version"><i/><span>Güncel sürüm</span><strong>1.0.0</strong><small>Apple Silicon · Güvenli indirme</small></div></div><div className="app-window-demo"><div className="app-window-top"><span/><span/><span/><small>PhotoResize</small></div><div className="app-window-body"><div className="app-window-mark"><Image src="/logo.svg" alt="" width={110} height={110}/><span>DROP YOUR IMAGES</span></div><div className="app-window-controls"><article><small>WIDTH</small><strong>1920 px</strong></article><article><small>FORMAT</small><strong>WebP</strong></article><article><small>QUALITY</small><strong>92%</strong></article></div><button>12 görseli dışa aktar <Sparkles/></button></div></div></div></section>

    <section className="app-feature-section section"><header><p className="eyebrow">PRO WORKFLOW</p><h2>Küçük araç.<br/><em>Büyük zaman kazancı.</em></h2></header><div>{features.map(([Icon,title,detail])=><article key={String(title)}><span><Icon/></span><small>PHOTORESIZE</small><h3>{String(title)}</h3><p>{String(detail)}</p></article>)}</div></section>

    <section className="app-security-section section"><div><p className="eyebrow">SECURE BY DESIGN</p><h2>Dosyan sende.<br/><em>Kontrol sende.</em></h2><p>Görseller yerel olarak işlenir. Lisans oturumu Apple Keychain’de korunur ve cihazına bağlı imzalı receipt ile doğrulanır.</p></div><div className="app-security-console"><article><LockKeyhole/><span><small>VERİ İŞLEME</small><strong>On-device</strong></span><Check/></article><article><BadgeCheck/><span><small>LİSANS</small><strong>ES256 signed</strong></span><Check/></article><article><HardDrive/><span><small>OFFLINE</small><strong>Grace mode</strong></span><Check/></article></div></section>

    <section className="app-requirements section"><div><Monitor/><h2>Sistem gereksinimleri</h2></div><dl><div><dt>İşletim sistemi</dt><dd>macOS 14 Sonoma veya üzeri</dd></div><div><dt>İşlemci</dt><dd>Apple Silicon önerilir</dd></div><div><dt>Depolama</dt><dd>En az 250 MB boş alan</dd></div><div><dt>Bağlantı</dt><dd>İlk aktivasyon için internet</dd></div></dl><div className="app-requirement-note"><Cpu/><span><strong>Mac’in için üretildi.</strong><small>Native SwiftUI arayüz ve yerel görüntü işleme.</small></span></div></section>

    <section className="app-final-download section"><div><p className="eyebrow">READY TO RESIZE</p><h2>PhotoResize’i<br/>Mac’ine indir.</h2></div><a href="/downloads/PhotoResize.dmg" download><Download/> Ücretsiz indirilebilir DMG <span>1.0.0</span></a></section>
  </main><SiteFooter/></>;
}
