import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { organizations, submissions } from "@/db/schema";
import { requireOrgOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GettingStartedPage() {
  const { orgId } = await requireOrgOwner();
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  if (!org) redirect("/dashboard");

  const subs = await db.query.submissions.findMany({ where: eq(submissions.orgId, orgId), limit: 1 });
  const stripeReady = !!org.stripeSecretKey;
  const widgetSnippet = `<script src="https://friction-bounty.vercel.app/widget.js" data-key="${org.apiKey}" async></script>`;

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <header>
        <p className="font-mono text-xs uppercase text-gray-500 mb-1">Getting started</p>
        <h1 className="text-3xl md:text-4xl font-bold font-mono uppercase">Welcome, {org.name}.</h1>
        <p className="text-gray-700 mt-2">
          Friction Bounty turns silent bug-victims into paid bug-reporters. Here&rsquo;s the flow, end to end —
          from installing the widget to issuing rewards.
        </p>
      </header>

      <ProgressBar stripeReady={stripeReady} hasSubmission={subs.length > 0} />

      {/* Step 1 */}
      <Step n={1} title="Install the widget on your site" status="todo">
        <p className="text-sm text-gray-700 mb-3">
          Paste this <strong>once</strong>, just before <code className="bg-gray-100 px-1">&lt;/body&gt;</code>. The widget reads its config from your account, so you never need to redeploy to change copy or color.
        </p>
        <Snippet code={widgetSnippet} />

        <details className="mt-4">
          <summary className="font-mono text-sm uppercase cursor-pointer">Shopify</summary>
          <ol className="list-decimal pl-5 mt-2 text-sm space-y-1">
            <li>Shopify admin → <em>Online Store → Themes</em></li>
            <li>On your active theme: <em>⋯ → Edit code</em></li>
            <li>Open <code className="bg-gray-100 px-1">layout/theme.liquid</code></li>
            <li>Paste the snippet above just before the closing <code className="bg-gray-100 px-1">&lt;/body&gt;</code> tag, save</li>
          </ol>
        </details>
        <details className="mt-2">
          <summary className="font-mono text-sm uppercase cursor-pointer">WordPress</summary>
          <ol className="list-decimal pl-5 mt-2 text-sm space-y-1">
            <li>Install the &ldquo;Insert Headers and Footers&rdquo; plugin (or use your theme&rsquo;s footer hook)</li>
            <li>Paste the snippet into the <em>Footer</em> section, save</li>
          </ol>
        </details>
        <details className="mt-2">
          <summary className="font-mono text-sm uppercase cursor-pointer">Next.js / React</summary>
          <p className="text-sm mt-2">
            In your root <code className="bg-gray-100 px-1">layout.tsx</code>, add the widget with the <code className="bg-gray-100 px-1">next/script</code> component:
          </p>
          <Snippet code={`import Script from "next/script";\n\n<Script src="https://friction-bounty.vercel.app/widget.js" data-key="${org.apiKey}" strategy="afterInteractive" />`} />
        </details>
      </Step>

      {/* Step 2 */}
      <Step n={2} title="Connect Stripe so you can pay rewards" status={stripeReady ? "done" : "todo"}>
        <p className="text-sm text-gray-700 mb-3">
          Rewards are issued as <strong>customer credit on your Stripe account</strong> — we never touch the money. When you approve a report, we look up (or create) the reporter as a customer in your Stripe and apply the credit.
        </p>
        <ol className="list-decimal pl-5 text-sm space-y-1 mb-4">
          <li>In Stripe → <em>Developers → API keys</em>, create a <strong>restricted key</strong></li>
          <li>Permissions: <em>Customers (read/write)</em>, <em>Customer Balance Transactions (write)</em>, <em>Coupons (write)</em>, <em>Promotion Codes (write)</em></li>
          <li>Copy the key (starts with <code className="bg-gray-100 px-1">rk_live_…</code>)</li>
          <li>Paste it on the <Link className="underline" href="/dashboard/settings">Settings page</Link></li>
        </ol>
        {stripeReady ? (
          <p className="brutal-box-sm bg-green-100 px-3 py-2 font-mono text-sm">✓ Stripe key on file. You can issue rewards.</p>
        ) : (
          <p className="brutal-box-sm bg-yellow-100 px-3 py-2 font-mono text-sm">
            Until you add a Stripe key, you can still review &amp; reply — the &ldquo;reward&rdquo; step will fail with a clear message.
          </p>
        )}
      </Step>

      {/* Step 3 */}
      <Step n={3} title="Tune the widget &amp; bounty amount" status="optional">
        <p className="text-sm text-gray-700 mb-3">
          On <Link href="/dashboard/settings" className="underline">Settings</Link> you can change:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Default bounty amount</strong> — what reporters earn for an approved report. You can override per-submission when approving.</li>
          <li><strong>Widget color &amp; position</strong> — match your brand.</li>
          <li><strong>Welcome message</strong> — what the user sees when they open the badge.</li>
          <li><strong>Notification email</strong> — where new-report alerts go. Defaults to your account email.</li>
        </ul>
      </Step>

      {/* Step 4 */}
      <Step n={4} title="Test it on your live site" status={subs.length > 0 ? "done" : "todo"}>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Visit your site after installing — you should see the badge in the corner you chose.</li>
          <li>Click it, fill out a fake report, optionally take a screenshot, hit submit.</li>
          <li>Within a second you&rsquo;ll get a notification email; the report appears in your <Link href="/dashboard" className="underline">inbox</Link>.</li>
          <li>The reporter receives a confirmation email automatically.</li>
        </ol>
        {subs.length > 0 && (
          <p className="brutal-box-sm bg-green-100 px-3 py-2 font-mono text-sm mt-3">✓ At least one submission has landed.</p>
        )}
      </Step>

      {/* Step 5 */}
      <Step n={5} title="Triage a real report">
        <p className="text-sm text-gray-700 mb-3">When a real report lands, open the submission. You&rsquo;ll see:</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mb-4">
          <li>The reporter&rsquo;s description, page URL, browser, OS, viewport, and screenshot</li>
          <li>The full conversation thread (this is your first message touchpoint)</li>
        </ul>
        <p className="text-sm text-gray-700 mb-1">Three things you can do:</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Reply</strong> — emails the reporter (e.g. &ldquo;can you share the order number?&rdquo;). They reply directly to you.</li>
          <li><strong>Approve &amp; reward</strong> — sets bounty (you can change it), issues Stripe credit, emails the reporter the good news.</li>
          <li><strong>Decline</strong> — for spam, dupes, or non-bugs. The reason you type is emailed to the reporter.</li>
        </ul>
      </Step>

      {/* Step 6 */}
      <Step n={6} title="What the reporter sees">
        <p className="text-sm text-gray-700 mb-3">
          For approved reports, the bounty appears as <strong>account credit on your Stripe customer record</strong> for that email. Next time they check out on your site (using the same email), Stripe automatically deducts the credit from the order.
        </p>
        <p className="text-sm text-gray-700">
          They get an email at every step: receipt on submit, your replies, and the final approve/decline.
        </p>
      </Step>

      <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-black">
        <Link href="/dashboard" className="brutal-btn-black">Go to inbox →</Link>
        <Link href="/dashboard/settings" className="brutal-btn">Open settings</Link>
      </div>
    </main>
  );
}

