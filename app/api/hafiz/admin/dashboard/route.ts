import { NextRequest } from "next/server";
import { getAdminDashboard } from "@/lib/hafiz/admin-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try { return noStoreJSON(await getAdminDashboard(await requireHafizContext(request, ["ADMIN"]), request.nextUrl.searchParams.get("institutionId"))); }
  catch (error) { return hafizErrorResponse(error, "ADMIN DASHBOARD"); }
}
