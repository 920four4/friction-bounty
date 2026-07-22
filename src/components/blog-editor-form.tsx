"use client";

import { useMemo, useState } from "react";
import { validateBlogPost, slugify, type SeoReport } from "@/lib/seo/validate-post";
import { SeoReportPanel } from "@/components/seo-report-panel";
import { saveBlogPost, deleteBlogPost } from "@/app/admin/actions";

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: string;
  category?: string;
  tags?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string;
  metaTitle?: string;
  metaDescription?: string;
  authorName?: string;
  ctaLabel?: string;
  ctaHref?: string;
  relatedSlugs?: string;
  seoReport?: SeoReport | null;
};

export function BlogEditorForm({ initial }: { initial: Initial }) {
  const [title, setTitle] = useState(initial.title || "");
  const [slug, setSlug] = useState(initial.slug || "");
  const [excerpt, setExcerpt] = useState(initial.excerpt || "");
  const [content, setContent] = useState(initial.content || "");
  const [status, setStatus] = useState(initial.status || "draft");
  const [category, setCategory] = useState(initial.category || "guides");
  const [tags, setTags] = useState(initial.tags || "");
  const [primaryKeyword, setPrimaryKeyword] = useState(initial.primaryKeyword || "");
  const [secondaryKeywords, setSecondaryKeywords] = useState(initial.secondaryKeywords || "");
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription || "");
  const [authorName, setAuthorName] = useState(initial.authorName || "Friction Bounty");
  const [ctaLabel, setCtaLabel] = useState(initial.ctaLabel || "Start free");
  const [ctaHref, setCtaHref] = useState(initial.ctaHref || "/signup");
  const [relatedSlugs, setRelatedSlugs] = useState(initial.relatedSlugs || "");

  const liveReport = useMemo(
    () =>
      validateBlogPost({
        title,
        slug: slug || slugify(title),
        excerpt,
        content,
        primaryKeyword,
        secondaryKeywords: secondaryKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        category,
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        ctaLabel,
        ctaHref,
        relatedSlugs: relatedSlugs.split(",").map((s) => s.trim()).filter(Boolean),
        authorName,
        status,
      }),
    [
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
    ],
  );

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <form action={saveBlogPost} className="space-y-4">
        {initial.id && <input type="hidden" name="id" value={initial.id} />}

        <Field label="Title">
          <input
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!initial.slug && !slug) setSlug(slugify(e.target.value));
            }}
            required
            className="brutal-input"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Slug">
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="brutal-input font-mono text-sm"
            />
          </Field>
          <Field label="Category">
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="brutal-input">
              <option value="guides">Guides</option>
              <option value="product">Product</option>
              <option value="playbooks">Playbooks</option>
              <option value="engineering">Engineering</option>
              <option value="ecommerce">Ecommerce</option>
            </select>
          </Field>
        </div>

        <Field label="Excerpt (list + meta fallback)">
          <textarea
            name="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="brutal-input"
          />
        </Field>

        <Field label="Body (Markdown)">
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={22}
            className="brutal-input font-mono text-sm leading-relaxed"
            required
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Primary keyword">
            <input
              name="primaryKeyword"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              className="brutal-input"
            />
          </Field>
          <Field label="Secondary keywords (comma-separated)">
            <input
              name="secondaryKeywords"
              value={secondaryKeywords}
              onChange={(e) => setSecondaryKeywords(e.target.value)}
              className="brutal-input"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Meta title">
            <input
              name="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={70}
              className="brutal-input"
              placeholder={title}
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input name="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="brutal-input" />
          </Field>
        </div>

        <Field label="Meta description">
          <textarea
            name="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={170}
            rows={2}
            className="brutal-input"
            placeholder={excerpt}
          />
        </Field>

        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Author">
            <input name="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="brutal-input" />
          </Field>
          <Field label="CTA label">
            <input name="ctaLabel" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className="brutal-input" />
          </Field>
          <Field label="CTA href">
            <input name="ctaHref" value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className="brutal-input" />
          </Field>
        </div>

        <Field label="Related post slugs (comma-separated)">
          <input
            name="relatedSlugs"
            value={relatedSlugs}
            onChange={(e) => setRelatedSlugs(e.target.value)}
            className="brutal-input font-mono text-sm"
            placeholder="silent-bugs-cost, install-bug-widget"
          />
        </Field>

        <div className="flex flex-wrap items-center gap-4">
          <label className="font-mono text-sm flex items-center gap-2">
            Status
            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="brutal-input w-auto">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="font-mono text-xs flex items-center gap-2 text-gray-600">
            <input type="checkbox" name="forcePublish" className="border-2 border-black" />
            Force publish if SEO &lt; ready
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" className="brutal-btn-black">
            Save post
          </button>
        </div>
      </form>

      {initial.id && (
        <form action={deleteBlogPost} className="mt-2">
          <input type="hidden" name="id" value={initial.id} />
          <button
            type="submit"
            className="brutal-btn text-red-700 text-sm"
            onClick={(e) => {
              if (!confirm("Delete this post permanently?")) e.preventDefault();
            }}
          >
            Delete post
          </button>
        </form>
      )}

      <aside className="space-y-3 lg:sticky lg:top-20 self-start">
        <h2 className="font-mono font-bold uppercase text-sm">Live SEO validator</h2>
        <SeoReportPanel report={liveReport} />
        <p className="text-xs text-gray-500 font-mono leading-relaxed">
          Required checks must pass to publish (unless force). Write like a human: clear, honest, no fake stats.
        </p>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="brutal-label">{label}</label>
      {children}
    </div>
  );
}
