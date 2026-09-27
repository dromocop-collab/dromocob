import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { listParentStudents } from "@/lib/hafiz/relationships";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["PARENT"]);
    return noStoreJSON(await listParentStudents(context));
  } catch (error) {
    return hafizErrorResponse(error, "PARENT STUDENTS");
  }
}
