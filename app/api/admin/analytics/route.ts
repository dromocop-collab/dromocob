import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminToken } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

function iso(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return "";
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminToken(request.headers.get("authorization"));
    const [eventsSnapshot, sessionsSnapshot] = await Promise.all([
      adminDb.collection("analytics_events").orderBy("createdAt", "desc").limit(1200).get(),
      adminDb.collection("analytics_sessions").orderBy("lastSeenAt", "desc").limit(400).get(),
    ]);

    const events: Row[] = eventsSnapshot.docs.map(doc => {
      const data: Row = doc.data();
      return { id: doc.id, ...data, createdAt: iso(data.createdAt) };
    });
    const sessions: Row[] = sessionsSnapshot.docs.map(doc => {
      const data: Row = doc.data();
      return { id: doc.id, ...data, lastSeenAt: iso(data.lastSeenAt) };
    });

    const now = Date.now();
    const activeCutoff = now - 45_000;
    const dayCutoff = now - 86_400_000;
    const live = sessions.filter(item => Date.parse(String(item.lastSeenAt)) >= activeCutoff);
    const dayEvents = events.filter(item => Date.parse(String(item.createdAt)) >= dayCutoff);
    const pageViews = dayEvents.filter(item => item.name === "page_view");
    const exits = dayEvents.filter(item => item.name === "page_exit" && Number(item.duration) > 0);
    const uniqueVisitors = new Set(pageViews.map(item => item.visitorId)).size;
    const avgDuration = exits.length ? Math.round(exits.reduce((sum, item) => sum + Number(item.duration), 0) / exits.length) : 0;
    const avgScroll = exits.length ? Math.round(exits.reduce((sum, item) => sum + Number(item.scrollDepth), 0) / exits.length) : 0;

    const countBy = (items: typeof events, key: string) => {
      const counts = new Map<string, number>();
      for (const item of items) {
        const value = String(item[key] || "Bilinmiyor");
        counts.set(value, (counts.get(value) || 0) + 1);
      }
      return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    };

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      summary: {
        activeNow: live.length,
        visitors24h: uniqueVisitors,
        pageViews24h: pageViews.length,
        avgDuration,
        avgScroll,
        interactions24h: dayEvents.filter(item => item.name === "click").length,
      },
      live: live.slice(0, 60),
      topPages: countBy(pageViews, "page").slice(0, 8),
      devices: countBy(pageViews, "device").slice(0, 4),
      sources: countBy(pageViews, "referrer").slice(0, 6),
      activity: events.filter(item => item.name !== "heartbeat").slice(0, 80),
    }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
    console.error("[ADMIN ANALYTICS]", error);
    return new NextResponse("Analytics failed", { status: 500 });
  }
}
