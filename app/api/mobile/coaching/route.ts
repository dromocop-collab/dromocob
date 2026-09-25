import { createHash, randomBytes, randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { effectivePremiumStatus } from "@/lib/mobile-premium";

export const dynamic = "force-dynamic";

const CODE_TTL_MS = 15 * 60_000;
const MAX_MEALS = 40;
const ROLES = new Set(["dietitian", "trainer"]);

function hashCode(code: string) {
  return createHash("sha256").update(`calorievision-coaching:${code}`).digest("hex");
}

function cleanCode(value: unknown) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return Array.from(bytes, value => alphabet[value % alphabet.length]).join("");
}

async function requireUser(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new Error("UNAUTHORIZED");
  return adminAuth.verifyIdToken(token);
}

async function requirePremium(uid: string) {
  const snapshot = await adminDb.collection("mobile_premium_entitlements").doc(uid).get();
  const data = snapshot.data() || {};
  const status = effectivePremiumStatus({
    active: data.active === true,
    startsAt: data.startsAt instanceof Timestamp ? data.startsAt.toDate().toISOString() : null,
    expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : null,
  });
  if (status !== "active") throw new Error("PREMIUM_REQUIRED");
}

function responseError(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN";
  if (code === "UNAUTHORIZED") return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  if (code === "PREMIUM_REQUIRED") return NextResponse.json({ message: "Bu özellik Premium hesaplara açıktır." }, { status: 403 });
  if (code === "INVALID_CODE") return NextResponse.json({ message: "Kod geçersiz, kullanılmış veya süresi dolmuş." }, { status: 400 });
  if (code === "SELF_LINK") return NextResponse.json({ message: "Kendi müşteri kodunu kullanamazsın." }, { status: 400 });
  console.error("[MOBILE COACHING]", error);
  return NextResponse.json({ message: "Koçluk işlemi şu anda tamamlanamadı." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(body.action || "");
    await requirePremium(user.uid);

    if (action === "generateInvite") {
      const account = await adminDb.collection("mobile_app_users").doc(user.uid).get();
      const authUser = await adminAuth.getUser(user.uid);
      const raw = generateCode();
      const expiresAt = Timestamp.fromMillis(Date.now() + CODE_TTL_MS);
      await adminDb.collection("coaching_invites").doc(hashCode(raw)).set({
        customerUid: user.uid,
        customerName: String(account.data()?.displayName || authUser.displayName || "Danışan").slice(0, 120),
        customerEmail: authUser.email || null,
        expiresAt,
        usedAt: null,
        createdAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ code: raw, expiresAt: expiresAt.toDate().toISOString() }, { headers: { "cache-control": "private, no-store" } });
    }

    if (action === "redeemInvite") {
      const code = cleanCode(body.code);
      const professionalAccount = await adminDb.collection("mobile_app_users").doc(user.uid).get();
      const role = String(professionalAccount.data()?.professionalRole || "customer");
      if (!ROLES.has(role)) return NextResponse.json({ message: "Bu hesap diyetisyen veya antrenör olarak yetkilendirilmemiş." }, { status: 403 });
      if (code.length !== 8) throw new Error("INVALID_CODE");
      const inviteRef = adminDb.collection("coaching_invites").doc(hashCode(code));
      const professional = await adminAuth.getUser(user.uid);
      const result = await adminDb.runTransaction(async tx => {
        const invite = await tx.get(inviteRef);
        const data = invite.data();
        if (!invite.exists || !data || data.usedAt || !(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now()) throw new Error("INVALID_CODE");
        if (data.customerUid === user.uid) throw new Error("SELF_LINK");
        const relationshipID = `${user.uid}_${data.customerUid}`;
        const relationshipRef = adminDb.collection("coaching_relationships").doc(relationshipID);
        const existing = await tx.get(relationshipRef);
        const clientID = String(existing.data()?.clientID || randomUUID());
        tx.set(relationshipRef, {
          professionalUid: user.uid,
          professionalName: professional.displayName || professional.email || "Profesyonel",
          professionalRole: role,
          customerUid: data.customerUid,
          customerName: data.customerName,
          customerEmail: data.customerEmail || null,
          clientID,
          active: true,
          updatedAt: FieldValue.serverTimestamp(),
          ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        }, { merge: true });
        tx.update(inviteRef, { usedAt: FieldValue.serverTimestamp(), usedBy: user.uid });
        return { relationshipID, clientID, customerName: data.customerName, customerEmail: data.customerEmail || "", role };
      });
      return NextResponse.json({ ok: true, client: result }, { headers: { "cache-control": "private, no-store" } });
    }

    if (action === "syncMeals") {
      const meals = Array.isArray(body.meals) ? body.meals.slice(0, MAX_MEALS) : [];
      const batch = adminDb.batch();
      const activeMealIDs: string[] = [];
      for (const rawMeal of meals) {
        const meal = rawMeal as Record<string, unknown>;
        const id = String(meal.id || "");
        const date = new Date(String(meal.date || ""));
        if (!/^[0-9a-fA-F-]{36}$/.test(id) || Number.isNaN(date.getTime())) continue;
        activeMealIDs.push(id);
        const photoBase64 = typeof meal.photoBase64 === "string" && meal.photoBase64.length <= 260_000 ? meal.photoBase64 : null;
        const ref = adminDb.collection("coaching_customers").doc(user.uid).collection("meals").doc(id);
        batch.set(ref, {
          id,
          customerUid: user.uid,
          date: Timestamp.fromDate(date),
          type: String(meal.type || "Öğün").slice(0, 40),
          title: String(meal.title || "Öğün").slice(0, 160),
          note: String(meal.note || "").slice(0, 1000),
          calories: Math.max(0, Number(meal.calories) || 0),
          protein: Math.max(0, Number(meal.protein) || 0),
          carbs: Math.max(0, Number(meal.carbs) || 0),
          fat: Math.max(0, Number(meal.fat) || 0),
          photoBase64,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
      batch.set(adminDb.collection("coaching_customers").doc(user.uid), {
        activeMealIDs,
        lastSyncedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      await batch.commit();
      return NextResponse.json({ ok: true, synced: meals.length }, { headers: { "cache-control": "private, no-store" } });
    }

    return NextResponse.json({ message: "Geçersiz işlem." }, { status: 400 });
  } catch (error) {
    return responseError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    await requirePremium(user.uid);
    const scope = request.nextUrl.searchParams.get("scope");
    if (scope === "customer") {
      const outgoing = await adminDb.collection("coaching_relationships").where("customerUid", "==", user.uid).limit(100).get();
      const connections = outgoing.docs.filter(document => document.data().active === true).map(document => {
        const value = document.data();
        return {
          relationshipID: document.id,
          professionalName: value.professionalName,
          professionalRole: value.professionalRole,
        };
      });
      return NextResponse.json({ connections }, { headers: { "cache-control": "private, no-store" } });
    }

    const professionalAccount = await adminDb.collection("mobile_app_users").doc(user.uid).get();
    if (!ROLES.has(String(professionalAccount.data()?.professionalRole || "customer"))) {
      return NextResponse.json({ message: "Profesyonel hesap yetkisi gerekli." }, { status: 403 });
    }

    const relationships = await adminDb.collection("coaching_relationships")
      .where("professionalUid", "==", user.uid).limit(100).get();
    const clients = await Promise.all(relationships.docs.filter(document => document.data().active === true).map(async document => {
      const data = document.data();
      const customerRef = adminDb.collection("coaching_customers").doc(String(data.customerUid));
      const [customer, meals] = await Promise.all([
        customerRef.get(),
        customerRef.collection("meals").orderBy("date", "desc").limit(80).get(),
      ]);
      const activeIDs = new Set(Array.isArray(customer.data()?.activeMealIDs) ? customer.data()!.activeMealIDs : []);
      return {
        relationshipID: document.id,
        clientID: data.clientID,
        customerUid: data.customerUid,
        name: data.customerName,
        email: data.customerEmail || "",
        role: data.professionalRole,
        meals: meals.docs.filter(meal => activeIDs.has(meal.id)).slice(0, 40).map(meal => {
          const value = meal.data();
          return { ...value, date: value.date instanceof Timestamp ? value.date.toDate().toISOString() : null, updatedAt: undefined };
        }),
      };
    }));
    return NextResponse.json({ clients }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return responseError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({})) as { relationshipID?: unknown };
    const id = String(body.relationshipID || "");
    const ref = adminDb.collection("coaching_relationships").doc(id);
    const snapshot = await ref.get();
    const data = snapshot.data();
    if (!snapshot.exists || (data?.professionalUid !== user.uid && data?.customerUid !== user.uid)) {
      return NextResponse.json({ message: "Bağlantı bulunamadı." }, { status: 404 });
    }
    await ref.set({ active: false, revokedAt: FieldValue.serverTimestamp(), revokedBy: user.uid }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responseError(error);
  }
}
