import { NextResponse } from "next/server";
import { syncAppStore } from "@/lib/app-store-monitor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    return NextResponse.json(await syncAppStore(true));
  } catch (error) {
    console.error("[APP STORE MONITOR] Scheduled sync failed", error);
    return NextResponse.json({ ok: false, error: "SYNC_FAILED" }, { status: 503 });
  }
}
