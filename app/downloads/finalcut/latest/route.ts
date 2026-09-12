import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FinalCutManifest = {
  installerURL?: string;
  downloadURL?: string;
};

const ALLOWED_HOSTS = new Set(["github.com", "objects.githubusercontent.com", "dromocob.tr"]);

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const response = await fetch(`${origin}/downloads/finalcut/manifest.json`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`manifest ${response.status}`);
    const manifest = (await response.json()) as FinalCutManifest;
    const target = new URL(manifest.installerURL || manifest.downloadURL || "");

    if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
      throw new Error("invalid download host");
    }

    return NextResponse.redirect(target, 307);
  } catch {
    return NextResponse.redirect(new URL("/uygulamalar/dromocob-ultra?download=unavailable", request.url), 307);
  }
}
