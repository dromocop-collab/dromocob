import { NextRequest } from "next/server";

import { createAssignmentRevision } from "@/lib/hafiz/assignment-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ assignmentId: string }> };

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await createAssignmentRevision(
      context,
      (await routeContext.params).assignmentId,
    ), 201);
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENT REVISION");
  }
}
