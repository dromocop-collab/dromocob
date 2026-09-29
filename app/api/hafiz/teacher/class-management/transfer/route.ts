import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import { transferTeacherStudent } from "@/lib/hafiz/teacher-class-management-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await transferTeacherStudent(context, await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER STUDENT CLASS TRANSFER");
  }
}
