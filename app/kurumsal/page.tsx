import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Blocks,
  CheckCircle2,
  Clapperboard,
  Code2,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import QuoteLauncher from "@/components/quote-launcher";

export const metadata = pageMetadata({
  title: "Kurumsal",
  description:
    "Dromocob'un web application, video prodüksiyon ve dijital büyüme alanlarını birleştiren kurumsal üretim modeli.",
  path: "/kurumsal",
  keywords: ["Dromocob kurumsal", "dijital ürün stüdyosu", "video prodüksiyon şirketi"],
});

const capabilities = [
  [Code2, "Digital Products", "Web application, e-ticaret, üyelik sistemleri ve yönetim panelleri."],
  [Clapperboard, "Film Production", "Marka filmi, reklam, ürün anlatımı ve çok formatlı video serileri."],
  [Workflow, "Business Systems", "CRM, ERP, ödeme, rezervasyon ve operasyon otomasyonları."],
  [Gauge, "Growth Intelligence", "SEO, analitik, reklam ölçümü ve sürekli dönüşüm optimizasyonu."],
];

const standards = [
  "Tek proje lideri ve şeffaf sorumluluk yapısı",
  "Kapsam, takvim ve teslim kriterlerinin baştan tanımlanması",
  "Performans, güvenlik ve erişilebilirlik kalite kontrolü",
  "Kaynak dosyaları ve yönetilebilir sistem teslimi",
  "Yayın sonrası stabilizasyon ve ölçüm desteği",
];

export default function CorporatePage() {
  return (
    <>
      <section className="corporate-hero section">
        <div className="corporate-hero-copy">
          <p className="eyebrow">Dromocob / Independent digital studio</p>
          <h1>Fikirleri<br/><span>çalışan sistemlere</span><br/>dönüştürüyoruz.</h1>
          <p>Strateji, yazılım ve film prodüksiyonunu tek bir üretim kültüründe buluşturan bağımsız dijital stüdyo. Güzel görünen işler değil; yönetilen, ölçülen ve büyüyen marka varlıkları kuruyoruz.</p>
          <div className="corporate-hero-actions">
            <Link className="button" href="/paketler#teklif">Birlikte çalışalım <ArrowUpRight size={18}/></Link>
            <Link className="corporate-text-link" href="/projeler">Seçili projeleri gör <ArrowUpRight size={16}/></Link>
          </div>
        </div>
        <div className="corporate-orbit" aria-hidden="true">
          <div className="corporate-orbit-ring ring-one"/>
          <div className="corporate-orbit-ring ring-two"/>
          <div className="corporate-orbit-core"><span><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></span><small>Strategy × Craft × Technology</small></div>
          <i className="orbit-node node-one">WEB</i>
          <i className="orbit-node node-two">FILM</i>
          <i className="orbit-node node-three">GROWTH</i>
        </div>
      </section>

      <section className="corporate-proof-strip">
        <span>Stratejik keşif</span><i/> <span>Premium tasarım</span><i/> <span>Modern teknoloji</span><i/> <span>Sinematik üretim</span><i/> <span>Ölçülebilir büyüme</span>
      </section>

      <section className="corporate-intro section">
        <div>
          <p className="eyebrow">One studio, complete capability</p>
          <h2>Ajans çevikliği.<br/>Ürün ekibi disiplini.</h2>
        </div>
        <div className="corporate-manifesto">
          <p>Dromocob; parçalı tedarikçi yapısını ortadan kaldırır. Marka stratejisinden arayüze, geliştirmeden çekime, yayından optimizasyona kadar bütün kararlar aynı yaratıcı ve teknik çerçevede alınır.</p>
          <p>Bu model daha az koordinasyon kaybı, daha yüksek görsel tutarlılık ve iş hedefleriyle doğrudan bağlantılı çıktılar üretir.</p>
        </div>
      </section>

      <section className="corporate-capabilities section">
        <div className="corporate-section-head"><p className="eyebrow">Core capabilities</p><span>01 — 04</span></div>
        <div className="corporate-capability-grid">
          {capabilities.map(([Icon, title, description], index) => {
            const CapabilityIcon = Icon as typeof Code2;
            return <article key={String(title)}><div><span>0{index + 1}</span><CapabilityIcon/></div><h3>{String(title)}</h3><p>{String(description)}</p><ArrowUpRight size={18}/></article>;
          })}
        </div>
      </section>

      <section className="corporate-operating section">
        <div className="corporate-operating-card">
          <p className="eyebrow">Operating model</p>
          <h2>Belirsizliği azaltan<br/>dört aşamalı sistem.</h2>
          <div className="corporate-process">
            {[
              ["01", "Discover", "İş hedefi, kullanıcı, rekabet ve teknik gereksinimleri netleştiririz."],
              ["02", "Design", "Deneyimi, anlatıyı ve görsel sistemi prototiplerle görünür kılarız."],
              ["03", "Build", "Yazılımı ve prodüksiyonu kontrollü kilometre taşlarıyla üretiriz."],
              ["04", "Scale", "Yayınlar, ölçer ve büyüme verisine göre sistemi geliştiririz."],
            ].map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}
          </div>
        </div>
        <aside className="corporate-standard-card">
          <ShieldCheck size={32}/><p className="eyebrow">Dromocob standard</p><h3>Premium yalnız görünüm değil, çalışma biçimidir.</h3>
          <ul>{standards.map(item => <li key={item}><CheckCircle2 size={16}/>{item}</li>)}</ul>
        </aside>
      </section>

      <section className="corporate-system section">
        <div className="corporate-system-mark"><Blocks/><Layers3/><Sparkles/></div>
        <p className="eyebrow">Built for ambitious brands</p>
        <h2>Tek bir kampanya değil.<br/><span>Uzun vadeli dijital değer.</span></h2>
        <p>Yeni bir marka kuruyor, mevcut operasyonunu dijitalleştiriyor veya kategorinde daha güçlü bir konuma hazırlanıyorsan; doğru kapsamı birlikte tasarlayalım.</p>
        <QuoteLauncher>Kurumsal görüşme planla <ArrowUpRight size={18}/></QuoteLauncher>
      </section>
    </>
  );
}
