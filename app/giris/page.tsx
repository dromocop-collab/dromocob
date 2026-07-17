"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  useRouter,
} from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  auth,
} from "@/lib/firebase";
import {
  authMessage,
} from "@/lib/auth-errors";

export default function LoginPage() {
  const router = useRouter();
  const [
    show,
    setShow,
  ] = useState(false);
  const [
    busy,
    setBusy,
  ] = useState(false);
  const [
    resetBusy,
    setResetBusy,
  ] = useState(false);
  const [
    resetOpen,
    setResetOpen,
  ] = useState(false);
  const [
    resetStep,
    setResetStep,
  ] = useState<"request" | "confirm">("request");
  const [
    email,
    setEmail,
  ] = useState("");
  const [
    resetCode,
    setResetCode,
  ] = useState("");
  const [
    newPassword,
    setNewPassword,
  ] = useState("");
  const [
    newPasswordAgain,
    setNewPasswordAgain,
  ] = useState("");
  const [
    msg,
    setMsg,
  ] = useState("");
  const [
    err,
    setErr,
  ] = useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setErr("");

    const formData = new FormData(event.currentTarget);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        String(formData.get("email")),
        String(formData.get("password"))
      );

      router.push(
        credential.user.emailVerified
          ? "/profilim"
          : "/hesap-dogrulama"
      );
    } catch (error) {
      setErr(
        authMessage(
          typeof error === "object" &&
            error &&
            "code" in error
            ? String(error.code)
            : ""
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function requestResetCode(): Promise<void> {
    if (!email.trim()) {
      setErr("Önce e-posta adresini yaz.");
      return;
    }

    setResetBusy(true);
    setErr("");
    setMsg("");

    try {
      const response = await fetch(
        "/api/auth/password-reset/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "Kod gönderilemedi."
        );
      }

      setMsg(payload?.message || "Kod gönderildi.");
      setResetStep("confirm");
    } catch (resetError) {
      setErr(
        resetError instanceof Error
          ? resetError.message
          : "Kod gönderilemedi."
      );
    } finally {
      setResetBusy(false);
    }
  }

  async function confirmReset(): Promise<void> {
    if (newPassword !== newPasswordAgain) {
      setErr("Yeni şifreler eşleşmiyor.");
      return;
    }

    setResetBusy(true);
    setErr("");
    setMsg("");

    try {
      const response = await fetch(
        "/api/auth/password-reset/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: resetCode,
            email,
            password: newPassword,
          }),
        }
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "Parola yenilenemedi."
        );
      }

      setMsg(
        payload?.message ||
          "Parolan yenilendi. Yeni şifrenle giriş yapabilirsin."
      );
      setResetOpen(false);
      setResetStep("request");
      setResetCode("");
      setNewPassword("");
      setNewPasswordAgain("");
    } catch (resetError) {
      setErr(
        resetError instanceof Error
          ? resetError.message
          : "Parola yenilenemedi."
      );
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-art">
        <span className="auth-mark">DC</span>
        <div>
          <p className="eyebrow">Dromocob Account</p>
          <h2>
            Tek hesap.
            <br />
            <em>Bütün deneyim.</em>
          </h2>
          <p>
            Profilini, tekliflerini ve Dromocob deneyimini tek merkezde yönet.
          </p>
        </div>
      </div>

      <div className="auth-form-shell">
        <form
          className="auth-form"
          onSubmit={submit}
        >
          <div className="auth-icon">
            <LockKeyhole />
          </div>
          <p className="eyebrow">Tekrar hoş geldin</p>
          <h1>Hesabına giriş yap.</h1>

          {err && <div className="auth-error">{err}</div>}
          {msg && <div className="auth-notice">{msg}</div>}

          <label>
            E-posta
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </label>

          <label>
            Şifre
            <div className="password-field">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            type="button"
            className="forgot-link"
            onClick={() => {
              setResetOpen(current => !current);
              setErr("");
              setMsg("");
            }}
          >
            Şifremi unuttum
          </button>

          {resetOpen && (
            <div className="reset-panel">
              <div>
                <KeyRound size={18} />
                <strong>6 haneli kodla parola yenile</strong>
              </div>

              {resetStep === "request" ? (
                <button
                  type="button"
                  className="button button-full"
                  onClick={requestResetCode}
                  disabled={resetBusy}
                >
                  {resetBusy ? (
                    <Loader2 className="spin" />
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Sıfırlama kodu gönder
                    </>
                  )}
                </button>
              ) : (
                <>
                  <label className="auth-code-field compact-code">
                    <ShieldCheck size={18} />
                    <input
                      value={resetCode}
                      onChange={event =>
                        setResetCode(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      inputMode="numeric"
                      pattern="\d{6}"
                      placeholder="000000"
                    />
                  </label>
                  <label>
                    Yeni şifre
                    <input
                      type="password"
                      minLength={8}
                      value={newPassword}
                      onChange={event =>
                        setNewPassword(event.target.value)
                      }
                      placeholder="En az 8 karakter, büyük harf ve rakam"
                    />
                  </label>
                  <label>
                    Yeni şifre tekrar
                    <input
                      type="password"
                      minLength={8}
                      value={newPasswordAgain}
                      onChange={event =>
                        setNewPasswordAgain(event.target.value)
                      }
                    />
                  </label>
                  <div className="reset-actions">
                    <button
                      type="button"
                      className="verify-secondary"
                      onClick={requestResetCode}
                      disabled={resetBusy}
                    >
                      Kodu tekrar gönder
                    </button>
                    <button
                      type="button"
                      className="button"
                      onClick={confirmReset}
                      disabled={
                        resetBusy ||
                        resetCode.length !== 6 ||
                        !newPassword ||
                        !newPasswordAgain
                      }
                    >
                      {resetBusy ? (
                        <Loader2 className="spin" />
                      ) : (
                        "Parolayı yenile"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            className="button button-full"
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="spin" />
            ) : (
              <>
                Giriş yap <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="auth-switch">
            Hesabın yok mu? <Link href="/kayit">Kayıt ol</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
