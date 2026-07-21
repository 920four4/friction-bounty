import { and, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, submissions } from "@/db/schema";

export type BudgetStatus = {
  /** Configured monthly cap, or null when no budget is set (unlimited). */
  budget: number | null;
  /** Dollars already rewarded this calendar month. */
  spent: number;
  /** budget - spent, floored at 0. null when unlimited. */
  remaining: number | null;
  /** 0–100 percentage of budget used. 0 when unlimited. */
  pctUsed: number;
  /** True when a budget is set and spend has reached/exceeded it. */
  exceeded: boolean;
  /** e.g. "July 2026" */
  monthLabel: string;
};

/** First instant of the current calendar month (server local time). */
export function startOfMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Sum of bounty amounts actually rewarded (money moved) since the start of
 * the current calendar month for an org. Only status="rewarded" counts —
 * approved-but-undelivered rewards never charged anyone.
 */
export async function getMonthlySpend(orgId: string, now = new Date()): Promise<number> {
  const db = getDb();
  const monthStart = startOfMonth(now);
  const rows = await db.query.submissions.findMany({
    where: and(
      eq(submissions.orgId, orgId),
      eq(submissions.status, "rewarded"),
      gte(submissions.rewardDeliveredAt, monthStart),
    ),
    columns: { bountyAmount: true },
  });
  const total = rows.reduce((sum, r) => sum + parseFloat(r.bountyAmount), 0);
  // Guard against float drift on money.
  return Math.round(total * 100) / 100;
}

export async function getBudgetStatus(
  org: { id: string; monthlyBudget: string | null },
  now = new Date(),
): Promise<BudgetStatus> {
  const spent = await getMonthlySpend(org.id, now);
  const budget = org.monthlyBudget != null ? parseFloat(org.monthlyBudget) : null;
  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  if (budget == null || !(budget > 0)) {
    return { budget: null, spent, remaining: null, pctUsed: 0, exceeded: false, monthLabel };
  }

  const remaining = Math.max(0, Math.round((budget - spent) * 100) / 100);
  const pctUsed = Math.min(100, Math.round((spent / budget) * 100));
  return { budget, spent, remaining, pctUsed, exceeded: spent >= budget, monthLabel };
}

/**
 * Would rewarding `amount` more dollars this month push the org over its cap?
 * Returns null when it's fine, or a human-readable reason when it's blocked.
 */
export async function checkBudgetForReward(
  org: { id: string; monthlyBudget: string | null; bountyCurrency?: string },
  amount: number,
  now = new Date(),
): Promise<string | null> {
  if (org.monthlyBudget == null) return null;
  const budget = parseFloat(org.monthlyBudget);
  if (!(budget > 0)) return null;

  const spent = await getMonthlySpend(org.id, now);
  if (spent + amount > budget + 1e-9) {
    const remaining = Math.max(0, budget - spent);
    return (
      `This $${amount.toFixed(2)} reward would exceed your monthly budget of ` +
      `$${budget.toFixed(2)}. You have $${remaining.toFixed(2)} left this month. ` +
      `Raise the budget in Settings or wait until next month.`
    );
  }
  return null;
}

/** Re-fetch org purely for budget checks (used in server actions). */
export async function loadOrgBudget(orgId: string) {
  const db = getDb();
  return db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
    columns: { id: true, monthlyBudget: true, bountyCurrency: true },
  });
}
