import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to handle www → non-www canonical redirect.
 * Google Search Console shows both www.dromocob.tr and dromocob.tr variants
 * being crawled, which causes duplicate content issues.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Redirect www.dromocob.tr → dromocob.tr
  if (host.startsWith("www.")) {
    const canonicalHost = host.replace(/^www\./, "");
    const url = request.nextUrl.clone();
    url.host = canonicalHost;
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|opengraph-image|images/).*)",
  ],
};
