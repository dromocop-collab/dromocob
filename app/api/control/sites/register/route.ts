import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminToken } from "@/lib/admin-guard";

const HEALTH_TIMEOUT_MS = 8000;

class RegistrationError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly logDetail?: unknown
  ) {
    super(message);
  }
}

function fail(message: string, status = 400, logDetail?: unknown): never {
  throw new RegistrationError(message, status, logDetail);
}

function isPermissionDenied(error: unknown) {
  const candidate = error as { code?: unknown; details?: unknown; message?: unknown };
  const details = String(candidate?.details || candidate?.message || "");

  return candidate?.code === 7 || details.includes("PERMISSION_DENIED");
}

function requiredString(body: Record<string, unknown>, key: string) {
  const value = String(body[key] || "").trim();
  if (!value) fail(`${key} is required`);
  return value;
}

function normalizeEndpoint(value: string, fieldName: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    fail(`${fieldName} must be a valid URL`);
  }

  if (!["https:", "http:"].includes(url.protocol)) {
    fail(`${fieldName} must use http or https`);
  }

  return url.toString();
}

function normalizeDomain(value: string) {
  const candidate = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .replace(/\.$/, "");

  if (!candidate) fail("domain is required");
  if (candidate.length > 253) fail("domain is too long");
  if (!/^[a-z0-9.-]+$/.test(candidate)) {
    fail("domain may only contain letters, numbers, dots and hyphens");
  }
  if (candidate.includes("..")) fail("domain is invalid");

  return candidate;
}

function siteIdFromDomain(domain: string) {
  const slug =
    domain
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "site";
  const hash = createHash("sha256").update(domain).digest("hex").slice(0, 10);

  return `${slug}-${hash}`;
}

async function readJsonBody(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      fail("Request body must be a JSON object");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof RegistrationError) throw error;
    fail("Request body must be valid JSON");
  }
}

function getEndpoint(body: Record<string, unknown>, preferred: string, legacy: string) {
  return String(body[preferred] || body[legacy] || "").trim();
}

async function verifyHealthEndpoint(healthEndpoint: string) {
  let response: Response;

  try {
    response = await fetch(healthEndpoint, {
      headers: { "user-agent": "Dromocob-Site-Register/2.0" },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    fail("Health endpoint could not be reached", 502, error);
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!response.ok) {
    if (response.status === 404) {
      console.warn(
        "Health endpoint returned 404. This is not a Dromocob register route error; the remote project's /api/health endpoint is missing or not deployed.",
        { healthEndpoint }
      );
    }

    fail(
      `Health endpoint returned HTTP ${response.status}`,
      502,
      text.slice(0, 500)
    );
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    console.warn(
      "Health endpoint did not return JSON. This is not a Dromocob register route error; the remote project's /api/health endpoint may be missing and returning HTML.",
      { healthEndpoint, contentType }
    );

    fail("Health endpoint must return JSON", 502, text.slice(0, 500));
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    console.warn(
      "Health endpoint response could not be parsed as JSON. This is not a Dromocob register route error; check the remote project's /api/health implementation.",
      { healthEndpoint }
    );

    fail("Health endpoint returned invalid JSON", 502, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminToken(req.headers.get("authorization"));
    const body = await readJsonBody(req);

    const name = requiredString(body, "name");
    const domain = normalizeDomain(requiredString(body, "domain"));
    const controlEndpoint = normalizeEndpoint(
      getEndpoint(body, "controlEndpoint", "controlUrl"),
      "controlEndpoint"
    );
    const healthEndpoint = normalizeEndpoint(
      getEndpoint(body, "healthEndpoint", "healthUrl"),
      "healthEndpoint"
    );
    const secret = String(body.secret || body.controlSecret || "").trim();

    if (secret.length < 40) {
      fail("secret must be at least 40 characters");
    }

    const healthPayload = await verifyHealthEndpoint(healthEndpoint);
    const siteId = siteIdFromDomain(domain);
    const siteRef = adminDb.collection("managed_sites").doc(siteId);
    const now = new Date();

    await adminDb.runTransaction(async tx => {
      tx.set(siteRef, {
        name,
        domain,
        controlEndpoint,
        healthEndpoint,
        controlUrl: controlEndpoint,
        healthUrl: healthEndpoint,
        status: "active",
        lastHealth: "online",
        lastHealthPayload: healthPayload,
        lastCheckedAt: now,
        createdAt: now,
        updatedAt: now
      }, { merge: false });
      tx.set(adminDb.collection("managed_site_secrets").doc(siteId), {
        secret,
        controlSecret: secret,
        createdAt: now,
        updatedAt: now
      }, { merge: false });
      tx.set(adminDb.collection("site_events").doc(), {
        siteId,
        type: "site_registered",
        actorUid: actor.uid,
        createdAt: now
      });
    });

    return NextResponse.json({
      ok: true,
      siteId,
      message: "Site registered successfully"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
    if (error instanceof RegistrationError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Site registration validation failed", {
          message: error.message,
          detail: error.logDetail,
        });
      }

      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status }
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.error("Site registration failed", error);
    }

    if (isPermissionDenied(error)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Firebase Admin credentials are missing Firestore write permission. Configure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY for the Dromocob project."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          "Server could not complete site registration. Check Firebase Admin credentials and server logs.",
      },
      { status: 500 }
    );
  }
}
