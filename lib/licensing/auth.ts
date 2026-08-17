import { adminAuth } from "@/lib/firebase-admin";

export async function requireUser(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new Error("UNAUTHORIZED");
  return adminAuth.verifyIdToken(token, true);
}

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
        new Date()
          .toISOString(),
    }
  );

  const status =
    code === "UNAUTHORIZED"
      ? 401

      : code === "FORBIDDEN"
        ? 403

        : [
            "INVALID_REQUEST",
            "INVALID_LICENSE",
            "PRODUCT_NOT_INCLUDED",
            "DEVICE_LIMIT_REACHED",
            "LICENSE_INACTIVE",
            "LICENSE_EXPIRED",
          ].includes(code)
          ? 400

          : 500;

  const safe =
    status === 500
      ? "LICENSE_SERVICE_UNAVAILABLE"
      : code;

  return Response.json(
    {
      ok: false,
      error: safe,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}