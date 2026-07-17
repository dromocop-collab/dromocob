"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  useAuth,
} from "@/components/auth/auth-provider";
import {
  auth,
} from "@/lib/firebase";

export default function VerifyPage() {
  const router = useRouter();
  const {
    loading,
    user,
  } = useAuth();
  const [
    code,
    setCode,
  ] = useState("");
  const [
    busy,
    setBusy,
  ] = useState(false);
  const [
    msg,
    setMsg,
  ] = useState("");
  const [
    err,
    setErr,
  ] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/giris");
    }
  }, [loading, router, user]);

  async function getToken(): Promise<string> {
    if (!auth.currentUser) {
      throw new Error("Oturum bulunamadı. Yeniden giriş yap.");
    }

    return auth.currentUser.getIdToken();
  }

  async function sendCode(): Promise<void> {
    setBusy(true);
    setErr("");
    setMsg("");

    try {
      const token = await getToken();
      const response = await fetch(
        "/api/auth/email-verification/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "Doğrulama kodu gönderilemedi."
        );
      }

      setMsg(payload?.message || "Doğrulama kodu gönderildi.");
    } catch (sendError) {
      setErr(
        sendError instanceof Error
          ? sendError.message
          : "Doğrulama kodu gönderilemedi."
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");

    try {
      const token = await getToken();
      const response = await fetch(
        "/api/auth/email-verification/confirm",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        }
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "Hesap doğrulanamadı."
        );
      }

      await auth.currentUser?.reload();
      setMsg(payload?.message || "Hesap doğrulandı.");
      router.push("/profilim");
    } catch (confirmError) {
      setErr(
        confirmError instanceof Error
          ? confirmError.message
          : "Hesap doğrulanamadı."
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-state-loader">
        <Loader2 className="spin" />
      </div>
    );
  }

  return (
    <section className="verification-page">
      <form
        className="verification-card"
        onSubmit={confirmCode}
      >
        <div className="verification-icon">
          <MailCheck />
        </div>
        <p className="eyebrow">6 haneli güvenlik kodu</p>
        <h1>E-postanı doğrula.</h1>
        <p>
          <strong>{user?.email}</strong> adresine gönderilen kodu gir.
          Kod 10 dakika geçerlidir.
        </p>

        {err && <div className="auth-error">{err}</div>}
        {msg && <div className="auth-notice">{msg}</div>}

        <label className="auth-code-field">
          <ShieldCheck size={18} />
          <input
            value={code}
            onChange={event =>
              setCode(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              )
            }
            inputMode="numeric"
            pattern="\d{6}"
            placeholder="000000"
            required
          />
        </label>

        <button
          className="button button-full"
          disabled={busy || code.length !== 6}
        >
          {busy ? (
            <Loader2 className="spin" />
          ) : (
            <>
              <CheckCircle2 size={18} />
              Hesabı doğrula
            </>
          )}
        </button>

        <button
          type="button"
          className="verify-secondary"
          onClick={sendCode}
          disabled={busy}
        >
          <RefreshCw size={16} />
          Yeni kod gönder
        </button>
      </form>
    </section>
  );
}
