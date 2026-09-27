import { NextRequest } from "next/server";
import { getSystemConfiguration, updateSystemConfiguration } from "@/lib/hafiz/admin-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try { return noStoreJSON(await getSystemConfiguration(await requireHafizContext(request, ["ADMIN"]))); }
  catch (error) { return hafizErrorResponse(error, "ADMIN SYSTEM GET"); }
}
export async function PUT(request: NextRequest) {
  try { return noStoreJSON(await updateSystemConfiguration(await requireHafizContext(request, ["ADMIN"]), await request.json())); }
  catch (error) { return hafizErrorResponse(error, "ADMIN SYSTEM UPDATE"); }
}
