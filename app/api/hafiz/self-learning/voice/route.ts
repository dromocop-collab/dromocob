import { NextRequest, NextResponse } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse } from "@/lib/hafiz/http";
import { learningVoiceAudio } from "@/lib/hafiz/learning-voice-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["STUDENT"]);
    const body = await request.json();
    const audio = await learningVoiceAudio(context, body?.profile, body?.text);
    return new NextResponse(new Uint8Array(audio.bytes).buffer as ArrayBuffer, {
      headers: {
        "content-type": "audio/aac",
        "cache-control": "private, max-age=31536000, immutable",
        "content-disposition": "inline",
        "x-content-type-options": "nosniff",
        "x-hafiz-voice-cache-key": audio.cacheKey,
        "vary": "Authorization",
      },
    });
  } catch (error) {
    return hafizErrorResponse(error, "SELF LEARNING VOICE");
  }
}
