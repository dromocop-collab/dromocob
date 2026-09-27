import { NextRequest } from "next/server";

import { createAssignmentDraft, listTeacherAssignments } from "@/lib/hafiz/assignment-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await listTeacherAssignments(context));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENTS LIST");
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await createAssignmentDraft(context, await request.json()), 201);
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENT CREATE");
  }
}
