import type { MetadataRoute } from "next";
import { appBaseUrl } from "@/lib/url";
import { listPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appBaseUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const posts = await listPublishedPosts();
    const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
