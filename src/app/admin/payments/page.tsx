import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, paymentEvents } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const db = getDb();
  const [events, orgs] = await Promise.all([
    db.query.paymentEvents.findMany({ orderBy: [desc(paymentEvents.createdAt)], limit: 200 }),
    db.query.organizations.findMany(),
  ]);
  const orgName = new Map(orgs.map((o) => [o.id, o.name]));

  const paid = events.filter((e) => e.type === "invoice.paid" || e.type === "checkout.session.completed");
  const totalCents = paid.reduce((s, e) => s + (e.amountCents || 0), 0);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-mono uppercase">Payments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Friction Bounty only — other Stripe products on this account are ignored by the webhook.
          </p>
        </div>
        <Link href="/admin" className="font-mono text-xs underline">
          ← Admin
        </Link>
      </header>

      <section className="grid sm:grid-cols-3 gap-3">
        <div className="brutal-box p-4">
          <p className="font-mono text-xs uppercase text-gray-500">Tracked events</p>
          <p className="text-2xl font-bold font-mono">{events.length}</p>
        </div>
        <div className="brutal-box p-4">
          <p className="font-mono text-xs uppercase text-gray-500">Gross (recorded)</p>
          <p className="text-2xl font-bold font-mono">${(totalCents / 100).toFixed(2)}</p>
        </div>
        <div className="brutal-box p-4">
          <p className="font-mono text-xs uppercase text-gray-500">App tag</p>
          <p className="text-2xl font-bold font-mono">friction_bounty</p>
        </div>
      </section>

      {events.length === 0 ? (
        <div className="brutal-box p-10 text-center text-gray-500 text-sm">
          No events yet. They appear when a customer upgrades or an invoice is paid for this product only.
        </div>
      ) : (
        <div className="overflow-x-auto brutal-box">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-black font-mono text-xs uppercase">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Org</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-gray-200">
                  <td className="p-3 font-mono text-xs whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-xs">{e.type}</td>
                  <td className="p-3">
                    {e.orgId ? (
                      <Link href={`/admin/users?org=${e.orgId}`} className="underline">
                        {String(orgName.get(e.orgId) ?? e.orgId.slice(0, 8))}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {e.amountCents != null ? `$${(e.amountCents / 100).toFixed(2)}` : "—"}
                  </td>
                  <td className="p-3 font-mono text-xs">{e.status || "—"}</td>
                  <td className="p-3 font-mono text-[10px] text-gray-500">{e.priceId || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
