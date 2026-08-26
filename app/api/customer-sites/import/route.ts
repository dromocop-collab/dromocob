import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getRequestUser } from "@/lib/request-user";
import type { CustomerSiteDraft } from "@/lib/customer-sites";

export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) { return String(value || "").trim().slice(0, max); }

function normalizeDraft(input: unknown): CustomerSiteDraft | null {
  if (!input || typeof input !== "object") return null;
  const source = input as Record<string, unknown>;
  const template = source.template;
  if (template !== "studio" && template !== "restaurant" && template !== "portfolio") return null;
  const businessName = clean(source.businessName, 120);
  const headline = clean(source.headline, 300);
  const subdomain = clean(source.subdomain, 80).toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
  const accent = clean(source.accent, 20);
  if (!businessName || !headline || !subdomain || !accent) return null;
  return {
    template,
    businessName,
    headline,
    subdomain,
    accent,
    ...(source.brief && typeof source.brief === "object" ? { brief: source.brief as CustomerSiteDraft["brief"] } : {}),
    ...(Array.isArray(source.pages) ? { pages: source.pages as CustomerSiteDraft["pages"] } : {}),
    ...(source.siteSettings && typeof source.siteSettings === "object" ? { siteSettings: source.siteSettings as CustomerSiteDraft["siteSettings"] } : {}),
  };
}

export async function POST(request: Request) {
  const user = await getRequestUser(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ message: "Oturum doğrulanamadı." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { draft?: unknown; transferId?: unknown };
  const draft = normalizeDraft(body.draft);
  const transferId = clean(body.transferId, 120);
  if (!draft || transferId.length < 8) return NextResponse.json({ message: "Taslak verisi eksik veya geçersiz." }, { status: 400 });

  const fingerprint = createHash("sha256").update(`${user.uid}:${transferId}`).digest("hex").slice(0, 32);
  const siteRef = adminDb.collection("customer_sites").doc(`import_${fingerprint}`);
  try {
    await adminDb.runTransaction(async transaction => {
      const existing = await transaction.get(siteRef);
      if (existing.exists) return;
      transaction.create(siteRef, {
        ...draft,
        ownerId: user.uid,
        status: "published",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    return NextResponse.json({ ok: true, id: siteRef.id });
  } catch (error) {
    console.error("[CUSTOMER SITE IMPORT]", error);
    return NextResponse.json({ message: "Taslak şu anda aktarılamadı. Taslağın silinmedi; biraz sonra tekrar deneyebilirsin." }, { status: 503 });
  }
}
