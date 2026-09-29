import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import {
  createTeacherClass,
  getTeacherClassManagement,
  updateTeacherClass,
} from "@/lib/hafiz/teacher-class-management-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await getTeacherClassManagement(context));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER CLASS MANAGEMENT GET");
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await createTeacherClass(context, await request.json()), 201);
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER CLASS MANAGEMENT CREATE");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    return noStoreJSON(await updateTeacherClass(context, await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER CLASS MANAGEMENT UPDATE");
  }
}
