import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminToken } from "@/lib/admin-guard";

const allowedStatuses = new Set(["active", "maintenance", "disabled"]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdminToken(req.headers.get("authorization"));
    const { id } = await params;
    const body = await req.json();
    const status = String(body.status || "");

    if (!allowedStatuses.has(status)) return new NextResponse("Invalid status", { status: 400 });

    const [siteSnap, secretSnap] = await Promise.all([
      adminDb.collection("managed_sites").doc(id).get(),
      adminDb.collection("managed_site_secrets").doc(id).get()
    ]);

    if (!siteSnap.exists) return new NextResponse("Site not found", { status: 404 });

    const site = siteSnap.data()!;
    const controlSecret = String(secretSnap.data()?.controlSecret || "");
    if (!site.controlUrl) return new NextResponse("Control endpoint is not configured", { status: 409 });
    if (!controlSecret) return new NextResponse("Control secret is not configured", { status: 409 });

    const timestamp = Date.now().toString();
    const nonce = randomUUID();
    const commandId = randomUUID();
    const payload = JSON.stringify({ siteId: id, status, timestamp, nonce, commandId });
    const signature = createHmac("sha256", controlSecret).update(payload).digest("hex");

    const eventRef = adminDb.collection("site_events").doc();
    await eventRef.set({
      siteId: id,
      type: "command_dispatched",
      status,
      commandId,
      actorUid: actor.uid,
      createdAt: new Date()
    });

    const remote = await fetch(site.controlUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dromocob-signature": signature,
        "user-agent": "Dromocob-Control-OS/2.0"
      },
      body: payload,
      signal: AbortSignal.timeout(12000),
      cache: "no-store"
    });

    const remoteText = await remote.text();

    if (!remote.ok) {
      await adminDb.collection("site_events").add({
        siteId: id,
        type: "command_failed",
        status,
        commandId,
        remoteStatus: remote.status,
        remoteResponse: remoteText.slice(0, 1000),
        createdAt: new Date()
      });
      return new NextResponse(`Remote site rejected command (${remote.status}): ${remoteText}`, { status: 502 });
    }

    await Promise.all([
      adminDb.collection("managed_sites").doc(id).update({
        status,
        updatedAt: new Date(),
        lastCommandAt: new Date(),
        lastCommandId: commandId
      }),
      adminDb.collection("site_events").add({
        siteId: id,
        type: "status_changed",
        status,
        commandId,
        actorUid: actor.uid,
        createdAt: new Date()
      })
    ]);

    return NextResponse.json({ ok: true, status, commandId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
    console.error(error);
    return new NextResponse("Control command failed", { status: 500 });
  }
}
