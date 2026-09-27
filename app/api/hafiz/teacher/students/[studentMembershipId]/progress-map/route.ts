import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getTeacherStudentProgressMap } from "@/lib/hafiz/mastery-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ studentMembershipId: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await getTeacherStudentProgressMap(
      context, (await routeContext.params).studentMembershipId,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER STUDENT MASTERY MAP");
  }
}
