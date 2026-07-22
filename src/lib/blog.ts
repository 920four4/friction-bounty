import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";
import { validateBlogPost, type SeoReport } from "@/lib/seo/validate-post";

export type BlogPostRow = typeof blogPosts.$inferSelect;

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function parseSeoReport(raw: string | null | undefined): SeoReport | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SeoReport;
  } catch {
    return null;
  }
}

export function scorePostFields(input: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  ctaLabel: string;
  ctaHref: string;
  relatedSlugs: string[];
  authorName: string;
  status: string;
}) {
  const report = validateBlogPost(input);
  return {
    seoScore: report.score,
    seoReport: JSON.stringify(report),
    wordCount: report.wordCount,
    report,
  };
}

export async function listPublishedPosts() {
  const db = getDb();
  return db.query.blogPosts.findMany({
    where: eq(blogPosts.status, "published"),
    orderBy: [desc(blogPosts.publishedAt)],
  });
}

export async function getPublishedBySlug(slug: string) {
  const db = getDb();
  return db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")),
  });
}

export async function listAllPosts() {
  const db = getDb();
  return db.query.blogPosts.findMany({
    orderBy: [desc(blogPosts.updatedAt)],
  });
}

export async function getPostById(id: string) {
  const db = getDb();
  return db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
}
