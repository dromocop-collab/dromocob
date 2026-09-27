import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { listTeacherClasses } from "@/lib/hafiz/relationships";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await listTeacherClasses(context));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER CLASSES");
  }
}
