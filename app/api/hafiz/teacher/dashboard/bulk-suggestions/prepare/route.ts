import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { prepareBulkAssignmentDraft } from "@/lib/hafiz/teacher-dashboard-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await prepareBulkAssignmentDraft(context, await request.json()), 201);
  } catch (error) {
    return hafizErrorResponse(error, "OPERATIONAL BULK DRAFT PREPARE");
  }
}
