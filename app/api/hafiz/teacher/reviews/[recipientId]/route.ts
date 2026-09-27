import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getTeacherReview, submitTeacherReview } from "@/lib/hafiz/review-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ recipientId: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await getTeacherReview(context, (await routeContext.params).recipientId));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER REVIEW DETAIL");
  }
}

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await submitTeacherReview(
      context, (await routeContext.params).recipientId, await request.json(),
    ));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER REVIEW DECISION");
  }
}
