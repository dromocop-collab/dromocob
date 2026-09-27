import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getStudentToday } from "@/lib/hafiz/student-assignment-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["STUDENT"]);
    return noStoreJSON(await getStudentToday(context));
  } catch (error) {
    return hafizErrorResponse(error, "STUDENT TODAY");
  }
}
