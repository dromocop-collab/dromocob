import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { updateRevisionSuggestion } from "@/lib/hafiz/mastery-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ suggestionId: string }> };

export async function PATCH(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await updateRevisionSuggestion(
      context, (await routeContext.params).suggestionId, await request.json(),
    ));
  } catch (error) {
    return hafizErrorResponse(error, "REVISION SUGGESTION UPDATE");
  }
}
