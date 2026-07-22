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

  const installed = subs.length > 0;
  const stripeReady = orgCanIssueRewards(org);
  const connectPending = !!org.stripeAccountId && !org.stripeChargesEnabled;
  const widgetUrl = `${widgetBaseUrl()}/widget.js`;
  const widgetSnippet = `<script src="${widgetUrl}" data-key="${org.apiKey}" async></script>`;

  // 1 = snippet copied/install proven by first report, 2 = Stripe, 3 = test report (same signal as install)
  const stepDone = {
    install: installed,
    stripe: stripeReady,
    test: installed,
  };
  const progressDone =
    (stepDone.install ? 1 : 0) + (stepDone.stripe ? 1 : 0) + (stepDone.test ? 1 : 0);

  const chips = [
    { id: 1, label: "Install", href: "#install", done: stepDone.install },
    { id: 2, label: "Stripe", href: "#connect", done: stepDone.stripe },
    { id: 3, label: "Test", href: "#test", done: stepDone.test },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <p className="dash-page-kicker">Setup</p>
        <h1 className="dash-page-title">Get live in 3 steps</h1>
        <p className="dash-page-lead">
          Welcome, <strong>{org.name}</strong>. Copy one line of code, connect Stripe (no API keys),
          then send yourself a test report.
        </p>
      </header>

      {/* Progress */}
      <section className="dash-card">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="font-mono text-xs uppercase text-gray-500">Your progress</p>
          <p className="font-mono text-sm font-bold">{progressDone} / 3</p>
        </div>
        <div className="w-full h-2.5 border-2 border-black bg-white mb-4">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(progressDone / 3) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((s) => (
            <a
              key={s.id}
              href={s.href}
              className={
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black font-mono text-xs " +
                (s.done ? "bg-green-100" : "bg-white")
              }
            >
              <span>{s.done ? "✓" : s.id}</span>
              {s.label}
            </a>
          ))}
        </div>
      </section>

      {/* Step 1 */}
      <section id="install" className="dash-card space-y-3 scroll-mt-20">
        <div className="flex items-start gap-3">
          <span className={"dash-step-num " + (installed ? "done" : "")}>1</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg m-0">Install the widget</h2>
            <p className="text-sm text-gray-600 mt-1 m-0">
              Paste this once on your site, just before <code className="bg-gray-100 px-1 text-xs">&lt;/body&gt;</code>.
              Works on any stack.
            </p>
          </div>
        </div>
        <CopyField value={widgetSnippet} />
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/settings" className="brutal-btn text-sm">
            Preview &amp; brand the look →
          </Link>
        </div>
        <p className="text-xs text-gray-500 m-0">
          Color, style, corner, and button label are in <strong>Widget</strong> settings — no need to change this snippet again.
        </p>
      </section>

      {/* Step 2 — Stripe Connect explained simply */}
      <section id="connect" className="dash-card space-y-4 scroll-mt-20">
        <div className="flex items-start gap-3">
          <span className={"dash-step-num " + (stripeReady ? "done" : "")}>2</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg m-0">Connect Stripe for rewards</h2>
            <p className="text-sm text-gray-600 mt-1 m-0">
              So you can pay reporters with <strong>your</strong> money — not ours.
            </p>
          </div>
        </div>

        {stripeReady ? (
          <div className="border-2 border-black bg-green-100 px-3 py-2.5 font-mono text-sm">
            ✓ Stripe connected. You can approve reports and issue rewards.
          </div>
        ) : (
          <>
            <div className="border-2 border-black bg-yellow-50 p-3 sm:p-4 space-y-3 text-sm">
              <p className="font-bold m-0">What is this?</p>
              <p className="m-0 text-gray-700 leading-relaxed">
                You click <strong>Connect with Stripe</strong>. Stripe opens a short form (business details).
                When you’re done, we can create credits or promo codes <em>on your Stripe account</em> when you
                approve a bug.
              </p>
              <p className="m-0 text-gray-700 leading-relaxed">
                <strong>We never ask for API keys.</strong> We never hold the bounty money. We don’t take a cut of rewards.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-xs uppercase text-gray-500 m-0">What you’ll do (about 2 minutes)</p>
              <ol className="m-0 pl-5 space-y-1.5 text-sm text-gray-800">
                <li>Click the button below</li>
                <li>Log into Stripe or create an account</li>
                <li>Answer Stripe’s questions (business type, etc.)</li>
                <li>Come back here — status becomes “Connected”</li>
              </ol>
            </div>

            <ConnectStripeButton connected={false} pending={connectPending} />

            <details className="text-sm border-2 border-black p-3 bg-gray-50">
              <summary className="font-mono text-xs uppercase cursor-pointer font-bold">
                Two kinds of money (read this once)
              </summary>
              <ul className="mt-3 space-y-2 text-gray-700 pl-0 list-none">
                <li>
                  <strong>Paying us (optional Pro)</strong> — your Friction Bounty subscription. Managed under Account → Billing.
                </li>
                <li>
                  <strong>Paying reporters</strong> — credits/promo codes on <em>your</em> Stripe when you approve a report.
                  That’s what Connect is for.
                </li>
              </ul>
            </details>
          </>
        )}

        <Link href="/dashboard/account" className="text-sm underline font-mono">
          Full Account page (billing + Connect) →
        </Link>
      </section>

      {/* Step 3 */}
      <section id="test" className="dash-card space-y-3 scroll-mt-20">
        <div className="flex items-start gap-3">
          <span className={"dash-step-num " + (installed ? "done" : "")}>3</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg m-0">Send a test report</h2>
            <p className="text-sm text-gray-600 mt-1 m-0">
              Prove the install works end-to-end.
            </p>
          </div>
        </div>
        <ol className="m-0 pl-5 space-y-1.5 text-sm text-gray-800">
          <li>Open your site with the snippet installed</li>
          <li>Tap the corner button → fill a fake bug → submit</li>
          <li>It appears in your <Link href="/dashboard" className="underline">Inbox</Link> within a second</li>
        </ol>
        {installed ? (
          <div className="border-2 border-black bg-green-100 px-3 py-2.5 font-mono text-sm">
            ✓ First report received. You’re live.
          </div>
        ) : (
          <div className="border-2 border-black bg-yellow-50 px-3 py-2.5 font-mono text-sm">
            Waiting for your first report…
          </div>
        )}
      </section>

      <section className="dash-card bg-gray-50 space-y-2">
        <h2 className="font-mono text-xs uppercase font-bold m-0">After you’re live</h2>
        <ul className="m-0 pl-5 text-sm space-y-1 text-gray-700">
          <li>Review every report yourself — nothing pays automatically</li>
          <li>Approve → credit or promo code on your Stripe</li>
          <li>Optional monthly budget stops overspend</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link href="/dashboard" className="brutal-btn-black">
          Go to inbox →
        </Link>
        <Link href="/dashboard/settings" className="brutal-btn">
          Widget look
        </Link>
      </div>
    </div>
  );
}
