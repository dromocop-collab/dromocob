import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import {
  createDirectoryRecord,
  listDirectory,
  type DirectoryResource,
  updateDirectoryRecord,
} from "@/lib/hafiz/directory";
import { hafizErrorResponse, noStoreJSON } from "@/lib/hafiz/http";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const resource = parseResource((await routeContext.params).resource);
    return noStoreJSON(await listDirectory(context, resource, request.nextUrl.searchParams));
  } catch (error) {
    return hafizErrorResponse(error, "ADMIN DIRECTORY GET");
  }
}

export async function POST(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const resource = parseResource((await routeContext.params).resource);
    return noStoreJSON(
      await createDirectoryRecord(context, resource, await request.json()),
      201,
    );
  } catch (error) {
    return hafizErrorResponse(error, "ADMIN DIRECTORY POST");
  }
}

export async function PATCH(request: NextRequest, routeContext: Context) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const resource = parseResource((await routeContext.params).resource);
    const body = await request.json() as { id?: unknown };
    if (typeof body.id !== "string" || !body.id) throw new Error("INVALID_ID");
    return noStoreJSON(await updateDirectoryRecord(context, resource, body.id, body));
  } catch (error) {
    return hafizErrorResponse(error, "ADMIN DIRECTORY PATCH");
  }
}

function parseResource(value: string): DirectoryResource {
  if (["institutions", "teachers", "students", "parents", "classes"].includes(value)) {
    return value as DirectoryResource;
  }
  throw new Error("INVALID_RESOURCE");
}
