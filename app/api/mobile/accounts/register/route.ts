import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await adminAuth.getUser(decoded.uid);
    const ref = adminDb.collection("mobile_app_users").doc(user.uid);
    const existing = await ref.get();
    await ref.set({
      uid: user.uid,
      app: "calorievision",
      platform: "ios",
      email: user.email || null,
      displayName: user.displayName || null,
      lastSeenAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    }, { merge: true });
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[MOBILE ACCOUNT REGISTER]", error);
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
