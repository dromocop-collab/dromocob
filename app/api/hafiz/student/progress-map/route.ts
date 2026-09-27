import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getStudentProgressMap } from "@/lib/hafiz/mastery-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["STUDENT"]);
    return noStoreJSON(await getStudentProgressMap(context));
  } catch (error) {
    return hafizErrorResponse(error, "STUDENT MASTERY MAP");
  }
}
