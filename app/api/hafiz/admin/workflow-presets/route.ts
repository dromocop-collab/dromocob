import { NextRequest } from "next/server";
import { listWorkflowPresets, saveWorkflowPreset } from "@/lib/hafiz/admin-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try { return noStoreJSON(await listWorkflowPresets(await requireHafizContext(request, ["ADMIN"]))); }
  catch (error) { return hafizErrorResponse(error, "ADMIN WORKFLOW PRESETS"); }
}
export async function PUT(request: NextRequest) {
  try { return noStoreJSON(await saveWorkflowPreset(await requireHafizContext(request, ["ADMIN"]), await request.json())); }
  catch (error) { return hafizErrorResponse(error, "ADMIN WORKFLOW PRESET UPDATE"); }
}
