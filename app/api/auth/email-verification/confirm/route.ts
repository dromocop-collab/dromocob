import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  AUTH_CODE_MAX_ATTEMPTS,
  hashCode,
  isExpired,
} from "@/lib/auth-code-mail";
import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return jsonError("Oturum bulunamadı.", 401);
    }

    const body = await request.json().catch(() => null);
    const code =
      typeof body?.code === "string"
        ? body.code.trim()
        : "";

    if (!/^\d{6}$/.test(code)) {
      return jsonError("6 haneli doğrulama kodunu gir.", 400);
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();

    if (!email) {
      return jsonError("Hesap e-postası bulunamadı.", 400);
    }

    const codeRef = adminDb
      .collection("auth_email_codes")
      .doc(decoded.uid);
    const codeDoc = await codeRef.get();
    const data = codeDoc.data();

    if (!data || data.email !== email || isExpired(data.expiresAt)) {
      return jsonError("Kod süresi doldu. Yeni kod iste.", 400);
    }

    if ((data.attempts || 0) >= AUTH_CODE_MAX_ATTEMPTS) {
      return jsonError("Çok fazla hatalı deneme. Yeni kod iste.", 429);
    }

    const expectedHash =
      typeof data.codeHash === "string"
        ? data.codeHash
        : "";
    const salt =
      typeof data.salt === "string"
        ? data.salt
        : "";

    if (hashCode(code, salt) !== expectedHash) {
      await codeRef.update({
        attempts: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return jsonError("Doğrulama kodu hatalı.", 400);
    }

    await adminAuth.updateUser(decoded.uid, {
      emailVerified: true,
    });

    await adminDb
      .collection("users")
      .doc(decoded.uid)
      .set(
        {
          verified: true,
          emailVerifiedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

    await codeRef.delete();

    return NextResponse.json({
      ok: true,
      message: "Hesap başarıyla doğrulandı.",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Email verification confirm failed", error);
    }

    return jsonError(
      "Hesap doğrulama tamamlanamadı.",
      500
    );
  }
}

function getBearerToken(request: NextRequest): string {
  const header = request.headers.get("authorization") || "";

  return header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : "";
}

function jsonError(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      ok: false,
      message,
    },
    {
      status,
    }
  );
}
