import "server-only";

import { Timestamp } from "firebase-admin/firestore";

export const PREMIUM_PLANS = ["free", "premium", "premium_plus", "lifetime"] as const;
export const PREMIUM_STATUSES = ["inactive", "active", "scheduled", "expired", "revoked"] as const;
export const PREMIUM_SOURCES = ["admin", "app_store", "promotion", "support", "migration"] as const;

export type PremiumPlan = (typeof PREMIUM_PLANS)[number];
export type PremiumStatus = (typeof PREMIUM_STATUSES)[number];
export type PremiumSource = (typeof PREMIUM_SOURCES)[number];

export type PremiumEntitlementInput = {
  active: boolean;
  plan: PremiumPlan;
  source: PremiumSource;
  startsAt: string | null;
  expiresAt: string | null;
  features: string[];
  note: string;
  reason: string;
};

const ALLOWED_FEATURES = new Set([
  "ai_scan_unlimited",
  "advanced_reports",
  "cloud_sync",
  "data_export",
  "early_access",
  "priority_support",
  "ad_free",
]);

function validDate(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) throw new Error(`INVALID_${field.toUpperCase()}`);
  return new Date(value).toISOString();
}

export function parsePremiumInput(value: unknown): PremiumEntitlementInput {
  if (!value || typeof value !== "object") throw new Error("INVALID_BODY");
  const body = value as Record<string, unknown>;
  if (typeof body.active !== "boolean") throw new Error("INVALID_ACTIVE");
  if (!PREMIUM_PLANS.includes(body.plan as PremiumPlan)) throw new Error("INVALID_PLAN");
  if (!PREMIUM_SOURCES.includes(body.source as PremiumSource)) throw new Error("INVALID_SOURCE");

  const startsAt = validDate(body.startsAt, "startsAt");
  const expiresAt = validDate(body.expiresAt, "expiresAt");
  if (startsAt && expiresAt && Date.parse(expiresAt) <= Date.parse(startsAt)) throw new Error("INVALID_DATE_RANGE");

  const features = Array.isArray(body.features)
    ? [...new Set(body.features.filter((item): item is string => typeof item === "string" && ALLOWED_FEATURES.has(item)))]
    : [];
  if (features.length > ALLOWED_FEATURES.size) throw new Error("INVALID_FEATURES");

  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : "";
  if (!reason) throw new Error("REASON_REQUIRED");

  return { active: body.active, plan: body.plan as PremiumPlan, source: body.source as PremiumSource, startsAt, expiresAt, features, note, reason };
}

export function effectivePremiumStatus(input: Pick<PremiumEntitlementInput, "active" | "startsAt" | "expiresAt">, now = Date.now()): PremiumStatus {
  if (!input.active) return "inactive";
  if (input.startsAt && Date.parse(input.startsAt) > now) return "scheduled";
  if (input.expiresAt && Date.parse(input.expiresAt) <= now) return "expired";
  return "active";
}

export function serializeAdminValue(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeAdminValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeAdminValue(item)]));
  }
  return value;
}
