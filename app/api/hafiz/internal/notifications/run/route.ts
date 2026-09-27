import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { runNotificationCycle } from "@/lib/hafiz/notification-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const expected = process.env.HAFIZ_NOTIFICATION_CRON_SECRET || "";
  const received = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!expected || !secureEqual(expected, received)) {
    return NextResponse.json({ ok: false, code: "CRON_FORBIDDEN" }, { status: 403 });
  }
  try { return NextResponse.json({ ok: true, ...(await runNotificationCycle()) }); }
  catch (error) {
    console.error("[HAFIZ NOTIFICATION CYCLE]", error);
    return NextResponse.json({ ok: false, code: "NOTIFICATION_CYCLE_FAILED" }, { status: 500 });
  }
}

function secureEqual(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}
