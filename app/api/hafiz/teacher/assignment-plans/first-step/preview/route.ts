import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { previewFirstStepPlan } from "@/lib/hafiz/weekly-assignment-plan-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await previewFirstStepPlan(context, await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "FIRST STEP PLAN PREVIEW");
  }
}
