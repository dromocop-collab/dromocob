import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminToken } from "@/lib/admin-guard";

export async function POST(req: NextRequest) {
  try {
    await requireAdminToken(req.headers.get("authorization"));
    const snap = await adminDb.collection("managed_sites").get();

    const results = await Promise.all(snap.docs.map(async siteDoc => {
      const site = siteDoc.data();
      const healthEndpoint = site.healthEndpoint || site.healthUrl;
      if (!healthEndpoint) return { id: siteDoc.id, health: "unknown" };

      const started = Date.now();
      try {
        const remote = await fetch(healthEndpoint, {
          headers: { "user-agent": "Dromocob-Health-Check/2.0" },
          signal: AbortSignal.timeout(8000),
          cache: "no-store"
        });
        const latencyMs = Date.now() - started;
        const payload = await remote.json().catch(() => null);
        const health = remote.ok ? "online" : "offline";

        await siteDoc.ref.update({
          lastHealth: health,
          lastHealthStatusCode: remote.status,
          lastHealthLatencyMs: latencyMs,
          lastHealthPayload: payload,
          lastCheckedAt: new Date()
        });

        return { id: siteDoc.id, health, latencyMs };
      } catch {
        const latencyMs = Date.now() - started;
        await siteDoc.ref.update({
          lastHealth: "offline",
          lastHealthLatencyMs: latencyMs,
          lastCheckedAt: new Date()
        });
        return { id: siteDoc.id, health: "offline", latencyMs };
      }
    }));

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
    console.error(error);
    return new NextResponse("Batch health check failed", { status: 500 });
  }
}
