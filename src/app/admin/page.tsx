import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { blogPosts, organizations, paymentEvents, submissions, users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const db = getDb();

  const [orgs, userRows, allSubs, posts, payments, proOrgs] = await Promise.all([
    db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)], limit: 8 }),
    db.query.users.findMany({ orderBy: [desc(users.createdAt)], limit: 8 }),
    db.query.submissions.findMany(),
    db.query.blogPosts.findMany({ orderBy: [desc(blogPosts.updatedAt)], limit: 5 }),
    db.query.paymentEvents.findMany({ orderBy: [desc(paymentEvents.createdAt)], limit: 8 }),
    db.query.organizations.findMany({ where: eq(organizations.plan, "pro") }),
  ]);

  const pending = allSubs.filter((s) => s.status === "pending").length;
  const rewarded = allSubs.filter((s) => s.status === "rewarded").length;
  const mrrCents = proOrgs.length * 2900;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-mono uppercase">Admin</h1>
        <p className="text-sm text-gray-600 mt-1">Users, content, and Friction Bounty billing only.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Organizations" value={String(await countOrgs())} />
        <Stat label="Pro plans" value={String(proOrgs.length)} sub={`~$${(mrrCents / 100).toFixed(0)} MRR`} />
        <Stat label="Submissions" value={String(allSubs.length)} sub={`${pending} pending · ${rewarded} rewarded`} />
        <Stat label="Blog posts" value={String(await countPosts())} />
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-mono font-bold uppercase text-sm">Recent orgs</h2>
            <Link href="/admin/users" className="font-mono text-xs underline">
              All users →
            </Link>
          </div>
          {orgs.map((o) => (
            <Link
              key={o.id}
              href={`/admin/users?org=${o.id}`}
              className="brutal-box block p-3 hover:bg-white text-sm"
            >
              <div className="flex justify-between gap-2">
                <span className="font-bold">{o.name}</span>
                <span className="font-mono text-xs uppercase">{o.plan}</span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {o.billingStatus} · {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-mono font-bold uppercase text-sm">FB payments</h2>
            <Link href="/admin/payments" className="font-mono text-xs underline">
              All payments →
            </Link>
          </div>
          {payments.length === 0 ? (
            <div className="brutal-box p-6 text-sm text-gray-500">No Friction Bounty payment events yet.</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="brutal-box p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-mono text-xs">{p.type}</span>
                  <span className="font-mono text-xs">
                    {p.amountCents != null ? `$${(p.amountCents / 100).toFixed(2)}` : "—"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {p.description || p.status} · {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-mono font-bold uppercase text-sm">Blog</h2>
          <Link href="/admin/blogs/new" className="brutal-btn-black text-xs">
            New post
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="brutal-box p-6 text-sm text-gray-500">
            No posts yet.{" "}
            <Link href="/admin/blogs/new" className="underline">
              Write the first one
            </Link>
            .
          </div>
        ) : (
          posts.map((p) => (
            <Link key={p.id} href={`/admin/blogs/${p.id}`} className="brutal-box block p-3 hover:bg-white">
              <div className="flex justify-between gap-2 text-sm">
                <span className="font-bold">{p.title}</span>
                <span className="font-mono text-xs">
                  SEO {p.seoScore} · {p.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}

async function countOrgs() {
  const db = getDb();
  const rows = await db.select({ c: sql<number>`count(*)::int` }).from(organizations);
  return rows[0]?.c ?? 0;
}
async function countPosts() {
  const db = getDb();
  const rows = await db.select({ c: sql<number>`count(*)::int` }).from(blogPosts);
  return rows[0]?.c ?? 0;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="brutal-box p-4">
      <p className="font-mono text-xs uppercase text-gray-500">{label}</p>
      <p className="text-2xl font-bold font-mono mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
