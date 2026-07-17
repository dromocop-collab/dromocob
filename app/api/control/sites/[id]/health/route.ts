import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminToken } from "@/lib/admin-guard";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminToken(req.headers.get("authorization"));
    const { id } = await params;
    const siteRef = adminDb.collection("managed_sites").doc(id);
    const snap = await siteRef.get();

    if (!snap.exists) return new NextResponse("Site not found", { status: 404 });
    const site = snap.data()!;
    const healthEndpoint = site.healthEndpoint || site.healthUrl;
    if (!healthEndpoint) return new NextResponse("Health endpoint missing", { status: 409 });

    const started = Date.now();
    let health: "online" | "offline" = "offline";
    let statusCode = 0;
    let latencyMs = 0;
    let payload: unknown = null;

    try {
      const remote = await fetch(healthEndpoint, {
        headers: { "user-agent": "Dromocob-Health-Check/2.0" },
        signal: AbortSignal.timeout(8000),
        cache: "no-store"
      });
      statusCode = remote.status;
      latencyMs = Date.now() - started;
      payload = await remote.json().catch(() => null);
      health = remote.ok ? "online" : "offline";
    } catch {
      latencyMs = Date.now() - started;
      health = "offline";
    }

    await siteRef.update({
      lastHealth: health,
      lastHealthStatusCode: statusCode,
      lastHealthLatencyMs: latencyMs,
      lastHealthPayload: payload,
      lastCheckedAt: new Date()
    });

    await adminDb.collection("site_events").add({
      siteId: id,
      type: "health_check",
      health,
      statusCode,
      latencyMs,
      createdAt: new Date()
    });

    return NextResponse.json({ ok: true, health, statusCode, latencyMs, payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
    console.error(error);
    return new NextResponse("Health check failed", { status: 500 });
  }
}
