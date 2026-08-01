import { licensingError, requireUser } from "@/lib/licensing/auth";
import { deactivateActivation } from "@/lib/licensing/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    await deactivateActivation(body.activationId, body.deviceHash, user.uid);
    return Response.json({ ok: true });
  } catch (error) {
    return licensingError(error);
  }
}
