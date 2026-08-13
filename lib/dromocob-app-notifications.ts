import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { apnsConfigurationStatus, sendAPNS } from "@/lib/apns";
import { adminDb } from "@/lib/firebase-admin";

const APP_ID = "dromocob";
const APP_TOPIC = "com.cihat.dromocob";
const INVALID_TOKEN_REASONS = new Set(["BadDeviceToken", "Unregistered", "DeviceTokenNotForTopic"]);

export type DromocobNotificationKind = "chat_message" | "quote_request" | "contact_request";

type NotificationInput = {
  eventId: string;
  kind: DromocobNotificationKind;
  title: string;
  body: string;
  deepLink: string;
  entityId: string;
};

type PushResult = Awaited<ReturnType<typeof sendAPNS>>;

function eventDocumentId(eventId: string) {
  return createHash("sha256").update(`${APP_ID}:${eventId}`).digest("hex");
}

function failureSummary(results: PromiseSettledResult<PushResult>[]) {
  const summary: Record<string, number> = {};
  for (const result of results) {
    const reason = result.status === "fulfilled"
      ? (result.value.ok ? "" : result.value.reason || `HTTP_${result.value.status}`)
      : "APNS_CONNECTION_ERROR";
    if (reason) summary[reason] = (summary[reason] || 0) + 1;
  }
  return summary;
}

export async function notifyDromocobApp(input: NotificationInput) {
  const eventRef = adminDb.collection("app_notification_events").doc(eventDocumentId(input.eventId));
  const claimed = await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(eventRef);
    const current = snapshot.data();
    if (snapshot.exists && ["sending", "sent", "partial", "no_audience"].includes(String(current?.status || ""))) {
      return false;
    }
    transaction.set(eventRef, {
      appId: APP_ID,
      eventId: input.eventId,
      kind: input.kind,
      entityId: input.entityId,
      title: input.title.slice(0, 80),
      body: input.body.slice(0, 240),
      deepLink: input.deepLink.slice(0, 500),
      status: "sending",
      attempts: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: current?.createdAt || FieldValue.serverTimestamp(),
    }, { merge: true });
    return true;
  });

  if (!claimed) return { ok: true, duplicate: true, status: "duplicate", matched: 0, successCount: 0 };

  const provider = apnsConfigurationStatus();
  if (!provider.ready) {
    await eventRef.set({ status: "provider_unavailable", providerMissing: provider.missing, providerInvalid: provider.invalid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { ok: false, duplicate: false, status: "provider_unavailable", matched: 0, successCount: 0 };
  }

  try {
    const snapshot = await adminDb.collection("mobile_push_tokens")
      .where("appId", "==", APP_ID).where("active", "==", true).limit(2000).get();
    const adminDocuments = snapshot.docs.filter(document => document.data().adminAuthorized === true);
    const results: PromiseSettledResult<PushResult>[] = [];

    for (let offset = 0; offset < adminDocuments.length; offset += 25) {
      const documents = adminDocuments.slice(offset, offset + 25);
      const batchResults = await Promise.allSettled(documents.map(async document => {
        const data = document.data();
        const token = String(data.token || "");
        let environment: "sandbox" | "production" = data.environment === "sandbox" ? "sandbox" : "production";
        let result = await sendAPNS({ token, topic: APP_TOPIC, environment, title: input.title, body: input.body, deepLink: input.deepLink });

        if (!result.ok && result.reason === "BadDeviceToken") {
          const fallbackEnvironment = environment === "sandbox" ? "production" : "sandbox";
          const fallback = await sendAPNS({ token, topic: APP_TOPIC, environment: fallbackEnvironment, title: input.title, body: input.body, deepLink: input.deepLink });
          if (fallback.ok) {
            result = fallback;
            environment = fallbackEnvironment;
            await document.ref.set({ environment, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
          }
        }

        if (!result.ok && INVALID_TOKEN_REASONS.has(result.reason || "")) {
          await document.ref.set({ active: false, invalidatedAt: FieldValue.serverTimestamp(), invalidReason: result.reason }, { merge: true });
        }
        return result;
      }));
      results.push(...batchResults);
    }

    const successCount = results.filter(result => result.status === "fulfilled" && result.value.ok).length;
    const failureCount = results.length - successCount;
    const status = results.length === 0 ? "no_audience" : failureCount === 0 ? "sent" : successCount > 0 ? "partial" : "failed";
    await eventRef.set({
      status,
      matched: results.length,
      successCount,
      failureCount,
      failureReasons: failureSummary(results),
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return { ok: successCount > 0 || results.length === 0, duplicate: false, status, matched: results.length, successCount };
  } catch (error) {
    await eventRef.set({ status: "failed", failureReasons: { INTERNAL_ERROR: 1 }, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    throw error;
  }
}
