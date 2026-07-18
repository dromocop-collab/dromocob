"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import AccountMenu from "@/components/auth/account-menu";

const links=[["Anasayfa","/"],["Hakkımda","/hakkimda"],["Projeler","/projeler"],["Paketler","/paketler"],["Kurumsal","/kurumsal"],["İletişim","/iletisim"]];
export default function SiteNav(){
  const [open,setOpen]=useState(false);
  const pathname=usePathname();

  function isActive(href:string){
    return href==="/" ? pathname==="/" : pathname.startsWith(href);
  }

  return <header className="nav-shell">
    <Link className="brand" href="/"><span className="brand-dot"/>DROMOCOB</Link>
    <nav className="desktop-nav">
      {links.map(([l,h])=><Link key={h} href={h} className={isActive(String(h))?"nav-link active":"nav-link"}>{l}</Link>)}
      <Link href="/paketler#teklif" className="nav-cta">Fiyat Teklifi Al</Link>
      <AccountMenu/>
    </nav>
    <button className="icon-button mobile-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    {open&&<div className="mobile-nav"><div className="mobile-nav-links">{links.map(([l,h])=><Link key={h} href={h} className={isActive(String(h))?"nav-link active":"nav-link"} onClick={()=>setOpen(false)}>{l}</Link>)}<Link href="/paketler#teklif" className="nav-cta" onClick={()=>setOpen(false)}>Fiyat Teklifi Al</Link></div><AccountMenu/></div>}
  </header>;
}
