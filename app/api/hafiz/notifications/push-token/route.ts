import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { registerHafizPushToken } from "@/lib/hafiz/notification-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request);
    return noStoreJSON(await registerHafizPushToken(context, await request.json()));
  } catch (error) { return hafizErrorResponse(error, "PUSH TOKEN"); }
}
