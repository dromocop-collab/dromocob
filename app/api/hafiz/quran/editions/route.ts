import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { listQuranEditions } from "@/lib/hafiz/quran-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER", "ADMIN"]);
    return noStoreJSON(await listQuranEditions(context));
  } catch (error) {
    return hafizErrorResponse(error, "QURAN EDITIONS");
  }
}
