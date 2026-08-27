import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { getFethiyeDestination } from "@/lib/fethiye-destinations";

export const runtime = "nodejs";

function clean(value: unknown, max: number) { return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max); }
function fingerprint(request: Request, email: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  return createHash("sha256").update(`${ip}|${request.headers.get("user-agent") || ""}|${email}`).digest("hex");
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!getFethiyeDestination(slug)) return Response.json({ comments: [] }, { status: 404 });
  try {
    const snapshot = await adminDb.collection("fethiye_comments").where("slug", "==", slug).where("status", "==", "approved").limit(30).get();
    const comments = snapshot.docs.map(document => {
      const data = document.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
      return { id: document.id, name: clean(data.name, 60), rating: Number(data.rating) || 5, message: clean(data.message, 900), createdAt: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(createdAt) };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt, "tr"));
    return Response.json({ comments }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ comments: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    if (!getFethiyeDestination(slug)) return Response.json({ ok: false, error: "Geçersiz rota." }, { status: 404 });
    const body = await request.json();
    if (clean(body.website, 120)) return Response.json({ ok: true }, { status: 201 });
    const name = clean(body.name, 60);
    const email = clean(body.email, 140).toLowerCase();
    const message = clean(body.message, 900);
    const rating = Math.round(Number(body.rating));
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || message.length < 12 || rating < 1 || rating > 5) return Response.json({ ok: false, error: "Lütfen tüm alanları kontrol et." }, { status: 400 });
    const hash = fingerprint(request, email);
    const limiterRef = adminDb.collection("fethiye_comment_limits").doc(hash);
    const commentRef = adminDb.collection("fethiye_comments").doc();
    await adminDb.runTransaction(async transaction => {
      const limiter = await transaction.get(limiterRef);
      const previous = limiter.data()?.lastSubmittedAt as Timestamp | undefined;
      if (previous && Date.now() - previous.toMillis() < 120_000) throw new Error("RATE_LIMIT");
      transaction.set(limiterRef, { lastSubmittedAt: Timestamp.now(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      transaction.set(commentRef, { slug, name, email, emailHash: createHash("sha256").update(email).digest("hex"), message, rating, status: "pending", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
    return Response.json({ ok: true, id: commentRef.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT") return Response.json({ ok: false, error: "Yeni yorum göndermeden önce lütfen biraz bekle." }, { status: 429 });
    console.error("[FETHIYE COMMENT]", error);
    return Response.json({ ok: false, error: "Yorum şu anda gönderilemedi." }, { status: 500 });
  }
}
