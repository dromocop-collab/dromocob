import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminRole } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "license_manager"]);
    const { id } = await params;
    const body = await request.json();
    const allowed = ["active", "suspended", "revoked", "expired"];
    if (!allowed.includes(body.status)) return Response.json({ ok: false, error: "INVALID_STATUS" }, { status: 400 });
    await adminDb.collection("licenses").doc(id).update({ status: body.status, updatedAt: FieldValue.serverTimestamp() });
    if (body.status !== "active") {
      const active = await adminDb.collection("license_activations").where("licenseId", "==", id).where("active", "==", true).get();
      const batch = adminDb.batch();
      active.docs.forEach(doc => batch.update(doc.ref, { active: false, updatedAt: FieldValue.serverTimestamp() }));
      await batch.commit();
    }
    await adminDb.collection("license_events").add({ type: `license_${body.status}`, licenseId: id, userId: admin.uid, createdAt: FieldValue.serverTimestamp() });
    return Response.json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return Response.json({ ok: false, error: code }, { status: code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500 });
  }
}
