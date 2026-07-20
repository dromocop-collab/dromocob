"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { Boxes, CircleGauge, Command, ExternalLink, FolderKanban, Globe2, LogOut, Mail, Menu, MessageSquare, Package, RadioTower, Rocket, Settings2, Sparkles, X } from "lucide-react";

const nav = [
  [CircleGauge, "Genel Bakış", "/admin"],
  [FolderKanban, "Projeler", "/admin/projeler"],
  [Package, "Paketler", "/admin/paketler"],
  [Sparkles, "Teklif Motoru", "/admin/teklif"],
  [MessageSquare, "Canlı Destek", "/admin/destek"],
  [RadioTower, "Site Control Center", "/admin/siteler"],
  [Globe2, "Müşteri Siteleri", "/admin/musteri-siteleri"],
  [Rocket, "Site Aktivasyonları", "/admin/site-aktivasyonlari"],
  [Boxes, "Form & Talepler", "/admin/talepler"],
  [Mail, "Aboneler & Mail", "/admin/aboneler"],
  [Settings2, "Ayarlar", "/admin/ayarlar"]
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = nav.find(([, , href]) => pathname === href || (String(href) !== "/admin" && pathname.startsWith(String(href))));

  return (
    <div className="admin-os">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><span>DC</span><div>DROMOCOB<small>CONTROL OS</small></div></Link>
        <nav>
          {nav.map(([Icon, label, href]) => {
            const C = Icon as typeof CircleGauge;
            return <Link key={String(href)} href={String(href)} className={pathname === href ? "active" : ""}><C size={19}/>{String(label)}</Link>;
          })}
        </nav>
        <button className="logout" onClick={() => signOut(auth)}><LogOut size={18}/> Çıkış yap</button>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-context"><span className="system-status"/><div><small>DROMOCOB CONTROL OS</small><strong>{activeItem ? String(activeItem[1]) : "Sistem çevrimiçi"}</strong></div></div>
          <div className="admin-topbar-actions">
            <div className="admin-command"><Command size={14}/><span>Hızlı komut</span><kbd>⌘ K</kbd></div>
            <Link className="admin-site-link" href="/" target="_blank">Siteyi aç <ExternalLink size={14}/></Link>
            <button className="admin-mobile-toggle" onClick={() => setMobileNavOpen(true)} aria-label="Admin menüsünü aç">
              <Menu size={18}/>
            </button>
            <div className="admin-user">CE</div>
          </div>
        </header>

        {mobileNavOpen && <div className="admin-mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)}>
          <aside className="admin-mobile-nav" onClick={(event) => event.stopPropagation()}>
            <div className="admin-mobile-nav-head">
              <strong>Menü</strong>
              <button className="icon-button" onClick={() => setMobileNavOpen(false)} aria-label="Admin menüsünü kapat"><X size={18}/></button>
            </div>
            <nav>
              {nav.map(([Icon, label, href]) => {
                const C = Icon as typeof CircleGauge;
                return <Link key={String(href)} href={String(href)} className={pathname === href ? "active" : ""} onClick={() => setMobileNavOpen(false)}><C size={18}/>{String(label)}</Link>;
              })}
            </nav>
            <button className="logout" onClick={() => signOut(auth)}><LogOut size={18}/> Çıkış yap</button>
          </aside>
        </div>}

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
