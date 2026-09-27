import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { previewQuranSelection } from "@/lib/hafiz/quran-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER", "ADMIN"]);
    return noStoreJSON(await previewQuranSelection(context, await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "QURAN SELECTION PREVIEW");
  }
}
