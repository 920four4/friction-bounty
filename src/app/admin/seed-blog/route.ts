import { NextResponse } from "next/server";
import { getCurrentUser, getSession, isAllowedSuperAdminEmail } from "@/lib/auth";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";
import { SEED_POSTS } from "@/lib/blog-seed";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/** Super-admin only (z@920four.com): upsert educational seed posts. */
export async function POST() {
  const session = await getSession();
  const user = await getCurrentUser();
  if (
    !session ||
    session.role !== "super_admin" ||
    !user ||
    !isAllowedSuperAdminEmail(user.email)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const upserted: string[] = [];

  for (const p of SEED_POSTS) {
    const existing = await db.query.blogPosts.findFirst({ where: eq(blogPosts.slug, p.slug) });
    const values = {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      status: "published" as const,
      category: p.category,
      tags: p.tagsJson,
      primaryKeyword: p.primaryKeyword,
      secondaryKeywords: p.secondaryJson,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      authorName: p.authorName,
      ctaLabel: p.ctaLabel,
      ctaHref: p.ctaHref,
      relatedSlugs: p.relatedJson,
      wordCount: p.wordCount,
      seoScore: p.seoScore,
      seoReport: p.seoReport,
      publishedAt: existing?.publishedAt || new Date(),
      updatedAt: new Date(),
    };
    if (existing) {
      await db.update(blogPosts).set(values).where(eq(blogPosts.id, existing.id));
    } else {
      await db.insert(blogPosts).values(values);
    }
    upserted.push(`${p.slug} (seo ${p.seoScore})`);
  }

  return NextResponse.json({ ok: true, upserted });
}
