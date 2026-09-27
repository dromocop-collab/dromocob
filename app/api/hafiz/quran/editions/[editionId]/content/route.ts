import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getQuranContent } from "@/lib/hafiz/quran-repository";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ editionId: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["TEACHER", "ADMIN"]);
    const mode = request.nextUrl.searchParams.get("mode");
    if (mode !== "page" && mode !== "surah" && mode !== "juz") throw new Error("INVALID_MODE");
    const value = Number(request.nextUrl.searchParams.get("value"));
    return noStoreJSON(await getQuranContent(
      context,
      (await routeContext.params).editionId,
      mode,
      value,
    ));
  } catch (error) {
    return hafizErrorResponse(error, "QURAN CONTENT");
  }
}
