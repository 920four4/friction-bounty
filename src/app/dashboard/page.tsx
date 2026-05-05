import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { requireOrgOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardInbox() {
  const { orgId } = await requireOrgOwner();
  const db = getDb();

  const list = await db.query.submissions.findMany({
    where: eq(submissions.orgId, orgId),
    orderBy: [desc(submissions.createdAt)],
    limit: 100,
  });

  const counts = {
    pending: list.filter((s) => s.status === "pending").length,
    approved: list.filter((s) => s.status === "approved").length,
    rewarded: list.filter((s) => s.status === "rewarded").length,
    rejected: list.filter((s) => s.status === "rejected").length,
  };

  return (
    <main>
      <div className="border-b-2 border-black bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap gap-8">
          <Stat label="Pending" value={counts.pending} />
          <Stat label="Approved" value={counts.approved} />
          <Stat label="Rewarded" value={counts.rewarded} />
          <Stat label="Rejected" value={counts.rejected} />
          <Stat label="Total" value={list.length} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {list.length === 0 ? (
          <div className="brutal-box p-12 text-center">
            <p className="font-mono text-lg mb-2">No submissions yet</p>
            <p className="text-gray-500 mb-6">Install the widget on your site and bug reports will land here.</p>
            <Link href="/dashboard/settings" className="brutal-btn-black inline-block">Get install snippet →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((s) => (
              <Link
                key={s.id}
                href={`/submissions/${s.id}`}
                className="brutal-box block p-4 md:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={s.status} />
                      <span className="font-mono text-xs text-gray-500">{s.issueType}</span>
                      <span className="font-mono text-xs text-gray-400">${s.bountyAmount}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{s.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{s.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-500">
                      <span>{s.email}</span>
                      <span className="truncate max-w-xs">{s.pageUrl}</span>
                      <span>{new Date(s.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {s.screenshotUrl && <span className="brutal-badge shrink-0">Screenshot</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-gray-500">{label}</p>
      <p className="text-2xl font-bold font-mono">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "brutal-badge-yellow",
    approved: "brutal-badge-blue",
    rewarded: "inline-block border border-black bg-green-500 text-white px-2 py-0.5 text-xs font-mono uppercase",
    rejected: "inline-block border border-black bg-gray-400 text-white px-2 py-0.5 text-xs font-mono uppercase",
  };
  return <span className={map[status] ?? "brutal-badge"}>{status}</span>;
}
