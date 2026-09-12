import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminRole } from "@/lib/admin-guard";
import { DROMOCOB_APPS } from "@/lib/licensing/types";

export const runtime = "nodejs";

const VALID_PRODUCTS = new Set<string>(["dromocob-all-apps", ...DROMOCOB_APPS.map(app => app.id)]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "license_manager"]);
    const { id } = await params;
    const body = await request.json();
    if (Array.isArray(body.products)) {
      const requested = Array.from(new Set<string>(body.products.map((item: unknown) => String(item).trim().toLowerCase())));
      const products = requested.filter(product => VALID_PRODUCTS.has(product)).slice(0, 20);
      if (!products.length || products.length !== requested.length) {
        return Response.json({ ok: false, error: "INVALID_PRODUCTS" }, { status: 400 });
      }
      const ref = adminDb.collection("licenses").doc(id);
      const snapshot = await ref.get();
      if (!snapshot.exists) return Response.json({ ok: false, error: "LICENSE_NOT_FOUND" }, { status: 404 });
      await ref.update({ products, updatedAt: FieldValue.serverTimestamp() });

      const active = await adminDb.collection("license_activations").where("licenseId", "==", id).where("active", "==", true).get();
      const batch = adminDb.batch();
      active.docs.forEach(doc => {
        const productId = String(doc.data().productId || "").trim().toLowerCase();
        const hasAccess = products.includes("dromocob-all-apps") ||
          (products.includes("dromocob-ultra") && productId.startsWith("dromocob-ultra-")) ||
          products.includes(productId);
        if (!hasAccess) batch.update(doc.ref, { active: false, updatedAt: FieldValue.serverTimestamp() });
      });
      await batch.commit();
      await adminDb.collection("license_events").add({ type: "license_products_updated", licenseId: id, products, userId: admin.uid, createdAt: FieldValue.serverTimestamp() });
      return Response.json({ ok: true, products });
    }
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
