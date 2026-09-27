import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import {
  importApprovedQuranDataset,
  validateQuranImport,
} from "@/lib/hafiz/quran-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const body = await request.json() as { mode?: unknown; dataset?: unknown };
    if (body.mode === "validate") {
      return noStoreJSON(await validateQuranImport(context, body.dataset));
    }
    if (body.mode === "import") {
      return noStoreJSON(await importApprovedQuranDataset(context, body.dataset), 201);
    }
    throw new Error("INVALID_IMPORT_MODE");
  } catch (error) {
    return hafizErrorResponse(error, "QURAN IMPORT");
  }
}
