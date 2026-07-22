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
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];
    const headers: { source: string; headers: { key: string; value: string }[] }[] = [
      { source: "/((?!api).*)", headers: securityHeaders },
      // Never index admin, auth, dashboard, migrate — even if a bot ignores robots.txt
      { source: "/admin", headers: noIndex },
      { source: "/admin/:path*", headers: noIndex },
      { source: "/super-admin", headers: noIndex },
      { source: "/super-admin/:path*", headers: noIndex },
      { source: "/dashboard", headers: noIndex },
      { source: "/dashboard/:path*", headers: noIndex },
      { source: "/submissions/:path*", headers: noIndex },
      { source: "/migrate", headers: noIndex },
      { source: "/login", headers: noIndex },
      { source: "/signup", headers: noIndex },
    ];
    if (!isProd) {
      // Block search engines on preview deployments.
      headers.push({
        source: "/:path*",
        headers: noIndex,
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
