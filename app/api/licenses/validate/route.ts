import { licensingError, requireUser } from "@/lib/licensing/auth";
import { validateActivation } from "@/lib/licensing/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const result = await validateActivation(body.activationId, body.productId, body.deviceHash, { uid: user.uid, email: user.email });
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return licensingError(error);
  }
}
