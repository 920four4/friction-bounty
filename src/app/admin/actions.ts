"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";
import { requireSuperAdmin } from "@/lib/auth";
import { scorePostFields } from "@/lib/blog";
import { slugify } from "@/lib/seo/validate-post";

function parseList(raw: string): string[] {
  return raw
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveBlogPost(formData: FormData) {
  await requireSuperAdmin();
  const db = getDb();

  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  let slug = String(formData.get("slug") || "").trim() || slugify(title);
  slug = slugify(slug);
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "");
  const status = String(formData.get("status") || "draft") === "published" ? "published" : "draft";
  const category = String(formData.get("category") || "guides").trim() || "guides";
  const tags = parseList(String(formData.get("tags") || ""));
  const primaryKeyword = String(formData.get("primaryKeyword") || "").trim();
  const secondaryKeywords = parseList(String(formData.get("secondaryKeywords") || ""));
  const metaTitle = String(formData.get("metaTitle") || title).trim().slice(0, 70);
  const metaDescription = String(formData.get("metaDescription") || excerpt).trim().slice(0, 170);
  const authorName = String(formData.get("authorName") || "Friction Bounty").trim();
  const ctaLabel = String(formData.get("ctaLabel") || "Start free").trim();
  const ctaHref = String(formData.get("ctaHref") || "/signup").trim();
  const relatedSlugs = parseList(String(formData.get("relatedSlugs") || ""));
  const forcePublish = formData.get("forcePublish") === "on";

  const scored = scorePostFields({
    title,
    slug,
    excerpt,
    content,
    primaryKeyword,
    secondaryKeywords,
    metaTitle,
    metaDescription,
    category,
    tags,
    ctaLabel,
    ctaHref,
    relatedSlugs,
    authorName,
    status,
  });

  if (status === "published" && !scored.report.readyToPublish && !forcePublish) {
    // Bounce back to editor with error via query — still save as draft
    const draftPayload = {
      title,
      slug,
      excerpt,
      content,
      status: "draft" as const,
      category,
      tags: JSON.stringify(tags),
      primaryKeyword,
      secondaryKeywords: JSON.stringify(secondaryKeywords),
      metaTitle,
      metaDescription,
      authorName,
      ctaLabel,
      ctaHref,
      relatedSlugs: JSON.stringify(relatedSlugs),
      wordCount: scored.wordCount,
      seoScore: scored.seoScore,
      seoReport: scored.seoReport,
      updatedAt: new Date(),
    };
    if (id) {
      await db.update(blogPosts).set(draftPayload).where(eq(blogPosts.id, id));
      redirect(`/admin/blogs/${id}?seo=blocked`);
    }
    const [row] = await db.insert(blogPosts).values(draftPayload).returning();
    redirect(`/admin/blogs/${row.id}?seo=blocked`);
  }

  const publishedAt =
    status === "published" ? new Date() : null;

  const payload = {
    title,
    slug,
    excerpt,
    content,
    status,
    category,
    tags: JSON.stringify(tags),
    primaryKeyword,
    secondaryKeywords: JSON.stringify(secondaryKeywords),
    metaTitle,
    metaDescription,
    authorName,
    ctaLabel,
    ctaHref,
    relatedSlugs: JSON.stringify(relatedSlugs),
    wordCount: scored.wordCount,
    seoScore: scored.seoScore,
    seoReport: scored.seoReport,
    publishedAt: status === "published" ? publishedAt : null,
    updatedAt: new Date(),
  };

  if (id) {
    // Keep original publishedAt if already published
    const existing = await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
    await db
      .update(blogPosts)
      .set({
        ...payload,
        publishedAt:
          status === "published"
            ? existing?.publishedAt || new Date()
            : null,
      })
      .where(eq(blogPosts.id, id));
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/admin/blogs");
    redirect(`/admin/blogs/${id}?saved=1`);
  }

  const [row] = await db.insert(blogPosts).values(payload).returning();
  revalidatePath("/blog");
  revalidatePath("/admin/blogs");
  redirect(`/admin/blogs/${row.id}?saved=1`);
}

export async function deleteBlogPost(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const db = getDb();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePath("/blog");
  revalidatePath("/admin/blogs");
  redirect("/admin/blogs");
}

export async function validateBlogDraft(formData: FormData) {
  await requireSuperAdmin();
  // Used by form for live check — returns via redirect not ideal for AJAX.
  // Prefer client-side validator; this is a server recompute path.
  const scored = scorePostFields({
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    content: String(formData.get("content") || ""),
    primaryKeyword: String(formData.get("primaryKeyword") || ""),
    secondaryKeywords: String(formData.get("secondaryKeywords") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    metaTitle: String(formData.get("metaTitle") || ""),
    metaDescription: String(formData.get("metaDescription") || ""),
    category: String(formData.get("category") || ""),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    ctaLabel: String(formData.get("ctaLabel") || ""),
    ctaHref: String(formData.get("ctaHref") || ""),
    relatedSlugs: String(formData.get("relatedSlugs") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    authorName: String(formData.get("authorName") || ""),
    status: String(formData.get("status") || "draft"),
  });
  return scored.report;
}
