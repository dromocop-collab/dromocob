import { enforceDesktopRateLimit, startOrValidateTrial } from "@/lib/licensing/desktop-service";
import { licensingError } from "@/lib/licensing/auth";
export const runtime = "nodejs";
export async function POST(request: Request) { try { const body = await request.json(); await enforceDesktopRateLimit(request, body.deviceHash); return Response.json({ ok: true, ...(await startOrValidateTrial(body.deviceHash)) }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { return licensingError(error); } }
