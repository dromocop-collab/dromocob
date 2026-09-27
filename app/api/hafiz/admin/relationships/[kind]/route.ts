import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";
import {
  createRelationship,
  listRelationships,
  type RelationshipKind,
  updateRelationship,
} from "@/lib/hafiz/relationships";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ kind: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const kind = parseKind((await routeContext.params).kind);
    return noStoreJSON(await listRelationships(context, kind, request.nextUrl.searchParams));
  } catch (error) {
    return hafizErrorResponse(error, "RELATIONSHIP GET");
  }
}

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const kind = parseKind((await routeContext.params).kind);
    return noStoreJSON(await createRelationship(context, kind, await request.json()), 201);
  } catch (error) {
    return hafizErrorResponse(error, "RELATIONSHIP POST");
  }
}

export async function PATCH(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const kind = parseKind((await routeContext.params).kind);
    const body = await request.json() as { id?: unknown };
    if (typeof body.id !== "string" || !body.id) throw new Error("INVALID_ID");
    return noStoreJSON(await updateRelationship(context, kind, body.id, body));
  } catch (error) {
    return hafizErrorResponse(error, "RELATIONSHIP PATCH");
  }
}

function parseKind(value: string): RelationshipKind {
  if (["classMembership", "teacherClassAssignment", "parentStudentLink"].includes(value)) {
    return value as RelationshipKind;
  }
  throw new Error("INVALID_RELATIONSHIP_KIND");
}
