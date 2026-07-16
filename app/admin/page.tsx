import MetricCards from "@/components/admin/metric-cards";
import { ArrowUpRight, Cpu, Radar, Zap } from "lucide-react";

export default function AdminDashboard() {
  return (
    <>
      <div className="admin-title"><div><p className="admin-kicker">14 JUL 2026 / OPERATIONS</p><h1>İyi geceler, Cihat.</h1><p>Dromocob dijital operasyonunun anlık görünümü.</p></div><button className="admin-action"><Zap size={17}/> Hızlı işlem</button></div>
      <MetricCards />
      <div className="admin-dashboard-grid">
        <section className="admin-panel wide">
          <div className="panel-head"><div><span className="panel-icon"><Radar/></span><div><h2>Operations Radar</h2><p>Kontrol merkezi özeti</p></div></div><button>Detay <ArrowUpRight size={16}/></button></div>
          <div className="radar-visual"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><div className="radar-sweep"/><span className="blip b1"/><span className="blip b2"/><span className="blip b3"/><div className="radar-center">DC</div></div>
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
