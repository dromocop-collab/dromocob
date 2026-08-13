import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { requireAdminRole } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

const APPS = {
  dromocob: "com.cihat.dromocob",
  calorievision: "com.cihat.Kalori-Merkezi",
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const appId = String(body.appId || "") as keyof typeof APPS;
    const token = String(body.token || "").trim().toLowerCase();
    const environment = body.environment === "sandbox" ? "sandbox" : "production";
    if (!(appId in APPS) || !/^[a-f0-9]{64,200}$/.test(token)) {
      return NextResponse.json({ ok: false, error: "INVALID_PUSH_TOKEN" }, { status: 400 });
    }

    let uid: string | null = null;
    var adminAuthorized = false;
    const authorization = request.headers.get("authorization") || "";
    if (authorization.startsWith("Bearer ")) {
      try {
        uid = (await adminAuth.verifyIdToken(authorization.slice(7))).uid;
        await requireAdminRole(authorization, ["super_admin", "admin", "support"]);
        adminAuthorized = true;
      } catch {}
    }

    const id = createHash("sha256").update(`${appId}:${token}`).digest("hex");
    await adminDb.collection("mobile_push_tokens").doc(id).set({
      appId,
      bundleId: APPS[appId],
      token,
      environment,
      platform: "ios",
      uid,
      adminAuthorized,
      active: true,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUSH TOKEN]", error);
    return NextResponse.json({ ok: false, error: "PUSH_TOKEN_FAILED" }, { status: 500 });
  }
}
