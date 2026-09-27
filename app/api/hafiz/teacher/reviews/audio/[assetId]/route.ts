import { NextRequest, NextResponse } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse } from "@/lib/hafiz/http";
import { readProtectedAudio } from "@/lib/hafiz/review-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ assetId: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    const audio = await readProtectedAudio(context, (await routeContext.params).assetId);
    const body = new Uint8Array(audio.bytes).buffer as ArrayBuffer;
    return new NextResponse(body, { headers: {
      "content-type": audio.mimeType,
      "cache-control": "private, no-store, max-age=0",
      "content-disposition": "inline",
      "x-content-type-options": "nosniff",
      "vary": "Authorization",
    } });
  } catch (error) {
    return hafizErrorResponse(error, "PROTECTED REVIEW AUDIO");
  }
}
