import type { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import {
  loadSelfLearningLeague,
  type SelfLearningLeagueScope,
} from "@/lib/hafiz/self-learning-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["STUDENT"]);
    const requested = request.nextUrl.searchParams.get("scope")?.toUpperCase();
    const scope: SelfLearningLeagueScope = requested === "GLOBAL" ? "GLOBAL" : "INSTITUTION";
    return noStoreJSON(await loadSelfLearningLeague(context, scope));
  } catch (error) {
    return hafizErrorResponse(error, "SELF LEARNING LEAGUE");
  }
}
