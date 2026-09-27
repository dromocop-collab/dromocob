import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { updateTeacherRecipientPriority } from "@/lib/hafiz/teacher-dashboard-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ recipientId: string }> };

export async function PATCH(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    const body = await request.json() as { priority?: unknown };
    return noStoreJSON(await updateTeacherRecipientPriority(
      context, (await routeContext.params).recipientId, body.priority,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER REVIEW PRIORITY");
  }
}
