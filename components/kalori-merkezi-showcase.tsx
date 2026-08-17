"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Apple,
  BadgeCheck,
  BarChart3,
  Camera,
  CheckCircle2,
  Flame,
  HeartPulse,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";

const APP_STORE_URL =
  "https://apps.apple.com/tr/app/kalori-merkezi/id6799123172";

export default function KaloriMerkeziShowcase() {
  return (
    <section
      className="kalori-showcase section"
      data-cinematic
      data-motion-section="APP"
      aria-labelledby="kalori-merkezi-title"
    >
      <div className="km-glow km-glow-green" aria-hidden="true" />
      <div className="km-glow km-glow-lime" aria-hidden="true" />

      <div className="km-shell">
        <header className="km-head">
          <div>
            <p className="eyebrow">
              <Sparkles size={15} />
              DROMOCOB APP / 02
            </p>

            <h2 id="kalori-merkezi-title">
              Daha bilinçli seçimler.
              <br />
              <em>Daha düzenli bir günlük.</em>
            </h2>
          </div>

          <div className="km-head-copy">
            <span>KALORİ MERKEZİ · iOS</span>
            <p>
              Günlük beslenme kayıtlarını, öğün takibini ve temel besin
              bilgilerini tek bir modern mobil deneyimde bir araya getiren
              Dromocob uygulaması.
            </p>
          </div>
        </header>

        <div className="km-stage">
          <div className="km-copy-card">
            <div className="km-live-badge">
              <BadgeCheck size={17} />
              APP STORE&apos;DA
            </div>

            <div className="km-brand-row">
              <Image
                className="km-app-icon"
                src="/images/apps/kalori-merkezi-icon.jpg"
                alt="Kalori Merkezi uygulama logosu"
                width={190}
                height={190}
                priority={false}
              />

              <div>
                <small>DROMOCOB HEALTH PRODUCT</small>
                <h3>Kalori Merkezi</h3>
                <span>Beslenme takibini sadeleştiren mobil yardımcı.</span>
              </div>
            </div>

            <p className="km-lead">
              Öğünlerini düzenli kaydet, günlük ilerlemeni tek ekranda takip et
              ve beslenme rutinini daha anlaşılır hale getir.
            </p>

            <div className="km-feature-grid">
              <Feature
                icon={Utensils}
                title="Öğün Takibi"
                text="Gün içindeki öğünlerini düzenli şekilde kaydet ve takip et."
              />
              <Feature
                icon={BarChart3}
                title="Günlük Özet"
                text="Günün genel görünümünü tek panelde daha hızlı değerlendir."
              />
              <Feature
                icon={Camera}
                title="Akıllı Tarama"
                text="Görsel tabanlı akışlarla besin kaydını daha pratik hale getir."
              />
              <Feature
                icon={HeartPulse}
                title="Kişisel Rutin"
                text="Günlük alışkanlıklarını daha düzenli bir sistem içinde yönet."
              />
            </div>

            <div className="km-actions">
              <Link
                className="km-appstore-button"
                href={APP_STORE_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Kalori Merkezi uygulamasını App Store'da aç"
              >
                <Apple size={20} />
                <span>
                  <small>APP STORE&apos;DAN İNDİR</small>
                  <strong>Kalori Merkezi</strong>
                </span>
                <ArrowUpRight size={17} />
              </Link>

              <Link className="km-secondary-link" href="/uygulamalar">
                Tüm uygulamaları gör
              </Link>
            </div>
          </div>

          <div className="km-visual" aria-hidden="true">
            <div className="km-grid" />
            <div className="km-scan" />

            <div className="km-phone">
              <div className="km-phone-status">
                <span>9:41</span>
                <i />
                <i />
                <i />
              </div>

              <div className="km-phone-top">
                <div>
                  <small>BUGÜN</small>
                  <strong>Günlük Beslenme</strong>
                </div>

                <div className="km-mini-avatar">
                  <Image
                    src="/images/apps/kalori-merkezi-icon.jpg"
                    alt=""
                    width={48}
                    height={48}
                  />
                </div>
              </div>

              <div className="km-ring-zone">
                <div className="km-ring">
                  <div>
                    <Flame size={18} />
                    <strong>1.640</strong>
                    <span>kcal</span>
                  </div>
                </div>

                <div className="km-ring-copy">
                  <span><i /> Günlük hedef</span>
                  <strong>2.100 kcal</strong>
                  <small>Takip devam ediyor</small>
                </div>
              </div>

              <div className="km-macro-grid">
                <Macro label="Protein" value="86 g" progress="72%" />
                <Macro label="Karbonhidrat" value="174 g" progress="61%" />
                <Macro label="Yağ" value="58 g" progress="54%" />
              </div>

              <div className="km-meal-card">
                <div>
                  <small>SON ÖĞÜN</small>
                  <strong>Akşam Yemeği</strong>
                  <span>19:10 · 520 kcal</span>
                </div>
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="km-float-card km-float-scan">
              <ScanLine size={16} />
              <div>
                <small>SMART SCAN</small>
                <strong>READY</strong>
              </div>
              <i />
            </div>

            <div className="km-float-card km-float-health">
              <Activity size={16} />
              <div>
                <small>DAILY TRACKING</small>
                <strong>ACTIVE</strong>
              </div>
              <i />
            </div>

            <div className="km-float-card km-float-secure">
              <ShieldCheck size={16} />
              <div>
                <small>PRIVATE DATA</small>
                <strong>SECURE</strong>
              </div>
              <i />
            </div>
          </div>
        </div>

        <footer className="km-footer-strip">
          <div>
            <i />
            <span>
              <small>PRODUCT STATUS</small>
              <strong>Kalori Merkezi · App Store&apos;da yayında</strong>
            </span>
          </div>

          <div className="km-footer-tags">
            <span>iOS / LIVE</span>
            <span>TRACKING / READY</span>
            <span>DROMOCOB / APP</span>
          </div>
        </footer>
      </div>
    </section>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Utensils;
  title: string;
  text: string;
}) {
  return (
    <article className="km-feature">
      <div>
        <Icon size={18} />
      </div>
      <h4>{title}</h4>
      <p>{text}</p>
    </article>
  );
}

function Macro({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: string;
}) {
  return (
    <div className="km-macro">
      <span>{label}</span>
      <strong>{value}</strong>
      <div>
        <i style={{ width: progress }} />
      </div>
    </div>
  );
}
