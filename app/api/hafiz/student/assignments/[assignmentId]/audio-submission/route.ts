import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { uploadStudentAudioSubmission } from "@/lib/hafiz/student-assignment-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ assignmentId: string }> };

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["STUDENT"]);
    const stepID = request.headers.get("x-hafiz-step-id") || "";
    const clientEventID = request.headers.get("x-hafiz-event-id") || "";
    const mimeType = request.headers.get("content-type") || "application/octet-stream";
    const declaredSize = Number(request.headers.get("content-length") || 0);
    if (declaredSize > 15 * 1024 * 1024) {
      return noStoreJSON(
        { code: "AUDIO_TOO_LARGE", message: "Ses kaydı 15 MB sınırını aşamaz." },
        413,
      );
    }
    const bytes = Buffer.from(await request.arrayBuffer());
    return noStoreJSON(await uploadStudentAudioSubmission(
      context,
      (await routeContext.params).assignmentId,
      stepID,
      clientEventID,
      mimeType,
      bytes,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "STUDENT AUDIO SUBMISSION");
  }
}
