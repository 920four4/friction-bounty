import Link from "next/link";
import { listAllPosts } from "@/lib/blog";
import { SeedBlogButton } from "@/components/seed-blog-button";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await listAllPosts();

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-mono uppercase">Blog machine</h1>
          <p className="text-sm text-gray-600 mt-1">
            Every post is scored by the SEO validator before publish. No fake stats — the checker flags hype.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-start">
          <SeedBlogButton />
          <Link href="/blog" className="brutal-btn text-sm" target="_blank">
            View blog
          </Link>
          <Link href="/admin/blogs/new" className="brutal-btn-black text-sm">
            New post
          </Link>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="brutal-box p-10 text-center">
          <p className="font-mono mb-3">No posts yet</p>
          <Link href="/admin/blogs/new" className="brutal-btn-black inline-block">
            Create first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/admin/blogs/${p.id}`}
              className="brutal-box block p-4 hover:bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-bold">{p.title}</p>
                  <p className="font-mono text-xs text-gray-500 mt-0.5">
                    /blog/{p.slug} · {p.category} · {p.wordCount} words
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase">
                  <span
                    className={
                      "brutal-badge " +
                      (p.seoScore >= 75
                        ? "bg-green-500 text-white"
                        : p.seoScore >= 50
                          ? "bg-yellow-300"
                          : "bg-red-200")
                    }
                  >
                    SEO {p.seoScore}
                  </span>
                  <span className="brutal-badge">{p.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
