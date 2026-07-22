import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogEditorForm } from "@/components/blog-editor-form";
import { getPostById, parseJsonArray, parseSeoReport } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; seo?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase">Edit post</h1>
          <p className="font-mono text-xs text-gray-500 mt-1">/blog/{post.slug}</p>
        </div>
        <div className="flex gap-3 font-mono text-xs">
          {post.status === "published" && (
            <Link href={`/blog/${post.slug}`} className="underline" target="_blank">
              View live
            </Link>
          )}
          <Link href="/admin/blogs" className="underline">
            ← All posts
          </Link>
        </div>
      </header>

      {sp.saved && (
        <div className="brutal-box-sm bg-green-100 px-3 py-2 font-mono text-sm">Saved.</div>
      )}
      {sp.seo === "blocked" && (
        <div className="brutal-box-sm bg-yellow-100 px-3 py-2 font-mono text-sm">
          Publish blocked by SEO validator — saved as draft. Fix required checks or force-publish.
        </div>
      )}

      <BlogEditorForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          status: post.status,
          category: post.category,
          tags: parseJsonArray(post.tags).join(", "),
          primaryKeyword: post.primaryKeyword,
          secondaryKeywords: parseJsonArray(post.secondaryKeywords).join(", "),
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          authorName: post.authorName,
          ctaLabel: post.ctaLabel,
          ctaHref: post.ctaHref,
          relatedSlugs: parseJsonArray(post.relatedSlugs).join(", "),
          seoReport: parseSeoReport(post.seoReport),
        }}
      />
    </main>
  );
}
