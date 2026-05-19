import type { NextConfig } from "next";

const isProd = process.env.VERCEL_ENV === "production";

const securityHeaders = [
  // HSTS — only meaningful on production HTTPS, but harmless elsewhere.
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // The dashboard / submission pages should never be framed. Widget endpoints
  // serve JSON, not HTML, so they're not framable anyway.
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  images: {
    // We render attacker-controlled screenshotUrls (Vercel Blob URLs) on the
    // submission detail page. unoptimized: true avoids the image optimizer
    // becoming an SSRF surface.
    unoptimized: true,
  },
  async headers() {
    const headers: { source: string; headers: { key: string; value: string }[] }[] = [
      { source: "/((?!api).*)", headers: securityHeaders },
    ];
    if (!isProd) {
      // Block search engines on preview deployments.
      headers.push({
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      });
    }
    return headers;
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.frictionbounty.app" }],
        destination: "https://frictionbounty.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
