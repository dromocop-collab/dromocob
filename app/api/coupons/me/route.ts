import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getRequestUser } from "@/lib/request-user";

export const dynamic = "force-dynamic";
function iso(value: unknown) { return value && typeof value === "object" && "toDate" in value ? (value as { toDate: () => Date }).toDate().toISOString() : ""; }

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  const snapshot = await adminDb.collection("coupons").where("userId", "==", user.uid).limit(50).get();
  const now = Date.now();
  const coupons = snapshot.docs.map(document => {
    const data = document.data();
    const expiresAt = iso(data.expiresAt);
    const status = data.status === "active" && expiresAt && new Date(expiresAt).getTime() < now ? "expired" : String(data.status || "active");
    return { id: document.id, code: String(data.code || document.id), label: String(data.label || "Kupon"), description: String(data.description || ""), kind: data.kind, value: Number(data.value || 0), status, expiresAt, createdAt: iso(data.createdAt), usedAt: iso(data.usedAt), quoteId: String(data.quoteId || "") };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ coupons }, { headers: { "cache-control": "no-store" } });
}
