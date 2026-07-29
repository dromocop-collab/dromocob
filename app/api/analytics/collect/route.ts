import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const EVENT_NAMES = new Set(["page_view", "heartbeat", "click", "scroll", "page_exit"]);
const rate = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, limit) : "";
}

function clientIp(request: NextRequest) {
  return clean(request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown", 64);
}

function deviceType(userAgent: string) {
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const now = Date.now();
  const current = rate.get(ip);
  if (!current || current.resetAt < now) rate.set(ip, { count: 1, resetAt: now + 60_000 });
  else if (++current.count > 120) return new NextResponse("Too many requests", { status: 429 });

  try {
    const body = await request.json() as { sessionId?: unknown; visitorId?: unknown; events?: unknown };
    const sessionId = clean(body.sessionId, 80);
    const visitorId = clean(body.visitorId, 80);
    const events: Record<string, unknown>[] = Array.isArray(body.events)
      ? body.events.filter((event): event is Record<string, unknown> => Boolean(event) && typeof event === "object").slice(0, 20)
      : [];
    if (!/^s_[a-z0-9]+$/i.test(sessionId) || !/^v_[a-z0-9]+$/i.test(visitorId) || !events.length) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const userAgent = clean(request.headers.get("user-agent"), 500);
    const country = clean(request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry"), 8);
    const city = clean(request.headers.get("x-vercel-ip-city"), 100);
    const validEvents = events.filter(event => typeof event.name === "string" && EVENT_NAMES.has(event.name));
    if (!validEvents.length) return new NextResponse("Invalid events", { status: 400 });

    const batch = adminDb.batch();
    const sessionRef = adminDb.collection("analytics_sessions").doc(sessionId);
    let lastPage = "";

    for (const event of validEvents) {
      const page = clean(event.page, 500) || "/";
      lastPage = page;
      const ref = adminDb.collection("analytics_events").doc();
      batch.set(ref, {
        name: event.name,
        sessionId,
        visitorId,
        page,
        title: clean(event.title, 160),
        label: clean(event.label, 100),
        target: clean(event.target, 300),
        referrer: clean(event.referrer, 500),
        screen: clean(event.screen, 30),
        language: clean(event.language, 20),
        duration: Math.max(0, Math.min(86_400, Number(event.duration) || 0)),
        scrollDepth: Math.max(0, Math.min(100, Number(event.scrollDepth) || 0)),
        device: deviceType(userAgent),
        country,
        city,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    batch.set(sessionRef, {
      sessionId,
      visitorId,
      currentPage: lastPage,
      device: deviceType(userAgent),
      country,
      city,
      userAgent,
      lastSeenAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      firstSeenAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[ANALYTICS COLLECT]", error);
    return new NextResponse("Collect failed", { status: 500 });
  }
}
