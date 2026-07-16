"use client";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { ChevronDown, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useAuth } from "./auth-provider";

export default function AccountMenu() {
  const {user,profile,isAdmin,loading}=useAuth();
  const [open,setOpen]=useState(false);
  if (loading) return <span className="account-skeleton"/>;
  if (!user) return <div className="guest-actions"><Link href="/giris">Giriş yap</Link><Link href="/kayit" className="button button-small">Kayıt ol</Link></div>;

  const name=profile?.displayName||user.displayName||user.email?.split("@")[0]||"Hesabım";
  const initials=name.split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

  return <div className="account-menu">
    {isAdmin && <Link href="/admin" className="admin-nav-button"><ShieldCheck size={15}/>ADMIN PANEL</Link>}
    <button className="account-trigger" onClick={()=>setOpen(!open)}><span>{initials}</span><b>{name}</b><ChevronDown size={14}/></button>
    {open && <div className="account-dropdown">
      <div><strong>{name}</strong><small>{user.email}</small><em className={user.emailVerified?"verified-badge":"pending-badge"}>{user.emailVerified?"✓ Hesap doğrulandı":"• Doğrulama bekliyor"}</em></div>
      <Link href="/profilim"><UserRound size={16}/>Profilim</Link>
      {!user.emailVerified && <Link href="/hesap-dogrulama"><ShieldCheck size={16}/>Hesabı doğrula</Link>}
      {isAdmin && <Link href="/admin"><ShieldCheck size={16}/>Yönetim merkezi</Link>}
      <button onClick={()=>signOut(auth)}><LogOut size={16}/>Çıkış yap</button>
    </div>}
  </div>;
}
