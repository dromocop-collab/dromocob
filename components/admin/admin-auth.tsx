"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, LockKeyhole } from "lucide-react";

export default function AdminAuth({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, async current => {
    setUser(current);
    if (!current) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    const allowlist = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
    const firestoreAdmin = await getDoc(doc(db, "admin_users", current.uid));
    const isAllowed = allowlist.includes(current.email?.toLowerCase() || "") || firestoreAdmin.data()?.active === true;
    setAuthorized(isAllowed);
    setLoading(false);
  }), []);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await signInWithEmailAndPassword(auth, String(fd.get("email")), String(fd.get("password")));
    } catch {
      setError("Giriş başarısız. E-posta veya şifreyi kontrol et.");
    }
  }

  if (loading) return <div className="admin-loading"><Loader2 className="spin"/></div>;
  if (!user || !authorized) {
    return (
      <div className="admin-login">
        <form onSubmit={login}>
          <div className="login-icon"><LockKeyhole /></div>
          <p className="eyebrow">Dromocob Control OS</p>
          <h1>Yönetim merkezi</h1>
          {user && !authorized && <div className="admin-alert">Bu hesap admin listesinde değil. <button type="button" onClick={() => signOut(auth)}>Çıkış yap</button></div>}
          {!user && <>
            <input name="email" type="email" placeholder="Admin e-posta" required />
            <input name="password" type="password" placeholder="Şifre" required />
            {error && <div className="admin-alert">{error}</div>}
            <button className="button button-full">Güvenli Giriş</button>
          </>}
        </form>
      </div>
    );
  }
  return <>{children}</>;
}
