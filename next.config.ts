import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  async redirects() {
    return [
      // ── Duplicate content fix: consolidate /hizmetler/* into canonical short URLs ──
      { source: "/hizmetler/web-tasarim", destination: "/web-tasarim", permanent: true },
      { source: "/hizmetler/video-film-produksiyon", destination: "/tanitim-filmi", permanent: true },

      // ── Legacy 404 fixes: old PHP/HTML site URLs found in Search Console ──
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/iletisim/index.html", destination: "/iletisim", permanent: true },
      { source: "/dromocop-yapilan-calismalarimiz.html", destination: "/projeler", permanent: true },
      { source: "/hakkimizda", destination: "/hakkimda", permanent: true },

      // ── Old PHP product routes → projects ──
      { source: "/products/view.php", destination: "/projeler", permanent: true },
      { source: "/products/:path*", destination: "/projeler", permanent: true },

      // ── Catch any remaining .html extension requests ──
      { source: "/:path*.html", destination: "/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
      {
        source: "/videos/reels/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
