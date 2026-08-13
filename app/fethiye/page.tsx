import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, Camera, CheckCircle2, Clock3, Compass, ExternalLink, MapPin, Newspaper, Radio, Waves } from "lucide-react";
import { getFethiyeNews } from "@/lib/fethiye-news";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const revalidate = 900;
export const metadata = pageMetadata({
  title: "Fethiye Rehberi ve Güncel Haberler | Dromocob Fethiye",
  description: "Fethiye'nin güncel yerel haberleri, resmî kaynakları, marka ve işletme rehberi. Fethiye web tasarım, drone çekimi ve video prodüksiyon çözümleri.",
  path: "/fethiye",
  keywords: ["Fethiye", "Fethiye haberleri", "Fethiye son dakika", "Fethiye güncel", "Fethiye web tasarım", "Fethiye drone çekimi", "Fethiye video prodüksiyon", "Fethiye tanıtım filmi", "Fethiye işletme", "Fethiye dijital ajans"],
});

const officialSources = [
  { title: "Fethiye Belediyesi", detail: "Belediye haberleri, duyurular ve kent hizmetleri", href: "https://www.fethiye.bel.tr/tr/tumhaberler.aspx", icon: Building2 },
  { title: "Fethiye Kaymakamlığı", detail: "Resmî açıklamalar ve ilçe gündemi", href: "https://www.fethiye.gov.tr/haberler", icon: Compass },
  { title: "Haber48 / Fethiye", detail: "Fethiye kategorisi yerel haber akışı", href: "https://www.haber48.com.tr/haberler/fethiye/", icon: Newspaper },
];

function formatDate(value: string) {
  if (!value) return "Güncel";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(value));
}

export default async function FethiyePage() {
  const news = await getFethiyeNews();
  const updatedAt = news[0]?.publishedAt ? formatDate(news[0].publishedAt) : "Kaynak bağlantıları aktif";
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "CollectionPage", "@id": `${siteUrl}/fethiye#page`, name: "Fethiye Rehberi ve Güncel Yerel Haberler", description: "Fethiye yerel gündemi, resmî kaynakları ve işletmelere yönelik dijital üretim rehberi.", url: absoluteUrl("/fethiye"), isPartOf: { "@id": `${siteUrl}/#website` }, about: { "@type": "Place", name: "Fethiye", address: { "@type": "PostalAddress", addressLocality: "Fethiye", addressRegion: "Muğla", addressCountry: "TR" } }, publisher: { "@type": "Organization", name: siteName, url: siteUrl } }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Fethiye", item: absoluteUrl("/fethiye") }] }] };

  return <main className="fethiye-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <section className="fethiye-hero"><div className="fethiye-map-grid"/><div className="fethiye-hero-copy"><p className="eyebrow"><MapPin/> DROMOCOB / FETHİYE DESK</p><h1>Fethiye’nin<br/><em>dijital nabzı.</em></h1><p>Yerel gündemi, resmî kaynakları ve Fethiye’de büyümek isteyen markalar için dijital üretim gücünü tek merkezde buluşturuyoruz.</p><div className="fethiye-status"><span><i/> YEREL AKIŞ AKTİF</span><span><Clock3/> {updatedAt}</span><span>UTC+3 / FETHİYE</span></div></div><div className="fethiye-orbit"><i/><i/><i/><span><Waves/></span><b>36.6217° N<br/>29.1164° E</b></div></section>

    <section className="fethiye-news"><header><div><p className="eyebrow"><Radio/> LIVE LOCAL FEED</p><h2>Fethiye’de<br/><em>bugün.</em></h2></div><div className="fethiye-feed-meta"><span><i/> OTOMATİK YENİLEME</span><strong>15 DAKİKA</strong><small>Başlık ve kısa özetler kaynak RSS akışından alınır. Haberlerin yayın sorumluluğu ilgili kaynağa aittir.</small></div></header>
      {news.length ? <div className="fethiye-news-grid">{news.map((item, index) => <a href={item.url} target="_blank" rel="noopener noreferrer" key={`${item.url}-${index}`} className={index === 0 ? "is-lead" : ""}><div><span>{String(index + 1).padStart(2, "0")}</span><small>{item.source} · {formatDate(item.publishedAt)}</small></div><h3>{item.title}</h3><p>{item.summary}</p><b>Haberi kaynağında aç <ExternalLink/></b></a>)}</div> : <div className="fethiye-news-fallback"><Radio/><div><strong>Canlı akış geçici olarak yanıt vermiyor.</strong><p>Sayfa çalışmaya devam ediyor. Güncel haberleri aşağıdaki doğrulanmış kaynaklardan takip edebilirsiniz.</p></div></div>}
    </section>

    <section className="fethiye-official"><div><p className="eyebrow">DOĞRULANMIŞ BAĞLANTILAR</p><h2>Resmî ve yerel<br/>kaynak merkezi.</h2><p>Önemli duyurularda bilgiyi doğrudan yayımlayan kurumdan doğrulayın.</p></div><div>{officialSources.map(source => { const Icon = source.icon; return <a href={source.href} target="_blank" rel="noopener noreferrer" key={source.href}><Icon/><span><strong>{source.title}</strong><small>{source.detail}</small></span><ArrowUpRight/></a>; })}</div></section>

    <section className="fethiye-business"><div className="fethiye-business-image"><Image src="/images/services/dji-mini-5-pro-drone.webp" alt="Fethiye drone çekimi ve yerel marka prodüksiyonu" fill sizes="(max-width: 900px) 100vw, 48vw"/><span><Camera/> FETHİYE PRODUCTION UNIT</span></div><div><p className="eyebrow">FETHİYE’DE MARKALAR İÇİN</p><h2>Yereli bilen,<br/><em>global üreten.</em></h2><p>Fethiye merkezli ekibimiz; otel, villa, restoran, turizm, gayrimenkul ve kurumsal markalar için web, film ve büyüme sistemlerini birlikte kurar.</p><ul><li><CheckCircle2/> Fethiye web tasarım ve özel yazılım</li><li><CheckCircle2/> Drone, FPV ve tanıtım filmi prodüksiyonu</li><li><CheckCircle2/> Yerel SEO ve ölçülebilir reklam altyapısı</li></ul><div><Link className="button" href="/iletisim">Fethiye projesini başlat <ArrowUpRight/></Link><Link href="/kamera-ekipmanlari">Prodüksiyon setini gör</Link></div></div></section>

    <section className="fethiye-services"><header><p className="eyebrow">LOCAL GROWTH ROUTES</p><h2>Fethiye’de büyüme rotaları.</h2></header><div><Link href="/drone-cekimi"><span>01</span><h3>Fethiye drone çekimi</h3><p>Otel, villa, tesis ve etkinlikler için sinematik hava görüntüleme.</p><ArrowUpRight/></Link><Link href="/web-tasarim"><span>02</span><h3>Fethiye web tasarım</h3><p>Aramada bulunan, hızlı çalışan ve müşteriye dönüştüren kurumsal siteler.</p><ArrowUpRight/></Link><Link href="/yerel-seo"><span>03</span><h3>Fethiye yerel SEO</h3><p>Harita, hizmet ve bölgesel aramalarda görünürlük sistemi.</p><ArrowUpRight/></Link><Link href="/tanitim-filmi"><span>04</span><h3>Fethiye tanıtım filmi</h3><p>Markanın mekânını ve deneyimini güçlü bir hikâyeye dönüştüren prodüksiyon.</p><ArrowUpRight/></Link></div></section>
  </main>;
}
