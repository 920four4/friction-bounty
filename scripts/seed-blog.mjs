/**
 * Seed published blog posts. Run: node scripts/seed-blog.mjs
 * Uses DATABASE_URL from env or .env.local
 */
import fs from "fs";
import pg from "pg";
import { createRequire } from "module";

// Load env
const envPath = new URL("../.env.local", import.meta.url);
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let v = line.slice(i + 1);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[line.slice(0, i)]) process.env[line.slice(0, i)] = v;
  }
}

// Dynamic import of compiled seed is awkward in mjs — inline minimal seed via HTTP to API? 
// Instead: run TypeScript through a small approach — duplicate seed runner using pg + reimplement score? 
// Simpler: import from dist not available. Use tsx if present, else raw SQL with precomputed scores.

const { SEED_POSTS } = await import("../src/lib/blog-seed.ts").catch(async () => {
  // fallback: register ts via next's path won't work. Use node --experimental-strip-types if available
  throw new Error("Import failed — run with: node --experimental-strip-types scripts/seed-blog.mjs");
});

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

for (const p of SEED_POSTS) {
  await client.query(
    `INSERT INTO blog_posts (
      slug, title, excerpt, content, status, category, tags,
      primary_keyword, secondary_keywords, meta_title, meta_description,
      author_name, cta_label, cta_href, related_slugs,
      word_count, seo_score, seo_report, published_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,'published',$5,$6,
      $7,$8,$9,$10,
      $11,$12,$13,$14,
      $15,$16,$17,NOW(),NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      excerpt = EXCLUDED.excerpt,
      content = EXCLUDED.content,
      category = EXCLUDED.category,
      tags = EXCLUDED.tags,
      primary_keyword = EXCLUDED.primary_keyword,
      secondary_keywords = EXCLUDED.secondary_keywords,
      meta_title = EXCLUDED.meta_title,
      meta_description = EXCLUDED.meta_description,
      related_slugs = EXCLUDED.related_slugs,
      word_count = EXCLUDED.word_count,
      seo_score = EXCLUDED.seo_score,
      seo_report = EXCLUDED.seo_report,
      status = 'published',
      published_at = COALESCE(blog_posts.published_at, NOW()),
      updated_at = NOW()
    `,
    [
      p.slug,
      p.title,
      p.excerpt,
      p.content,
      p.category,
      p.tagsJson,
      p.primaryKeyword,
      p.secondaryJson,
      p.metaTitle,
      p.metaDescription,
      p.authorName,
      p.ctaLabel,
      p.ctaHref,
      p.relatedJson,
      p.wordCount,
      p.seoScore,
      p.seoReport,
    ],
  );
  console.log("seeded", p.slug, "seo", p.seoScore, "words", p.wordCount);
}

await client.end();
console.log("done");
