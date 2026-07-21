import Link from "next/link";
import { widgetBaseUrl } from "@/lib/url";

export default function Home() {
  const widgetSrc = `${widgetBaseUrl()}/widget.js`;
  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold uppercase text-sm">Friction Bounty</Link>
          <div className="flex items-center gap-3">
            <a href="#how" className="font-mono text-sm uppercase hidden md:inline hover:underline">How it works</a>
            <a href="#who" className="font-mono text-sm uppercase hidden md:inline hover:underline">Who it&rsquo;s for</a>
            <a href="#faq" className="font-mono text-sm uppercase hidden md:inline hover:underline">FAQ</a>
            <Link href="/pricing" className="font-mono text-sm uppercase hidden md:inline hover:underline">Pricing</Link>
            <Link href="/login" className="font-mono text-sm uppercase hover:underline">Log in</Link>
            <Link href="/signup" className="brutal-btn-black text-sm">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-yellow-300 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="brutal-box-white inline-block px-3 py-1 mb-6">
              <span className="font-mono text-xs uppercase">Bug bounties for the other 99% of your users</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-mono uppercase leading-[1.05] mb-6">
              Your users found<br />the bug.<br />Pay them to tell you.
            </h1>
            <p className="text-lg md:text-xl font-mono leading-relaxed mb-8 max-w-xl">
              Most people who hit a broken checkout just leave — quietly, forever. Friction Bounty puts a reward on every
              report, so the bugs costing you customers land in your inbox instead of your churn stats.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="brutal-btn-black text-center">Start free — get your snippet</Link>
              <a href="#how" className="brutal-btn text-center">See how it works</a>
            </div>
            <p className="font-mono text-xs text-black/60 mt-4">No credit card. Set your own bounties. We never touch your payout money.</p>
          </div>

          {/* Mock dashboard preview */}
          <div className="brutal-box bg-white p-1">
            <div className="border-b-2 border-black bg-gray-100 px-3 py-2 font-mono text-xs uppercase flex items-center justify-between">
              <span>Inbox · acme.shop</span>
              <span className="brutal-badge-yellow">3 pending</span>
            </div>
            <div className="px-3 pt-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase text-gray-500 mb-1">
                <span>Budget · July</span>
                <span>$120 / $500</span>
              </div>
              <div className="w-full h-2 border-2 border-black bg-white mb-3">
                <div className="h-full bg-green-500" style={{ width: "24%" }} />
              </div>
            </div>
            <div className="px-3 pb-3 space-y-2 text-sm">
              <MockRow status="pending" title="Checkout button does nothing on iOS Safari" who="rachel@…" amount="20" />
              <MockRow status="rewarded" title="Coupon field cuts off on /cart" who="dev@…" amount="10" />
              <MockRow status="rejected" title="i want a free shirt" who="spam@…" amount="0" />
              <MockRow status="pending" title="Image gallery scrolls past last item" who="ben@…" amount="15" />
            </div>
          </div>
        </div>
      </section>

      {/* Honest stat strip — every number is a fact about the product, not a claim about traction */}
      <section className="bg-black text-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Stat big="1 line" small="to install — one script tag" />
          <Stat big="~30 sec" small="from paste to live badge" />
          <Stat big="0%" small="we take from your rewards" />
          <Stat big="100%" small="of payouts on your own Stripe" />
        </div>
      </section>

      {/* Problem */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-6 leading-tight">
              Silent bugs are your most expensive bugs.
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              For every user who bothers to email support, a crowd of others just close the tab. You never see the
              broken flow — you only feel it later, in a churn number nobody can trace back to a cause.
            </p>
            <p className="text-lg leading-relaxed">
              A reward flips that math. Suddenly the fastest, cheapest QA team you have is the users already standing on
              the bug — and they&rsquo;re happy to point at it.
            </p>
          </div>
          <div className="mt-8 md:mt-0 brutal-box-yellow p-8">
            <p className="font-mono text-sm uppercase text-gray-700 mb-4">The trade</p>
            <div className="space-y-4 font-mono">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">A churned customer</span>
              </div>
              <p className="text-sm">Gone silently. LTV lost. No idea why.</p>
              <div className="brutal-divider" />
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">vs. a $20 credit</span>
              </div>
              <p className="text-sm">A fixed bug, a happy reporter, and a customer who stayed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="who" className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">Who it&rsquo;s for</h2>
          <p className="text-lg font-mono mb-12 max-w-3xl">Same 30-second install. Two ways to pay it back.</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Software / SaaS */}
            <div className="brutal-box p-8">
              <p className="font-mono text-xs uppercase text-gray-500 mb-2">SaaS &amp; software teams</p>
              <h3 className="text-2xl font-bold font-mono uppercase mb-4">Ship faster, churn less.</h3>
              <ul className="space-y-3 text-sm leading-relaxed">
                <Bullet>Drop one script tag into any web app — React, Next.js, Vue, Svelte, plain HTML</Bullet>
                <Bullet>Every report ships with screenshot, browser, OS, viewport &amp; exact URL — reproduce in minutes</Bullet>
                <Bullet>Reward with Stripe customer credit (auto-applied at their next invoice) or a one-time promo code</Bullet>
                <Bullet>Perfect for subscriptions — the credit quietly lands on the account they already have</Bullet>
              </ul>
              <Link href="/signup" className="brutal-btn-black inline-block mt-6">Create your inbox →</Link>
            </div>

            {/* Ecommerce / Shopify */}
            <div className="brutal-box p-8 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-xs uppercase text-gray-500">Ecommerce &amp; Shopify</p>
                <span className="brutal-badge">Native app in beta</span>
              </div>
              <h3 className="text-2xl font-bold font-mono uppercase mb-4">Catch the checkout bug before it costs the sale.</h3>
              <ul className="space-y-3 text-sm leading-relaxed">
                <Bullet>The report widget drops onto any Shopify theme (or any storefront) today</Bullet>
                <Bullet>Reward hunters right now with a Stripe promo code — no theme surgery, no dev</Bullet>
                <Bullet><strong>Coming:</strong> native Shopify gift-card &amp; store-credit payouts via the discount API — no Stripe key needed</Bullet>
                <Bullet>A broken cart on mobile Safari is a lost order. This is the tripwire.</Bullet>
              </ul>
              <p className="font-mono text-xs text-gray-600 mt-6">
                Want the native Shopify app first? Start free today and email <strong>hi@frictionbounty.app</strong> for beta access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-green-50 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">How it works</h2>
          <p className="text-lg font-mono mb-12 max-w-3xl">Four steps. No engineering team required.</p>

          <div className="grid md:grid-cols-4 gap-4">
            <Step n="1" title="Install" body="Sign up, copy your unique script tag, paste it before </body>. The badge is live — no redeploys to change color or copy." />
            <Step n="2" title="User reports" body="A user hits a bug, clicks the badge, types what broke, optionally snaps and annotates a screenshot, hits submit. No account needed." />
            <Step n="3" title="You review" body="In your inbox: full context, screenshot, page URL, browser. Approve, decline as spam, or reply for more info — every message is emailed." />
            <Step n="4" title="Auto reward" body="Approve → Stripe credit or a promo code is issued on your account. The reporter gets an email. Your monthly budget keeps the spend capped." />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-12">What&rsquo;s in the box</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Feature title="Production context" body="Every report includes URL, browser, OS, viewport size, and an optional annotated screenshot. Reproduce in minutes, not days." />
            <Feature title="Two-way conversation" body="Reply to a reporter for clarification before deciding. Every message is logged on the submission and emailed out." />
            <Feature title="Spam control" body="Rate-limited per IP per org. You review before any money moves. Decline-as-spam closes the loop with the reporter." />
            <Feature title="Monthly budget cap" body="Set a hard spend ceiling per calendar month. A live meter tracks payouts; approvals block automatically once you hit it. No surprises." />
            <Feature title="Your Stripe, your money" body="Rewards land on your Stripe account, not ours. We never hold or touch payout funds — we just trigger the credit or promo code." />
            <Feature title="Configurable widget" body="Pick your color, position, welcome message, and default bounty. Matches your brand without code." />
          </div>
        </div>
      </section>

      {/* Reward types */}
      <section className="bg-blue-50 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">Two ways to pay a bounty</h2>
          <p className="text-lg font-mono mb-12 max-w-3xl">You choose per approval. Both run on your own Stripe.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="brutal-box-white p-6">
              <p className="font-mono text-xs uppercase mb-2">Customer credit <span className="brutal-badge">Default</span></p>
              <p className="text-sm leading-relaxed mb-3">
                We add the bounty as a balance credit on the reporter&rsquo;s Stripe customer record. Next time they check
                out with the same email, it&rsquo;s auto-deducted from the invoice. Zero friction — nothing to remember.
              </p>
              <p className="text-xs text-gray-500 font-mono">Best for: subscriptions &amp; repeat purchases.</p>
            </div>
            <div className="brutal-box-white p-6">
              <p className="font-mono text-xs uppercase mb-2">Promo code</p>
              <p className="text-sm leading-relaxed mb-3">
                We create a single-use Stripe promotion code for the bounty amount and email it to the reporter. They
                paste it at checkout. Expires in 30 days. Tangible and immediate.
              </p>
              <p className="text-xs text-gray-500 font-mono">Best for: one-off purchases &amp; first-time buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="bg-blue-100 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">Install in 30 seconds</h2>
          <p className="font-mono text-lg mb-8 max-w-3xl">Sign up, grab your key, paste one line. That&rsquo;s the whole integration.</p>

          <div className="brutal-box-white p-6 bg-white max-w-3xl">
            <p className="font-mono text-xs uppercase mb-3 text-gray-500">Any web app or storefront</p>
            <pre className="brutal-box-sm p-4 font-mono text-xs bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap break-all">{`<script src="${widgetSrc}"
        data-key="fb_pk_yourkey..."
        async></script>`}</pre>
            <p className="text-sm text-gray-600 mt-3">Drop in before <code className="bg-gray-100 px-1">&lt;/body&gt;</code>. Works anywhere JavaScript runs — including Shopify themes.</p>
          </div>

          <div className="mt-8">
            <Link href="/signup" className="brutal-btn-black inline-block">Get my key →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-10">Straight answers</h2>
          <div className="space-y-3">
            <Faq q="What does it cost?">
              Free to start — no credit card. You fund the bounties you approve, and we take <strong>0%</strong> of them.
              The only money that moves is the reward you choose to pay, on your own Stripe. See <Link href="/pricing" className="underline">pricing</Link>.
            </Faq>
            <Faq q="Where does the reward money come from?">
              Your Stripe account. You connect a restricted key; when you approve a report we issue the credit or promo
              code on your account. We never hold, route, or touch payout funds.
            </Faq>
            <Faq q="Does it actually work on Shopify?">
              Yes — the report widget installs on any Shopify theme today, and you can reward hunters with a Stripe promo
              code right away. Native Shopify gift-card &amp; store-credit payouts (no Stripe key required) are in private
              beta — start free and email us for early access.
            </Faq>
            <Faq q="Do reporters need to sign up?">
              No. The widget on your site is everything they need — they type the issue, optionally attach a screenshot,
              and submit. They only give an email so you can reward and reply.
            </Faq>
            <Faq q="How do you stop people farming rewards?">
              Submissions are rate-limited per IP per org, and <strong>nothing pays out automatically</strong> — you
              review every report before approving. Spam gets declined in one click, with a note emailed to the reporter.
            </Faq>
            <Faq q="Can I control how much I spend?">
              Set a monthly budget and it&rsquo;s a hard cap: a live meter tracks payouts, and any approval that would push
              you over the limit is blocked until next month or you raise it.
            </Faq>
            <Faq q="What do I have to add to my code?">
              One <code className="bg-gray-100 px-1">&lt;script&gt;</code> tag. No SDK, no npm package, no build step.
              React, Next.js, Vue, Svelte, plain HTML, Shopify — same single line.
            </Faq>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="brutal-box-white bg-white text-black p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-4">Catch the bugs that cost you customers.</h2>
            <p className="font-mono text-lg mb-8 max-w-2xl">
              The cheapest bug report is the one a user willingly hands you. Make it worth their time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="brutal-btn-black bg-yellow-300 text-black border-black inline-block text-center">Start free</Link>
              <Link href="/login" className="brutal-btn inline-block text-center">I already have an account</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-100 border-t-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-3">
          <p className="font-mono text-sm text-gray-600">Friction Bounty — built by 920four</p>
          <div className="flex flex-wrap gap-4 font-mono text-sm text-gray-600">
            <a href="#faq">FAQ</a>
            <Link href="/pricing">Pricing</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:hi@frictionbounty.app">Contact</a>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="font-mono">→</span>
      <span>{children}</span>
    </li>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold font-mono text-yellow-300 leading-none mb-2">{big}</p>
      <p className="font-mono text-xs uppercase text-gray-300 leading-snug">{small}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="brutal-box-white p-5">
      <div className="brutal-box-sm bg-black text-white w-10 h-10 flex items-center justify-center font-mono font-bold mb-3">{n}</div>
      <h3 className="font-mono font-bold uppercase mb-2">{title}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="brutal-box p-5">
      <h3 className="font-mono font-bold uppercase mb-2">{title}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="brutal-box p-5 group">
      <summary className="font-mono font-bold uppercase text-sm cursor-pointer flex items-center justify-between gap-4 list-none">
        <span>{q}</span>
        <span aria-hidden className="font-mono text-xl leading-none group-open:rotate-45 transition-transform">+</span>
      </summary>
      <p className="text-sm text-gray-700 leading-relaxed mt-3">{children}</p>
    </details>
  );
}

function MockRow({ status, title, who, amount }: { status: "pending" | "rewarded" | "rejected"; title: string; who: string; amount: string }) {
  const badge = status === "pending"
    ? <span className="brutal-badge-yellow">pending</span>
    : status === "rewarded"
      ? <span className="inline-block border border-black bg-green-500 text-white px-2 py-0.5 text-xs font-mono uppercase">rewarded</span>
      : <span className="inline-block border border-black bg-gray-400 text-white px-2 py-0.5 text-xs font-mono uppercase">rejected</span>;
  return (
    <div className="border-2 border-black px-3 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {badge}
        <span className="truncate">{title}</span>
      </div>
      <div className="flex items-center gap-3 font-mono text-xs text-gray-500 shrink-0">
        <span>{who}</span>
        <span>${amount}</span>
      </div>
    </div>
  );
}
