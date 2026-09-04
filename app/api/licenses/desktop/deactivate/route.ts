import { deactivateDesktop } from "@/lib/licensing/desktop-service";
import { licensingError } from "@/lib/licensing/auth";
export const runtime = "nodejs";
export async function POST(request: Request) { try { const body = await request.json(); await deactivateDesktop(body.activationId, body.deviceHash, body.licenseKey); return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { return licensingError(error); } }
