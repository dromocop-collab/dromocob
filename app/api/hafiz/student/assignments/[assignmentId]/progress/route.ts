import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { transitionStudentAssignment } from "@/lib/hafiz/student-assignment-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ assignmentId: string }> };

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["STUDENT"]);
    return noStoreJSON(await transitionStudentAssignment(
      context,
      (await routeContext.params).assignmentId,
      await request.json(),
    ));
  } catch (error) {
    return hafizErrorResponse(error, "STUDENT ASSIGNMENT PROGRESS");
  }
}
