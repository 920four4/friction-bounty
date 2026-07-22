/**
 * Per-post SEO validator for the Friction Bounty blog machine.
 * Scores 0–100 and returns actionable pass/warn/fail checks.
 * No fabricated metrics — only structural & content-quality rules.
 */

export type SeoCheck = {
  id: string;
  group: "metadata" | "structure" | "content" | "links" | "honesty" | "technical";
  label: string;
  severity: "required" | "recommended";
  status: "pass" | "warn" | "fail";
  detail: string;
  points: number; // max points this check contributes
  earned: number;
};

export type SeoReport = {
  score: number;
  maxScore: number;
  wordCount: number;
  checks: SeoCheck[];
  readyToPublish: boolean;
  summary: string;
};

export type PostInput = {
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
};

const FORBIDDEN_HYPE =
  /\b(guaranteed|#1|number one|secret formula|hack your way|10x overnight|proven system that always|never fails)\b/i;
const FAKE_STATS =
  /\b(\d{2,3}% of (users|customers|companies)|studies show \d|according to (our|a) (study|survey) of \d{3,})\b/i;

function countWords(text: string): number {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/[#>*_\-\[\]\(\)!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return 0;
  return plain.split(" ").filter(Boolean).length;
}

function stripMd(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function check(
  partial: Omit<SeoCheck, "earned" | "status"> & { ok: boolean; warn?: boolean; detail: string },
): SeoCheck {
  const status: SeoCheck["status"] = partial.ok ? "pass" : partial.warn ? "warn" : "fail";
  const earned = partial.ok ? partial.points : partial.warn ? Math.floor(partial.points / 2) : 0;
  return {
    id: partial.id,
    group: partial.group,
    label: partial.label,
    severity: partial.severity,
    status,
    detail: partial.detail,
    points: partial.points,
    earned,
  };
}

export function validateBlogPost(input: PostInput): SeoReport {
  const content = input.content || "";
  const plain = stripMd(content).toLowerCase();
  const wordCount = countWords(content);
  const kw = (input.primaryKeyword || "").trim().toLowerCase();
  const title = (input.title || "").trim();
  const metaTitle = (input.metaTitle || title).trim();
  const metaDesc = (input.metaDescription || input.excerpt || "").trim();
  const slug = (input.slug || "").trim();
  const h2s = [...content.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const h1s = [...content.matchAll(/^#\s+(.+)$/gm)].map((m) => m[1].trim());
  const internalLinks = [...content.matchAll(/\]\(\/([^)]+)\)/g)].map((m) => m[1]);
  const externalLinks = [...content.matchAll(/\]\(https?:\/\/[^)]+\)/g)];
  const images = [...content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  const hasCta =
    /\]\(\/(signup|pricing|login)\)/i.test(content) ||
    !!input.ctaHref ||
    /start free|get your snippet|create (your )?inbox|sign up/i.test(content);

  const checks: SeoCheck[] = [];

  // —— Metadata ——
  checks.push(
    check({
      id: "meta_title_len",
      group: "metadata",
      label: "Meta title length (30–60)",
      severity: "required",
      points: 8,
      ok: metaTitle.length >= 30 && metaTitle.length <= 60,
      warn: metaTitle.length > 0 && metaTitle.length < 70,
      detail: `“${metaTitle.slice(0, 70)}” (${metaTitle.length} chars)`,
    }),
  );
  checks.push(
    check({
      id: "meta_desc_len",
      group: "metadata",
      label: "Meta description length (120–160)",
      severity: "required",
      points: 8,
      ok: metaDesc.length >= 120 && metaDesc.length <= 160,
      warn: metaDesc.length >= 80 && metaDesc.length <= 170,
      detail: `${metaDesc.length} chars`,
    }),
  );
  checks.push(
    check({
      id: "slug_clean",
      group: "metadata",
      label: "Clean slug (kebab-case, ≤80)",
      severity: "required",
      points: 5,
      ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80 && slug.length >= 3,
      detail: slug || "(empty)",
    }),
  );
  checks.push(
    check({
      id: "primary_kw_set",
      group: "metadata",
      label: "Primary keyword set",
      severity: "required",
      points: 6,
      ok: kw.length >= 3,
      detail: kw || "(missing)",
    }),
  );
  checks.push(
    check({
      id: "kw_in_title",
      group: "metadata",
      label: "Primary keyword in title",
      severity: "required",
      points: 6,
      ok: !!kw && title.toLowerCase().includes(kw),
      warn: !!kw && title.toLowerCase().split(" ").some((w) => kw.includes(w) && w.length > 3),
      detail: kw ? `keyword “${kw}”` : "no keyword",
    }),
  );
  checks.push(
    check({
      id: "kw_in_meta_desc",
      group: "metadata",
      label: "Primary keyword in meta description",
      severity: "recommended",
      points: 4,
      ok: !!kw && metaDesc.toLowerCase().includes(kw),
      detail: kw ? (metaDesc.toLowerCase().includes(kw) ? "present" : "missing") : "no keyword",
    }),
  );

  // —— Structure ——
  checks.push(
    check({
      id: "single_h1",
      group: "structure",
      label: "At most one H1 in body (title is the page H1)",
      severity: "recommended",
      points: 3,
      ok: h1s.length <= 1,
      detail: `${h1s.length} H1 in markdown body`,
    }),
  );
  checks.push(
    check({
      id: "h2_count",
      group: "structure",
      label: "At least 3 H2 sections",
      severity: "required",
      points: 6,
      ok: h2s.length >= 3,
      warn: h2s.length >= 2,
      detail: `${h2s.length} H2 headings`,
    }),
  );
  checks.push(
    check({
      id: "kw_in_h2",
      group: "structure",
      label: "Primary keyword (or close term) in an H2",
      severity: "recommended",
      points: 4,
      ok: !!kw && h2s.some((h) => h.toLowerCase().includes(kw) || kw.split(" ").every((p) => p.length < 4 || h.toLowerCase().includes(p))),
      detail: h2s.slice(0, 4).join(" · ") || "no H2s",
    }),
  );

  // —— Content ——
  checks.push(
    check({
      id: "word_count",
      group: "content",
      label: "Word count ≥ 500 (ideal 1,200–2,000)",
      severity: "required",
      points: 10,
      ok: wordCount >= 500,
      warn: wordCount >= 350,
      detail: `${wordCount} words`,
    }),
  );
  checks.push(
    check({
      id: "kw_density",
      group: "content",
      label: "Primary keyword appears 3–20 times (natural use)",
      severity: "required",
      points: 6,
      ok: (() => {
        if (!kw) return false;
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const n = (plain.match(re) || []).length;
        return n >= 3 && n <= 20;
      })(),
      warn: (() => {
        if (!kw) return false;
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const n = (plain.match(re) || []).length;
        return n >= 1 && n <= 30;
      })(),
      detail: (() => {
        if (!kw) return "no keyword";
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        return `${(plain.match(re) || []).length} occurrences`;
      })(),
    }),
  );
  checks.push(
    check({
      id: "excerpt",
      group: "content",
      label: "Excerpt 80–200 chars",
      severity: "required",
      points: 4,
      ok: (input.excerpt || "").trim().length >= 80 && (input.excerpt || "").trim().length <= 200,
      warn: (input.excerpt || "").trim().length >= 40,
      detail: `${(input.excerpt || "").trim().length} chars`,
    }),
  );
  checks.push(
    check({
      id: "secondary_kws",
      group: "content",
      label: "2+ secondary keywords",
      severity: "recommended",
      points: 3,
      ok: (input.secondaryKeywords || []).filter(Boolean).length >= 2,
      detail: `${(input.secondaryKeywords || []).length} secondary`,
    }),
  );

  // —— Links ——
  checks.push(
    check({
      id: "internal_links",
      group: "links",
      label: "≥ 2 internal links (/, /pricing, /signup, /blog/…)",
      severity: "required",
      points: 6,
      ok: internalLinks.length >= 2,
      warn: internalLinks.length >= 1,
      detail: `${internalLinks.length} internal: ${internalLinks.slice(0, 5).join(", ") || "none"}`,
    }),
  );
  checks.push(
    check({
      id: "related_posts",
      group: "links",
      label: "Related posts set (cross-linking)",
      severity: "recommended",
      points: 3,
      ok: (input.relatedSlugs || []).length >= 2,
      warn: (input.relatedSlugs || []).length >= 1,
      detail: `${(input.relatedSlugs || []).length} related slugs`,
    }),
  );
  checks.push(
    check({
      id: "cta_present",
      group: "links",
      label: "Clear signup CTA in content or post CTA field",
      severity: "required",
      points: 6,
      ok: hasCta && !!input.ctaHref,
      detail: `CTA “${input.ctaLabel || "—"}” → ${input.ctaHref || "—"}`,
    }),
  );

  // —— Honesty ——
  checks.push(
    check({
      id: "no_hype",
      group: "honesty",
      label: "No hype / guarantee language",
      severity: "required",
      points: 5,
      ok: !FORBIDDEN_HYPE.test(content) && !FORBIDDEN_HYPE.test(title),
      detail: FORBIDDEN_HYPE.test(content + title) ? "Flagged hype phrase" : "Clean",
    }),
  );
  checks.push(
    check({
      id: "no_fake_stats",
      group: "honesty",
      label: "No fabricated study/stat patterns",
      severity: "required",
      points: 5,
      ok: !FAKE_STATS.test(content),
      detail: FAKE_STATS.test(content) ? "Looks like an invented stat — cite or remove" : "Clean",
    }),
  );
  checks.push(
    check({
      id: "author",
      group: "honesty",
      label: "Author name set (E-E-A-T)",
      severity: "recommended",
      points: 2,
      ok: !!(input.authorName || "").trim(),
      detail: input.authorName || "(missing)",
    }),
  );

  // —— Technical ——
  checks.push(
    check({
      id: "category",
      group: "technical",
      label: "Category set",
      severity: "recommended",
      points: 2,
      ok: !!(input.category || "").trim(),
      detail: input.category || "(missing)",
    }),
  );
  checks.push(
    check({
      id: "tags",
      group: "technical",
      label: "1–6 tags",
      severity: "recommended",
      points: 2,
      ok: (input.tags || []).length >= 1 && (input.tags || []).length <= 6,
      detail: `${(input.tags || []).length} tags`,
    }),
  );
  checks.push(
    check({
      id: "images_alt",
      group: "technical",
      label: "Images have alt text (if any)",
      severity: "recommended",
      points: 2,
      ok: images.length === 0 || images.every((m) => (m[1] || "").trim().length > 0),
      detail: `${images.length} images`,
    }),
  );

  // unused but available for future
  void externalLinks;

  const maxScore = checks.reduce((s, c) => s + c.points, 0);
  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const score = maxScore ? Math.round((earned / maxScore) * 100) : 0;
  const requiredFails = checks.filter((c) => c.severity === "required" && c.status === "fail");
  const readyToPublish = score >= 75 && requiredFails.length === 0;

  let summary = "";
  if (readyToPublish) summary = `SEO score ${score}/100 — ready to publish.`;
  else if (requiredFails.length)
    summary = `SEO score ${score}/100 — fix ${requiredFails.length} required issue(s) before publishing.`;
  else summary = `SEO score ${score}/100 — improve recommended items for better reach.`;

  return { score, maxScore, wordCount, checks, readyToPublish, summary };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
