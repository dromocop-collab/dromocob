"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, UserPlus } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { authMessage } from "@/lib/auth-errors";

export default function RegisterPage(){
  const router=useRouter();const [busy,setBusy]=useState(false);const [err,setErr]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setErr("");const f=new FormData(e.currentTarget);const displayName=String(f.get("displayName")||"").trim(),email=String(f.get("email")||"").trim().toLowerCase(),password=String(f.get("password")||"");if(password.length<8||!/[A-ZÇĞİÖŞÜ]/.test(password)||!/\d/.test(password)){setBusy(false);setErr("Şifre en az 8 karakter, 1 büyük harf ve 1 rakam içermeli.");return;}try{const c=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(c.user,{displayName});await setDoc(doc(db,"users",c.user.uid),{uid:c.user.uid,email,displayName,phone:"",company:"",city:"",bio:"",verified:false,status:"active",createdAt:serverTimestamp(),updatedAt:serverTimestamp()});await sendEmailVerification(c.user);router.push("/hesap-dogrulama");}catch(x){setErr(authMessage(typeof x==="object"&&x&&"code"in x?String(x.code):""));}finally{setBusy(false);}}
  return <section className="auth-page"><div className="auth-art"><span className="auth-mark">01</span><div><p className="eyebrow">Create account</p><h2>İlk temas.<br/><em>Uzun iş birliği.</em></h2><p>Dromocob hesabını oluştur ve dijital deneyimini tek profilde topla.</p></div></div><div className="auth-form-shell"><form className="auth-form" onSubmit={submit}><div className="auth-icon"><UserPlus/></div><p className="eyebrow">Yeni hesap</p><h1>Dromocob&apos;a katıl.</h1>{err&&<div className="auth-error">{err}</div>}<label>Ad soyad<input name="displayName" required/></label><label>E-posta<input name="email" type="email" required/></label><label>Şifre<input name="password" type="password" minLength={8} required placeholder="En az 8 karakter, büyük harf ve rakam"/></label><button className="button button-full" disabled={busy}>{busy?<Loader2 className="spin"/>:<>Hesap oluştur <ArrowRight size={18}/></>}</button><p className="auth-switch">Zaten hesabın var mı? <Link href="/giris">Giriş yap</Link></p></form></div></section>;
}
