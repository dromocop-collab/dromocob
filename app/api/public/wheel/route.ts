import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { enqueueMail, isValidEmail, normalizeEmail } from "@/lib/auth-code-mail";
import { adminDb } from "@/lib/firebase-admin";
import { getRequestUser } from "@/lib/request-user";
import { DEFAULT_WHEEL_CONFIG, normalizeWheelConfig, type WheelReward } from "@/lib/promo-wheel";

export const dynamic = "force-dynamic";
const DEVICE_COOKIE = "dromocob_wheel_device";

function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
function clean(value: unknown, max: number) { return String(value || "").trim().slice(0, max); }
function pickReward(rewards: WheelReward[]) {
  const active = rewards.filter(item => item.active && item.weight > 0);
  const total = active.reduce((sum, item) => sum + item.weight, 0);
  if (!active.length || total <= 0) throw new Error("NO_REWARDS");
  let cursor = randomInt(1, Math.max(2, Math.ceil(total) + 1));
  for (const reward of active) { cursor -= reward.weight; if (cursor <= 0) return reward; }
  return active[active.length - 1];
}
function couponCode() { return `DROMO-${randomBytes(4).toString("hex").toUpperCase()}`; }
function couponMail(name: string, code: string, reward: WheelReward, expiresAt: Date) {
  const date = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(expiresAt);
  return {
    subject: `Çark hediyen hazır: ${reward.label}`,
    text: `Merhaba ${name},\n\nDromocob çarkından kazandığın ödül: ${reward.label}\nKupon kodun: ${code}\nSon kullanım: ${date}\n\nTeklif oluştururken bu kodu kullanabilirsin.`,
    html: `<!doctype html><html lang="tr"><body style="margin:0;background:#eef1e9;font-family:Arial,sans-serif;color:#11140f"><table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 14px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:24px;overflow:hidden"><tr><td style="padding:22px 28px;background:#0d130e;color:#d9ff43;font-size:12px;font-weight:900;letter-spacing:.15em">DROMOCOB / WHEEL REWARD</td></tr><tr><td style="padding:32px 28px"><p style="color:#717b6d;font-size:12px">TEBRİKLER ${name.replace(/[<>&"]/g, "")}</p><h1 style="margin:8px 0 12px;font-size:31px">${reward.label}</h1><p style="color:#5f685b;line-height:1.7">${reward.description}</p><div style="margin:25px 0;padding:19px 20px;background:#101510;color:#d9ff43;border-radius:16px;font-size:26px;font-weight:900;letter-spacing:.12em;text-align:center">${code}</div><p style="font-size:12px;color:#778173">Son kullanım: ${date}. Teklif oluştururken kupon kodunu kullanabilirsin.</p></td></tr></table></td></tr></table></body></html>`,
  };
}

export async function GET(request: NextRequest) {
  const [snapshot, user] = await Promise.all([
    adminDb.collection("promo_wheel").doc("config").get(),
    getRequestUser(request.headers.get("authorization")),
  ]);
  const config = normalizeWheelConfig(snapshot.exists ? snapshot.data() : DEFAULT_WHEEL_CONFIG);
  let canSpin = config.active;
  if (user && !user.isAdmin) {
    const device = request.cookies.get(DEVICE_COOKIE)?.value;
    const claims = await Promise.all([
      adminDb.collection("wheel_claims").doc(`uid_${user.uid}`).get(),
      user.email ? adminDb.collection("wheel_claims").doc(`email_${hash(user.email)}`).get() : Promise.resolve(null),
      device ? adminDb.collection("wheel_claims").doc(`device_${hash(device)}`).get() : Promise.resolve(null),
    ]);
    canSpin = canSpin && !claims.some(item => item?.exists);
  } else if (!user) {
    const device = request.cookies.get(DEVICE_COOKIE)?.value;
    if (device) canSpin = canSpin && !(await adminDb.collection("wheel_claims").doc(`device_${hash(device)}`).get()).exists;
  }
  return NextResponse.json({ config, canSpin, isAdmin: user?.isAdmin === true }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = await getRequestUser(request.headers.get("authorization"));
    const name = clean(body.name, 120);
    const email = user?.email || normalizeEmail(body.email);
    if (!user && (name.length < 2 || !isValidEmail(email))) return NextResponse.json({ message: "Çarkı çevirmek için adını ve geçerli e-posta adresini gir." }, { status: 400 });

    const existingDevice = request.cookies.get(DEVICE_COOKIE)?.value;
    const device = existingDevice || randomUUID();
    const configRef = adminDb.collection("promo_wheel").doc("config");
    const reward = await adminDb.runTransaction(async transaction => {
      const configSnapshot = await transaction.get(configRef);
      const config = normalizeWheelConfig(configSnapshot.exists ? configSnapshot.data() : DEFAULT_WHEEL_CONFIG);
      if (!config.active) throw new Error("WHEEL_DISABLED");

      const claimRefs = user?.isAdmin ? [] : [
        ...(user ? [adminDb.collection("wheel_claims").doc(`uid_${user.uid}`)] : []),
        ...(email ? [adminDb.collection("wheel_claims").doc(`email_${hash(email)}`)] : []),
        ...[adminDb.collection("wheel_claims").doc(`device_${hash(device)}`)],
      ];
      for (const claimRef of claimRefs) if ((await transaction.get(claimRef)).exists) throw new Error("ALREADY_SPUN");
      const selected = pickReward(config.rewards);
      const spinRef = adminDb.collection("wheel_spins").doc();
      transaction.set(spinRef, { rewardId: selected.id, rewardLabel: selected.label, userId: user?.uid || null, emailHash: email ? hash(email) : null, guestName: user ? null : name, isAdmin: user?.isAdmin === true, createdAt: FieldValue.serverTimestamp() });
      for (const claimRef of claimRefs) transaction.set(claimRef, { spinId: spinRef.id, rewardId: selected.id, createdAt: FieldValue.serverTimestamp() });

      let code = "";
      let expiresAt: Date | null = null;
      if (selected.kind !== "none") {
        code = couponCode();
        expiresAt = new Date(Date.now() + selected.validityDays * 86400000);
        transaction.set(adminDb.collection("coupons").doc(code), {
          code, source: "promo_wheel", rewardId: selected.id, label: selected.label, description: selected.description,
          kind: selected.kind, value: selected.value, status: "active", userId: user?.uid || null,
          emailHash: email ? hash(email) : null, email: user ? null : email, guestName: user ? null : name,
          createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromDate(expiresAt), spinId: spinRef.id,
        });
      }
      return { selected, code, expiresAt };
    });

    if (!user && reward.code && reward.expiresAt) {
      const mail = couponMail(name, reward.code, reward.selected, reward.expiresAt);
      await enqueueMail({ to: email, ...mail });
    }
    const response = NextResponse.json({ reward: reward.selected, couponCode: reward.code, expiresAt: reward.expiresAt?.toISOString() || "", delivery: !user && reward.code ? "email" : user && reward.code ? "profile" : "none" });
    if (!existingDevice) response.cookies.set(DEVICE_COOKIE, device, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "ALREADY_SPUN") return NextResponse.json({ message: "Bu çark daha önce çevrilmiş. Her ziyaretçinin tek hakkı var." }, { status: 409 });
    if (message === "WHEEL_DISABLED") return NextResponse.json({ message: "Çark şu anda aktif değil." }, { status: 503 });
    console.error("[PROMO WHEEL]", error);
    return NextResponse.json({ message: "Çark şu anda çevrilemedi. Biraz sonra tekrar dene." }, { status: 500 });
  }
}
