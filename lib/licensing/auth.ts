import { adminAuth } from "@/lib/firebase-admin";

export async function requireUser(request: Request) {
  const authorization =
    request.headers.get("authorization") ?? "";

  const token =
    authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    return await adminAuth.verifyIdToken(
      token,
      true
    );
  } catch (error) {
    console.error(
      "[LICENSE AUTH ERROR]",
      error
    );

    throw new Error("UNAUTHORIZED");
  }
}

const CLIENT_ERROR_CODES = new Set([
  "INVALID_REQUEST",
  "INVALID_LICENSE",
  "PRODUCT_NOT_INCLUDED",
  "DEVICE_LIMIT_REACHED",
  "LICENSE_INACTIVE",
  "LICENSE_EXPIRED",
]);

export function licensingError(
  error: unknown
) {
  const code =
    error instanceof Error
      ? error.message
      : "UNKNOWN";

  console.error(
    "[LICENSE CLOUD ERROR]",
    {
      code,
      error,
      timestamp:
        new Date().toISOString(),
    }
  );

  let status = 500;

  if (code === "UNAUTHORIZED") {
    status = 401;
  } else if (code === "FORBIDDEN") {
    status = 403;
  } else if (
    CLIENT_ERROR_CODES.has(code)
  ) {
    status = 400;
  }

  /*
   * DEBUG:
   *
   * Geçici olarak gerçek backend hata
   * kodunu döndürüyoruz.
   *
   * Böylece Xcode Console'da:
   *
   * LICENSE_SIGNING_KEY_NOT_CONFIGURED
   *
   * veya gerçek Node/Firebase hatasını
   * görebileceğiz.
   *
   * Stack trace istemciye gönderilmiyor.
   */

  return Response.json(
    {
      ok: false,
      error: code,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}