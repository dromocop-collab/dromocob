import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const mobileAdminCollections = new Set([
  "projects",
  "packages",
  "quote_questions",
  "quote_rules",
  "quote_engine_versions",
  "chat_sessions",
  "managed_sites",
  "site_events",
  "customer_sites",
  "customer_site_admin",
  "contacts",
  "quotes",
  "newsletter_subscribers",
  "newsletter_campaigns",
  "site_settings",
]);

export const mobileAdminWritableCollections = new Set([
  "projects",
  "packages",
  "quote_questions",
  "quote_rules",
  "customer_sites",
  "customer_site_admin",
  "contacts",
  "quotes",
  "newsletter_subscribers",
  "site_settings",
]);

export const mobileAdminDeletableCollections = new Set([
  "projects",
  "packages",
  "quote_questions",
  "quote_rules",
  "customer_sites",
  "newsletter_subscribers",
]);

const blockedKeys = new Set([
  "secret",
  "controlSecret",
  "password",
  "passwordHash",
  "token",
  "refreshToken",
  "apiKey",
  "privateKey",
]);

export function validSegment(value: string) {
  return Boolean(value && value.length <= 160 && !value.includes("/"));
}

export function cleanAdminPayload(value: unknown, depth = 0): unknown {
  if (depth > 8) throw new Error("PAYLOAD_TOO_DEEP");
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return typeof value === "string" ? value.slice(0, 20_000) : value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("INVALID_NUMBER");
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 500).map(item => cleanAdminPayload(item, depth + 1));
  }
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, 200)) {
      if (!validSegment(key) || blockedKeys.has(key)) continue;
      result[key] = cleanAdminPayload(item, depth + 1);
    }
    return result;
  }
  return null;
}

export function serializeAdminValue(value: unknown, depth = 0): unknown {
  if (depth > 10) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(item => serializeAdminValue(item, depth + 1));
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (blockedKeys.has(key)) continue;
      result[key] = serializeAdminValue(item, depth + 1);
    }
    return result;
  }
  return value;
}

export function withServerUpdate(payload: Record<string, unknown>) {
  return {
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

export function adminMobileError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return { status: 401, message };
  if (message === "FORBIDDEN") return { status: 403, message };
  if (message.startsWith("INVALID_") || message === "PAYLOAD_TOO_DEEP") {
    return { status: 400, message };
  }
  return { status: 500, message: "MOBILE_ADMIN_REQUEST_FAILED" };
}
