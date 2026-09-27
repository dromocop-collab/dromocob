import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { noStoreJSON } from "@/lib/hafiz/http";
import { bootstrapHafizWebAdmin } from "@/lib/hafiz/web-admin-bootstrap";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    return noStoreJSON(await bootstrapHafizWebAdmin(request.headers.get("authorization")));
  } catch (error) {
    const message = error instanceof Error ? error.message : "REQUEST_FAILED";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("[HAFIZ WEB ADMIN BOOTSTRAP]", error);
    return NextResponse.json(
      { code: status === 401 ? "AUTH_REQUIRED" : status === 403 ? "ADMIN_REQUIRED" : "REQUEST_FAILED" },
      { status, headers: { "cache-control": "private, no-store, max-age=0", vary: "Authorization" } },
    );
  }
}
