import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function requireAdminToken(authorization: string | null) {
  const bearer = authorization || "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7) : "";
  if (!token) throw new Error("UNAUTHORIZED");

  const decoded = await adminAuth.verifyIdToken(token);
  const adminDoc = await adminDb.collection("admin_users").doc(decoded.uid).get();
  const emergencyEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);

  const authorized =
    adminDoc.data()?.active === true ||
    emergencyEmails.includes((decoded.email || "").toLowerCase());

  if (!authorized) throw new Error("FORBIDDEN");
  return decoded;
}
