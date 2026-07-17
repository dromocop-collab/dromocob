import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  createCodeSecret,
  generateAuthCode,
  getExpiresAt,
  enqueueMail,
  isValidEmail,
  normalizeEmail,
  passwordResetEmailTemplate,
  secondsUntilResend,
} from "@/lib/auth-code-mail";
import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

const GENERIC_MESSAGE =
  "Eğer bu e-posta kayıtlıysa 6 haneli parola kodu gönderildi.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);

    if (!isValidEmail(email)) {
      return jsonError("Geçerli bir e-posta gir.", 400);
    }

    let user;

    try {
      user = await adminAuth.getUserByEmail(email);
    } catch {
      return NextResponse.json({
        ok: true,
        message: GENERIC_MESSAGE,
      });
    }

    const codeRef = adminDb
      .collection("auth_password_reset_codes")
      .doc(user.uid);
    const currentCode = await codeRef.get();
    const waitSeconds = secondsUntilResend(
      currentCode.data()?.sentAt
    );

    if (waitSeconds > 0) {
      return jsonError(
        `Yeni kod için ${waitSeconds} saniye bekle.`,
        429
      );
    }

    const code = generateAuthCode();
    const {
      codeHash,
      salt,
    } = createCodeSecret(code);

    await codeRef.set({
      codeHash,
      salt,
      email,
      attempts: 0,
      sentAt: FieldValue.serverTimestamp(),
      expiresAt: getExpiresAt(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await enqueueMail({
      to: email,
      ...passwordResetEmailTemplate(code),
    });

    return NextResponse.json({
      ok: true,
      message: GENERIC_MESSAGE,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Password reset code send failed", error);
    }

    return jsonError(
      "Parola sıfırlama kodu gönderilemedi.",
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
