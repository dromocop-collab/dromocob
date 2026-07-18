import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createHash } from "node:crypto";

import { adminDb } from "@/lib/firebase-admin";

type LeadPayload = {
  type?: "contact" | "quote" | "newsletter";
  website?: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  answers?: Record<string, unknown>;
  estimatedPrice?: number;
  notes?: string[];
};

const RATE_LIMIT_WINDOW_MS =
  15 * 60 * 1000;

const RATE_LIMIT_MAX_REQUESTS = 5;

const requestStore = new Map<
  string,
  number[]
>();

function getClientKey(
  req: NextRequest,
  type: string
) {
  const forwardedFor =
    req.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() || "unknown_ip";

  const userAgent =
    req.headers
      .get("user-agent")
      ?.slice(0, 80) || "unknown_ua";

  return `${type}:${forwardedFor}:${userAgent}`;
}

function isRateLimited(
  key: string,
  now: number
) {
  const windowStart =
    now - RATE_LIMIT_WINDOW_MS;

  const recent = (
    requestStore.get(key) || []
  ).filter((timestamp) => timestamp > windowStart);

  if (
    recent.length >=
    RATE_LIMIT_MAX_REQUESTS
  ) {
    requestStore.set(key, recent);
    return true;
  }

  recent.push(now);
  requestStore.set(key, recent);
  return false;
}

function normalizeText(
  value: unknown,
  max = 2000
) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

function isValidEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      (await req.json()) as LeadPayload;

    const type =
      body.type || "contact";

    if (
      ![
        "contact",
        "quote",
        "newsletter",
      ].includes(type)
    ) {
      return new NextResponse(
        "Invalid lead type",
        { status: 400 }
      );
    }

    if (normalizeText(body.website)) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const now = Date.now();
    const key = getClientKey(req, type);

    if (isRateLimited(key, now)) {
      return new NextResponse(
        "Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.",
        { status: 429 }
      );
    }

    if (type === "contact") {
      const name = normalizeText(
        body.name,
        120
      );

      const email = normalizeText(
        body.email,
        180
      ).toLowerCase();

      const phone = normalizeText(
        body.phone,
        40
      );

      const subject = normalizeText(
        body.subject,
        120
      );

      const message = normalizeText(
        body.message,
        4000
      );

      if (
        name.length < 2 ||
        !isValidEmail(email) ||
        message.length < 10
      ) {
        return new NextResponse(
          "Form bilgileri eksik veya geçersiz.",
          { status: 400 }
        );
      }

      await adminDb
        .collection("contacts")
        .add({
          name,
          email,
          phone,
          subject,
          message,
          status: "new",
          source: "website_contact_form",
          createdAt: new Date(),
        });

      return NextResponse.json({ ok: true });
    }

    if (type === "newsletter") {
      const email = normalizeText(body.email, 180).toLowerCase();

      if (!isValidEmail(email)) {
        return new NextResponse("Geçerli bir e-posta adresi gir.", { status: 400 });
      }

      const subscriberId = createHash("sha256").update(email).digest("hex");

      await adminDb.collection("newsletter_subscribers").doc(subscriberId).set({
        email,
        status: "active",
        source: "website_footer",
        consentAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      const storedSubscriber = await adminDb
        .collection("newsletter_subscribers")
        .doc(subscriberId)
        .get();

      if (!storedSubscriber.exists) {
        throw new Error("Newsletter subscriber verification failed");
      }

      return NextResponse.json({ ok: true, stored: true });
    }

    const estimatedPrice =
      Number(body.estimatedPrice) || 0;

    const notes = Array.isArray(
      body.notes
    )
      ? body.notes
          .map((note) =>
            normalizeText(note, 240)
          )
          .filter(Boolean)
          .slice(0, 8)
      : [];

    const answers =
      body.answers &&
      typeof body.answers === "object"
        ? body.answers
        : {};

    if (estimatedPrice <= 0) {
      return new NextResponse(
        "Teklif verisi geçersiz.",
        { status: 400 }
      );
    }

    await adminDb
      .collection("quotes")
      .add({
        answers,
        estimatedPrice,
        notes,
        status: "new",
        source: "website_quote_wizard",
        createdAt: new Date(),
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "[PUBLIC LEADS API]",
      error
    );

    return new NextResponse(
      "İstek işlenemedi",
      { status: 500 }
    );
  }
}
