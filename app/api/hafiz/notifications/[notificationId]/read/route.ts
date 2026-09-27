import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { markHafizNotificationRead } from "@/lib/hafiz/notification-repository";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ notificationId: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const context = await requireHafizContext(request);
    return noStoreJSON(await markHafizNotificationRead(context, (await params).notificationId));
  } catch (error) { return hafizErrorResponse(error, "NOTIFICATION READ"); }
}
