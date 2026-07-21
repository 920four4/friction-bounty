import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { organizations, submissions, users } from "@/db/schema";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function toggleActive(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const orgId = String(formData.get("orgId") || "");
  const next = formData.get("next") === "1";
  if (!orgId) return;
  const db = getDb();
  await db.update(organizations).set({ isActive: next, updatedAt: new Date() }).where(eq(organizations.id, orgId));
  revalidatePath(`/super-admin/orgs/${orgId}`);
}

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const db = getDb();

  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  if (!org) redirect("/super-admin");

  const [orgSubs, orgUsers] = await Promise.all([
    db.query.submissions.findMany({
      where: eq(submissions.orgId, id),
      orderBy: [desc(submissions.createdAt)],
      limit: 100,
    }),
    db.query.users.findMany({ where: eq(users.orgId, id) }),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <Link href="/super-admin" className="text-gray-500 hover:text-black font-mono text-sm">← Back to overview</Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-mono uppercase">{org.name}</h1>
          {org.websiteUrl && <p className="font-mono text-sm text-gray-500">{org.websiteUrl}</p>}
        </div>
        <form action={toggleActive}>
          <input type="hidden" name="orgId" value={org.id} />
          <input type="hidden" name="next" value={org.isActive ? "0" : "1"} />
          <button type="submit" className={org.isActive ? "brutal-btn" : "brutal-btn-black"}>
            {org.isActive ? "Disable org" : "Re-enable org"}
          </button>
        </form>
      </div>

      <section className="brutal-box p-6 grid md:grid-cols-2 gap-4 text-sm">
        <KV k="API key" v={org.apiKey} mono />
        <KV k="Slug" v={org.slug} />
        <KV k="Default bounty" v={`$${org.defaultBountyAmount}`} />
        <KV k="Stripe Connect" v={org.stripeAccountId ? `${org.stripeAccountId}${org.stripeChargesEnabled ? " (ready)" : " (pending)"}` : (org.stripeSecretKey ? "legacy key" : "no")} />
        <KV k="Plan" v={`${org.plan} / ${org.billingStatus}`} />
        <KV k="Created" v={new Date(org.createdAt).toLocaleString()} />
        <KV k="Status" v={org.isActive ? "active" : "disabled"} />
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase mb-3">Owners</h2>
        {orgUsers.length === 0 ? (
          <div className="brutal-box p-4 text-gray-500 font-mono text-sm">No users on this org.</div>
        ) : (
          <ul className="space-y-2">
            {orgUsers.map((u) => (
              <li key={u.id} className="brutal-box p-3 font-mono text-sm">{u.email} · {u.role}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase mb-3">Submissions</h2>
        {orgSubs.length === 0 ? (
          <div className="brutal-box p-4 text-gray-500 font-mono text-sm">No submissions yet.</div>
        ) : (
          <div className="space-y-2">
            {orgSubs.map((s) => (
              <Link key={s.id} href={`/submissions/${s.id}`} className="brutal-box p-3 block hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{s.title}</p>
                    <p className="font-mono text-xs text-gray-500 truncate">{s.email} · {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 font-mono text-xs">
                    <span className="brutal-badge">{s.status}</span>
                    <span className="brutal-badge">${s.bountyAmount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <span className="font-mono text-gray-500 block text-xs uppercase">{k}</span>
      <span className={mono ? "font-mono break-all" : ""}>{v}</span>
    </div>
  );
}
