import MetricCards from "@/components/admin/metric-cards";
import Link from "next/link";
import Image from "next/image";
import { Activity, ArrowRight, ArrowUpRight, BarChart3, Cpu, Globe2, Mail, MessageSquare, Package, Radar, Settings2, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function AdminDashboard() {
  const dateLabel = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase();
  return (
    <>
      <section className="dashboard-command-hero">
        <div className="dashboard-command-grid"/>
        <div className="dashboard-command-copy"><p className="admin-kicker"><i/> {dateLabel} / EXECUTIVE OVERVIEW</p><h1>Kontrol<br/><em>merkezi.</em></h1><p>Dromocob&apos;un müşteri, büyüme, ürün ve yayın operasyonunu tek canlı merkezden yönet.</p><div><Link href="/admin/analitik"><BarChart3/> Canlı veriyi izle <ArrowRight/></Link><Link href="/admin/ayarlar"><Settings2/> Sistemi yapılandır</Link></div></div>
        <aside className="dashboard-command-core"><div className="dashboard-core-orbit"><i/><i/><i/><span><Image src="/logo.svg" alt="" width={58} height={58}/></span></div><div className="dashboard-core-state"><span><i/> CONTROL OS ONLINE</span><b>04</b><small>CORE SERVICE ACTIVE</small></div></aside>
      </section>
      <div className="dashboard-signal-bar"><span><i/> Firebase connected</span><span><i/> Conversion pipeline ready</span><span><i/> Customer channels online</span><b>SYNC / 5 SN</b></div>
      <section className="admin-quick-grid">
        <Link href="/admin/paketler"><span><Package/></span><div><small>CONTENT OPS</small><strong>Paketleri yönet</strong></div><ArrowUpRight/></Link>
        <Link href="/admin/destek"><span><MessageSquare/></span><div><small>CUSTOMER CARE</small><strong>Canlı desteğe git</strong></div><ArrowUpRight/></Link>
        <Link href="/admin/aboneler"><span><Mail/></span><div><small>AUDIENCE</small><strong>Kampanya oluştur</strong></div><ArrowUpRight/></Link>
        <Link href="/admin/ayarlar"><span><Settings2/></span><div><small>SEO & SYSTEM</small><strong>Görünürlüğü optimize et</strong></div><ArrowUpRight/></Link>
      </section>
      <MetricCards />
      <div className="admin-dashboard-grid dashboard-main-grid">
        <section className="admin-panel wide">
          <div className="panel-head"><div><span className="panel-icon"><Radar/></span><div><h2>Operasyon radarı</h2><p>Canlı servis ve müşteri sinyalleri</p></div></div><Link href="/admin/analitik">Detay <ArrowUpRight size={16}/></Link></div>
          <div className="radar-visual"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><div className="radar-sweep"/><span className="blip b1"/><span className="blip b2"/><span className="blip b3"/><div className="radar-center"><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></div></div>
        </section>
        <section className="admin-panel">
          <div className="panel-head"><div><span className="panel-icon"><Cpu/></span><div><h2>Sistem sağlığı</h2><p>Çekirdek servisler</p></div></div><span className="health-score">%94</span></div>
          <div className="health-list">
            {["Firebase Core", "Live Chat", "Quote Engine", "Site Control API"].map((name, i) => <div key={name}><span><i className={i === 3 ? "warning" : ""}/>{name}</span><b>{i === 3 ? "CONFIG" : "ONLINE"}</b></div>)}
          </div>
        </section>
      </div>
      <section className="dashboard-operations-grid">
        <article className="dashboard-action-center"><header><div><Sparkles/><span><small>NEXT BEST ACTION</small><strong>Operasyon önerileri</strong></span></div><b>03 AÇIK</b></header><div><Link href="/admin/talepler"><span><MessageSquare/></span><p><strong>Yeni talepleri değerlendir</strong><small>Form, teklif ve müşteri kayıtlarını tek kuyrukta incele.</small></p><ArrowUpRight/></Link><Link href="/admin/ads"><span><Activity/></span><p><strong>Dönüşüm akışını doğrula</strong><small>Ads etiketlerinin ve lead sinyallerinin durumunu kontrol et.</small></p><ArrowUpRight/></Link><Link href="/admin/siteler"><span><Globe2/></span><p><strong>Yönetilen siteleri tara</strong><small>Health check sonuçlarını ve yayın durumunu görüntüle.</small></p><ArrowUpRight/></Link></div></article>
        <article className="dashboard-security-card"><header><ShieldCheck/><span><small>SECURITY POSTURE</small><strong>Koruma katmanı</strong></span></header><div className="security-score"><strong>92</strong><span>/100</span><i/></div><ul><li><i/>Admin erişimi korunuyor <b>AKTİF</b></li><li><i/>Consent Mode v2 <b>AKTİF</b></li><li><i/>Rate limit politikası <b>KONTROL</b></li></ul><Link href="/admin/ayarlar">Güvenlik ayarlarını aç <ArrowRight/></Link></article>
      </section>
    </>
  );
}
