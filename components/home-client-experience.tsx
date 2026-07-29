"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Check, Code2, PartyPopper, Play, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";

const stories = [
  {
    number: "01",
    kicker: "Birlikte keşif",
    title: "Fikrini masaya dök.",
    text: "Karmaşık briefler yok. Kahveni al, hedefini anlat; doğru fikri birlikte görünür hale getirelim.",
    image: "/images/home-experience/discovery-studio.png",
    alt: "Yaratıcı stüdyoda marka fikri üzerine çalışan müşteri ve kreatif ekip",
    icon: WandSparkles,
  },
  {
    number: "02",
    kicker: "Üretim günü",
    title: "Markan sete çıksın.",
    text: "Kamera, tasarım ve teknoloji aynı hikâyede buluşsun. Sen süreci izlerken her detay planlı ilerlesin.",
    image: "/images/home-experience/production-day.png",
    alt: "Aydınlık bir sette marka çekimini izleyen müşteri ve prodüksiyon ekibi",
    icon: Camera,
  },
  {
    number: "03",
    kicker: "Yayın anı",
    title: "Sonuç kutlanmaya değer.",
    text: "Yeni siten, filmin veya dijital ürünün yayına girsin; gerçek kullanıcı verileriyle büyümeye devam etsin.",
    image: "/images/home-experience/launch-celebration.png",
    alt: "Yeni dijital ürünlerinin yayınını kutlayan yaratıcı ekip",
    icon: PartyPopper,
  },
];

const missions = [
  {
    key: "web",
    label: "Daha güçlü bir site",
    icon: Code2,
    title: "Dijital vitrini baştan kuralım.",
    text: "Markanı doğru anlatan, hızlı çalışan ve ziyaretçiyi talebe dönüştüren özel bir web deneyimi.",
    tags: ["Özel tasarım", "Mobil deneyim", "SEO altyapısı"],
    href: "/web-tasarim",
  },
  {
    key: "film",
    label: "İzleten bir film",
    icon: Play,
    title: "Hikâyeni ekrana taşıyalım.",
    text: "İnsanların kaydırıp geçmediği; markanın karakterini, ürününü ve enerjisini hissettiren sinematik içerik.",
    tags: ["Kreatif fikir", "Prodüksiyon", "Post-production"],
    href: "/video-produksiyon",
  },
  {
    key: "hybrid",
    label: "Hepsi birlikte",
    icon: Sparkles,
    title: "Tek kampanya, bütünlüklü etki.",
    text: "Web, film ve büyüme katmanlarını aynı yaratıcı yön altında birleştiren uçtan uca marka lansmanı.",
    tags: ["Strateji", "Film + Web", "Ölçüm ve büyüme"],
    href: "/iletisim",
  },
];

export default function HomeClientExperience() {
  const [activeMission, setActiveMission] = useState("web");
  const mission = missions.find(item => item.key === activeMission) || missions[0];

  return (
    <>
      <section className="section client-story-section">
        <div className="client-story-head">
          <div>
            <p className="eyebrow"><Sparkles size={15} /> İş yaparken eğlenmek serbest</p>
            <h2>Proje değil,<br/><em>iyi bir macera.</em></h2>
          </div>
          <p>İlk fikirden yayın gününe kadar her adımı anlaşılır, heyecanlı ve sana özel bir deneyime dönüştürüyorum.</p>
        </div>

        <div className="client-story-grid">
          {stories.map(({ number, kicker, title, text, image, alt, icon: Icon }) => (
            <article key={number}>
              <div className="client-story-visual">
                <Image src={image} alt={alt} fill sizes="(max-width: 800px) 86vw, 33vw" />
                <span>{number} / 03</span>
                <i><Icon /></i>
              </div>
              <div className="client-story-copy">
                <small>{kicker}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section mission-picker">
        <div className="mission-picker-intro">
          <p className="eyebrow">Mini proje seçici</p>
          <h2>Bugün neyi<br/><span>büyütüyoruz?</span></h2>
          <p>Birini seç; sana en uygun başlangıç rotasını hemen gösterelim.</p>
        </div>

        <div className="mission-picker-console">
          <div className="mission-tabs" role="tablist" aria-label="Proje hedefi seç">
            {missions.map(({ key, label, icon: Icon }) => (
              <button key={key} role="tab" aria-selected={activeMission === key} className={activeMission === key ? "active" : ""} onClick={() => setActiveMission(key)}>
                <Icon /><span>{label}</span>{activeMission === key && <Check />}
              </button>
            ))}
          </div>

          <div className="mission-result" key={mission.key}>
            <div>
              <small>SANA UYGUN BAŞLANGIÇ</small>
              <h3>{mission.title}</h3>
              <p>{mission.text}</p>
              <div>{mission.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            </div>
            <Link href={mission.href}>Rotayı keşfet <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
