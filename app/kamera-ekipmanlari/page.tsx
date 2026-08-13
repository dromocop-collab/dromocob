import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, CheckCircle2 } from "lucide-react";
import { equipmentCatalog } from "@/lib/equipment-catalog";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Profesyonel Kamera Ekipmanları | Dromocob Prodüksiyon Seti",
  description: "Video prodüksiyon, drone çekimi ve kurumsal fotoğraf projelerinde kullandığımız Sony FX3, G Master, DJI drone, gimbal, ses, monitör ve ışık sistemleri.",
  path: "/kamera-ekipmanlari",
  keywords: ["kamera ekipmanları", "profesyonel çekim ekipmanları", "video prodüksiyon ekipmanları", "Sony FX3", "DJI drone", "FPV drone", "sinema kamerası", "profesyonel video çekimi"],
});

const schema = { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${siteUrl}/kamera-ekipmanlari#collection`, name: "Dromocob Profesyonel Kamera Ekipmanları", description: "Dromocob prodüksiyonlarında kullanılan kamera, lens, drone, ses, ışık ve hareket sistemleri.", url: absoluteUrl("/kamera-ekipmanlari"), isPartOf: { "@id": `${siteUrl}/#website` }, about: equipmentCatalog.map(item => ({ "@type": "Product", name: item.name, category: item.category, image: absoluteUrl(item.image), url: absoluteUrl(`/kamera-ekipmanlari/${item.slug}`) })), provider: { "@type": "Organization", name: siteName, url: siteUrl } };

export default function EquipmentHubPage() {
  return <main className="equipment-hub">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <section className="equipment-hero"><div><p className="eyebrow"><Camera /> DROMOCOB / PRODUCTION STACK</p><h1>Ekipman değil,<br/><em>doğru sistem.</em></h1><p>Her projeye aynı çantayla gitmiyoruz. Kamera, lens, hareket, ses, ışık ve hava sistemini anlatılacak hikâyeye göre kuruyoruz.</p><div className="equipment-hero-status"><span><i/> SET HAZIR</span><span>{equipmentCatalog.length} PROFESYONEL SİSTEM</span><span>TÜRKİYE GENELİ</span></div></div><aside><span>PRODUCTION<br/>SYSTEM</span><strong>08</strong><small>CAMERA · AIR · AUDIO · LIGHT</small></aside></section>
    <section className="equipment-intro"><div><p className="eyebrow">Neden ekipmanı gösteriyoruz?</p><h2>Teknik tercih, yaratıcı sonucun parçasıdır.</h2></div><p>Kameranın modeli tek başına iyi film üretmez. Doğru ekipmanın doğru ışık, ses, hareket ve post-prodüksiyon zinciriyle birleşmesi gerekir. Bu sayfalarda hangi sistemi nerede ve neden kullandığımızı açıkça anlatıyoruz.</p></section>
    <section className="equipment-grid">{equipmentCatalog.map((item, index) => <Link href={`/kamera-ekipmanlari/${item.slug}`} className="equipment-card" key={item.slug}><div className="equipment-card-image"><Image src={item.image} alt={`${item.name} profesyonel prodüksiyon ekipmanı`} fill sizes="(max-width: 760px) 100vw, 50vw"/><span>{String(index + 1).padStart(2, "0")}</span></div><div><small>{item.category}</small><h2>{item.name}</h2><p>{item.shortDescription}</p><span>Teknik sistemi incele <ArrowUpRight/></span></div></Link>)}</section>
    <section className="equipment-proof"><div><p className="eyebrow">PRODUCTION ASSURANCE</p><h2>Sette kontrol,<br/>teslimde güven.</h2></div><ul><li><CheckCircle2/> Projeye özel ekipman ve yedekleme planı</li><li><CheckCircle2/> Çekim öncesi teknik keşif ve risk kontrolü</li><li><CheckCircle2/> Kamera, drone, ses ve renk uyumlu iş akışı</li><li><CheckCircle2/> Web, reklam ve sosyal medya formatlarında teslim</li></ul><Link className="button" href="/iletisim">Prodüksiyonu planla <ArrowUpRight/></Link></section>
  </main>;
}
