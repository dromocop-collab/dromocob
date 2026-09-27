import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { listTeacherReviewQueue } from "@/lib/hafiz/review-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await listTeacherReviewQueue(context));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER REVIEW QUEUE");
  }
}
