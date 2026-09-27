import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/hafiz/notification-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try { return noStoreJSON(await getNotificationPreferences(await requireHafizContext(request))); }
  catch (error) { return hafizErrorResponse(error, "NOTIFICATION PREFERENCES"); }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await requireHafizContext(request);
    return noStoreJSON(await updateNotificationPreferences(context, await request.json()));
  } catch (error) { return hafizErrorResponse(error, "NOTIFICATION PREFERENCES UPDATE"); }
}
