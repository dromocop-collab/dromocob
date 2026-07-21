import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock3, MapPin, Radio, ShieldCheck, Zap } from "lucide-react";
import PackageQuoteLauncher from "@/components/package-quote-launcher";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Acil Drone Çekimi | Kurumsal Hava Görüntüleme",
  description: "İstanbul ve Türkiye genelinde acil kurumsal drone çekimi. Etkinlik, tesis, şantiye, gayrimenkul, lansman ve marka filmi için hızlı operasyon planı ve profesyonel hava görüntüleme.",
  path: "/acil-drone-cekimi",
  keywords: ["acil drone çekimi", "acil drone kiralama", "kurumsal drone çekimi", "İstanbul drone çekimi", "hava görüntüleme", "drone video çekimi", "şantiye drone çekimi", "gayrimenkul drone çekimi", "etkinlik drone çekimi", "FPV drone çekimi"],
});

const packageItems = [
  "Hızlı proje ve lokasyon ön değerlendirmesi",
  "Uçuşa uygunluk, hava koşulu ve operasyon planı",
  "Kurumsal kullanım amacına göre çekim briefi",
  "Hava görüntüleri için planlanan teslim formatı",
  "Marka filmi, sosyal medya veya satış sunumu adaptasyonu",
  "Çekim sonrası güvenli dosya teslim ve arşiv düzeni",
];

const faqs = [
  { question: "Acil drone çekimi için ne kadar önce iletişime geçmeliyiz?", answer: "Takvim, lokasyon, hava koşulları ve ilgili uçuş kısıtları değerlendirildikten sonra en hızlı uygulanabilir operasyon planını paylaşırız. Aynı gün taleplerde uygunluk teyidi önceliklidir." },
  { question: "İstanbul dışında drone çekimi organize edebilir misiniz?", answer: "Evet. İstanbul merkezli ekibimizle Türkiye genelindeki kurumsal çekimler için lokasyon, ulaşım, izin ve ekip planlamasını proje kapsamına göre yürütürüz." },
  { question: "Uçuş izni veya lokasyon izni gerektiğinde süreç nasıl ilerler?", answer: "Uçuş ve lokasyon uygunluğu proje başında kontrol edilir. İzin gerektiren alanlarda gerekli sorumluluklar, zamanlama ve alternatif çekim yaklaşımı netleştirilmeden operasyon başlatılmaz." },
  { question: "Teslimlerde hangi kullanım formatları hazırlanabilir?", answer: "İhtiyaca göre kurumsal film, web sitesi, LED ekran, 16:9 yatay video, 9:16 dikey Reels/Shorts veya kısa kampanya varyasyonları için teslim planı oluşturulur." },
];

export default function EmergencyDronePage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/acil-drone-cekimi#service`,
    name: "Acil Kurumsal Drone Çekimi",
    description: "Kurumsal markalar için hızlı planlanan drone ve hava görüntüleme operasyonu.",
    serviceType: "Kurumsal drone çekimi ve hava görüntüleme",
    url: absoluteUrl("/acil-drone-cekimi"),
    provider: { "@id": `${siteUrl}/#organization`, "@type": "ProfessionalService", name: siteName },
    areaServed: { "@type": "Country", name: "Türkiye" },
    availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/iletisim"), availableLanguage: "Turkish" },
  };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Acil Drone Çekimi", item: absoluteUrl("/acil-drone-cekimi") }] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />

    <section className="drone-hero section">
      <div><p className="eyebrow"><Radio size={14}/> Acil drone çekimi · Türkiye geneli</p><h1>Acil <span>drone çekimi</span><br/>kurumsal planla.</h1><p>Etkinlik, tesis, şantiye, gayrimenkul, lansman ve marka anlatısı için; hız ihtiyacını güvenli operasyon planı ve profesyonel hava görüntüleme ile birleştiriyoruz.</p><div className="drone-hero-actions"><PackageQuoteLauncher packageId="emergency-drone">Acil çekim talebi oluştur <ArrowRight size={18}/></PackageQuoteLauncher><a href="#acil-drone-paketi">Paketi incele <ArrowRight size={16}/></a></div></div>
      <aside><span><Zap/> Hızlı uygunluk kontrolü</span><strong>Önce rota,<br/>sonra <em>uçuş.</em></strong><p>Takvim, lokasyon, hava koşulları ve gerekli operasyon adımları netleşmeden çekime başlanmaz.</p><small><i/> Kurumsal operasyon briefi</small></aside>
    </section>

    <section className="drone-operation-strip" aria-label="Acil drone operasyon akışı"><article><Clock3/><span>01 / Hızlı brif</span><strong>İhtiyaç ve zaman çizelgesi</strong></article><article><MapPin/><span>02 / Uygunluk</span><strong>Lokasyon ve uçuş kontrolü</strong></article><article><ShieldCheck/><span>03 / Operasyon</span><strong>Çekim, teslim ve adaptasyon</strong></article></section>

    <section className="drone-package section" id="acil-drone-paketi"><div><p className="eyebrow">Acil drone operasyon paketi</p><h2>Hızlı talep.<br/><em>Net operasyon.</em></h2><p>Belirsiz bir “hemen gelin” talebi yerine; kullanım amacı, çekim alanı ve teslim ihtiyacını tek kontrol listesinde topluyoruz.</p><div className="drone-package-actions"><PackageQuoteLauncher packageId="emergency-drone">Paketi başlat <ArrowRight size={17}/></PackageQuoteLauncher><Link href="/paketler/acil-drone-operasyon">Tüm paket detayları <ArrowRight size={15}/></Link></div></div><div className="drone-package-card"><header><span>DC / AERIAL RESPONSE</span><b>Kurumsal paket</b></header><ul>{packageItems.map((item, index) => <li key={item}><i>{String(index + 1).padStart(2, "0")}</i><Check size={17}/><span>{item}</span></li>)}</ul><footer><ShieldCheck/><span>Uçuş ve lokasyon koşulları, operasyon öncesinde proje bazında teyit edilir.</span></footer></div></section>

    <section className="drone-use-cases section"><p className="eyebrow">Nerede kullanılır?</p><h2>Hava görüntüsü,<br/><em>iş hedefiyle birleşir.</em></h2><div>{[["Tesis & üretim", "Fabrika, depo, saha ve üretim gücünü kurumsal anlatıya taşır."], ["Etkinlik & lansman", "Açılış, lansman ve kalabalık atmosferini güçlü bir üst perspektifle kaydeder."], ["Gayrimenkul & proje", "Mekân, çevre ve ölçeği satış sunumu için anlaşılır biçimde gösterir."], ["Marka & kampanya", "Reklam filmi ve sosyal medya anlatısına sinematik hareket katmanı ekler."]].map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>

    <section className="drone-faq section"><header><p className="eyebrow">Operasyon öncesi</p><h2>Sık sorulan<br/><em>sorular.</em></h2></header><div>{faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
  </>;
}
