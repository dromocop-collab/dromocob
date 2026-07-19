import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createHash } from "node:crypto";

import { adminDb } from "@/lib/firebase-admin";
import { enqueueMail } from "@/lib/auth-code-mail";
import { siteEmail } from "@/lib/seo";

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
  service?: "web" | "video";
  serviceLabel?: string;
  contact?: { name?: string; company?: string; email?: string; phone?: string; city?: string; preferredContact?: string };
  answerSelections?: Array<{ key?: string; title?: string; values?: unknown[]; labels?: unknown[] }>;
  quoteVersion?: string;
  sourcePath?: string;
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

function escapeHtml(value: unknown) {
  return normalizeText(value, 4000).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
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

    const advanced = normalizeText(body.quoteVersion, 40) === "advanced-v1";
    const service = body.service === "video" ? "video" : "web";
    const serviceLabel = normalizeText(body.serviceLabel, 80) || (service === "video" ? "Video & Film" : "Web & Yazılım");
    const contact = {
      name: normalizeText(body.contact?.name, 120),
      company: normalizeText(body.contact?.company, 160),
      email: normalizeText(body.contact?.email, 180).toLowerCase(),
      phone: normalizeText(body.contact?.phone, 40),
      city: normalizeText(body.contact?.city, 100),
      preferredContact: normalizeText(body.contact?.preferredContact, 60),
    };

    const answerSelections = Array.isArray(body.answerSelections) ? body.answerSelections.slice(0, 40).map(item => ({
      key: normalizeText(item.key, 80),
      title: normalizeText(item.title, 240),
      values: Array.isArray(item.values) ? item.values.map(value => normalizeText(value, 120)).filter(Boolean).slice(0, 30) : [],
      labels: Array.isArray(item.labels) ? item.labels.map(value => normalizeText(value, 240)).filter(Boolean).slice(0, 30) : [],
    })).filter(item => item.key && item.title && item.values.length) : [];

    if (estimatedPrice <= 0) {
      return new NextResponse(
        "Teklif verisi geçersiz.",
        { status: 400 }
      );
    }

    if (advanced && (contact.name.length < 2 || !isValidEmail(contact.email) || contact.phone.replace(/\D/g, "").length < 10 || answerSelections.length < 5)) {
      return NextResponse.json({ message: "İletişim veya kapsam bilgileri eksik." }, { status: 400 });
    }

    const quoteReference = await adminDb
      .collection("quotes")
      .add({
        quoteVersion: advanced ? "advanced-v1" : "legacy",
        service,
        serviceLabel,
        contact,
        answers,
        answerSelections,
        estimatedPrice,
        notes,
        status: "new",
        source: advanced ? "advanced_service_quote_wizard" : "website_quote_wizard",
        sourcePath: normalizeText(body.sourcePath, 300),
        createdAt: new Date(),
      });

    if (advanced) {
      const rows = answerSelections.map(item => `<tr><td style="padding:10px 12px;border-bottom:1px solid #e7eadf;color:#6d7468;font-size:12px;vertical-align:top;">${escapeHtml(item.title)}</td><td style="padding:10px 12px;border-bottom:1px solid #e7eadf;color:#171a16;font-size:13px;font-weight:700;">${item.labels.map(escapeHtml).join(" · ")}</td></tr>`).join("");
      const subject = `Yeni ${serviceLabel} teklif talebi — ${contact.name}${contact.company ? ` / ${contact.company}` : ""}`;
      const text = `Yeni teklif talebi\nReferans: ${quoteReference.id}\nHizmet: ${serviceLabel}\nAd: ${contact.name}\nFirma: ${contact.company}\nE-posta: ${contact.email}\nTelefon: ${contact.phone}\nŞehir: ${contact.city}\nTercih: ${contact.preferredContact}\nÖn kapsam: ${estimatedPrice.toLocaleString("tr-TR")} TL+\n\n${answerSelections.map(item => `${item.title}: ${item.labels.join(", ")}`).join("\n")}`;
      const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#eef1e9;font-family:Arial,Helvetica,sans-serif;color:#11140f;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 14px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;background:#fff;border:1px solid #dce2d5;border-radius:22px;overflow:hidden;"><tr><td style="padding:22px 28px;background:#10140f;color:#d9ff43;font-size:12px;font-weight:900;letter-spacing:.14em;">DROMOCOB / NEW SCOPE REQUEST</td></tr><tr><td style="padding:30px 28px;"><p style="margin:0 0 8px;color:#7b8375;font-size:11px;text-transform:uppercase;letter-spacing:.12em;">${escapeHtml(serviceLabel)} · ${escapeHtml(quoteReference.id)}</p><h1 style="margin:0 0 22px;font-size:30px;">${escapeHtml(contact.name)}${contact.company ? ` / ${escapeHtml(contact.company)}` : ""}</h1><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background:#f3f5ef;border-radius:12px;"><tr><td style="padding:14px;line-height:1.7;font-size:13px;"><strong>E-posta:</strong> ${escapeHtml(contact.email)}<br/><strong>Telefon:</strong> ${escapeHtml(contact.phone)}<br/><strong>Şehir:</strong> ${escapeHtml(contact.city || "Belirtilmedi")}<br/><strong>Tercih:</strong> ${escapeHtml(contact.preferredContact)}<br/><strong>Ön kapsam:</strong> ${estimatedPrice.toLocaleString("tr-TR")} TL+</td></tr></table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e7eadf;border-radius:12px;overflow:hidden;">${rows}</table></td></tr></table></td></tr></table></body></html>`;
      await enqueueMail({ to: siteEmail, subject, text, html });
    }

    return NextResponse.json({ ok: true, referenceId: quoteReference.id });
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
