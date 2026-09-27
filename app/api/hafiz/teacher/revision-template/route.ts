import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { getRevisionTemplate, updateRevisionTemplate } from "@/lib/hafiz/mastery-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await getRevisionTemplate(context, "TEACHER"));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER REVISION TEMPLATE");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await updateRevisionTemplate(context, "TEACHER", await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER REVISION TEMPLATE UPDATE");
  }
}
