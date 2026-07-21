import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, submissions } from "@/db/schema";
import { requireOrgOwner } from "@/lib/auth";
import { getBudgetStatus } from "@/lib/budget";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "pending", "approved", "rewarded", "rejected"] as const;
type Filter = (typeof FILTERS)[number];

export default async function DashboardInbox({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { orgId } = await requireOrgOwner();
  const db = getDb();
  const { status, q } = await searchParams;

  const activeFilter: Filter = FILTERS.includes(status as Filter) ? (status as Filter) : "all";
  const query = (q ?? "").trim();
  const queryLower = query.toLowerCase();

  const [org, all] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, orgId) }),
    db.query.submissions.findMany({
      where: eq(submissions.orgId, orgId),
      orderBy: [desc(submissions.createdAt)],
      limit: 500,
    }),
  ]);

  const counts = {
    all: all.length,
    pending: all.filter((s) => s.status === "pending").length,
    approved: all.filter((s) => s.status === "approved").length,
    rewarded: all.filter((s) => s.status === "rewarded").length,
    rejected: all.filter((s) => s.status === "rejected").length,
  };

  const budget = org ? await getBudgetStatus(org) : null;

  let list = activeFilter === "all" ? all : all.filter((s) => s.status === activeFilter);
  if (queryLower) {
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(queryLower) ||
        s.description.toLowerCase().includes(queryLower) ||
        s.email.toLowerCase().includes(queryLower) ||
        s.pageUrl.toLowerCase().includes(queryLower),
    );
  }

  const hasAny = all.length > 0;

  return (
    <main>
      {/* Budget meter */}
      {hasAny && budget && (
        <div className="border-b-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <BudgetMeter budget={budget} currency={org?.bountyCurrency ?? "USD"} />
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="border-b-2 border-black bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <FilterTab
              key={f}
              filter={f}
              active={activeFilter === f}
              count={counts[f]}
              query={query}
            />
          ))}
          <form className="ml-auto flex items-center gap-2" action="/dashboard" method="GET">
            {activeFilter !== "all" && <input type="hidden" name="status" value={activeFilter} />}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search title, email, URL…"
              className="brutal-input py-1 text-sm w-48 md:w-64"
            />
            <button type="submit" className="brutal-btn text-xs py-1">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!hasAny ? (
          <div className="brutal-box p-12 text-center">
            <p className="font-mono text-lg mb-2">No submissions yet</p>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Paste one script tag, connect Stripe (no API keys), and reports show up here.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/dashboard/getting-started" className="brutal-btn-black inline-block">Start setup →</Link>
              <Link href="/dashboard/account" className="brutal-btn inline-block">Connect Stripe</Link>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="brutal-box p-12 text-center">
            <p className="font-mono text-lg mb-2">Nothing here</p>
            <p className="text-gray-500 mb-6">
              {query
                ? <>No {activeFilter === "all" ? "" : activeFilter + " "}submissions match &ldquo;{query}&rdquo;.</>
                : <>No {activeFilter} submissions right now.</>}
            </p>
            <Link href="/dashboard" className="brutal-btn inline-block">Clear filters</Link>
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
                      <span className="font-mono text-xs text-gray-500">{s.issueType.replace("_", " ")}</span>
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

function BudgetMeter({ budget, currency }: { budget: NonNullable<Awaited<ReturnType<typeof getBudgetStatus>>>; currency: string }) {
  const sym = currency === "USD" ? "$" : "";
  if (budget.budget == null) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-sm">
          <span className="text-gray-500 uppercase text-xs">Rewarded in {budget.monthLabel}: </span>
          <span className="font-bold">{sym}{budget.spent.toFixed(2)}</span>
        </div>
        <Link href="/dashboard/settings" className="font-mono text-xs uppercase underline text-gray-600 hover:text-black">
          Set a monthly budget →
        </Link>
      </div>
    );
  }

  const barColor = budget.exceeded ? "#FF3300" : budget.pctUsed >= 80 ? "#FFB000" : "#00CC66";
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="font-mono text-sm">
          <span className="text-gray-500 uppercase text-xs">Budget · {budget.monthLabel}: </span>
          <span className="font-bold">{sym}{budget.spent.toFixed(2)}</span>
          <span className="text-gray-500"> / {sym}{budget.budget.toFixed(2)}</span>
        </div>
        <div className="font-mono text-xs">
          {budget.exceeded ? (
            <span className="brutal-badge" style={{ backgroundColor: "#FF3300", color: "#fff", borderColor: "#000" }}>Budget reached</span>
          ) : (
            <span className="text-gray-600">{sym}{(budget.remaining ?? 0).toFixed(2)} left · {budget.pctUsed}% used</span>
          )}
        </div>
      </div>
      <div className="w-full h-3 border-2 border-black bg-white overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${Math.max(2, budget.pctUsed)}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

function FilterTab({ filter, active, count, query }: { filter: Filter; active: boolean; count: number; query: string }) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (query) params.set("q", query);
  const href = params.toString() ? `/dashboard?${params.toString()}` : "/dashboard";
  return (
    <Link
      href={href}
      className={
        "font-mono text-xs uppercase px-3 py-1.5 border-2 border-black transition-all " +
        (active ? "bg-black text-white" : "bg-white hover:bg-yellow-300")
      }
    >
      {filter} <span className={active ? "text-gray-300" : "text-gray-500"}>{count}</span>
    </Link>
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
