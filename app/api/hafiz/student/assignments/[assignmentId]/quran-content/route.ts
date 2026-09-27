import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getAssignmentQuranContent } from "@/lib/hafiz/quran-repository";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ assignmentId: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["STUDENT"]);
    return noStoreJSON(await getAssignmentQuranContent(
      context,
      (await routeContext.params).assignmentId,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "STUDENT ASSIGNMENT QURAN");
  }
}
