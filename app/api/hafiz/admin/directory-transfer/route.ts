import { NextRequest, NextResponse } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { transferDirectoryEntityInstitution } from "@/lib/hafiz/admin-repository";

export async function POST(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["ADMIN"]);
    const result = await transferDirectoryEntityInstitution(context, await request.json());
    return NextResponse.json(result);
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error
      ? Number((error as { status: number }).status)
      : 500;
    const message = error instanceof Error ? error.message : "Kurum taşıma işlemi tamamlanamadı.";
    return NextResponse.json({ error: message }, { status });
  }
}
