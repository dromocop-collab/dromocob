import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import {
  HumanVoiceUnavailableError,
  LearningVoiceRequestError,
  parseLearningVoiceRequest,
} from "@/lib/hafiz/learning-voice-policy";
import { renderLearningVoice } from "@/lib/hafiz/learning-voice";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireHafizContext(request, ["STUDENT"]);
    const voiceRequest = parseLearningVoiceRequest(await request.json());
    const audio = await renderLearningVoice(voiceRequest);
    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "content-length": String(audio.length),
        "cache-control": "private, no-store, max-age=0",
        "content-disposition": "inline; filename=hafiz-learning-voice.mp3",
        vary: "Authorization",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof LearningVoiceRequestError) {
      return noStoreJSON({ code: error.code, message: error.message }, 400);
    }
    if (error instanceof HumanVoiceUnavailableError) {
      return noStoreJSON({ code: error.code, message: error.message }, 422);
    }
    return hafizErrorResponse(error, "SELF LEARNING VOICE");
  }
}
