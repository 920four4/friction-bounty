import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { organizations, paymentEvents, users } from "@/db/schema";
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

  const owner =
    user?.id && user.id !== "super"
      ? await db.query.users.findFirst({ where: eq(users.id, user.id) })
      : null;

  const payments = await db.query.paymentEvents.findMany({
    where: eq(paymentEvents.orgId, orgId),
    orderBy: [desc(paymentEvents.createdAt)],
    limit: 50,
  });

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header>
        <p className="font-mono text-xs uppercase text-gray-500 mb-1">Account</p>
        <h1 className="text-3xl font-bold font-mono uppercase">Profile &amp; billing</h1>
        <p className="text-gray-600 mt-2 text-sm">
          Your account details, Friction Bounty subscription, invoices, and Stripe Connect for rewards.
        </p>
      </header>

      {params.connect === "connected" && (
        <Banner tone="good">Stripe connected. You can issue rewards from any submission.</Banner>
      )}
      {params.connect === "pending" && (
        <Banner tone="warn">Stripe setup started — finish remaining steps if rewards still fail.</Banner>
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
          <Item label="Member since" value={owner ? new Date(owner.createdAt).toLocaleDateString() : "—"} />
          <Item label="Org ID" value={org.id.slice(0, 8) + "…"} />
        </dl>
        <Link href="/dashboard/settings" className="brutal-btn text-sm inline-block">
          Edit org &amp; widget settings →
        </Link>
      </section>

      {/* Billing plan */}
      <section className="brutal-box p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-mono font-bold uppercase">Plan &amp; billing</h2>
            <p className="text-sm text-gray-600 mt-1">
              What you pay <em>us</em> for Friction Bounty. Separate from bounty rewards on your Stripe.
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
            <p className="font-mono text-xs uppercase text-gray-500 mb-1">Subscription status</p>
            <p className="font-bold font-mono text-lg capitalize">
              {org.billingStatus === "none" ? "—" : org.billingStatus}
            </p>
            <p className="text-xs text-gray-600 mt-1 break-all">
              {org.billingCustomerId ? `Customer ${org.billingCustomerId}` : "No Stripe customer yet"}
            </p>
          </div>
        </div>

        {isPro ? <ManageBillingButton /> : (
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

      {/* Payment history */}
      <section className="brutal-box p-6 space-y-3">
        <h2 className="font-mono font-bold uppercase">Billing history</h2>
        <p className="text-xs text-gray-500">
          Only Friction Bounty charges (app-tagged). Other products on the same Stripe account never appear here.
        </p>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-600 brutal-box-sm p-3 bg-gray-50">No payments yet.</p>
        ) : (
          <ul className="divide-y-2 divide-black border-2 border-black">
            {payments.map((p) => (
              <li key={p.id} className="p-3 flex flex-wrap justify-between gap-2 text-sm bg-white">
                <div>
                  <p className="font-mono text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</p>
                  <p className="font-medium">{p.description || p.type}</p>
                  <p className="font-mono text-[10px] text-gray-400">{p.type}</p>
                </div>
                <div className="text-right font-mono text-sm">
                  <p>{p.amountCents != null ? `$${(p.amountCents / 100).toFixed(2)}` : "—"}</p>
                  <p className="text-xs text-gray-500">{p.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {isPro && (
          <p className="text-xs text-gray-500">
            Need a PDF invoice? Use <strong>Manage billing</strong> for the Stripe customer portal.
          </p>
        )}
      </section>

      {/* Connect */}
      <section className="brutal-box p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-mono font-bold uppercase">Reward payouts (Stripe Connect)</h2>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Connect your Stripe account with one click. We never ask for API keys. Rewards issue on{" "}
              <strong>your</strong> account as credits or promo codes.
            </p>
          </div>
          <span className={`brutal-badge ${stripeReady ? "bg-green-500 text-white" : "bg-gray-200"}`}>
            {stripeReady ? "Connected" : connectPending ? "Pending" : "Not connected"}
          </span>
        </div>

        {!platformOk && (
          <Banner tone="warn">
            Platform Stripe is not configured yet. Email hi@frictionbounty.app.
          </Banner>
        )}
        {platformOk && <ConnectStripeButton connected={stripeReady} pending={connectPending} />}
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
  return <div className={`brutal-box-sm ${cls} px-4 py-2 font-mono text-sm`}>{children}</div>;
}
