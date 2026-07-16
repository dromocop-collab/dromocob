"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { auth } from "@/lib/firebase";
import { authMessage } from "@/lib/auth-errors";

export default function LoginPage(){
  const router=useRouter(); const [show,setShow]=useState(false); const [busy,setBusy]=useState(false); const [email,setEmail]=useState(""); const [msg,setMsg]=useState(""); const [err,setErr]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setErr("");const f=new FormData(e.currentTarget);try{const c=await signInWithEmailAndPassword(auth,String(f.get("email")),String(f.get("password")));router.push(c.user.emailVerified?"/profilim":"/hesap-dogrulama");}catch(x){setErr(authMessage(typeof x==="object"&&x&&"code"in x?String(x.code):""));}finally{setBusy(false);}}
  async function reset(){if(!email){setErr("Önce e-posta adresini yaz.");return;}try{await sendPasswordResetEmail(auth,email);setMsg("Şifre yenileme e-postası gönderildi.");}catch(x){setErr(authMessage(typeof x==="object"&&x&&"code"in x?String(x.code):""));}}
  return <section className="auth-page"><div className="auth-art"><span className="auth-mark">DC</span><div><p className="eyebrow">Dromocob Account</p><h2>Tek hesap.<br/><em>Bütün deneyim.</em></h2><p>Profilini, tekliflerini ve Dromocob deneyimini tek merkezde yönet.</p></div></div><div className="auth-form-shell"><form className="auth-form" onSubmit={submit}><div className="auth-icon"><LockKeyhole/></div><p className="eyebrow">Tekrar hoş geldin</p><h1>Hesabına giriş yap.</h1>{err&&<div className="auth-error">{err}</div>}{msg&&<div className="auth-notice">{msg}</div>}<label>E-posta<input name="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Şifre<div className="password-field"><input name="password" type={show?"text":"password"} required/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label><button type="button" className="forgot-link" onClick={reset}>Şifremi unuttum</button><button className="button button-full" disabled={busy}>{busy?<Loader2 className="spin"/>:<>Giriş yap <ArrowRight size={18}/></>}</button><p className="auth-switch">Hesabın yok mu? <Link href="/kayit">Kayıt ol</Link></p></form></div></section>;
}
