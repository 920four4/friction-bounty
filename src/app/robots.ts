import type { MetadataRoute } from "next";
import { appBaseUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  const base = appBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/submissions",
          "/submissions/*",
          "/super-admin",
          "/super-admin/*",
          "/api/",
          "/migrate",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
