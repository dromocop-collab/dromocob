import { NextRequest, NextResponse } from "next/server";

import {
  HafizAuthorizationError,
  requireHafizContext,
} from "@/lib/hafiz/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request);
    return NextResponse.json(context.session, {
      headers: { "cache-control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof HafizAuthorizationError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        {
          status: error.status,
          headers: { "cache-control": "private, no-store" },
        },
      );
    }

    console.error("[HAFIZ SESSION]", error);
    return NextResponse.json(
      { code: "SESSION_FAILED", message: "Oturum doğrulanamadı." },
      {
        status: 500,
        headers: { "cache-control": "private, no-store" },
      },
    );
  }
}
