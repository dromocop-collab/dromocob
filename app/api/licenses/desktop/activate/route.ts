import { activateDesktop, enforceDesktopRateLimit } from "@/lib/licensing/desktop-service";
import { licensingError } from "@/lib/licensing/auth";
export const runtime = "nodejs";
export async function POST(request: Request) { try { const body = await request.json(); await enforceDesktopRateLimit(request, body.deviceHash); return Response.json({ ok: true, ...(await activateDesktop(body)) }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { return licensingError(error); } }
