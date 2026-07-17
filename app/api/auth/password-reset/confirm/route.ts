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
  isStrongPassword,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth-code-mail";
import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);
    const code =
      typeof body?.code === "string"
        ? body.code.trim()
        : "";
    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (!isValidEmail(email)) {
      return jsonError("Geçerli bir e-posta gir.", 400);
    }

    if (!/^\d{6}$/.test(code)) {
      return jsonError("6 haneli sıfırlama kodunu gir.", 400);
    }

    if (!isStrongPassword(password)) {
      return jsonError(
        "Yeni şifre en az 8 karakter, 1 büyük harf ve 1 rakam içermeli.",
        400
      );
    }

    let user;

    try {
      user = await adminAuth.getUserByEmail(email);
    } catch {
      return jsonError("Kod veya e-posta hatalı.", 400);
    }

    const codeRef = adminDb
      .collection("auth_password_reset_codes")
      .doc(user.uid);
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

      return jsonError("Kod veya e-posta hatalı.", 400);
    }

    await adminAuth.updateUser(user.uid, {
      password,
    });
    await adminAuth.revokeRefreshTokens(user.uid);

    await adminDb
      .collection("users")
      .doc(user.uid)
      .set(
        {
          updatedAt: FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

    await codeRef.delete();

    return NextResponse.json({
      ok: true,
      message: "Parolan başarıyla yenilendi. Yeni şifrenle giriş yapabilirsin.",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Password reset confirm failed", error);
    }

    return jsonError(
      "Parola sıfırlama tamamlanamadı.",
      500
    );
  }
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
