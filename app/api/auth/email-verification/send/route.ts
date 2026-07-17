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
  secondsUntilResend,
  verificationEmailTemplate,
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

    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();

    if (!email) {
      return jsonError("Hesap e-postası bulunamadı.", 400);
    }

    if (decoded.email_verified) {
      return NextResponse.json({
        ok: true,
        message: "Hesap zaten doğrulanmış.",
      });
    }

    const codeRef = adminDb
      .collection("auth_email_codes")
      .doc(decoded.uid);
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
      ...verificationEmailTemplate(code),
    });

    return NextResponse.json({
      ok: true,
      message: "Doğrulama kodu e-postana gönderildi.",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Email verification code send failed", error);
    }

    return jsonError(
      "Doğrulama kodu gönderilemedi.",
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
