"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { BarChart3, Boxes, CircleGauge, Command, Crown, ExternalLink, FolderKanban, Globe2, KeyRound, LogOut, Mail, Megaphone, Menu, MessageSquare, Package, RadioTower, Rocket, Settings2, Smartphone, Sparkles, X } from "lucide-react";

const nav = [
  { icon: CircleGauge, label: "Genel Bakış", href: "/admin", group: "Komuta" },
  { icon: BarChart3, label: "Canlı Analitik", href: "/admin/analitik", group: "Komuta", live: true },
  { icon: Megaphone, label: "Ads Dönüşümleri", href: "/admin/ads", group: "Komuta" },
  { icon: Smartphone, label: "Uygulamalar", href: "/admin/uygulamalar", group: "Ürünler" },
  { icon: KeyRound, label: "Lisans Cloud", href: "/admin/lisanslar", group: "Ürünler" },
  { icon: Crown, label: "Mobil Hesaplar", href: "/admin/mobil-hesaplar", group: "Ürünler" },
  { icon: FolderKanban, label: "Projeler", href: "/admin/projeler", group: "İçerik" },
  { icon: Package, label: "Paketler", href: "/admin/paketler", group: "İçerik" },
  { icon: Sparkles, label: "Teklif Motoru", href: "/admin/teklif", group: "İçerik" },
  { icon: MessageSquare, label: "Canlı Destek", href: "/admin/destek", group: "Operasyon", live: true },
  { icon: RadioTower, label: "Site Control Center", href: "/admin/siteler", group: "Operasyon" },
  { icon: Globe2, label: "Müşteri Siteleri", href: "/admin/musteri-siteleri", group: "Operasyon" },
  { icon: Rocket, label: "Site Aktivasyonları", href: "/admin/site-aktivasyonlari", group: "Operasyon" },
  { icon: Boxes, label: "Form & Talepler", href: "/admin/talepler", group: "Müşteri" },
  { icon: Mail, label: "Aboneler & Mail", href: "/admin/aboneler", group: "Müşteri" },
  { icon: Settings2, label: "Ayarlar", href: "/admin/ayarlar", group: "Sistem" }
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = nav.find(item => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)));

  return (
    <div className="admin-os">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><span><Image className="brand-round-logo" src="/logo.svg" alt="Dromocob" width={512} height={512} /></span><div>DROMOCOB<small>CONTROL OS</small></div></Link>
        <div className="admin-sidebar-status"><span><i/> SYSTEM ONLINE</span><b>v2.6</b></div>
        <nav>
          {nav.map((item, index) => {
            const C = item.icon;
            const showGroup = !index || nav[index - 1].group !== item.group;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return <div className="admin-nav-item" key={item.href}>{showGroup && <p>{item.group}<span>{String(index + 1).padStart(2, "0")}</span></p>}<Link href={item.href} className={active ? "active" : ""}><span className="admin-nav-icon"><C size={18}/></span><strong>{item.label}</strong>{item.live && <i className="admin-nav-live"/>}<em>↗</em></Link></div>;
          })}
        </nav>
        <div className="admin-sidebar-foot"><div><span>DC</span><p><strong>Yönetici oturumu</strong><small>Güvenli bağlantı</small></p></div><button className="logout" onClick={() => signOut(auth)} aria-label="Çıkış yap"><LogOut size={17}/></button></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-context"><span className="system-status"/><div><small>DROMOCOB CONTROL OS</small><strong>{activeItem?.label || "Sistem çevrimiçi"}</strong></div></div>
          <div className="admin-topbar-actions">
            <div className="admin-command"><Command size={14}/><span>Hızlı komut</span><kbd>⌘ K</kbd></div>
            <Link className="admin-site-link" href="/" target="_blank" rel="noreferrer">Siteyi aç <ExternalLink size={14}/></Link>
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
              {nav.map((item) => {
                const C = item.icon;
                return <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} onClick={() => setMobileNavOpen(false)}><C size={18}/>{item.label}</Link>;
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
