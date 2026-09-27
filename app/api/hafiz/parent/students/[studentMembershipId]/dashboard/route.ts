import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getParentStudentDashboard } from "@/lib/hafiz/parent-dashboard-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ studentMembershipId: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["PARENT"]);
    return noStoreJSON(await getParentStudentDashboard(
      context, (await routeContext.params).studentMembershipId,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "PARENT STUDENT DASHBOARD");
  }
}
