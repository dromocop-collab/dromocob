import { NextRequest } from "next/server";

import { transferStudentInstitution } from "@/lib/hafiz/admin-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    return noStoreJSON(await transferStudentInstitution(context, await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "ADMIN STUDENT TRANSFER");
  }
}
