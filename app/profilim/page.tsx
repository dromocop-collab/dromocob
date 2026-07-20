"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  Activity,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Fingerprint,
  KeyRound,
  Loader2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/auth-provider";

export default function ProfilePage() {
  const router = useRouter();

  const {
    user,
    profile,
    isAdmin,
    adminRole,
    loading,
    adminLoading,
    refreshAdmin,
  } = useAuth();

  const [saving, setSaving] =
    useState(false);

  const [securityBusy, setSecurityBusy] =
    useState(false);
  const [passwordResetStep, setPasswordResetStep] =
    useState<"idle" | "code">("idle");
  const [passwordCode, setPasswordCode] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [newPasswordAgain, setNewPasswordAgain] =
    useState("");

  const [notice, setNotice] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/giris");
    }
  }, [
    loading,
    user,
    router,
  ]);

  const name = useMemo(() => {
    return (
      profile?.displayName ||
      user?.displayName ||
      "Dromocob User"
    );
  }, [
    profile?.displayName,
    user?.displayName,
  ]);

  const initials = useMemo(() => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0])
      .join("")
      .toUpperCase();
  }, [name]);

  async function saveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSaving(true);
    setNotice("");
    setError("");

    try {
      const formData = new FormData(
        event.currentTarget
      );

      const displayName = String(
        formData.get("displayName") || ""
      ).trim();

      const phone = String(
        formData.get("phone") || ""
      ).trim();

      const company = String(
        formData.get("company") || ""
      ).trim();

      const city = String(
        formData.get("city") || ""
      ).trim();

      const bio = String(
        formData.get("bio") || ""
      ).trim();

      if (displayName.length < 2) {
        throw new Error(
          "Ad soyad alanını kontrol et."
        );
      }

      await updateProfile(
        user,
        {
          displayName,
        }
      );

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          uid: user.uid,

          email:
            user.email || "",

          displayName,

          phone,

          company,

          city,

          bio,

          verified:
            user.emailVerified,

          status:
            profile?.status ||
            "active",

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setNotice(
        "Profil bilgilerin başarıyla güncellendi."
      );
    } catch (profileError) {
      console.error(
        profileError
      );

      setError(
        profileError instanceof Error
          ? profileError.message
          : "Profil güncellenemedi."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) {
      return;
    }

    setSecurityBusy(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        "/api/auth/password-reset/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
          }),
        }
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "Şifre yenileme kodu gönderilemedi."
        );
      }

      setNotice(
        payload?.message ||
          "Şifre yenileme kodu e-posta adresine gönderildi."
      );
      setPasswordResetStep("code");
    } catch (resetError) {
      console.error(
        resetError
      );

      setError(
        resetError instanceof Error
          ? resetError.message
          : "Şifre yenileme kodu gönderilemedi."
      );
    } finally {
      setSecurityBusy(false);
    }
  }

  async function confirmPasswordReset() {
    if (!user?.email) {
      return;
    }

    if (newPassword !== newPasswordAgain) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    setSecurityBusy(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        "/api/auth/password-reset/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: passwordCode,
            email: user.email,
            password: newPassword,
          }),
        }
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "Şifre yenilenemedi."
        );
      }

      setNotice(
        payload?.message ||
          "Şifre yenilendi. Yeni şifrenle tekrar giriş yap."
      );
      setPasswordResetStep("idle");
      setPasswordCode("");
      setNewPassword("");
      setNewPasswordAgain("");
      await signOut(auth);
      router.replace("/giris");
    } catch (resetError) {
      console.error(
        resetError
      );

      setError(
        resetError instanceof Error
          ? resetError.message
          : "Şifre yenilenemedi."
      );
    } finally {
      setSecurityBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);

    router.replace("/");
  }

  async function handleRefreshPermissions() {
    setNotice("");
    setError("");

    try {
      await refreshAdmin();

      setNotice(
        "Hesap yetkileri yeniden kontrol edildi."
      );
    } catch {
      setError(
        "Yetkiler güncellenemedi."
      );
    }
  }

  if (
    loading ||
    !user
  ) {
    return (
      <div className="auth-state-loader">
        <Loader2
          className="spin"
        />
      </div>
    );
  }

  return (
    <section className="profile-page section">
      <div className="profile-head">
        <div className="profile-identity">
          <div className="profile-avatar">
            {initials || "DC"}
          </div>

          <div>
            <p className="eyebrow">
              Dromocob Account Center
            </p>

            <h1>
              {name}
            </h1>

            <div className="profile-badges">
              <span
                className={
                  user.emailVerified
                    ? "verified-badge"
                    : "pending-badge"
                }
              >
                {user.emailVerified ? (
                  <>
                    <BadgeCheck
                      size={14}
                    />

                    Doğrulanmış hesap
                  </>
                ) : (
                  <>
                    <Clock3
                      size={14}
                    />

                    Doğrulama bekliyor
                  </>
                )}
              </span>

              {adminLoading ? (
                <span className="pending-badge">
                  <Loader2
                    size={13}
                    className="spin"
                  />

                  Yetki kontrolü
                </span>
              ) : isAdmin ? (
                <span className="profile-admin-badge">
                  <ShieldCheck
                    size={14}
                  />

                  {adminRole ===
                  "super_admin"
                    ? "SUPER ADMIN"
                    : "ADMIN"}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="button profile-admin-primary"
          >
            <ShieldCheck
              size={17}
            />

            Admin Paneline Git

            <ChevronRight
              size={17}
            />
          </Link>
        )}
      </div>

      {notice && (
        <div className="auth-notice profile-message">
          <CheckCircle2
            size={17}
          />

          {notice}
        </div>
      )}

      {error && (
        <div className="auth-error profile-message">
          {error}
        </div>
      )}

      {!user.emailVerified && (
        <div className="profile-verification-banner">
          <Mail
            size={21}
          />

          <div>
            <strong>
              Hesap doğrulaman tamamlanmadı.
            </strong>

            <p>
              E-posta doğrulamasını tamamlayarak
              hesap güvenliğini etkinleştir.
            </p>
          </div>

          <Link href="/hesap-dogrulama">
            Şimdi doğrula
          </Link>
        </div>
      )}

      {isAdmin && (
        <section className="profile-admin-command">
          <div className="profile-admin-command-icon">
            <ShieldCheck />
          </div>

          <div>
            <p className="eyebrow">
              Privileged access
            </p>

            <h2>
              Dromocob Control OS erişimin aktif.
            </h2>

            <p>
              Site Control Center, teklif motoru,
              proje yönetimi ve canlı destek
              operasyonlarına erişebilirsin.
            </p>
          </div>

          <Link
            href="/admin"
            className="profile-command-link"
          >
            Control OS
            <ChevronRight
              size={18}
            />
          </Link>
        </section>
      )}

      <div className="profile-layout">
        <form
          className="profile-card profile-form"
          onSubmit={saveProfile}
        >
          <div className="profile-card-head">
            <UserRound />

            <div>
              <h2>
                Profil bilgileri
              </h2>

              <p>
                Dromocob hesabındaki
                kişisel ve profesyonel bilgiler.
              </p>
            </div>
          </div>

          <div className="profile-form-grid">
            <label>
              <span>
                <CircleUserRound
                  size={15}
                />

                Ad soyad
              </span>

              <input
                name="displayName"
                defaultValue={name}
                required
                maxLength={80}
              />
            </label>

            <label>
              <span>
                <Mail
                  size={15}
                />

                E-posta
              </span>

              <input
                value={
                  user.email || ""
                }
                disabled
              />
            </label>

            <label>
              <span>
                <Phone
                  size={15}
                />

                Telefon
              </span>

              <input
                name="phone"
                defaultValue={
                  profile?.phone || ""
                }
                placeholder="+90..."
                maxLength={30}
              />
            </label>

            <label>
              <span>
                <Building2
                  size={15}
                />

                Şirket / marka
              </span>

              <input
                name="company"
                defaultValue={
                  profile?.company || ""
                }
                placeholder="Marka adı"
                maxLength={100}
              />
            </label>

            <label>
              <span>
                <MapPin
                  size={15}
                />

                Şehir
              </span>

              <input
                name="city"
                defaultValue={
                  profile?.city || ""
                }
                placeholder="İstanbul"
                maxLength={80}
              />
            </label>

            <label className="profile-bio-field">
              <span>
                <Sparkles
                  size={15}
                />

                Hakkında
              </span>

              <textarea
                name="bio"
                rows={6}
                defaultValue={
                  profile?.bio || ""
                }
                placeholder="Kendinden, markandan veya proje odağından bahset."
                maxLength={1000}
              />
            </label>
          </div>

          <button
            className="button"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2
                  className="spin"
                  size={17}
                />

                Kaydediliyor
              </>
            ) : (
              <>
                <Save
                  size={17}
                />

                Değişiklikleri kaydet
              </>
            )}
          </button>
        </form>

        <aside className="profile-sidebar">
          <section className="profile-card profile-sites-card">
            <div className="profile-card-head">
              <LayoutDashboard />
              <div>
                <h2>Sitelerim</h2>
                <p>Web sitelerini yönet ve düzenle.</p>
              </div>
            </div>
            <p className="profile-sites-copy">Dromocob Sites ile oluşturduğun tüm projelere tek yerden ulaş.</p>
            <Link href="/sitelerim" className="button button-full">
              Sitelerimi aç
              <ChevronRight size={17} />
            </Link>
          </section>

          <section className="profile-card">
            <div className="profile-card-head">
              <Fingerprint />

              <div>
                <h2>
                  Hesap kimliği
                </h2>

                <p>
                  Hesap ve erişim durumu.
                </p>
              </div>
            </div>

            <div className="account-status-list">
              <div>
                <span>
                  E-posta
                </span>

                <strong>
                  {user.emailVerified
                    ? "DOĞRULANDI"
                    : "BEKLİYOR"}
                </strong>
              </div>

              <div>
                <span>
                  Hesap durumu
                </span>

                <strong>
                  {profile?.status ||
                    "ACTIVE"}
                </strong>
              </div>

              <div>
                <span>
                  Yetki seviyesi
                </span>

                <strong>
                  {adminLoading
                    ? "KONTROL"
                    : isAdmin
                      ? adminRole ||
                        "ADMIN"
                      : "USER"}
                </strong>
              </div>

              <div>
                <span>
                  Kullanıcı UID
                </span>

                <code title={user.uid}>
                  {user.uid.slice(
                    0,
                    14
                  )}
                  …
                </code>
              </div>
            </div>

            <button
              className="profile-action"
              type="button"
              onClick={handleRefreshPermissions}
            >
              <RefreshCw
                size={17}
              />

              Yetkileri yeniden kontrol et
            </button>
          </section>

          {isAdmin && (
            <section className="profile-card profile-admin-card">
              <div className="profile-card-head">
                <ShieldCheck />

                <div>
                  <h2>
                    Admin erişimi
                  </h2>

                  <p>
                    Ayrıcalıklı operasyon
                    yetkileri.
                  </p>
                </div>
              </div>

              <div className="admin-access-status">
                <span>
                  <Activity
                    size={17}
                  />
                </span>

                <div>
                  <strong>
                    CONTROL OS ONLINE
                  </strong>

                  <small>
                    {adminRole ||
                      "super_admin"}
                  </small>
                </div>
              </div>

              <Link
                href="/admin"
                className="button button-full"
              >
                <ShieldCheck
                  size={17}
                />

                Yönetim merkezini aç
              </Link>
            </section>
          )}

          <section className="profile-card">
            <div className="profile-card-head">
              <LockKeyhole />

              <div>
                <h2>
                  Güvenlik
                </h2>

                <p>
                  Şifre ve oturum yönetimi.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="profile-action"
              onClick={handlePasswordReset}
              disabled={securityBusy}
            >
              {securityBusy ? (
                <Loader2
                  size={17}
                  className="spin"
                />
              ) : (
                <KeyRound
                  size={17}
                />
              )}

              Şifre yenileme kodu gönder
            </button>

            {passwordResetStep === "code" && (
              <div className="profile-reset-panel">
                <label className="auth-code-field compact-code">
                  <KeyRound
                    size={18}
                  />

                  <input
                    value={passwordCode}
                    onChange={(event) =>
                      setPasswordCode(
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
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    minLength={8}
                    placeholder="Büyük harf ve rakam içermeli"
                  />
                </label>

                <label>
                  Yeni şifre tekrar
                  <input
                    type="password"
                    value={newPasswordAgain}
                    onChange={(event) =>
                      setNewPasswordAgain(
                        event.target.value
                      )
                    }
                    minLength={8}
                  />
                </label>

                <div className="profile-reset-actions">
                  <button
                    type="button"
                    className="verify-secondary"
                    onClick={handlePasswordReset}
                    disabled={securityBusy}
                  >
                    Kodu tekrar gönder
                  </button>

                  <button
                    type="button"
                    className="profile-action"
                    onClick={confirmPasswordReset}
                    disabled={
                      securityBusy ||
                      passwordCode.length !== 6 ||
                      !newPassword ||
                      !newPasswordAgain
                    }
                  >
                    {securityBusy ? (
                      <Loader2
                        size={17}
                        className="spin"
                      />
                    ) : (
                      <ShieldCheck
                        size={17}
                      />
                    )}

                    Şifreyi yenile
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              className="profile-action danger-action"
              onClick={handleSignOut}
            >
              <LogOut
                size={17}
              />

              Hesaptan çıkış yap
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
