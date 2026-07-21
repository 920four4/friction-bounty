import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { organizations, users } from "@/db/schema";
import { requireOrgOwner, getCurrentUser } from "@/lib/auth";
import { isStripePlatformConfigured, orgCanIssueRewards } from "@/lib/stripe";
import {
  ConnectStripeButton,
  ManageBillingButton,
  UpgradeButton,
} from "@/components/account-actions";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string; billing?: string }>;
}) {
  const { orgId } = await requireOrgOwner();
  const user = await getCurrentUser();
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  if (!org) redirect("/dashboard");

  const params = await searchParams;
  const stripeReady = orgCanIssueRewards(org);
  const connectPending = !!org.stripeAccountId && !org.stripeChargesEnabled;
  const isPro = org.plan === "pro" && (org.billingStatus === "active" || org.billingStatus === "trialing");
  const platformOk = isStripePlatformConfigured();

  // Owner email from user row
  const owner = user?.id && user.id !== "super"
    ? await db.query.users.findFirst({ where: eq(users.id, user.id) })
    : null;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header>
        <p className="font-mono text-xs uppercase text-gray-500 mb-1">Account</p>
        <h1 className="text-3xl font-bold font-mono uppercase">Profile &amp; billing</h1>
        <p className="text-gray-600 mt-2 text-sm">
          Manage your plan, connect Stripe for rewards, and keep your org details tidy.
        </p>
      </header>

      {params.connect === "connected" && (
        <Banner tone="good">Stripe connected. You can issue rewards from any submission.</Banner>
      )}
      {params.connect === "pending" && (
        <Banner tone="warn">Stripe setup started — finish the remaining steps if rewards still fail.</Banner>
      )}
      {params.connect === "refresh" && (
        <Banner tone="warn">Session expired — click Connect again to resume.</Banner>
      )}
      {params.billing === "success" && (
        <Banner tone="good">Welcome to Pro. Unlimited reports are unlocked.</Banner>
      )}

      {/* Profile */}
      <section className="brutal-box p-6 space-y-4">
        <h2 className="font-mono font-bold uppercase">Profile</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <Item label="Name" value={owner?.name || user?.name || "—"} />
          <Item label="Email" value={owner?.email || user?.email || "—"} />
          <Item label="Organization" value={org.name} />
          <Item label="Website" value={org.websiteUrl || "Not set"} />
        </dl>
        <Link href="/dashboard/settings" className="brutal-btn text-sm inline-block">
          Edit org &amp; widget settings →
        </Link>
      </section>

      {/* Billing */}
      <section className="brutal-box p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-mono font-bold uppercase">Plan &amp; billing</h2>
            <p className="text-sm text-gray-600 mt-1">
              You pay Friction Bounty for the product. Bounty rewards still come from{" "}
              <em>your</em> Stripe — we never take a cut.
            </p>
          </div>
          <span className={`brutal-badge ${isPro ? "bg-green-500 text-white" : "bg-yellow-300"}`}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="brutal-box-sm p-3 bg-gray-50">
            <p className="font-mono text-xs uppercase text-gray-500 mb-1">Current plan</p>
            <p className="font-bold font-mono text-lg">{isPro ? "Pro — $29/mo" : "Free"}</p>
            <p className="text-xs text-gray-600 mt-1">
              {isPro ? "Unlimited reports" : "Up to 50 reports / month"}
            </p>
          </div>
          <div className="brutal-box-sm p-3 bg-gray-50">
            <p className="font-mono text-xs uppercase text-gray-500 mb-1">Status</p>
            <p className="font-bold font-mono text-lg capitalize">{org.billingStatus === "none" ? "—" : org.billingStatus}</p>
            <p className="text-xs text-gray-600 mt-1">Cancel anytime from the billing portal</p>
          </div>
        </div>

        {isPro ? (
          <ManageBillingButton />
        ) : (
          <div className="space-y-2">
            <ul className="text-sm space-y-1 text-gray-700">
              <li>→ Unlimited reports</li>
              <li>→ Remove powered-by badge</li>
              <li>→ Priority support</li>
            </ul>
            <UpgradeButton />
          </div>
        )}
      </section>

      {/* Payouts / Connect */}
      <section className="brutal-box p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-mono font-bold uppercase">Reward payouts (Stripe)</h2>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Connect your Stripe account with one click. We never ask for API keys —
              Stripe hosts the whole flow. Rewards (credits &amp; promo codes) are issued
              on <strong>your</strong> account.
            </p>
          </div>
          <span className={`brutal-badge ${stripeReady ? "bg-green-500 text-white" : "bg-gray-200"}`}>
            {stripeReady ? "Connected" : connectPending ? "Pending" : "Not connected"}
          </span>
        </div>

        {!platformOk && (
          <Banner tone="warn">
            Platform Stripe is not configured yet. Email hi@frictionbounty.app and we&rsquo;ll finish setup.
          </Banner>
        )}

        {platformOk && (
          <ConnectStripeButton connected={stripeReady} pending={connectPending} />
        )}

        {org.stripeAccountId && (
          <p className="font-mono text-xs text-gray-500">
            Connected account: <code className="bg-gray-100 px-1">{org.stripeAccountId}</code>
          </p>
        )}
      </section>

      <p className="text-xs font-mono text-gray-500">
        Need help? <a className="underline" href="mailto:hi@frictionbounty.app">hi@frictionbounty.app</a>
      </p>
    </main>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase text-gray-500">{label}</dt>
      <dd className="font-medium mt-0.5 break-all">{value}</dd>
    </div>
  );
}

function Banner({ tone, children }: { tone: "good" | "warn"; children: React.ReactNode }) {
  const cls = tone === "good" ? "bg-green-100" : "bg-yellow-100";
  return (
    <div className={`brutal-box-sm ${cls} px-4 py-2 font-mono text-sm`}>{children}</div>
  );
}
