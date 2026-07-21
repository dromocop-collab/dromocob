import MetricCards from "@/components/admin/metric-cards";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Cpu, Mail, MessageSquare, Package, Radar, Settings2, Zap } from "lucide-react";

export default function AdminDashboard() {
  const dateLabel = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase();
  return (
    <>
      <div className="admin-title"><div><p className="admin-kicker">{dateLabel} / EXECUTIVE OVERVIEW</p><h1>Kontrol merkezi.</h1><p>Dromocob dijital operasyonunun, kitlesinin ve servislerinin anlık görünümü.</p></div><Link href="/admin/ayarlar" className="admin-action"><Zap size={17}/> Sistem ayarları</Link></div>
      <section className="admin-quick-grid">
        <Link href="/admin/paketler"><span><Package/></span><div><small>CONTENT OPS</small><strong>Paketleri yönet</strong></div><ArrowUpRight/></Link>
        <Link href="/admin/destek"><span><MessageSquare/></span><div><small>CUSTOMER CARE</small><strong>Canlı desteğe git</strong></div><ArrowUpRight/></Link>
        <Link href="/admin/aboneler"><span><Mail/></span><div><small>AUDIENCE</small><strong>Kampanya oluştur</strong></div><ArrowUpRight/></Link>
        <Link href="/admin/ayarlar"><span><Settings2/></span><div><small>SEO & SYSTEM</small><strong>Görünürlüğü optimize et</strong></div><ArrowUpRight/></Link>
      </section>
      <MetricCards />
      <div className="admin-dashboard-grid">
        <section className="admin-panel wide">
          <div className="panel-head"><div><span className="panel-icon"><Radar/></span><div><h2>Operations Radar</h2><p>Kontrol merkezi özeti</p></div></div><button>Detay <ArrowUpRight size={16}/></button></div>
          <div className="radar-visual"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><div className="radar-sweep"/><span className="blip b1"/><span className="blip b2"/><span className="blip b3"/><div className="radar-center"><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></div></div>
        </section>
        <section className="admin-panel">
          <div className="panel-head"><div><span className="panel-icon"><Cpu/></span><div><h2>System health</h2><p>Core services</p></div></div></div>
          <div className="health-list">
            {["Firebase Core", "Live Chat", "Quote Engine", "Site Control API"].map((name, i) => <div key={name}><span><i className={i === 3 ? "warning" : ""}/>{name}</span><b>{i === 3 ? "CONFIG" : "ONLINE"}</b></div>)}
          </div>
        </section>
      </div>
    </>
  );
}
