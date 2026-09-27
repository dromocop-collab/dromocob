import { NextRequest } from "next/server";

import { publishAssignment } from "@/lib/hafiz/assignment-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ assignmentId: string }> };

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    const body = await request.json().catch(() => ({})) as { activate?: unknown };
    return noStoreJSON(await publishAssignment(
      context,
      (await routeContext.params).assignmentId,
      body.activate !== false,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENT PUBLISH");
  }
}
