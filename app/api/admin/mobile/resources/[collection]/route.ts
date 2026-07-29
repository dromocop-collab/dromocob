import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";
import {
  adminMobileError,
  cleanAdminPayload,
  mobileAdminCollections,
  mobileAdminWritableCollections,
  serializeAdminValue,
  validSegment,
} from "../_shared";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ collection: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    await requireAdminToken(request.headers.get("authorization"));
    const { collection } = await context.params;
    if (!mobileAdminCollections.has(collection)) {
      return NextResponse.json({ ok: false, error: "COLLECTION_NOT_ALLOWED" }, { status: 404 });
    }

    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || 100);
    const safeLimit = Math.min(200, Math.max(1, Math.floor(requestedLimit)));
    const snapshot = await adminDb.collection(collection).limit(safeLimit).get();
    const rows = snapshot.docs.map(item => ({
      id: item.id,
      ...(serializeAdminValue(item.data()) as Record<string, unknown>),
    }));

    return NextResponse.json(
      { ok: true, collection, rows },
      { headers: { "cache-control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const result = adminMobileError(error);
    if (result.status === 500) console.error("[MOBILE ADMIN LIST]", error);
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    const actor = await requireAdminToken(request.headers.get("authorization"));
    const { collection } = await context.params;
    if (!mobileAdminWritableCollections.has(collection)) {
      return NextResponse.json({ ok: false, error: "COLLECTION_NOT_WRITABLE" }, { status: 403 });
    }

    const raw = await request.json();
    const payload = cleanAdminPayload(raw) as Record<string, unknown>;
    const requestedId = typeof raw?.id === "string" ? raw.id.trim() : "";
    delete payload.id;

    const reference = requestedId && validSegment(requestedId)
      ? adminDb.collection(collection).doc(requestedId)
      : adminDb.collection(collection).doc();

    await reference.set({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      mobileAdminActorUid: actor.uid,
    }, { merge: false });

    return NextResponse.json({ ok: true, id: reference.id }, { status: 201 });
  } catch (error) {
    const result = adminMobileError(error);
    if (result.status === 500) console.error("[MOBILE ADMIN CREATE]", error);
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }
}
