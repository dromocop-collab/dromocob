import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";
import {
  adminMobileError,
  cleanAdminPayload,
  mobileAdminCollections,
  mobileAdminDeletableCollections,
  mobileAdminWritableCollections,
  serializeAdminValue,
  validSegment,
} from "../../_shared";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ collection: string; id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    await requireAdminToken(request.headers.get("authorization"));
    const { collection, id } = await context.params;
    if (!mobileAdminCollections.has(collection) || !validSegment(id)) {
      return NextResponse.json({ ok: false, error: "RESOURCE_NOT_ALLOWED" }, { status: 404 });
    }
    const snapshot = await adminDb.collection(collection).doc(id).get();
    if (!snapshot.exists) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      row: { id: snapshot.id, ...(serializeAdminValue(snapshot.data()) as Record<string, unknown>) },
    });
  } catch (error) {
    const result = adminMobileError(error);
    if (result.status === 500) console.error("[MOBILE ADMIN GET]", error);
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const actor = await requireAdminToken(request.headers.get("authorization"));
    const { collection, id } = await context.params;
    if (!mobileAdminWritableCollections.has(collection) || !validSegment(id)) {
      return NextResponse.json({ ok: false, error: "RESOURCE_NOT_WRITABLE" }, { status: 403 });
    }
    const raw = await request.json();
    const payload = cleanAdminPayload(raw) as Record<string, unknown>;
    delete payload.id;
    delete payload.createdAt;

    await adminDb.collection(collection).doc(id).set({
      ...payload,
      updatedAt: FieldValue.serverTimestamp(),
      mobileAdminActorUid: actor.uid,
    }, { merge: true });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const result = adminMobileError(error);
    if (result.status === 500) console.error("[MOBILE ADMIN PATCH]", error);
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireAdminToken(request.headers.get("authorization"));
    const { collection, id } = await context.params;
    if (!mobileAdminDeletableCollections.has(collection) || !validSegment(id)) {
      return NextResponse.json({ ok: false, error: "RESOURCE_NOT_DELETABLE" }, { status: 403 });
    }
    await adminDb.collection(collection).doc(id).delete();
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const result = adminMobileError(error);
    if (result.status === 500) console.error("[MOBILE ADMIN DELETE]", error);
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }
}
