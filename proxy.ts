import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy to handle www → non-www canonical redirect.
 * Google Search Console shows both www.dromocob.tr and dromocob.tr variants
 * being crawled, which causes duplicate content issues.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const forwardedProtocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const isDromocobHost = /^(www\.)?dromocob\.tr(?::\d+)?$/i.test(host);

  // Collapse HTTP and WWW variants to the canonical URL in one hop.
  if (isDromocobHost && (host.startsWith("www.") || forwardedProtocol !== "https")) {
    const url = request.nextUrl.clone();
    url.host = "dromocob.tr";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  // Preserve authority from the retired Turkish/PHP site instead of returning 404s.
  // Search Console still discovers these addresses from historical external links.
  let decodedPath = request.nextUrl.pathname;
  try {
    decodedPath = decodeURIComponent(decodedPath);
  } catch {
    // Keep the original path when a legacy URL contains malformed encoding.
  }

  const normalizedLegacyPath = decodedPath
    .normalize("NFC")
    .toLocaleLowerCase("tr-TR")
    .replace(/\/+$/, "") || "/";
  const legacyDestinations: Record<string, string> = {
    "/index.html": "/",
    "/iletişim": "/iletisim",
    "/iletişim/index.html": "/iletisim",
    "/iletişim/index.php": "/iletisim",
    "/hakkımızda": "/hakkimda",
    "/hakkımızda/index.html": "/hakkimda",
    "/hakkımızda/index.php": "/hakkimda",
    "/hakkimda/index.php": "/hakkimda",
    "/products": "/projeler",
    "/products/index.php": "/projeler",
    "/products/view.php": "/projeler",
    "/bakim": "/",
  };
  const legacyDestination = legacyDestinations[normalizedLegacyPath];

  if (legacyDestination) {
    return NextResponse.redirect(new URL(legacyDestination, "https://dromocob.tr"), 301);
  }

  // Unknown endpoints from the retired PHP site are permanently gone.
  // A 410 avoids turning unrelated legacy URLs into soft-404 home redirects.
  if (request.nextUrl.pathname.toLowerCase().endsWith(".php")) {
    return new NextResponse("Bu eski adres kalıcı olarak kaldırıldı.", {
      status: 410,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Run proxy on all routes except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|opengraph-image|images/).*)",
  ],
};
