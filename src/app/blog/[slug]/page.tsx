import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedBySlug,
  listPublishedPosts,
  parseJsonArray,
} from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";
import { appBaseUrl } from "@/lib/url";
import { BlogCta, BlogFooter, BlogNav } from "../page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBySlug(slug);
  if (!post) return { title: "Post not found" };
  const base = appBaseUrl();
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  return {
    title,
    description,
    authors: [{ name: post.authorName }],
    alternates: { canonical: post.canonicalPath || `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${base}/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedBySlug(slug);
  if (!post) notFound();

  const relatedSlugs = parseJsonArray(post.relatedSlugs);
  const all = await listPublishedPosts();
  const related = all.filter((p) => relatedSlugs.includes(p.slug) && p.slug !== post.slug).slice(0, 3);
  // Fallback related: same category
  const relatedFinal =
    related.length > 0
      ? related
      : all.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  const html = renderMarkdown(post.content);
  const base = appBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: { "@type": "Organization", name: post.authorName },
    publisher: {
      "@type": "Organization",
      name: "Friction Bounty",
      url: base,
    },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
    keywords: [post.primaryKeyword, ...parseJsonArray(post.secondaryKeywords)].filter(Boolean).join(", "),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${base}/blog/${post.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#faf9f5]">
      <BlogNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <article className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        <nav className="font-mono text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
          {" / "}
          <span className="text-gray-800">{post.slug}</span>
        </nav>

        <p className="font-mono text-xs uppercase text-gray-500 mb-3">
          {post.category}
          {post.publishedAt && <> · {new Date(post.publishedAt).toLocaleDateString()}</>}
          <> · {post.wordCount} words</>
          <> · {post.authorName}</>
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-gray-700 leading-relaxed">{post.excerpt}</p>}

        <div className="blog-prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Mid/end CTA */}
        <div className="brutal-box-yellow p-6 mt-12">
          <p className="font-mono text-xs uppercase mb-2">Try it</p>
          <p className="font-bold text-xl mb-2">{post.ctaLabel || "Start free"}</p>
          <p className="text-sm text-gray-800 mb-4">
            Install one script tag. Connect Stripe in a click. Pay users when their report helps you ship.
          </p>
          <Link href={post.ctaHref || "/signup"} className="brutal-btn-black inline-block">
            {post.ctaLabel || "Start free"} →
          </Link>
        </div>

        {relatedFinal.length > 0 && (
          <section className="mt-14 border-t-2 border-black pt-8">
            <h2 className="font-mono font-bold uppercase text-sm mb-4">Keep reading</h2>
            <ul className="space-y-3">
              {relatedFinal.map((r) => (
                <li key={r.id}>
                  <Link href={`/blog/${r.slug}`} className="font-medium underline hover:no-underline">
                    {r.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-0.5">{r.excerpt}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <BlogCta />
      <BlogFooter />
    </main>
  );
}
