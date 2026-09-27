import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getTeacherVisibleStudent } from "@/lib/hafiz/relationships";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  routeContext: { params: Promise<{ studentMembershipId: string }> },
) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(
      await getTeacherVisibleStudent(context, (await routeContext.params).studentMembershipId),
    );
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER STUDENT");
  }
}
