import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_GOOGLE_ADS_CONVERSION_LABEL, DEFAULT_GOOGLE_ADS_ID } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;
function iso(value: unknown) { return value && typeof value === "object" && "toDate" in value ? (value as { toDate: () => Date }).toDate().toISOString() : ""; }
function csvCell(value: unknown) { const text = String(value ?? ""); return `"${text.replaceAll('"', '""')}"`; }
function adsTime(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? "" : new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date).replace("T", " ") + "+03:00"; }

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const snapshot = await adminDb.collection("ad_conversions").orderBy("occurredAt", "desc").limit(2000).get();
    const rows: Row[] = snapshot.docs.map(document => { const data = document.data(); return { id: document.id, ...data, occurredAt: iso(data.occurredAt) }; });

    if (request.nextUrl.searchParams.get("format") === "csv") {
      const eligible = rows.filter(row => row.gclid || row.gbraid || row.wbraid);
      const header = ["Google Click ID", "GBRAID", "WBRAID", "Conversion Name", "Conversion Time", "Conversion Value", "Conversion Currency", "Order ID"];
      const lines = eligible.map(row => [row.gclid, row.gbraid, row.wbraid, row.conversionName, adsTime(String(row.occurredAt)), row.value, row.currency || "TRY", row.id].map(csvCell).join(","));
      return new NextResponse([header.map(csvCell).join(","), ...lines].join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="dromocob-google-ads-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
    }

    const totalValue = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
    const attributed = rows.filter(row => row.attributionStatus === "matched_click_id");
    const quotes = rows.filter(row => row.kind === "quote_submit");
    const byCampaign = new Map<string, { conversions: number; value: number }>();
    for (const row of rows) { const key = String(row.utmCampaign || (row.attributionStatus === "matched_click_id" ? "Google Ads / İsimsiz" : "Organik / Doğrudan")); const item = byCampaign.get(key) || { conversions: 0, value: 0 }; item.conversions++; item.value += Number(row.value || 0); byCampaign.set(key, item); }
    const settings = (await adminDb.collection("site_settings").doc("global").get()).data()?.tracking || {};
    return NextResponse.json({ ok: true, configuration: { googleAdsId: settings.googleAdsId || DEFAULT_GOOGLE_ADS_ID, conversionLabel: settings.googleAdsConversionLabel || DEFAULT_GOOGLE_ADS_CONVERSION_LABEL, consentMode: settings.consentModeEnabled !== false }, summary: { conversions: rows.length, quotes: quotes.length, attributed: attributed.length, totalValue, attributionRate: rows.length ? Math.round(attributed.length / rows.length * 100) : 0 }, campaigns: [...byCampaign].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.value - a.value), conversions: rows.slice(0, 250) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return new NextResponse(message === "UNAUTHORIZED" ? "Unauthorized" : message === "FORBIDDEN" ? "Forbidden" : "Ads data failed", { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 });
  }
}
