"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, UserPlus } from "lucide-react";

import { authMessage } from "@/lib/auth-errors";
import { importPendingSite } from "@/lib/customer-sites";
import { auth, db } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErr("");

    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (password.length < 8 || !/[A-ZÇĞİÖŞÜ]/.test(password) || !/\d/.test(password)) {
      setBusy(false);
      setErr("Şifre en az 8 karakter, 1 büyük harf ve 1 rakam içermeli.");
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        email,
        displayName,
        phone: "",
        company: "",
        city: "",
        bio: "",
        verified: false,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await importPendingSite(credential.user.uid);
      const token = await credential.user.getIdToken();
      await fetch("/api/auth/email-verification/send", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      router.push("/hesap-dogrulama");
    } catch (error) {
      setErr(authMessage(typeof error === "object" && error && "code" in error ? String(error.code) : ""));
    } finally {
      setBusy(false);
    }
  }

  return <section className="auth-page"><div className="auth-art"><span className="auth-mark">01</span><div><p className="eyebrow">Create account</p><h2>İlk temas.<br/><em>Uzun iş birliği.</em></h2><p>Dromocob hesabını oluştur ve dijital deneyimini tek profilde topla.</p></div></div><div className="auth-form-shell"><form className="auth-form" onSubmit={submit}><div className="auth-icon"><UserPlus/></div><p className="eyebrow">Yeni hesap</p><h1>Dromocob&apos;a katıl.</h1>{err&&<div className="auth-error">{err}</div>}<label>Ad soyad<input name="displayName" required/></label><label>E-posta<input name="email" type="email" required/></label><label>Şifre<input name="password" type="password" minLength={8} required placeholder="En az 8 karakter, büyük harf ve rakam"/></label><button className="button button-full" disabled={busy}>{busy?<Loader2 className="spin"/>:<>Hesap oluştur <ArrowRight size={18}/></>}</button><p className="auth-switch">Zaten hesabın var mı? <Link href="/giris">Giriş yap</Link></p></form></div></section>;
}
