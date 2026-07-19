import { NextRequest, NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminToken(request.headers.get("authorization"));

    const { id } = await context.params;
    const cleanId = id.trim();

    if (!cleanId || cleanId.length > 160 || cleanId.includes("/")) {
      return NextResponse.json({ ok: false, error: "INVALID_SESSION_ID" }, { status: 400 });
    }

    const sessionRef = adminDb.collection("chat_sessions").doc(cleanId);
    const session = await sessionRef.get();

    if (!session.exists) {
      return NextResponse.json({ ok: false, error: "SESSION_NOT_FOUND" }, { status: 404 });
    }

    await adminDb.recursiveDelete(sessionRef);

    return NextResponse.json(
      { ok: true, deletedSessionId: cleanId },
      { headers: { "cache-control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: message }, { status: 401 });
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: message }, { status: 403 });
    }

    console.error("[DELETE CHAT SESSION]", error);
    return NextResponse.json({ ok: false, error: "DELETE_FAILED" }, { status: 500 });
  }
}
