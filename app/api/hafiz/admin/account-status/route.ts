import { NextRequest } from "next/server";
import { updateAccountStatus } from "@/lib/hafiz/admin-repository";
import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest) {
  try { return noStoreJSON(await updateAccountStatus(await requireHafizContext(request, ["ADMIN"]), await request.json())); }
  catch (error) { return hafizErrorResponse(error, "ADMIN ACCOUNT STATUS"); }
}
