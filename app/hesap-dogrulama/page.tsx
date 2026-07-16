"use client";
import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";

export default function VerifyPage(){
  const router=useRouter();const {user,loading}=useAuth();const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");
  useEffect(()=>{if(!loading&&!user)router.replace("/giris");},[loading,user,router]);
  async function check(){if(!auth.currentUser)return;setBusy(true);await auth.currentUser.reload();const u=auth.currentUser;if(u?.emailVerified){await updateDoc(doc(db,"users",u.uid),{verified:true,emailVerifiedAt:serverTimestamp(),updatedAt:serverTimestamp()});router.push("/profilim");}else setMsg("Henüz doğrulanmadı. Maildeki bağlantıya tıklayıp tekrar kontrol et.");setBusy(false);}
  async function resend(){if(auth.currentUser){await sendEmailVerification(auth.currentUser);setMsg("Yeni doğrulama e-postası gönderildi.");}}
  if(loading)return <div className="auth-state-loader"><Loader2 className="spin"/></div>;
  return <section className="verification-page"><div className="verification-card"><div className="verification-icon"><MailCheck/></div><p className="eyebrow">Account verification</p><h1>E-postanı doğrula.</h1><p><strong>{user?.email}</strong> adresine doğrulama bağlantısı gönderdik.</p>{msg&&<div className="auth-notice">{msg}</div>}<button className="button button-full" onClick={check} disabled={busy}>{busy?<Loader2 className="spin"/>:<><CheckCircle2 size={18}/>Doğrulamayı kontrol et</>}</button><button className="verify-secondary" onClick={resend}><RefreshCw size={16}/>E-postayı tekrar gönder</button></div></section>;
}