function ProgressBar({ stripeReady, hasSubmission }: { stripeReady: boolean; hasSubmission: boolean }) {
  const items = [
    { label: "Install widget", done: hasSubmission },
    { label: "Connect Stripe", done: stripeReady },
    { label: "First report received", done: hasSubmission },
  ];
  return (
    <div className="brutal-box p-4 flex flex-wrap items-center gap-3">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={
            it.done
              ? "inline-flex items-center justify-center w-6 h-6 border-2 border-black bg-green-500 text-white font-mono text-sm"
              : "inline-flex items-center justify-center w-6 h-6 border-2 border-black bg-white text-black font-mono text-sm"
          }>{it.done ? "✓" : i + 1}</span>
          <span className={"font-mono text-sm " + (it.done ? "line-through text-gray-500" : "")}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function Step({ n, title, status, children }: { n: number; title: string; status?: "todo" | "done" | "optional"; children: React.ReactNode }) {
  const badge =
    status === "done" ? <span className="brutal-badge bg-green-500 text-white">Done</span>
    : status === "optional" ? <span className="brutal-badge">Optional</span>
    : null;
  return (
    <section className="brutal-box p-6">
      <header className="flex flex-wrap items-center gap-3 mb-3">
        <span className="brutal-box-sm bg-black text-white w-9 h-9 flex items-center justify-center font-mono font-bold">{n}</span>
        <h2 className="font-mono font-bold uppercase text-lg" dangerouslySetInnerHTML={{ __html: title }} />
        {badge}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <pre className="brutal-box-sm p-4 font-mono text-xs bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap break-all">{code}</pre>
  );
}
