import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { listRevisionSuggestions } from "@/lib/hafiz/mastery-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    const horizon = Number(request.nextUrl.searchParams.get("horizonDays") || 1);
    return noStoreJSON(await listRevisionSuggestions(context, horizon));
  } catch (error) {
    return hafizErrorResponse(error, "REVISION SUGGESTIONS");
  }
}
