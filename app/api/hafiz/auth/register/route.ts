import type { NextRequest } from "next/server";

import { requireFirebaseIdentity } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import {
  getRegistrationStatus,
  submitRegistrationRequest,
} from "@/lib/hafiz/registration-repository";

export async function GET(request: NextRequest) {
  try {
    const identity = await requireFirebaseIdentity(request);
    return noStoreJSON(await getRegistrationStatus(identity));
  } catch (error) {
    return hafizErrorResponse(error, "AUTH REGISTER STATUS");
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireFirebaseIdentity(request);
    return noStoreJSON(await submitRegistrationRequest(identity, await request.json()), 201);
  } catch (error) {
    return hafizErrorResponse(error, "AUTH REGISTER");
  }
}
