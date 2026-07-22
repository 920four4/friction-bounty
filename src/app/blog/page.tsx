import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedPosts, parseJsonArray } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — practical guides on silent bugs & user-reported QA",
  description:
    "Honest writing on product friction, user-reported bugs, installable feedback widgets, and paying users when they help you ship better software.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <main className="min-h-screen bg-[#faf9f5]">
      <BlogNav />
      <section className="border-b-2 border-black bg-yellow-300">
        <div className="max-w-4xl mx-auto px-6 py-14 md:py-16">
          <p className="font-mono text-xs uppercase mb-2">Friction Bounty Journal</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            Clear writing about silent bugs, user feedback, and paying people who help you ship.
          </h1>
          <p className="mt-4 text-lg max-w-2xl text-black/80">
            No fake case studies. No invented percentages. Just practical guides you can use whether or not you try{" "}
            <Link href="/" className="underline font-medium">
              Friction Bounty
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        {posts.length === 0 ? (
          <div className="brutal-box p-10 text-center text-gray-600">
            <p className="font-mono">Posts coming soon.</p>
            <Link href="/signup" className="brutal-btn-black inline-block mt-4">
              Start free meanwhile →
            </Link>
          </div>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="brutal-box p-6 bg-white hover:bg-gray-50 transition-colors">
              <p className="font-mono text-xs uppercase text-gray-500 mb-2">
                {p.category}
                {p.publishedAt && <> · {new Date(p.publishedAt).toLocaleDateString()}</>}
                <> · {p.wordCount} words</>
              </p>
              <h2 className="text-2xl font-bold leading-snug">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 text-gray-700 leading-relaxed">{p.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {parseJsonArray(p.tags).slice(0, 4).map((t) => (
                  <span key={t} className="brutal-badge text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
              <Link href={`/blog/${p.slug}`} className="inline-block mt-4 font-mono text-sm underline">
                Read →
              </Link>
            </article>
          ))
        )}
      </section>

      <BlogCta />
      <BlogFooter />
    </main>
  );
}

export function BlogNav() {
  return (
    <nav className="border-b-2 border-black bg-white sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-mono font-bold uppercase text-sm">
          Friction Bounty
        </Link>
        <div className="flex items-center gap-3 font-mono text-xs uppercase">
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
          <Link href="/pricing" className="hover:underline">
            Pricing
          </Link>
          <Link href="/signup" className="brutal-btn-black text-xs py-1">
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function BlogCta() {
  return (
    <section className="border-t-2 border-black bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">Pay users to tell you what broke.</h2>
        <p className="mt-2 text-white/70 max-w-xl">
          One script tag. Your Stripe for rewards. We never take a cut of bounties.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/signup" className="brutal-btn bg-yellow-300 text-black border-black">
            Start free — get your snippet
          </Link>
          <Link href="/pricing" className="brutal-btn border-white text-white bg-transparent">
            Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BlogFooter() {
  return (
    <footer className="border-t-2 border-black bg-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-wrap gap-4 font-mono text-xs text-gray-600">
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
