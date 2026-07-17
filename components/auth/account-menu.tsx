"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { auth } from "@/lib/firebase";
import { useAuth } from "./auth-provider";

export default function AccountMenu() {
  const {
    user,
    profile,
    isAdmin,
    loading,
  } = useAuth();

  const [openForUid, setOpenForUid] = useState<
    string | null
  >(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isGuest = !user || user.isAnonymous;
  const open = Boolean(user && openForUid === user.uid);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenForUid(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenForUid(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );
    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  if (loading) {
    return (
      <span
        className="account-skeleton"
        aria-label="Hesap yükleniyor"
      />
    );
  }

  /*
   * Live Chat için açılan anonim Firebase kullanıcısı,
   * normal üye olarak gösterilmemeli.
   */
  if (isGuest) {
    return (
      <div className="guest-actions">
        <Link href="/giris">
          Giriş yap
        </Link>

        <Link
          href="/kayit"
          className="button button-small"
        >
          Kayıt ol
        </Link>
      </div>
    );
  }

  const name =
    profile?.displayName?.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "Hesabım";

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toLocaleUpperCase("tr-TR") || "H";

  async function handleSignOut(): Promise<void> {
    try {
      setOpenForUid(null);
      await signOut(auth);
    } catch (error) {
      console.warn(
        "[DROMOCOB ACCOUNT] Çıkış yapılamadı:",
        error
      );
    }
  }

  return (
    <div
      ref={menuRef}
      className="account-menu"
    >
      {isAdmin && (
        <Link
          href="/admin"
          className="admin-nav-button"
        >
          <ShieldCheck
            size={15}
            aria-hidden="true"
          />
          ADMIN PANEL
        </Link>
      )}

      <button
        type="button"
        className="account-trigger"
        onClick={() =>
          setOpenForUid((current) =>
            current === user.uid ? null : user.uid
          )
        }
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-dropdown"
      >
        <span aria-hidden="true">
          {initials}
        </span>

        <b>{name}</b>

        <ChevronDown
          size={14}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id="account-dropdown"
          className="account-dropdown"
          role="menu"
        >
          <div className="account-dropdown-header">
            <strong>{name}</strong>

            {user.email && (
              <small>{user.email}</small>
            )}

            <em
              className={
                user.emailVerified
                  ? "verified-badge"
                  : "pending-badge"
              }
            >
              {user.emailVerified
                ? "✓ Hesap doğrulandı"
                : "• Doğrulama bekliyor"}
            </em>
          </div>

          <Link
            href="/profilim"
            role="menuitem"
            onClick={() => setOpenForUid(null)}
          >
            <UserRound
              size={16}
              aria-hidden="true"
            />
            Profilim
          </Link>

          {!user.emailVerified && (
            <Link
              href="/hesap-dogrulama"
              role="menuitem"
              onClick={() => setOpenForUid(null)}
            >
              <ShieldCheck
                size={16}
                aria-hidden="true"
              />
              Hesabı doğrula
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpenForUid(null)}
            >
              <ShieldCheck
                size={16}
                aria-hidden="true"
              />
              Yönetim merkezi
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
          >
            <LogOut
              size={16}
              aria-hidden="true"
            />
            Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}
