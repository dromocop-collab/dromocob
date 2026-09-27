import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { updateQuranEditionStatus } from "@/lib/hafiz/quran-repository";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ editionId: string }> };

export async function PATCH(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const body = await request.json() as { status?: unknown };
    if (body.status !== "ACTIVE" && body.status !== "INACTIVE") throw new Error("INVALID_STATUS");
    return noStoreJSON(await updateQuranEditionStatus(
      context,
      (await routeContext.params).editionId,
      body.status,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "QURAN EDITION STATUS");
  }
}
