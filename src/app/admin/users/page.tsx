import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org: focusOrg } = await searchParams;
  const db = getDb();
  const [orgs, allUsers] = await Promise.all([
    db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] }),
    db.query.users.findMany({ orderBy: [desc(users.createdAt)] }),
  ]);

  const usersByOrg = new Map<string, typeof allUsers>();
  for (const u of allUsers) {
    if (!u.orgId) continue;
    const list = usersByOrg.get(u.orgId) || [];
    list.push(u);
    usersByOrg.set(u.orgId, list);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-mono uppercase">Users &amp; orgs</h1>
          <p className="text-sm text-gray-600 mt-1">
            {orgs.length} organizations · {allUsers.length} owners
          </p>
        </div>
        <Link href="/admin" className="font-mono text-xs underline">
          ← Admin
        </Link>
      </header>

      <div className="space-y-3">
        {orgs.map((o) => {
          const members = usersByOrg.get(o.id) || [];
          const highlight = focusOrg === o.id;
          return (
            <section
              key={o.id}
              id={o.id}
              className={"brutal-box p-4 md:p-5 " + (highlight ? "bg-yellow-50" : "bg-white")}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg">{o.name}</h2>
                  <p className="font-mono text-xs text-gray-500 mt-1 break-all">
                    {o.slug} · {o.websiteUrl || "no site"} · key {o.apiKey.slice(0, 12)}…
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-xs uppercase">
                  <span className="brutal-badge">{o.plan}</span>
                  <span className="brutal-badge">{o.billingStatus}</span>
                  <span className={"brutal-badge " + (o.stripeChargesEnabled ? "bg-green-500 text-white" : "")}>
                    {o.stripeChargesEnabled ? "Stripe ready" : o.stripeAccountId ? "Stripe pending" : "No Stripe"}
                  </span>
                  <span className={"brutal-badge " + (o.isActive ? "" : "bg-red-200")}>
                    {o.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                {members.length === 0 ? (
                  <p className="text-gray-500 text-xs">No owner user row (edge case).</p>
                ) : (
                  members.map((u) => (
                    <div key={u.id} className="brutal-box-sm p-3 bg-gray-50">
                      <p className="font-medium">{u.name || "—"}</p>
                      <p className="font-mono text-xs text-gray-600">{u.email}</p>
                      <p className="font-mono text-[10px] text-gray-400 mt-1">
                        joined {new Date(u.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs">
                <Link href={`/super-admin/orgs/${o.id}`} className="underline">
                  Legacy org detail →
                </Link>
                {o.billingCustomerId && (
                  <span className="text-gray-500">cus: {o.billingCustomerId}</span>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
