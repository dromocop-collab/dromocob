import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { createRevisionDraft } from "@/lib/hafiz/mastery-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ suggestionId: string }> };

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await createRevisionDraft(
      context, (await routeContext.params).suggestionId,
    ), 201);
  } catch (error) {
    return hafizErrorResponse(error, "REVISION DRAFT CREATE");
  }
}
