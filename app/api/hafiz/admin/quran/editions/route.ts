import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { listAdminQuranEditions } from "@/lib/hafiz/quran-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    return noStoreJSON(await listAdminQuranEditions(context));
  } catch (error) {
    return hafizErrorResponse(error, "ADMIN QURAN EDITIONS");
  }
}
