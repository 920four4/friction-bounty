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
    <div className="space-y-5 max-w-2xl">
      <header>
        <p className="dash-page-kicker">Account</p>
        <h1 className="dash-page-title">You &amp; billing</h1>
        <p className="dash-page-lead">
          Profile, Stripe Connect (rewards), and your Friction Bounty plan.
        </p>
      </header>

      {params.connect === "connected" && (
        <Banner tone="good">Stripe connected. You can issue rewards from the inbox.</Banner>
      )}
      {params.connect === "pending" && (
        <Banner tone="warn">Almost there — finish any remaining steps in Stripe if rewards still fail.</Banner>
      )}
      {params.connect === "refresh" && (
        <Banner tone="warn">Session expired — click Connect again to resume.</Banner>
      )}
      {params.billing === "success" && (
        <Banner tone="good">Welcome to Pro. Unlimited reports are unlocked.</Banner>
      )}

      {/* Profile */}
      <section className="dash-card space-y-3">
        <h2 className="font-mono text-xs uppercase font-bold m-0">Profile</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <Item label="Name" value={owner?.name || user?.name || "—"} />
          <Item label="Email" value={owner?.email || user?.email || "—"} />
          <Item label="Organization" value={org.name} />
          <Item label="Website" value={org.websiteUrl || "Not set"} />
        </dl>
        <Link href="/dashboard/settings" className="brutal-btn text-sm inline-flex">
          Edit org &amp; widget →
        </Link>
      </section>

      {/* Stripe Connect — hero section */}
      <section id="connect" className="dash-card space-y-4 scroll-mt-20">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-mono text-xs uppercase font-bold m-0">Pay reporters (Stripe Connect)</h2>
            <p className="text-sm text-gray-600 mt-1 m-0 max-w-md">
              Connect once. Approve a bug → we create a credit or promo code{" "}
              <strong>on your Stripe</strong>.
            </p>
          </div>
          <span
            className={
              "font-mono text-[10px] uppercase border-2 border-black px-2 py-0.5 font-bold " +
              (stripeReady ? "bg-green-500 text-white" : "bg-gray-100")
            }
          >
            {stripeReady ? "Connected" : connectPending ? "Pending" : "Not connected"}
          </span>
        </div>

        <div className="border-2 border-black bg-[#faf9f5] p-3 sm:p-4 space-y-2 text-sm">
          <p className="font-bold m-0">How it works (simple)</p>
          <ol className="m-0 pl-5 space-y-1.5 text-gray-800">
            <li>
              You click <strong>Connect with Stripe</strong>
            </li>
            <li>Stripe shows a short form (they host it — we never see your password)</li>
            <li>You come back here when Stripe says you’re done</li>
            <li>When you approve a report, the reward is created on <em>your</em> account</li>
          </ol>
          <p className="m-0 text-xs text-gray-600 pt-1">
            ✦ No API keys to copy · ✦ We never hold bounty cash · ✦ 0% cut of rewards
          </p>
        </div>

        {!platformOk && (
          <Banner tone="warn">Platform Stripe isn’t configured yet. Email hi@frictionbounty.app.</Banner>
        )}
        {platformOk && (
          <ConnectStripeButton connected={stripeReady} pending={connectPending} />
        )}
        {org.stripeAccountId && (
          <p className="font-mono text-[10px] text-gray-500 m-0 break-all">
            Account id: {org.stripeAccountId}
          </p>
        )}

        <details className="text-sm border-2 border-black p-3">
          <summary className="font-mono text-xs uppercase cursor-pointer font-bold">
            FAQ: Is this the same as paying for Pro?
          </summary>
          <div className="mt-2 space-y-2 text-gray-700">
            <p className="m-0">
              <strong>No.</strong> Pro is you paying Friction Bounty for the product (section below).
            </p>
            <p className="m-0">
              <strong>Connect</strong> is so <em>you</em> can pay <em>your users</em> when their bug report is good.
            </p>
          </div>
        </details>
      </section>

      {/* Plan */}
      <section className="dash-card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-mono text-xs uppercase font-bold m-0">Your Friction Bounty plan</h2>
            <p className="text-sm text-gray-600 mt-1 m-0">What you pay us — separate from bounty rewards.</p>
          </div>
          <span className={"dash-pill " + (isPro ? "dash-pill-dark" : "bg-yellow-300")}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div className="border-2 border-black p-3 bg-gray-50">
            <p className="font-mono text-[10px] uppercase text-gray-500 m-0">Plan</p>
            <p className="font-bold text-lg m-0 mt-0.5">{isPro ? "Pro — $29/mo" : "Free"}</p>
            <p className="text-xs text-gray-600 m-0 mt-1">
              {isPro ? "Unlimited reports" : "Up to 50 reports / month"}
            </p>
          </div>
          <div className="border-2 border-black p-3 bg-gray-50">
            <p className="font-mono text-[10px] uppercase text-gray-500 m-0">Status</p>
            <p className="font-bold text-lg m-0 mt-0.5 capitalize">
              {org.billingStatus === "none" ? "—" : org.billingStatus}
            </p>
          </div>
        </div>

        {isPro ? (
          <ManageBillingButton />
        ) : (
          <div className="space-y-2">
            <ul className="text-sm m-0 pl-5 space-y-1 text-gray-700">
              <li>Unlimited reports</li>
              <li>Remove powered-by badge</li>
              <li>Priority support</li>
            </ul>
            <UpgradeButton />
          </div>
        )}
      </section>

      {/* History */}
      <section className="dash-card space-y-3">
        <h2 className="font-mono text-xs uppercase font-bold m-0">Billing history</h2>
        <p className="text-xs text-gray-500 m-0">
          Only Friction Bounty charges. Other apps on the same Stripe account never appear here.
        </p>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-600 border-2 border-black p-3 bg-gray-50 m-0">No payments yet.</p>
        ) : (
          <ul className="m-0 p-0 list-none divide-y-2 divide-black border-2 border-black">
            {payments.map((p) => (
              <li key={p.id} className="p-3 flex flex-wrap justify-between gap-2 text-sm bg-white">
                <div>
                  <p className="font-mono text-[10px] text-gray-500 m-0">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                  <p className="font-medium m-0 mt-0.5">{p.description || p.type}</p>
                </div>
                <div className="text-right font-mono text-sm">
                  <p className="m-0">{p.amountCents != null ? `$${(p.amountCents / 100).toFixed(2)}` : "—"}</p>
                  <p className="text-xs text-gray-500 m-0">{p.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs font-mono text-gray-500">
        Help: <a className="underline" href="mailto:hi@frictionbounty.app">hi@frictionbounty.app</a>
      </p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase text-gray-500">{label}</dt>
      <dd className="font-medium mt-0.5 break-all m-0">{value}</dd>
    </div>
  );
}

function Banner({ tone, children }: { tone: "good" | "warn"; children: React.ReactNode }) {
  const cls = tone === "good" ? "bg-green-100" : "bg-yellow-100";
  return (
    <div className={`border-2 border-black ${cls} px-3 py-2 font-mono text-sm`}>{children}</div>
  );
}
