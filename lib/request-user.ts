import { adminAuth, adminDb } from "@/lib/firebase-admin";

const FALLBACK_ADMIN_EMAILS = ["cihatwin@gmail.com"];

export type RequestUser = { uid: string; email: string; isAdmin: boolean; role: string | null };

export async function getRequestUser(authorization: string | null): Promise<RequestUser | null> {
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.uid) return null;
    const email = String(decoded.email || "").trim().toLowerCase();
    const envAdmins = String(process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(item => item.trim().toLowerCase()).filter(Boolean);
    const adminSnapshot = await adminDb.collection("admin_users").doc(decoded.uid).get();
    const adminData = adminSnapshot.data();
    const firestoreAdmin = adminSnapshot.exists && adminData?.active === true;
    const emergencyAdmin = [...FALLBACK_ADMIN_EMAILS, ...envAdmins].includes(email);
    return { uid: decoded.uid, email, isAdmin: firestoreAdmin || emergencyAdmin, role: firestoreAdmin ? String(adminData?.role || "admin") : emergencyAdmin ? "super_admin" : null };
  } catch {
    return null;
  }
}
