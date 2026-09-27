import type { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import {
  listRegistrationRequests,
  reviewRegistrationRequest,
} from "@/lib/hafiz/registration-repository";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    return noStoreJSON(await listRegistrationRequests(context, request.nextUrl.searchParams));
  } catch (error) {
    return hafizErrorResponse(error, "ADMIN REGISTRATION GET");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    return noStoreJSON(await reviewRegistrationRequest(context, await request.json()));
  } catch (error) {
    return hafizErrorResponse(error, "ADMIN REGISTRATION PATCH");
  }
}
