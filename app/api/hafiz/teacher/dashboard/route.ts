import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getTeacherOperationalDashboard } from "@/lib/hafiz/teacher-dashboard-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await getTeacherOperationalDashboard(context, {
      classID: request.nextUrl.searchParams.get("classId"),
      start: request.nextUrl.searchParams.get("start"),
      end: request.nextUrl.searchParams.get("end"),
    }));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER OPERATIONAL DASHBOARD");
  }
}
