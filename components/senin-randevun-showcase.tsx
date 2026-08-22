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
  Network,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
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
              DROMOCOB LABS / PRODUCT 01
            </p>

            <h2 id="seninrandevun-title">
              Bir randevu ürünü değil.
              <br />
              <em>İşletmenin dijital merkezi.</em>
            </h2>
          </div>

          <div className="sr-head-copy">
            <span>WEB + NATIVE iOS · 2026</span>
            <p>
              Keşif, rezervasyon ve işletme operasyonunu aynı veri mimarisinde
              buluşturan; farklı sektörlere ve çoklu mağaza yapılarına uyarlanan
              yeni nesil SaaS platformu.
            </p>
          </div>
        </div>

        <div className="sr-stage">
          <div className="sr-product-copy">
            <div className="sr-product-badge">
              <BadgeCheck size={17} />
              DROMOCOB PRODUCT · CANLI
            </div>

            <h3>
              Keşiften operasyona
              <span>tek, kesintisiz deneyim.</span>
            </h3>

            <p>
              Müşteriler doğru hizmeti bulup uygun saati seçer. İşletmeler
              takvimini, ekibini, hizmetlerini, müşterilerini ve mağazalarını
              web ile iOS üzerinden tek merkezden yönetir.
            </p>

            <div className="sr-proof-grid" aria-label="SeninRandevun ürün kapsamı">
              <div><Smartphone size={17}/><span><small>PLATFORM</small><strong>Web + iOS</strong></span></div>
              <div><Store size={17}/><span><small>OPERASYON</small><strong>Çoklu mağaza</strong></span></div>
              <div><Network size={17}/><span><small>MİMARİ</small><strong>Ortak veri sistemi</strong></span></div>
            </div>

            <div className="sr-feature-grid">
              <Feature
                icon={CalendarDays}
                title="Online Randevu"
                text="Müşteriler uygun saatleri görerek hızlıca randevu oluşturabilir."
              />
              <Feature
                icon={LayoutDashboard}
                title="İşletme Paneli"
                text="Takvim, hizmet, ekip, müşteri ve mağazalar aynı merkezde."
              />
              <Feature
                icon={UsersRound}
                title="Akıllı Keşif"
                text="Kategori, işletme, hizmet ve uygun saat tek akışta."
              />
              <Feature
                icon={ShieldCheck}
                title="Ölçeklenebilir SaaS"
                text="Rol, onay ve çoklu mağaza ihtiyaçlarına hazır mimari."
              />
            </div>

            <div className="sr-actions">
              <Link className="sr-primary-link" href="/projeler/senin-randevun">
                Vaka çalışmasını incele
                <ArrowUpRight size={17} />
              </Link>

              <Link className="sr-secondary-link" href="https://seninrandevun.com" target="_blank" rel="noreferrer">
                Canlı ürünü aç
                <Globe2 size={15}/>
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
                    <small>OPERASYON MERKEZİ</small>
                    <strong>Bugünün akışı</strong>
                  </div>
                  <span>
                    <CheckCircle2 size={15} />
                    Canlı senkronizasyon
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
                    <small>İŞLETME MERKEZİ</small>
                    <strong>Tüm operasyon tek yerde</strong>
                    <span>Takvim · Ekip · Hizmet · Müşteri</span>
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

            <div className="sr-phone">
              <div className="sr-phone-island" />
              <div className="sr-phone-brand"><span>SR</span><div><small>SENİN</small><strong>Randevun</strong></div></div>
              <div className="sr-phone-hero"><small>SANA ÖZEL KEŞİF</small><strong>İyi hissettiren<br/>hizmeti keşfet.</strong></div>
              <div className="sr-phone-search">Hizmet veya işletme ara…</div>
              <div className="sr-phone-cards"><i/><i/><i/></div>
              <div className="sr-phone-nav"><i/><i/><i/><i/></div>
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
                <small>MULTI STORE</small>
                <strong>CONNECTED</strong>
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
              <strong>SeninRandevun web ve iOS ürünü yayında</strong>
            </span>
          </div>

          <div className="sr-footer-signals">
            <span>DISCOVERY / LIVE</span>
            <span>BUSINESS OS / ACTIVE</span>
            <span>iOS / NATIVE</span>
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
