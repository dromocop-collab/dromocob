import {
  createHash,
  randomBytes,
  randomInt,
} from "crypto";

import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import {
  adminDb,
} from "@/lib/firebase-admin";

export const AUTH_CODE_TTL_MS = 10 * 60 * 1000;
export const AUTH_CODE_RESEND_MS = 60 * 1000;
export const AUTH_CODE_MAX_ATTEMPTS = 5;

export function normalizeEmail(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-ZÇĞİÖŞÜ]/.test(password) &&
    /\d/.test(password)
  );
}

export function generateAuthCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function createCodeSecret(code: string) {
  const salt = randomBytes(16).toString("hex");

  return {
    codeHash: hashCode(code, salt),
    salt,
  };
}

export function hashCode(
  code: string,
  salt: string
): string {
  return createHash("sha256")
    .update(`${salt}.${code}`)
    .digest("hex");
}

export function getExpiresAt(): Timestamp {
  return Timestamp.fromMillis(Date.now() + AUTH_CODE_TTL_MS);
}

export function isExpired(value: unknown): boolean {
  if (!(value instanceof Timestamp)) {
    return true;
  }

  return value.toMillis() < Date.now();
}

export function secondsUntilResend(value: unknown): number {
  if (!(value instanceof Timestamp)) {
    return 0;
  }

  const waitMs =
    AUTH_CODE_RESEND_MS - (Date.now() - value.toMillis());

  return waitMs > 0
    ? Math.ceil(waitMs / 1000)
    : 0;
}

export function verificationEmailTemplate(code: string) {
  return {
    subject: "Dromocob hesap doğrulama kodun",
    text:
      `Dromocob hesap doğrulama kodun: ${code}\n\n` +
      "Bu kod 10 dakika geçerlidir. Bu işlemi sen başlatmadıysan bu e-postayı yok sayabilirsin.",
    html: authCodeHtml({
      code,
      eyebrow: "Hesap doğrulama",
      title: "Dromocob hesabını doğrula",
      body: "Hesabını aktif hale getirmek için bu 6 haneli kodu doğrulama ekranına gir.",
    }),
  };
}

export function passwordResetEmailTemplate(code: string) {
  return {
    subject: "Dromocob parola sıfırlama kodun",
    text:
      `Dromocob parola sıfırlama kodun: ${code}\n\n` +
      "Bu kod 10 dakika geçerlidir. Bu işlemi sen başlatmadıysan parolan değişmez.",
    html: authCodeHtml({
      code,
      eyebrow: "Güvenli parola sıfırlama",
      title: "Parolanı yenile",
      body: "Yeni parola belirlemek için bu 6 haneli kodu parola sıfırlama ekranına gir.",
    }),
  };
}

export async function enqueueMail({
  html,
  subject,
  text,
  to,
}: {
  html: string;
  subject: string;
  text: string;
  to: string;
}) {
  const collectionName =
    process.env.TRIGGER_EMAIL_COLLECTION || "mail";

  await adminDb.collection(collectionName).add({
    to: [to],
    message: {
      subject,
      text,
      html,
    },
    createdAt: FieldValue.serverTimestamp(),
  });
}

function authCodeHtml({
  body,
  code,
  eyebrow,
  title,
}: {
  body: string;
  code: string;
  eyebrow: string;
  title: string;
}) {
  return `<!doctype html>
<html lang="tr">
  <body style="margin:0;background:#f4f6ef;font-family:Arial,Helvetica,sans-serif;color:#10110f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f4f6ef;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dfe6d6;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:34px 34px 18px;">
                <p style="margin:0 0 10px;color:#66705f;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">${eyebrow}</p>
                <h1 style="margin:0;font-size:32px;line-height:1.05;letter-spacing:-.04em;">${title}</h1>
                <p style="margin:16px 0 0;color:#596254;font-size:15px;line-height:1.65;">${body}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:14px 34px 26px;">
                <div style="display:inline-block;padding:18px 24px;border-radius:18px;background:#10110f;color:#d9ff43;font-size:36px;font-weight:900;letter-spacing:.24em;">${code}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 34px 32px;border-top:1px solid #edf1e6;color:#788272;font-size:12px;line-height:1.6;">
                Kod 10 dakika geçerlidir ve güvenliğin için kimseyle paylaşılmamalıdır.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
