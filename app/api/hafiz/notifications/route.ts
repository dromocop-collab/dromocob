import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { listHafizNotifications } from "@/lib/hafiz/notification-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request);
    return noStoreJSON(await listHafizNotifications(context));
  } catch (error) { return hafizErrorResponse(error, "NOTIFICATIONS"); }
}
