import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { replyToStudentHelpRequest } from "@/lib/hafiz/review-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ requestId: string }> };

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await replyToStudentHelpRequest(
      context,
      (await routeContext.params).requestId,
      await request.json(),
    ));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER HELP REPLY");
  }
}
