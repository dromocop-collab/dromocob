import { adminAuth, adminDb } from "@/lib/firebase-admin";

const FALLBACK_ADMIN_EMAILS = [
  "cihatwin@gmail.com",
];

type AdminTokenPayload = {
  uid: string;
  email?: string;
};

function getEmergencyEmails(): string[] {
  return [
    ...(
      process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
    )
      .split(",")
      .map(x => x.trim().toLowerCase())
      .filter(Boolean),
    ...FALLBACK_ADMIN_EMAILS,
  ];
}

function isEmergencyAdminEmail(email: string | undefined): boolean {
  return getEmergencyEmails().includes(
    (email || "").toLowerCase()
  );
}

function decodeDevelopmentToken(token: string): AdminTokenPayload {
  if (process.env.NODE_ENV === "production") {
    throw new Error("UNAUTHORIZED");
  }

  const [, payload] = token.split(".");

  if (!payload) {
    throw new Error("UNAUTHORIZED");
  }

  const decoded = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8")
  ) as {
    user_id?: string;
    sub?: string;
    email?: string;
  };

  const uid = decoded.user_id || decoded.sub;

  if (!uid) {
    throw new Error("UNAUTHORIZED");
  }

  if (!isEmergencyAdminEmail(decoded.email)) {
    throw new Error("FORBIDDEN");
  }

  return {
    uid,
    email: decoded.email,
  };
}

function isCredentialError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return (
    message.includes("Could not load the default credentials") ||
    message.includes("Unable to detect a Project Id") ||
    message.includes("permission") ||
    message.includes("PERMISSION_DENIED")
  );
}

export async function requireAdminToken(authorization: string | null) {
  const bearer = authorization || "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7) : "";
  if (!token) throw new Error("UNAUTHORIZED");

  let decoded: AdminTokenPayload;

  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch (error) {
    if (!isCredentialError(error)) {
      throw error;
    }

    decoded = decodeDevelopmentToken(token);
  }

  let isFirestoreAdmin = false;

  try {
    const adminDoc =
      await adminDb
        .collection("admin_users")
        .doc(decoded.uid)
        .get();

    isFirestoreAdmin =
      adminDoc.data()?.active === true;
  } catch (error) {
    if (!isCredentialError(error)) {
      throw error;
    }
  }

  const authorized =
    isFirestoreAdmin ||
    isEmergencyAdminEmail(decoded.email);

  if (!authorized) throw new Error("FORBIDDEN");
  return decoded;
}
