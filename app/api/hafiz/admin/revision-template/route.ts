import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getRevisionTemplate, updateRevisionTemplate } from "@/lib/hafiz/mastery-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    return noStoreJSON(await getRevisionTemplate(context, "INSTITUTION"));
  } catch (error) {
    return hafizErrorResponse(error, "INSTITUTION REVISION TEMPLATE");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    return noStoreJSON(await updateRevisionTemplate(context, "INSTITUTION", await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "INSTITUTION REVISION TEMPLATE UPDATE");
  }
}
