"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import AccountMenu from "@/components/auth/account-menu";

const links=[["Anasayfa","/"],["Hizmetler","/hizmetler"],["Projeler","/projeler"],["Paketler","/paketler"],["Kurumsal","/kurumsal"],["İletişim","/iletisim"]];
export default function SiteNav(){
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const pathname=usePathname();

  useEffect(()=>{
    const handleScroll=()=>setScrolled(window.scrollY>18);
    handleScroll();
    window.addEventListener("scroll",handleScroll,{passive:true});
    return ()=>window.removeEventListener("scroll",handleScroll);
  },[]);

  function isActive(href:string){
    return href==="/" ? pathname==="/" : pathname.startsWith(href);
  }

  return <header className={`nav-shell ${scrolled?"is-scrolled":""} ${open?"menu-open":""}`}>
    <Link className="brand" href="/" aria-label="Dromocob ana sayfa" onClick={()=>setOpen(false)}>
      <span className="brand-monogram"><Image src="/logo.svg" alt="" width={43} height={43} priority /></span>
      <span className="brand-copy"><b>DROMOCOB</b><small>Film · Web · Growth</small></span>
    </Link>
    <nav className="desktop-nav" aria-label="Ana navigasyon">
      <div className="nav-primary">
        {links.map(([l,h])=><Link key={h} href={h} className={isActive(String(h))?"nav-link active":"nav-link"}>{l}</Link>)}
      </div>
      <div className="nav-actions">
        <Link href="/paketler#teklif" className="nav-cta"><span><small>Yeni proje</small>Teklif Oluştur</span><i><ArrowUpRight size={16}/></i></Link>
        <AccountMenu/>
      </div>
    </nav>
    <button className="mobile-menu" type="button" onClick={()=>setOpen(!open)} aria-label={open?"Menüyü kapat":"Menüyü aç"} aria-expanded={open} aria-controls="mobile-site-navigation"><span>{open?<X/>:<Menu/>}</span></button>
    {open&&<div className="mobile-nav" id="mobile-site-navigation">
      <div className="mobile-nav-intro"><span>MENU / 01—06</span><p>Film, web ve büyüme sistemleri için bütünleşik üretim.</p></div>
      <div className="mobile-nav-links">{links.map(([l,h],index)=><Link key={h} href={h} className={isActive(String(h))?"nav-link active":"nav-link"} onClick={()=>setOpen(false)}><span>0{index+1}</span>{l}<ArrowUpRight size={18}/></Link>)}</div>
      <div className="mobile-nav-footer"><Link href="/paketler#teklif" className="nav-cta" onClick={()=>setOpen(false)}><span><small>Projenizi planlayın</small>Teklif Oluştur</span><i><ArrowUpRight size={17}/></i></Link><AccountMenu/></div>
    </div>}
  </header>;
}
