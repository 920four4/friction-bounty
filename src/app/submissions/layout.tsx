import { eq } from "drizzle-orm";
import { getSession, getCurrentOrg, getCurrentUser } from "@/lib/auth";
import { orgCanIssueRewards } from "@/lib/stripe";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

/** Same app shell as /dashboard for org owners (mobile tab bar, sidebar). */
export default async function SubmissionsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "org_owner" || !session.oid) {
    return <>{children}</>;
  }

  const orgId = session.oid;
  const [org, user, firstSub] = await Promise.all([
    getCurrentOrg(),
    getCurrentUser(),
    getDb().query.submissions.findMany({
      where: eq(submissions.orgId, orgId),
      limit: 1,
      columns: { id: true },
    }),
  ]);
  const installed = firstSub.length > 0;
  const stripeReady = org ? orgCanIssueRewards(org) : false;

  return (
    <DashboardShell
      orgName={org?.name || "Your org"}
      email={user?.email || ""}
      isPro={org?.plan === "pro"}
      stripeReady={stripeReady}
      setupDone={(installed ? 1 : 0) + (stripeReady ? 1 : 0) + (installed ? 1 : 0)}
      setupTotal={3}
    >
      {children}
    </DashboardShell>
  );
}
