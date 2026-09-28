import type { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { syncSelfLearningProgress } from "@/lib/hafiz/self-learning-repository";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["STUDENT", "TEACHER", "PARENT"]);
    const body = await request.json();
    return noStoreJSON(await syncSelfLearningProgress(context, body));
  } catch (error) {
    return hafizErrorResponse(error, "SELF LEARNING PROGRESS");
  }
}
