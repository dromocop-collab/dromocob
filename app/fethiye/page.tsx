import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, Camera, CheckCircle2, Clock3, Compass, ExternalLink, MapPin, Navigation, Newspaper, Radio, Sparkles } from "lucide-react";
import { getFethiyeNews } from "@/lib/fethiye-news";
import { fethiyeDestinations } from "@/lib/fethiye-destinations";
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

function freshnessLabel(ageHours: number) {
  if (ageHours < 1) return "Şimdi";
  if (ageHours < 24) return `${ageHours} saat önce`;
  return `${Math.max(1, Math.floor(ageHours / 24))} gün önce`;
}

export default async function FethiyePage() {
  const news = await getFethiyeNews();
  const updatedAt = news[0]?.publishedAt ? formatDate(news[0].publishedAt) : "Kaynak bağlantıları aktif";
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "CollectionPage", "@id": `${siteUrl}/fethiye#page`, name: "Fethiye Rehberi ve Güncel Yerel Haberler", description: "Fethiye yerel gündemi, resmî kaynakları ve işletmelere yönelik dijital üretim rehberi.", url: absoluteUrl("/fethiye"), isPartOf: { "@id": `${siteUrl}/#website` }, about: { "@type": "Place", name: "Fethiye", address: { "@type": "PostalAddress", addressLocality: "Fethiye", addressRegion: "Muğla", addressCountry: "TR" } }, publisher: { "@type": "Organization", name: siteName, url: siteUrl } }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Fethiye", item: absoluteUrl("/fethiye") }] }] };

  return <main className="fethiye-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav className="fethiye-local-nav" aria-label="Fethiye rehberi menüsü"><Link href="/fethiye"><MapPin/> Fethiye</Link><a href="#kesfet">Keşfet</a><a href="#haberler">Güncel haberler</a>{fethiyeDestinations.map(destination => <Link href={`/fethiye/gezilecek-yerler/${destination.slug}`} key={destination.slug}>{destination.shortName}</Link>)}<a href="#isletmeler">Fethiye’de iş</a></nav>

    <section className="fethiye-hero"><div className="fethiye-map-grid"/><div className="fethiye-hero-copy"><p className="eyebrow"><MapPin/> DROMOCOB / FETHİYE INTELLIGENCE</p><h1>Fethiye’yi<br/><em>yerinden keşfet.</em></h1><p>Ölüdeniz’den Faralya’ya uzanan görsel rotalar, doğrulanmış gezi notları ve tazeliğine göre sıralanan yerel haberler. Fethiye için yaşayan bir keşif merkezi.</p><div className="fethiye-hero-actions"><a className="button" href="#kesfet">Rotanı seç <ArrowRight/></a><a href="#haberler">Bugünün akışına git <Radio/></a></div><div className="fethiye-status"><span><i/> YEREL AKIŞ AKTİF</span><span><Clock3/> {updatedAt}</span><span>UTC+3 / FETHİYE</span></div></div><div className="fethiye-hero-visual"><Image src="/images/fethiye/oludeniz-cinematic.jpg" alt="Fethiye Ölüdeniz lagünü ve Akdeniz kıyısı" fill priority sizes="(max-width: 900px) 100vw, 48vw"/><div className="fethiye-visual-overlay"><span><Navigation/> 4 SEÇİLİ ROTA</span><strong>36.6217° N<br/>29.1164° E</strong></div><div className="fethiye-visual-card"><small>ŞİMDİ KEŞFET</small><b>Ölüdeniz → Faralya</b><span>Deniz · doğa · tarih</span></div></div></section>

    <section className="fethiye-destinations" id="kesfet"><header><div><p className="eyebrow"><Sparkles/> CURATED LOCAL ROUTES</p><h2>Fethiye’nin<br/><em>imza rotaları.</em></h2></div><p>Her rota kendi detay sayfasına, pratik gezi bilgilerine ve ziyaretçi yorumlarına sahip. Aradığın yeri seç, yolculuğunu tek ekrandan planla.</p></header><div className="fethiye-destination-grid">{fethiyeDestinations.map((destination, index) => <Link href={`/fethiye/gezilecek-yerler/${destination.slug}`} className={index === 0 ? "is-featured" : ""} key={destination.slug}><div className="fethiye-destination-image"><Image src={destination.image} alt={destination.imageAlt} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 55vw" : "(max-width: 900px) 100vw, 30vw"}/><span>{String(index + 1).padStart(2, "0")}</span></div><div><small>{destination.eyebrow}</small><h3>{destination.shortName}</h3><p>{destination.description}</p><b>Rehberi aç <ArrowUpRight/></b></div></Link>)}</div></section>

    <section className="fethiye-news" id="haberler"><header><div><p className="eyebrow"><Radio/> MULTI-SOURCE LIVE FEED</p><h2>Fethiye’de<br/><em>şimdi.</em></h2></div><div className="fethiye-feed-meta"><span><i/> TAZELİK KONTROLÜ AKTİF</span><strong>5 DAKİKA</strong><small>Akış yayın tarihine göre sıralanır; 24 saat içindeki içerikler “yeni”, 72 saati aşanlar “arşiv” olarak açıkça işaretlenir.</small></div></header>
      {news.length ? <div className="fethiye-news-grid">{news.map((item, index) => <a href={item.url} target="_blank" rel="noopener noreferrer" key={`${item.url}-${index}`} className={`${index === 0 ? "is-lead" : ""} freshness-${item.freshness}`}><div className="fethiye-news-image"><Image src={item.image.startsWith("/") ? item.image : "/images/fethiye/oludeniz-cinematic.jpg"} alt="" fill sizes={index === 0 ? "(max-width: 900px) 100vw, 55vw" : "(max-width: 900px) 100vw, 30vw"}/><span>{item.freshness === "live" ? "YENİ" : item.freshness === "recent" ? "GÜNCEL" : "ARŞİV"}</span></div><div className="fethiye-news-copy"><div><span>{String(index + 1).padStart(2, "0")}</span><small>{item.source} · {freshnessLabel(item.ageHours)}</small></div><h3>{item.title}</h3><p>{item.summary}</p><b>Haberi kaynağında aç <ExternalLink/></b></div></a>)}</div> : <div className="fethiye-news-fallback"><Radio/><div><strong>Canlı kaynaklar şu anda yanıt vermiyor.</strong><p>Eski bir başlığı “bugün” diye göstermiyoruz. Doğrulanmış kaynak bağlantıları aşağıda erişilebilir durumda.</p></div></div>}
    </section>

    <section className="fethiye-official"><div><p className="eyebrow">DOĞRULANMIŞ BAĞLANTILAR</p><h2>Resmî ve yerel<br/>kaynak merkezi.</h2><p>Önemli duyurularda bilgiyi doğrudan yayımlayan kurumdan doğrulayın.</p></div><div>{officialSources.map(source => { const Icon = source.icon; return <a href={source.href} target="_blank" rel="noopener noreferrer" key={source.href}><Icon/><span><strong>{source.title}</strong><small>{source.detail}</small></span><ArrowUpRight/></a>; })}</div></section>

    <section className="fethiye-business" id="isletmeler"><div className="fethiye-business-image"><Image src="/images/services/dji-mini-5-pro-drone.webp" alt="Fethiye drone çekimi ve yerel marka prodüksiyonu" fill sizes="(max-width: 900px) 100vw, 48vw"/><span><Camera/> FETHİYE PRODUCTION UNIT</span></div><div><p className="eyebrow">FETHİYE’DE MARKALAR İÇİN</p><h2>Yereli bilen,<br/><em>global üreten.</em></h2><p>Fethiye merkezli ekibimiz; otel, villa, restoran, turizm, gayrimenkul ve kurumsal markalar için web, film ve büyüme sistemlerini birlikte kurar.</p><ul><li><CheckCircle2/> Fethiye web tasarım ve özel yazılım</li><li><CheckCircle2/> Drone, FPV ve tanıtım filmi prodüksiyonu</li><li><CheckCircle2/> Yerel SEO ve ölçülebilir reklam altyapısı</li></ul><div><Link className="button" href="/iletisim">Fethiye projesini başlat <ArrowUpRight/></Link><Link href="/kamera-ekipmanlari">Prodüksiyon setini gör</Link></div></div></section>

    <section className="fethiye-services"><header><p className="eyebrow">LOCAL GROWTH ROUTES</p><h2>Fethiye’de büyüme rotaları.</h2></header><div><Link href="/drone-cekimi"><span>01</span><h3>Fethiye drone çekimi</h3><p>Otel, villa, tesis ve etkinlikler için sinematik hava görüntüleme.</p><ArrowUpRight/></Link><Link href="/web-tasarim"><span>02</span><h3>Fethiye web tasarım</h3><p>Aramada bulunan, hızlı çalışan ve müşteriye dönüştüren kurumsal siteler.</p><ArrowUpRight/></Link><Link href="/yerel-seo"><span>03</span><h3>Fethiye yerel SEO</h3><p>Harita, hizmet ve bölgesel aramalarda görünürlük sistemi.</p><ArrowUpRight/></Link><Link href="/tanitim-filmi"><span>04</span><h3>Fethiye tanıtım filmi</h3><p>Markanın mekânını ve deneyimini güçlü bir hikâyeye dönüştüren prodüksiyon.</p><ArrowUpRight/></Link></div></section>
  </main>;
}
