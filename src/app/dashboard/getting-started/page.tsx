import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { organizations, submissions } from "@/db/schema";
import { requireOrgOwner } from "@/lib/auth";
import { widgetBaseUrl } from "@/lib/url";
import { orgCanIssueRewards } from "@/lib/stripe";
import { CopyField } from "@/components/copy-button";
import { ConnectStripeButton } from "@/components/account-actions";

export const dynamic = "force-dynamic";

export default async function GettingStartedPage() {
  const { orgId } = await requireOrgOwner();
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  if (!org) redirect("/dashboard");

  const subs = await db.query.submissions.findMany({
    where: eq(submissions.orgId, orgId),
    limit: 1,
  });

  const installed = subs.length > 0; // first report is the real install proof
  const stripeReady = orgCanIssueRewards(org);
  const connectPending = !!org.stripeAccountId && !org.stripeChargesEnabled;
  const widgetUrl = `${widgetBaseUrl()}/widget.js`;
  const widgetSnippet = `<script src="${widgetUrl}" data-key="${org.apiKey}" async></script>`;

  const checklist = [
    { id: 1, label: "Copy & paste the widget", done: true, note: "Always available below" },
    { id: 2, label: "Connect Stripe for rewards", done: stripeReady, note: stripeReady ? "Ready to pay bounties" : "One-click, no API keys" },
    { id: 3, label: "Get your first report", done: installed, note: installed ? "Inbox has activity" : "Submit a test bug from your site" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header>
        <p className="font-mono text-xs uppercase text-gray-500 mb-1">Setup</p>
        <h1 className="text-3xl md:text-4xl font-bold font-mono uppercase leading-tight">
          Welcome, {org.name}.
        </h1>
        <p className="text-gray-700 mt-2">
          Three steps to a live bug bounty. Takes about two minutes.
        </p>
      </header>

      {/* Progress */}
      <section className="brutal-box p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="font-mono text-xs uppercase text-gray-500">Progress</p>
          <p className="font-mono text-sm font-bold">{doneCount} / {checklist.length}</p>
        </div>
        <div className="w-full h-3 border-2 border-black bg-white mb-4">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(doneCount / checklist.length) * 100}%` }}
          />
        </div>
        <ol className="space-y-2">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-start gap-3">
              <span
                className={
                  "shrink-0 w-7 h-7 border-2 border-black flex items-center justify-center font-mono text-sm " +
                  (c.done ? "bg-green-500 text-white" : "bg-white")
                }
              >
                {c.done ? "✓" : c.id}
              </span>
              <div>
                <p className={"font-mono text-sm font-bold " + (c.done ? "line-through text-gray-500" : "")}>
                  {c.label}
                </p>
                <p className="text-xs text-gray-500 font-mono">{c.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Step 1 — Install */}
      <section className="brutal-box p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="brutal-box-sm bg-black text-white w-8 h-8 flex items-center justify-center font-mono font-bold text-sm">1</span>
          <h2 className="font-mono font-bold uppercase text-lg">Paste this on your site</h2>
        </div>
        <p className="text-sm text-gray-700">
          One line, just before <code className="bg-gray-100 px-1">&lt;/body&gt;</code>.
          Works on any stack — React, Next, Vue, Shopify themes, plain HTML.
        </p>
        <CopyField value={widgetSnippet} />
        <details className="text-sm">
          <summary className="font-mono text-xs uppercase cursor-pointer">Next.js snippet</summary>
          <div className="mt-2">
            <CopyField
              value={`import Script from "next/script";\n\n<Script src="${widgetUrl}" data-key="${org.apiKey}" strategy="afterInteractive" />`}
            />
          </div>
        </details>
        <p className="text-xs font-mono text-gray-500">
          API key is already in the snippet — no extra config. Change color &amp; copy anytime in{" "}
          <Link href="/dashboard/settings" className="underline">Settings</Link>.
        </p>
      </section>

      {/* Step 2 — Stripe Connect */}
      <section className="brutal-box p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="brutal-box-sm bg-black text-white w-8 h-8 flex items-center justify-center font-mono font-bold text-sm">2</span>
          <h2 className="font-mono font-bold uppercase text-lg">Connect Stripe for rewards</h2>
        </div>
        <p className="text-sm text-gray-700">
          Click once. Stripe opens a secure form for your business details.
          <strong> We never ask for API keys</strong> — and never hold reward money.
        </p>
        {stripeReady ? (
          <p className="brutal-box-sm bg-green-100 px-3 py-2 font-mono text-sm">
            ✓ Stripe connected. You can approve &amp; reward reports.
          </p>
        ) : (
          <ConnectStripeButton connected={false} pending={connectPending} />
        )}
        <p className="text-xs text-gray-500 font-mono">
          Prefer full account settings?{" "}
          <Link href="/dashboard/account" className="underline">Open Account →</Link>
        </p>
      </section>

      {/* Step 3 — Test */}
      <section className="brutal-box p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="brutal-box-sm bg-black text-white w-8 h-8 flex items-center justify-center font-mono font-bold text-sm">3</span>
          <h2 className="font-mono font-bold uppercase text-lg">Send a test report</h2>
        </div>
        <ol className="list-decimal pl-5 text-sm space-y-1 text-gray-700">
          <li>Open your site with the widget installed</li>
          <li>Click the badge → describe a fake bug → submit</li>
          <li>It lands in your inbox in about a second</li>
        </ol>
        {installed ? (
          <p className="brutal-box-sm bg-green-100 px-3 py-2 font-mono text-sm">
            ✓ First report received. You&rsquo;re live.
          </p>
        ) : (
          <p className="brutal-box-sm bg-yellow-100 px-3 py-2 font-mono text-sm">
            Waiting for your first report…
          </p>
        )}
      </section>

      {/* How rewards work — short */}
      <section className="brutal-box p-6 bg-gray-50 space-y-2">
        <h2 className="font-mono font-bold uppercase text-sm">How rewards work (30 sec)</h2>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>→ You review every report — nothing pays out automatically</li>
          <li>→ Approve → credit on their Stripe customer, or a one-time promo code</li>
          <li>→ Optional monthly budget blocks overspending</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/dashboard" className="brutal-btn-black">
          Go to inbox →
        </Link>
        <Link href="/dashboard/settings" className="brutal-btn">
          Widget settings
        </Link>
        <Link href="/dashboard/account" className="brutal-btn">
          Account &amp; billing
        </Link>
      </div>
    </main>
  );
}
