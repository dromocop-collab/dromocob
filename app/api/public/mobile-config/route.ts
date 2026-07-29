import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";

  if (!apiKey || !projectId) {
    return NextResponse.json(
      { ok: false, error: "MOBILE_FIREBASE_CONFIG_MISSING" },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      firebase: { apiKey, projectId, authDomain },
      minimumAppVersion: "1.0.0",
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
