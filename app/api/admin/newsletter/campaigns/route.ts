import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminToken } from "@/lib/admin-guard";
import { enqueueMail, isValidEmail } from "@/lib/auth-code-mail";

export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function campaignHtml(subject: string, preheader: string, content: string, ctaLabel: string, ctaUrl: string) {
  const safeContent = escapeHtml(content).replace(/\n/g, "<br>");
  const button = ctaLabel && ctaUrl
    ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;margin-top:24px;padding:14px 20px;border-radius:999px;background:#d9ff43;color:#10110f;text-decoration:none;font-weight:800;">${escapeHtml(ctaLabel)}</a>`
    : "";

  return `<!doctype html><html lang="tr"><body style="margin:0;background:#eef1e9;font-family:Arial,Helvetica,sans-serif;color:#11140f;"><div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:34px 16px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dce2d5;border-radius:24px;overflow:hidden;"><tr><td style="padding:24px 34px;background:#10140f;color:#d9ff43;font-size:14px;font-weight:900;letter-spacing:.14em;">DROMOCOB</td></tr><tr><td style="padding:42px 34px;"><p style="margin:0 0 12px;color:#778071;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">Dromocob Dispatch</p><h1 style="margin:0;font-size:36px;line-height:1.05;letter-spacing:-.045em;">${escapeHtml(subject)}</h1><div style="margin-top:22px;color:#566052;font-size:15px;line-height:1.75;">${safeContent}</div>${button}</td></tr><tr><td style="padding:24px 34px;border-top:1px solid #edf0e9;color:#899184;font-size:10px;line-height:1.6;">Bu e-postayı Dromocob listesine abone olduğun için aldın. Abonelik tercihin için info@dromocob.tr adresine yazabilirsin.</td></tr></table></td></tr></table></body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminToken(request.headers.get("authorization"));
    const body = await request.json() as Record<string, unknown>;
    const subject = clean(body.subject, 140);
    const preheader = clean(body.preheader, 180);
    const content = clean(body.content, 8000);
    const ctaLabel = clean(body.ctaLabel, 60);
    const ctaUrl = clean(body.ctaUrl, 500);
    const selected = Array.isArray(body.recipients) ? body.recipients.map(String).filter(isValidEmail) : [];

    if (subject.length < 4 || content.length < 20) {
      return NextResponse.json({ ok: false, message: "Konu ve kampanya içeriği zorunlu." }, { status: 400 });
    }
    if (ctaUrl && !/^https:\/\//i.test(ctaUrl)) {
      return NextResponse.json({ ok: false, message: "CTA bağlantısı https:// ile başlamalı." }, { status: 400 });
    }

    let recipients = [...new Set(selected)];
    if (!recipients.length) {
      const snapshot = await adminDb.collection("newsletter_subscribers").where("status", "==", "active").limit(500).get();
      recipients = snapshot.docs.map(document => String(document.data().email || "")).filter(isValidEmail);
    }
    if (!recipients.length) {
      return NextResponse.json({ ok: false, message: "Gönderilecek aktif abone bulunamadı." }, { status: 400 });
    }

    const campaignRef = adminDb.collection("newsletter_campaigns").doc();
    await campaignRef.set({ subject, preheader, content, ctaLabel, ctaUrl, recipientCount: recipients.length, status: "queueing", createdBy: admin.uid, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });

    const html = campaignHtml(subject, preheader, content, ctaLabel, ctaUrl);
    await Promise.all(recipients.map(to => enqueueMail({ to, subject, text: `${content}\n\n${ctaLabel && ctaUrl ? `${ctaLabel}: ${ctaUrl}` : ""}`, html })));
    await campaignRef.update({ status: "queued", queuedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ ok: true, campaignId: campaignRef.id, recipientCount: recipients.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ ok: false, message: status === 500 ? "Kampanya kuyruğa alınamadı." : "Yetkisiz işlem." }, { status });
  }
}
