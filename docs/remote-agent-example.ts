/**
 * Yönetilen HER Next.js sitesine uyarlanabilecek örnek.
 * Gerçek projede status bilgisini kalıcı storage/database içinde tut.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.SITE_CONTROL_MASTER_SECRET;
  if (!secret) return new NextResponse("Not configured", { status: 500 });

  const raw = await req.text();
  const received = req.headers.get("x-dromocob-signature") || "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(raw);
  const age = Math.abs(Date.now() - Number(body.timestamp));
  if (age > 60_000) return new NextResponse("Expired command", { status: 400 });

  // TODO: body.status değerini kalıcı storage'a yaz.
  // active | maintenance | disabled
  return NextResponse.json({ ok: true });
}
