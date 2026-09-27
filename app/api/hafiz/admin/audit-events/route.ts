import { NextRequest } from "next/server";
import { listAuditEvents } from "@/lib/hafiz/admin-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try { return noStoreJSON(await listAuditEvents(await requireHafizContext(request, ["ADMIN"]), request.nextUrl.searchParams)); }
  catch (error) { return hafizErrorResponse(error, "ADMIN AUDIT EVENTS"); }
}
