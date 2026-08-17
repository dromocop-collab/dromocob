import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminRole } from "@/lib/admin-guard";

export const runtime = "nodejs";

const allowedStatuses = new Set(["new", "contacted", "approved", "rejected", "closed"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(
      request.headers.get("authorization"),
      ["super_admin", "admin", "license_manager", "support"],
    );

    const { id } = await params;
    const body = await request.json();

    const status = String(body.status || "");
    const adminNotes = String(body.adminNotes || "").trim().slice(0, 4000);

    if (!allowedStatuses.has(status)) {
      return Response.json({ ok: false, error: "INVALID_STATUS" }, { status: 400 });
    }

    const ref = adminDb.collection("license_requests").doc(id);
    const existing = await ref.get();

    if (!existing.exists) {
      return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    await ref.update({
      status,
      adminNotes,
      updatedBy: admin.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("license_request_events").add({
      requestId: id,
      type: "license_request_updated",
      status,
      userId: admin.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return Response.json(
      { ok: false, error: code },
      { status: code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500 },
    );
  }
}
