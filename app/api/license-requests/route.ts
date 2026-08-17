import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const allowedProducts = new Set([
  "dromocob-all-apps",
  "pixel-resizer-pro",
  "ai-upscaler",
  "background-remover",
  "watermark-studio",
  "image-compressor",
  "video-converter",
]);

const allowedPlans = new Set(["trial", "pro", "business", "lifetime"]);

function text(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function normalizeEmail(value: unknown) {
  return text(value, 180).toLowerCase();
}

function hash(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function requestFingerprint(request: Request, email: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const realIp = request.headers.get("x-real-ip") || "";
  const userAgent = request.headers.get("user-agent") || "";
  return hash(`${forwarded}|${realIp}|${userAgent}|${email}`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot: botlar görünmeyen alanı doldurursa sessizce başarılı dön.
    if (text(body.website, 200)) {
      return Response.json({ ok: true }, { status: 200 });
    }

    const fullName = text(body.fullName, 120);
    const email = normalizeEmail(body.email);
    const phone = text(body.phone, 40);
    const company = text(body.company, 140);
    const deviceCount = text(body.deviceCount, 20);
    const message = text(body.message, 1200);
    const productId = text(body.productId, 80);
    const plan = text(body.plan, 30);
    const source = text(body.source, 80) || "website";
    const consent = body.consent === true;

    if (
      fullName.length < 2 ||
      !email.includes("@") ||
      !allowedProducts.has(productId) ||
      !allowedPlans.has(plan) ||
      !consent
    ) {
      return Response.json({ ok: false, error: "Form bilgilerini kontrol edin." }, { status: 400 });
    }

    const fingerprint = requestFingerprint(request, email);
    const limiterRef = adminDb.collection("license_request_rate_limits").doc(fingerprint);
    const requestRef = adminDb.collection("license_requests").doc();

    await adminDb.runTransaction(async (tx) => {
      const limiter = await tx.get(limiterRef);
      const lastSubmittedAt = limiter.data()?.lastSubmittedAt as Timestamp | undefined;

      if (lastSubmittedAt) {
        const elapsedMs = Date.now() - lastSubmittedAt.toMillis();
        if (elapsedMs < 60_000) {
          throw new Error("RATE_LIMIT");
        }
      }

      tx.set(
        limiterRef,
        {
          lastSubmittedAt: Timestamp.now(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      tx.set(requestRef, {
        fullName,
        email,
        emailNormalized: email,
        phone,
        company,
        deviceCount,
        message,
        productId,
        plan,
        source,
        consent: true,
        status: "new",
        adminNotes: "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return Response.json(
      { ok: true, id: requestRef.id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT") {
      return Response.json(
        { ok: false, error: "Talebiniz az önce gönderildi. Lütfen kısa bir süre sonra tekrar deneyin." },
        { status: 429 },
      );
    }

    console.error("[LICENSE REQUEST CREATE ERROR]", error);
    return Response.json(
      { ok: false, error: "Lisans talebi şu anda gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
