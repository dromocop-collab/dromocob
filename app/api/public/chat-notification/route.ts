import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { enqueueMail } from "@/lib/auth-code-mail";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { siteEmail, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function cleanId(value: unknown) {
  const result = String(value || "").trim();
  return result && result.length <= 160 && !result.includes("/") ? result : "";
}

function escapeHtml(value: unknown) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] || character);
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const body = await request.json() as { sessionId?: unknown; messageId?: unknown };
    const sessionId = cleanId(body.sessionId);
    const messageId = cleanId(body.messageId);
    if (!sessionId || !messageId) return NextResponse.json({ ok: false }, { status: 400 });

    const sessionRef = adminDb.collection("chat_sessions").doc(sessionId);
    const messageRef = sessionRef.collection("messages").doc(messageId);
    const [sessionSnapshot, messageSnapshot] = await Promise.all([sessionRef.get(), messageRef.get()]);

    if (!sessionSnapshot.exists || !messageSnapshot.exists) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const session = sessionSnapshot.data() || {};
    const message = messageSnapshot.data() || {};
    if (session.ownerUid !== decoded.uid || message.senderUid !== decoded.uid || message.sender !== "visitor") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    if (message.emailNotificationQueuedAt) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const messageText = String(message.text || "").trim().slice(0, 1000);
    if (!messageText) return NextResponse.json({ ok: false }, { status: 400 });

    const visitorName = String(session.visitorName || "Web sitesi ziyaretçisi").trim().slice(0, 120);
    const adminUrl = `${siteUrl}/admin/destek`;
    const subject = `Yeni canlı destek mesajı — ${visitorName}`;
    const text = `Yeni canlı destek mesajı\n\n${messageText}\n\nOturum: ${sessionId}\nDestek ekranı: ${adminUrl}`;
    const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#eef1e9;font-family:Arial,Helvetica,sans-serif;color:#11140f;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 14px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dce2d5;border-radius:22px;overflow:hidden;"><tr><td style="padding:20px 28px;background:#10140f;color:#d9ff43;font-size:11px;font-weight:900;letter-spacing:.14em;">DROMOCOB / LIVE SUPPORT</td></tr><tr><td style="padding:30px 28px;"><p style="margin:0 0 9px;color:#798273;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Yeni ziyaretçi mesajı</p><h1 style="margin:0 0 22px;font-size:28px;letter-spacing:-.035em;">${escapeHtml(visitorName)}</h1><div style="padding:20px;border-left:4px solid #d9ff43;border-radius:4px 14px 14px 4px;background:#f3f5ef;color:#252a22;font-size:16px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(messageText)}</div><p style="margin:18px 0 24px;color:#8a9285;font-size:10px;">Oturum: ${escapeHtml(sessionId)}</p><a href="${adminUrl}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#10140f;color:#d9ff43;font-size:12px;font-weight:900;text-decoration:none;">Mesajı yanıtla →</a></td></tr></table></td></tr></table></body></html>`;

    await enqueueMail({ to: siteEmail, subject, text, html });
    await messageRef.update({ emailNotificationQueuedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[CHAT EMAIL NOTIFICATION]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
