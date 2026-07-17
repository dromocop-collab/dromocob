"use client";

import {
  type User,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth, db } from "@/lib/firebase";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  company?: string;
  city?: string;
  bio?: string;
  verified?: boolean;
  status?: "active" | "suspended";
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  adminRole: string | null;
  loading: boolean;
  adminLoading: boolean;
  refreshAdmin: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isAdmin: false,
  adminRole: null,
  loading: true,
  adminLoading: true,
  refreshAdmin: async () => undefined,
});

const FALLBACK_ADMIN_EMAILS = [
  "cihatwin@gmail.com",
];

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    if (!currentUser || currentUser.isAnonymous) {
      setIsAdmin(false);
      setAdminRole(null);
      setAdminLoading(false);
      return;
    }

    setAdminLoading(true);

    try {
      const adminRef = doc(
        db,
        "admin_users",
        currentUser.uid
      );

      const adminSnap = await getDoc(adminRef);

      const envAdmins = (
        process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
      )
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      const email = (
        currentUser.email || ""
      ).toLowerCase();

      const isFirestoreAdmin =
        adminSnap.exists() &&
        adminSnap.data()?.active === true;

      const isEnvAdmin = envAdmins.includes(email);

      const isFallbackAdmin =
        FALLBACK_ADMIN_EMAILS.includes(email);

      const finalAdmin =
        isFirestoreAdmin ||
        isEnvAdmin ||
        isFallbackAdmin;

      setIsAdmin(finalAdmin);

      if (isFirestoreAdmin) {
        setAdminRole(
          String(
            adminSnap.data()?.role ||
            "admin"
          )
        );
      } else if (finalAdmin) {
        setAdminRole("super_admin");
      } else {
        setAdminRole(null);
      }
    } catch (error) {
      console.error(
        "[DROMOCOB AUTH] Admin kontrol hatası:",
        error
      );

      const email = (
        currentUser.email || ""
      ).toLowerCase();

      const emergencyAdmin =
        FALLBACK_ADMIN_EMAILS.includes(email);

      setIsAdmin(emergencyAdmin);
      setAdminRole(
        emergencyAdmin
          ? "super_admin"
          : null
      );
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const refreshAdmin = useCallback(async () => {
    await checkAdmin(auth.currentUser);
  }, [checkAdmin]);

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | undefined;

    let unsubscribeAdmin:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          unsubscribeProfile?.();
          unsubscribeAdmin?.();

          if (currentUser?.isAnonymous) {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            setAdminRole(null);
            setLoading(false);
            setAdminLoading(false);
            return;
          }

          setUser(currentUser);
          setProfile(null);

          if (!currentUser) {
            setIsAdmin(false);
            setAdminRole(null);
            setLoading(false);
            setAdminLoading(false);
            return;
          }

          setLoading(true);

          const profileRef = doc(
            db,
            "users",
            currentUser.uid
          );

          unsubscribeProfile = onSnapshot(
            profileRef,
            (snapshot) => {
              if (snapshot.exists()) {
                setProfile({
                  uid: currentUser.uid,
                  ...snapshot.data(),
                } as UserProfile);
              } else {
                setProfile(null);
              }

              setLoading(false);
            },
            (error) => {
              console.error(
                "[DROMOCOB AUTH] Profil okuma hatası:",
                error
              );

              setLoading(false);
            }
          );

          await checkAdmin(currentUser);

          const adminRef = doc(
            db,
            "admin_users",
            currentUser.uid
          );

          unsubscribeAdmin = onSnapshot(
            adminRef,
            (snapshot) => {
              const email = (
                currentUser.email || ""
              ).toLowerCase();

              const envAdmins = (
                process.env
                  .NEXT_PUBLIC_ADMIN_EMAILS || ""
              )
                .split(",")
                .map((item) =>
                  item.trim().toLowerCase()
                )
                .filter(Boolean);

              const firestoreAdmin =
                snapshot.exists() &&
                snapshot.data()?.active === true;

              const emergencyAdmin =
                envAdmins.includes(email) ||
                FALLBACK_ADMIN_EMAILS.includes(
                  email
                );

              const finalAdmin =
                firestoreAdmin ||
                emergencyAdmin;

              setIsAdmin(finalAdmin);

              setAdminRole(
                firestoreAdmin
                  ? String(
                      snapshot.data()?.role ||
                      "admin"
                    )
                  : finalAdmin
                    ? "super_admin"
                    : null
              );

              setAdminLoading(false);
            },
            (error) => {
              console.error(
                "[DROMOCOB AUTH] Admin listener hatası:",
                error
              );

              const email = (
                currentUser.email || ""
              ).toLowerCase();

              const emergencyAdmin =
                FALLBACK_ADMIN_EMAILS.includes(
                  email
                );

              setIsAdmin(emergencyAdmin);

              setAdminRole(
                emergencyAdmin
                  ? "super_admin"
                  : null
              );

              setAdminLoading(false);
            }
          );
        }
      );

    return () => {
      unsubscribeAuth();
      unsubscribeProfile?.();
      unsubscribeAdmin?.();
    };
  }, [checkAdmin]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      adminRole,
      loading,
      adminLoading,
      refreshAdmin,
    }),
    [
      user,
      profile,
      isAdmin,
      adminRole,
      loading,
      adminLoading,
      refreshAdmin,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
