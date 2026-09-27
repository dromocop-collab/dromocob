import { NextRequest } from "next/server";

import { updateAssignmentStatus } from "@/lib/hafiz/assignment-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ assignmentId: string }> };

export async function PATCH(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    const body = await request.json() as { status?: unknown };
    return noStoreJSON(await updateAssignmentStatus(
      context,
      (await routeContext.params).assignmentId,
      body.status,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENT STATUS");
  }
}
