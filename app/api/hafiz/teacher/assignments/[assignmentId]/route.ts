import { NextRequest } from "next/server";

import { getTeacherAssignment, updateAssignmentDraft } from "@/lib/hafiz/assignment-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ assignmentId: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await getTeacherAssignment(context, (await routeContext.params).assignmentId));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENT DETAIL");
  }
}

export async function PATCH(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await updateAssignmentDraft(
      context,
      (await routeContext.params).assignmentId,
      await request.json(),
    ));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENT UPDATE");
  }
}
