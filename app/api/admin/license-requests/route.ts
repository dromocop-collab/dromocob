import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminRole } from "@/lib/admin-guard";

export const runtime = "nodejs";

function serialize(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data();
  return {
    id: doc.id,
    ...Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value instanceof Timestamp ? value.toDate().toISOString() : value,
      ]),
    ),
  };
}

export async function GET(request: Request) {
  try {
    await requireAdminRole(
      request.headers.get("authorization"),
      ["super_admin", "admin", "license_manager", "support"],
    );

    const snapshot = await adminDb
      .collection("license_requests")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    return Response.json({
      ok: true,
      requests: snapshot.docs.map(serialize),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return Response.json(
      { ok: false, error: code },
      { status: code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500 },
    );
  }
}
