import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminToken } from "@/lib/admin-guard";

function normalizeUrl(value: unknown) {
  const url = new URL(String(value || ""));
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("INVALID_URL");
  return url.toString();
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminToken(req.headers.get("authorization"));
    const body = await req.json();

    const name = String(body.name || "").trim();
    const domain = String(body.domain || "").trim().toLowerCase();
    const controlUrl = normalizeUrl(body.controlUrl);
    const healthUrl = normalizeUrl(body.healthUrl);
    const controlSecret = String(body.controlSecret || "").trim();

    if (!name || !domain) return new NextResponse("Name/domain required", { status: 400 });
    if (controlSecret.length < 40) return new NextResponse("Control secret must be at least 40 characters", { status: 400 });

    const siteRef = adminDb.collection("managed_sites").doc();
    const now = new Date();

    await adminDb.runTransaction(async tx => {
      tx.set(siteRef, {
        name,
        domain,
        controlUrl,
        healthUrl,
        status: "active",
        lastHealth: "unknown",
        createdAt: now,
        updatedAt: now
      });
      tx.set(adminDb.collection("managed_site_secrets").doc(siteRef.id), {
        controlSecret,
        createdAt: now,
        updatedAt: now
      });
      tx.set(adminDb.collection("site_events").doc(), {
        siteId: siteRef.id,
        type: "site_registered",
        actorUid: actor.uid,
        createdAt: now
      });
    });

    return NextResponse.json({ ok: true, id: siteRef.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
    if (message === "INVALID_URL") return new NextResponse("Invalid URL", { status: 400 });
    console.error(error);
    return new NextResponse("Site registration failed", { status: 500 });
  }
}
