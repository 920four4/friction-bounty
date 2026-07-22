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
    <div className="space-y-4 -mx-4 sm:mx-0">
      <header className="px-4 sm:px-0">
        <p className="dash-page-kicker">Inbox</p>
        <h1 className="dash-page-title">Reports</h1>
        <p className="dash-page-lead">Review, reply, approve, or decline. Nothing pays until you say so.</p>
      </header>

      {hasAny && budget && (
        <div className="border-y-2 border-black bg-white px-4 sm:px-0 sm:border-2 sm:p-4">
          <div className="py-3 sm:py-0">
            <BudgetMeter budget={budget} currency={org?.bountyCurrency ?? "USD"} />
          </div>
        </div>
      )}

      <div className="border-y-2 sm:border-2 border-black bg-gray-100 px-3 py-2.5 sm:p-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <FilterTab
              key={f}
              filter={f}
              active={activeFilter === f}
              count={counts[f]}
              query={query}
            />
          ))}
        </div>
        <form className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto" action="/dashboard" method="GET">
          {activeFilter !== "all" && <input type="hidden" name="status" value={activeFilter} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search…"
            className="brutal-input py-2 text-sm flex-1 sm:w-52"
            enterKeyHint="search"
          />
          <button type="submit" className="brutal-btn text-xs shrink-0">Go</button>
        </form>
      </div>

      <div className="px-4 sm:px-0">
        {!hasAny ? (
          <div className="dash-card text-center py-10 px-4">
            <p className="font-bold text-lg mb-2">No reports yet</p>
            <p className="text-gray-600 mb-5 text-sm max-w-md mx-auto">
              Install the widget, connect Stripe, send a test — then everything lands here.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center">
              <Link href="/dashboard/getting-started" className="brutal-btn-black">
                Open setup →
              </Link>
              <Link href="/dashboard/settings" className="brutal-btn">
                Widget preview
              </Link>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="dash-card text-center py-8">
            <p className="font-bold mb-2">Nothing here</p>
            <p className="text-gray-600 text-sm mb-4">
              {query
                ? <>No matches for &ldquo;{query}&rdquo;.</>
                : <>No {activeFilter} reports right now.</>}
            </p>
            <Link href="/dashboard" className="brutal-btn text-sm">Clear filters</Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {list.map((s) => (
              <Link
                key={s.id}
                href={`/submissions/${s.id}`}
                className="dash-card block hover:bg-yellow-50/50 active:bg-yellow-100 transition-colors !p-3.5 sm:!p-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={s.status} />
                    <span className="font-mono text-[10px] text-gray-500 uppercase">
                      {s.issueType.replace("_", " ")}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">${s.bountyAmount}</span>
                    {s.screenshotUrl && (
                      <span className="font-mono text-[10px] border border-black px-1 uppercase">Shot</span>
                    )}
                  </div>
                  <h3 className="font-bold text-base leading-snug m-0">{s.title}</h3>
                  <p className="text-gray-600 text-sm m-0 line-clamp-2">{s.description}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-mono text-gray-500">
                    <span className="truncate max-w-[12rem]">{s.email}</span>
                    <span className="truncate max-w-[10rem]">{s.pageUrl}</span>
                    <span>{new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
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
