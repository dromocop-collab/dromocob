"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

export default function SeninRandevunShowcase() {
  return (
    <section
      className="seninrandevun-showcase section"
      data-cinematic
      data-motion-section="PRODUCT"
      aria-labelledby="seninrandevun-title"
    >
      <div className="sr-glow sr-glow-one" aria-hidden="true" />
      <div className="sr-glow sr-glow-two" aria-hidden="true" />

      <div className="sr-shell">
        <div className="sr-head">
          <div>
            <p className="eyebrow">
              <Sparkles size={15} />
              DROMOCOB PRODUCT / 01
            </p>

            <h2 id="seninrandevun-title">
              Randevu almak
              <br />
              <em>bu kadar zor olmamalı.</em>
            </h2>
          </div>

          <div className="sr-head-copy">
            <span>seninrandevun.com</span>
            <p>
              İşletmeler ve müşteriler arasındaki randevu sürecini tek,
              hızlı ve modern bir deneyimde buluşturan yeni nesil randevu
              platformu.
            </p>
          </div>
        </div>

        <div className="sr-stage">
          <div className="sr-product-copy">
            <div className="sr-product-badge">
              <BadgeCheck size={17} />
              CANLI ÜRÜN
            </div>

            <h3>
              İşletmen için
              <span>tek merkezden randevu yönetimi.</span>
            </h3>

            <p>
              Müşterilerin uygun saatleri görsün, online randevu oluştursun;
              işletmeler takvimini, hizmetlerini ve müşteri akışını tek
              panelden yönetsin.
            </p>

            <div className="sr-feature-grid">
              <Feature
                icon={CalendarDays}
                title="Online Randevu"
                text="Müşteriler uygun saatleri görerek hızlıca randevu oluşturabilir."
              />
              <Feature
                icon={LayoutDashboard}
                title="İşletme Paneli"
                text="Takvim, hizmetler ve randevular tek kontrol merkezinde."
              />
              <Feature
                icon={UsersRound}
                title="Müşteri Akışı"
                text="Daha düzenli iletişim ve daha profesyonel müşteri deneyimi."
              />
              <Feature
                icon={ShieldCheck}
                title="Güvenli Altyapı"
                text="Modern, ölçeklenebilir ve işletme odaklı dijital sistem."
              />
            </div>

            <div className="sr-actions">
              <Link
                className="sr-primary-link"
                href="https://seninrandevun.com"
                target="_blank"
                rel="noreferrer"
              >
                Canlı projeyi keşfet
                <ArrowUpRight size={17} />
              </Link>

              <Link className="sr-secondary-link" href="/projeler">
                Dromocob projelerini gör
              </Link>
            </div>
          </div>

          <div className="sr-product-visual" aria-hidden="true">
            <div className="sr-visual-grid" />
            <div className="sr-visual-scan" />

            <div className="sr-browser">
              <div className="sr-browser-head">
                <div className="sr-browser-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>seninrandevun.com</span>
                <b>LIVE</b>
              </div>

              <div className="sr-browser-body">
                <div className="sr-browser-top">
                  <div>
                    <small>RANDEVU MOTORU</small>
                    <strong>Bugün için uygun saatler</strong>
                  </div>
                  <span>
                    <CheckCircle2 size={15} />
                    Sistem aktif
                  </span>
                </div>

                <div className="sr-time-grid">
                  {["09:30", "10:15", "11:00", "13:30", "15:00", "16:45"].map(
                    (time, index) => (
                      <div
                        key={time}
                        className={index === 3 ? "is-active" : undefined}
                      >
                        <Clock3 size={14} />
                        <span>{time}</span>
                      </div>
                    ),
                  )}
                </div>

                <div className="sr-browser-card">
                  <div>
                    <small>İŞLETME</small>
                    <strong>Takvim yönetimi hazır</strong>
                    <span>Bugün · 12 randevu</span>
                  </div>
                  <div className="sr-browser-chart">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            </div>

            <div className="sr-status sr-status-booking">
              <CalendarDays size={16} />
              <div>
                <small>BOOKING ENGINE</small>
                <strong>ONLINE</strong>
              </div>
              <i />
            </div>

            <div className="sr-status sr-status-panel">
              <LayoutDashboard size={16} />
              <div>
                <small>BUSINESS PANEL</small>
                <strong>READY</strong>
              </div>
              <i />
            </div>

            <div className="sr-status sr-status-web">
              <Globe2 size={16} />
              <div>
                <small>WEB EXPERIENCE</small>
                <strong>LIVE</strong>
              </div>
              <i />
            </div>
          </div>
        </div>

        <div className="sr-footer-strip">
          <div>
            <i />
            <span>
              <small>PRODUCT STATUS</small>
              <strong>seninrandevun.com yayında</strong>
            </span>
          </div>

          <div className="sr-footer-signals">
            <span>BOOKING / LIVE</span>
            <span>PANEL / ACTIVE</span>
            <span>MOBILE / READY</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CalendarDays;
  title: string;
  text: string;
}) {
  return (
    <article className="sr-feature">
      <div>
        <Icon size={18} />
      </div>
      <h4>{title}</h4>
      <p>{text}</p>
    </article>
  );
}
