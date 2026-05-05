import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, submissions } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function SuperAdminOverview() {
  const db = getDb();
  const [orgs, recent] = await Promise.all([
    db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] }),
    db.query.submissions.findMany({ orderBy: [desc(submissions.createdAt)], limit: 25 }),
  ]);

  // Aggregate counts per org
  const allSubs = await db.query.submissions.findMany();
  const byOrg = new Map<string, { pending: number; rewarded: number; total: number }>();
  for (const s of allSubs) {
    const orgIdKey = String(s.orgId);
    const acc = byOrg.get(orgIdKey) ?? { pending: 0, rewarded: 0, total: 0 };
    acc.total++;
    if (s.status === "pending") acc.pending++;
    if (s.status === "rewarded") acc.rewarded++;
    byOrg.set(orgIdKey, acc);
  }

  const totalPending = allSubs.filter((s) => s.status === "pending").length;
  const totalRewarded = allSubs.filter((s) => s.status === "rewarded").length;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Organizations" value={orgs.length} />
        <Stat label="Total submissions" value={allSubs.length} />
        <Stat label="Pending review" value={totalPending} />
        <Stat label="Rewarded" value={totalRewarded} />
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase mb-3">Organizations</h2>
        {orgs.length === 0 ? (
          <div className="brutal-box p-8 text-center text-gray-500 font-mono text-sm">No orgs signed up yet.</div>
        ) : (
          <div className="space-y-2">
            {orgs.map((o) => {
              const c = byOrg.get(String(o.id)) ?? { pending: 0, rewarded: 0, total: 0 };
              return (
                <Link key={o.id} href={`/super-admin/orgs/${o.id}`} className="brutal-box p-4 block hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-bold">{o.name}</p>
                      <p className="font-mono text-xs text-gray-500">{o.websiteUrl ?? "—"}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 font-mono text-xs">
                      <span className="brutal-badge">total {c.total}</span>
                      <span className="brutal-badge-yellow">pending {c.pending}</span>
                      <span className="inline-block border border-black bg-green-500 text-white px-2 py-0.5 uppercase">rewarded {c.rewarded}</span>
                      <span className={o.isActive ? "brutal-badge" : "inline-block border border-black bg-red-500 text-white px-2 py-0.5 uppercase"}>{o.isActive ? "active" : "disabled"}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase mb-3">Recent submissions (all orgs)</h2>
        {recent.length === 0 ? (
          <div className="brutal-box p-8 text-center text-gray-500 font-mono text-sm">No submissions yet.</div>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => {
              const orgName = orgs.find((o) => o.id === s.orgId)?.name ?? "—";
              return (
                <div key={s.id} className="brutal-box p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{s.title}</p>
                    <p className="font-mono text-xs text-gray-500 truncate">{orgName} · {s.email} · {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 font-mono text-xs">
                    <span className="brutal-badge">{s.status}</span>
                    <span className="brutal-badge">${s.bountyAmount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="brutal-box p-4">
      <p className="font-mono text-xs uppercase text-gray-500">{label}</p>
      <p className="text-3xl font-bold font-mono">{value}</p>
    </div>
  );
}
