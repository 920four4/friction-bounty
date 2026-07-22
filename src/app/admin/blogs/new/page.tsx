import Link from "next/link";
import { BlogEditorForm } from "@/components/blog-editor-form";

export const dynamic = "force-dynamic";

export default function NewBlogPostPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold font-mono uppercase">New post</h1>
        <Link href="/admin/blogs" className="font-mono text-xs underline">
          ← All posts
        </Link>
      </header>
      <BlogEditorForm initial={{}} />
    </main>
  );
}
