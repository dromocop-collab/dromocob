import type { NextResponse } from "next/server";
import { NextResponse as Response } from "next/server";

import { HafizAuthorizationError } from "@/lib/hafiz/authorization";

export function noStoreJSON(body: unknown, status = 200): NextResponse {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "vary": "Authorization",
    },
  });
}

export function hafizErrorResponse(error: unknown, label: string): NextResponse {
  if (error instanceof HafizAuthorizationError) {
    return noStoreJSON({ code: error.code, message: error.message }, error.status);
  }
  console.error(`[HAFIZ ${label}]`, error);
  return noStoreJSON(
    { code: "REQUEST_FAILED", message: "İşlem tamamlanamadı." },
    500,
  );
}
