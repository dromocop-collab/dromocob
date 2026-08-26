import { NextResponse } from "next/server";
import { syncAppStore } from "@/lib/app-store-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pulse = await syncAppStore();
    return NextResponse.json(pulse, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("[APP STORE MONITOR] Public sync failed", error);
    return NextResponse.json({ ok: false, error: "APP_STORE_UNAVAILABLE" }, { status: 503 });
  }
}
