import { FieldValue } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export type ConversionKind = "quote_submit" | "contact_submit";

type Input = { request: NextRequest; kind: ConversionKind; entityId: string; name: string; email?: string; phone?: string; value: number; service?: string; sourcePath?: string };

function clean(value: unknown, max = 300) { return String(value || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }

function attribution(request: NextRequest) {
  try {
    const data = JSON.parse(decodeURIComponent(request.cookies.get("dc_ad_attribution")?.value || "")) as Record<string, unknown>;
    return { gclid: clean(data.gclid, 180), gbraid: clean(data.gbraid, 180), wbraid: clean(data.wbraid, 180), utmSource: clean(data.utm_source, 100), utmMedium: clean(data.utm_medium, 100), utmCampaign: clean(data.utm_campaign, 160), utmTerm: clean(data.utm_term, 160), utmContent: clean(data.utm_content, 160), landingPage: clean(data.landingPage, 500) };
  } catch { return { gclid: "", gbraid: "", wbraid: "", utmSource: "", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "", landingPage: "" }; }
}

export async function recordConversion(input: Input) {
  const reference = adminDb.collection("ad_conversions").doc(`${input.kind}_${input.entityId}`);
  const click = attribution(input.request);
  await reference.set({ kind: input.kind, conversionName: input.kind === "quote_submit" ? "Teklif Formu" : "İletişim Formu", entityId: input.entityId, customerName: clean(input.name, 120), customerEmail: clean(input.email, 180).toLowerCase(), customerPhone: clean(input.phone, 40), value: Math.max(0, Math.round(Number(input.value) || 0)), currency: "TRY", service: clean(input.service, 120), sourcePath: clean(input.sourcePath, 500), ...click, attributionStatus: click.gclid || click.gbraid || click.wbraid ? "matched_click_id" : "organic_or_direct", uploadStatus: "pending", occurredAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return reference.id;
}
