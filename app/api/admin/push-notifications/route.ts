import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase-admin";
import { sendAPNS } from "@/lib/apns";

export const dynamic = "force-dynamic";

const APP_TOPICS = {
  dromocob: "com.cihat.dromocob",
  calorievision: "com.cihat.Kalori-Merkezi",
} as const;

function clean(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

function serializeCampaign(id: string, value: FirebaseFirestore.DocumentData) {
  const date = value.createdAt?.toDate?.();
  return { id, ...value, createdAt: date instanceof Date ? date.toISOString() : null };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin", "support"]);
    const snapshot = await adminDb.collection("push_campaigns").orderBy("createdAt", "desc").limit(30).get();
    const tokenSnapshots = await Promise.all(Object.keys(APP_TOPICS).map(appId =>
      adminDb.collection("mobile_push_tokens").where("appId", "==", appId).where("active", "==", true).count().get()
    ));
    return NextResponse.json({
      ok: true,
      providerReady: Boolean(process.env.APNS_TEAM_ID && process.env.APNS_KEY_ID && process.env.APNS_PRIVATE_KEY),
      campaigns: snapshot.docs.map(document => serializeCampaign(document.id, document.data())),
      audiences: Object.keys(APP_TOPICS).reduce<Record<string, number>>((result, appId, index) => {
        result[appId] = tokenSnapshots[index].data().count;
        return result;
      }, {}),
    }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    return responseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminRole(request.headers.get("authorization"), ["super_admin", "admin"]);
    const body = await request.json() as Record<string, unknown>;
    const appId = clean(body.appId, 40) as keyof typeof APP_TOPICS;
    const title = clean(body.title, 80);
    const message = clean(body.body, 240);
    const deepLink = clean(body.deepLink, 500);
    if (!(appId in APP_TOPICS) || title.length < 2 || message.length < 2) {
      return NextResponse.json({ ok: false, error: "INVALID_CAMPAIGN" }, { status: 400 });
    }
    if (deepLink && !/^(https:\/\/|[a-z][a-z0-9+.-]*:\/\/)/i.test(deepLink)) {
      return NextResponse.json({ ok: false, error: "INVALID_DEEP_LINK" }, { status: 400 });
    }

    const campaignRef = adminDb.collection("push_campaigns").doc();
    await campaignRef.set({
      appId, title, body: message, deepLink: deepLink || null,
      status: "sending", matched: 0, successCount: 0, failureCount: 0,
      createdBy: admin.uid, createdByEmail: admin.email || null,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });

    const snapshot = await adminDb.collection("mobile_push_tokens")
      .where("appId", "==", appId).where("active", "==", true).limit(2000).get();
    const results: PromiseSettledResult<Awaited<ReturnType<typeof sendAPNS>>>[] = [];
    for (let offset = 0; offset < snapshot.docs.length; offset += 25) {
      const batch = snapshot.docs.slice(offset, offset + 25);
      const batchResults = await Promise.allSettled(batch.map(async document => {
        const data = document.data();
        const result = await sendAPNS({
          token: String(data.token || ""), topic: APP_TOPICS[appId],
          environment: data.environment === "sandbox" ? "sandbox" : "production",
          title, body: message, deepLink: deepLink || undefined,
        });
        if (!result.ok && ["BadDeviceToken", "Unregistered", "DeviceTokenNotForTopic"].includes(result.reason || "")) {
          await document.ref.set({ active: false, invalidatedAt: FieldValue.serverTimestamp(), invalidReason: result.reason }, { merge: true });
        }
        return result;
      }));
      results.push(...batchResults);
    }
    const successCount = results.filter(result => result.status === "fulfilled" && result.value.ok).length;
    const failureCount = results.length - successCount;
    const status = results.length === 0 ? "no_audience" : failureCount === 0 ? "sent" : successCount > 0 ? "partial" : "failed";
    await campaignRef.update({ matched: results.length, successCount, failureCount, status, sentAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ ok: true, campaignId: campaignRef.id, matched: results.length, successCount, failureCount, status });
  } catch (error) {
    return responseError(error);
  }
}

function responseError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : message === "APNS_NOT_CONFIGURED" ? 503 : 500;
  if (status === 500) console.error("[PUSH CAMPAIGN]", error);
  return NextResponse.json({ ok: false, error: status === 503 ? "APNS_NOT_CONFIGURED" : status < 500 ? message : "PUSH_CAMPAIGN_FAILED" }, { status });
}
