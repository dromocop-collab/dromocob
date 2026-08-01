import { DROMOCOB_APPS } from "@/lib/licensing/types";
import { publicKeyPEM } from "@/lib/licensing/crypto";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json({
      ok: true,
      apps: DROMOCOB_APPS,
      receiptPublicKey: publicKeyPEM(),
      minimumVersions: { "pixel-resizer-pro": "1.0.0" },
      latestVersions: { "pixel-resizer-pro": "1.0.0" },
    }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ ok: false, error: "LICENSE_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
