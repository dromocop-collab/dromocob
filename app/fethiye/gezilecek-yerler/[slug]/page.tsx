import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, Compass, MapPin, Navigation, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import { FethiyeComments } from "@/components/fethiye-comments";
import { fethiyeDestinations, getFethiyeDestination } from "@/lib/fethiye-destinations";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() { return fethiyeDestinations.map(destination => ({ slug: destination.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = getFethiyeDestination(slug);
  if (!destination) return {};
  return pageMetadata({
    title: `${destination.name} | Ulaşım, İpuçları ve Yorumlar`,
    description: `${destination.description} Ulaşım, ideal zaman, öne çıkan yerler, yerel ipuçları ve ziyaretçi yorumlarıyla güncel ${destination.shortName} rehberi.`,
    path: `/fethiye/gezilecek-yerler/${destination.slug}`,
    keywords: [`${destination.shortName} gezi rehberi`, `${destination.shortName} nerede`, `${destination.shortName} nasıl gidilir`, `${destination.shortName} yorumları`, "Fethiye gezilecek yerler"],
  });
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = getFethiyeDestination(slug);
  if (!destination) notFound();
  const currentIndex = fethiyeDestinations.findIndex(item => item.slug === slug);
  const nextDestination = fethiyeDestinations[(currentIndex + 1) % fethiyeDestinations.length];
  const path = `/fethiye/gezilecek-yerler/${destination.slug}`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "TouristAttraction", "@id": `${absoluteUrl(path)}#place`, name: destination.shortName, description: destination.description, url: absoluteUrl(path), image: absoluteUrl(destination.image), geo: { "@type": "GeoCoordinates", latitude: destination.coordinates.latitude, longitude: destination.coordinates.longitude }, address: { "@type": "PostalAddress", addressLocality: "Fethiye", addressRegion: "Muğla", addressCountry: "TR" }, touristType: ["Doğa gezgini", "Kültür gezgini", "Fotoğraf gezgini"] },
    { "@type": "WebPage", "@id": `${absoluteUrl(path)}#page`, name: destination.name, url: absoluteUrl(path), inLanguage: "tr-TR", isPartOf: { "@id": `${siteUrl}/#website` }, about: { "@id": `${absoluteUrl(path)}#place` }, publisher: { "@type": "Organization", name: siteName, url: siteUrl } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Fethiye", item: absoluteUrl("/fethiye") }, { "@type": "ListItem", position: 3, name: destination.shortName, item: absoluteUrl(path) }] },
    { "@type": "FAQPage", mainEntity: destination.faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ] };

  return <main className="fethiye-place-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}/>
    <nav className="fethiye-local-nav" aria-label="Fethiye rehberi menüsü"><Link href="/fethiye"><ArrowLeft/> Fethiye merkezi</Link>{fethiyeDestinations.map(item => <Link className={item.slug === slug ? "is-active" : ""} href={`/fethiye/gezilecek-yerler/${item.slug}`} key={item.slug}>{item.shortName}</Link>)}<a href="#yorumlar">Yorumlar</a></nav>
    <section className="fethiye-place-hero"><div className="fethiye-place-photo"><Image src={destination.image} alt={destination.imageAlt} fill priority sizes="100vw"/><div className="fethiye-place-shade"/></div><div className="fethiye-place-hero-copy"><p className="eyebrow"><MapPin/> FETHİYE / {destination.eyebrow}</p><h1>{destination.shortName}<em>.</em></h1><p>{destination.description}</p><div><a className="button" href="#rota">Rotayı planla <ArrowRight/></a><a href="#yorumlar">Deneyimleri oku</a></div></div><div className="fethiye-place-coordinates"><Navigation/><span><small>KOORDİNAT</small><strong>{destination.coordinates.latitude}° N<br/>{destination.coordinates.longitude}° E</strong></span></div></section>

    <section className="fethiye-place-intro" id="rota"><div><p className="eyebrow"><Compass/> LOCAL FIELD NOTES</p><h2>Gitmeden önce<br/><em>bilmen gerekenler.</em></h2>{destination.longDescription.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="fethiye-place-facts"><article><MapPin/><span><small>MESAFE</small><strong>{destination.distance}</strong></span></article><article><SunMedium/><span><small>İDEAL ZAMAN</small><strong>{destination.idealTime}</strong></span></article><article><Clock3/><span><small>ÖNERİLEN SÜRE</small><strong>{destination.duration}</strong></span></article><article><Sparkles/><span><small>ROTA KARAKTERİ</small><strong>{destination.character}</strong></span></article></div></section>

    <section className="fethiye-place-guide"><div><p className="eyebrow">ROTA İÇERİĞİ</p><h2>Kaçırma.</h2><ol>{destination.highlights.map((highlight, index) => <li key={highlight}><span>{String(index + 1).padStart(2, "0")}</span><strong>{highlight}</strong></li>)}</ol></div><div><p className="eyebrow"><ShieldCheck/> YEREL İPUÇLARI</p><h2>Hazırlıklı git.</h2><ul>{destination.tips.map(tip => <li key={tip}><ShieldCheck/><span>{tip}</span></li>)}</ul></div></section>

    <section className="fethiye-place-faq"><header><p className="eyebrow">HIZLI CEVAPLAR</p><h2>{destination.shortName}<br/><em>SSS.</em></h2></header><div>{destination.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div></section>
    <FethiyeComments slug={destination.slug} placeName={destination.shortName}/>
    <Link className="fethiye-next-place" href={`/fethiye/gezilecek-yerler/${nextDestination.slug}`}><span><small>SONRAKİ ROTA</small><strong>{nextDestination.shortName}</strong></span><ArrowUpRight/><Image src={nextDestination.image} alt="" fill sizes="100vw"/></Link>
  </main>;
}
