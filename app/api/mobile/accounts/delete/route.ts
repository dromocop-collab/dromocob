import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // Hesaba bağlı doğrudan belgeleri, olası alt koleksiyonlarıyla beraber sil.
    await Promise.all([
      adminDb.recursiveDelete(adminDb.collection("mobile_app_users").doc(uid)),
      adminDb.recursiveDelete(adminDb.collection("mobile_premium_entitlements").doc(uid)),
    ]);

    // Bildirim token'larının belge kimliği cihaz token'ından üretildiği için UID ile sorgulanır.
    const [pushTokens, premiumAuditLogs] = await Promise.all([
      adminDb.collection("mobile_push_tokens").where("uid", "==", uid).get(),
      adminDb.collection("mobile_premium_audit_logs").where("targetUid", "==", uid).get(),
    ]);
    const relatedDocuments = [...pushTokens.docs, ...premiumAuditLogs.docs];
    for (let index = 0; index < relatedDocuments.length; index += 400) {
      const batch = adminDb.batch();
      relatedDocuments.slice(index, index + 400).forEach(document => batch.delete(document.ref));
      await batch.commit();
    }

    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "auth/user-not-found") throw error;
    }

    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[MOBILE ACCOUNT DELETE]", error);
    return NextResponse.json(
      { ok: false, error: "ACCOUNT_DELETION_FAILED", message: "Hesap silme işlemi tamamlanamadı." },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
