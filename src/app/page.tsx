import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <nav className="border-b-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold uppercase text-sm">Friction Bounty</Link>
          <div className="flex items-center gap-3">
            <a href="#how" className="font-mono text-sm uppercase hidden md:inline hover:underline">How it works</a>
            <a href="#install" className="font-mono text-sm uppercase hidden md:inline hover:underline">Install</a>
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
              <span className="font-mono text-xs uppercase">For SaaS products</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-mono uppercase leading-[1.05] mb-6">
              Pay your users<br />to find your bugs.
            </h1>
            <p className="text-lg md:text-xl font-mono leading-relaxed mb-8 max-w-xl">
              When something breaks in your app, most users churn quietly. A handful would tell you — if it was easy and worth their time.
              Friction Bounty makes it both. One script tag, one inbox, automatic Stripe rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="brutal-btn-black text-center">Start free — get your install snippet</Link>
              <a href="#how" className="brutal-btn text-center">See how it works</a>
            </div>
            <p className="font-mono text-xs text-black/60 mt-4">No credit card. Set your own bounty amount. Cancel anytime.</p>
          </div>

          {/* Mock dashboard preview */}
          <div className="brutal-box bg-white p-1">
            <div className="border-b-2 border-black bg-gray-100 px-3 py-2 font-mono text-xs uppercase flex items-center justify-between">
              <span>Inbox · acme.shop</span>
              <span className="brutal-badge-yellow">3 pending</span>
            </div>
            <div className="p-3 space-y-2 text-sm">
              <MockRow status="pending" title="Checkout button does nothing on iOS Safari" who="rachel@…" amount="20" />
              <MockRow status="rewarded" title="Coupon field cuts off on /cart" who="dev@…" amount="10" />
              <MockRow status="rejected" title="i want a free shirt" who="spam@…" amount="0" />
              <MockRow status="pending" title="Image gallery scrolls past last item" who="ben@…" amount="15" />
            </div>
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-6">
          <div className="brutal-box p-8">
            <p className="font-mono text-xs uppercase text-gray-500 mb-2">For SaaS teams</p>
            <h2 className="text-2xl font-bold font-mono uppercase mb-4">Stop losing users to silent bugs.</h2>
            <ul className="space-y-3 text-sm leading-relaxed">
              <Bullet>One install — drop a script tag into any web app</Bullet>
              <Bullet>Reports come with screenshot, browser, OS, viewport, exact URL</Bullet>
              <Bullet>You decide: approve &amp; reward, decline as spam, or reply for more info</Bullet>
              <Bullet>Rewards: Stripe customer credit (auto-applied at next checkout) <em>or</em> a single-use promo code</Bullet>
              <Bullet>Set bounty amounts per submission — a $20 credit beats a churned LTV</Bullet>
            </ul>
            <Link href="/signup" className="brutal-btn-black inline-block mt-6">Create your inbox →</Link>
          </div>

          <div className="brutal-box p-8 bg-blue-50">
            <p className="font-mono text-xs uppercase text-gray-500 mb-2">For users / hunters</p>
            <h2 className="text-2xl font-bold font-mono uppercase mb-4">Get paid for things you&rsquo;d report anyway.</h2>
            <ul className="space-y-3 text-sm leading-relaxed">
              <Bullet>Click the badge on any participating site, take 30 seconds</Bullet>
              <Bullet>Optional one-click screenshot — no signup required to submit</Bullet>
              <Bullet>Real bounties, not points: store credit hits your Stripe-linked account</Bullet>
              <Bullet>Get an email reply from the merchant — approved, declined, or asking for more</Bullet>
            </ul>
            <p className="font-mono text-xs text-gray-600 mt-6">No hunter signup. The widget on the merchant&rsquo;s site is everything you need.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-green-50 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">How it works</h2>
          <p className="text-lg font-mono mb-12 max-w-3xl">Four steps. No engineering team required.</p>

          <div className="grid md:grid-cols-4 gap-4">
            <Step n="1" title="Install" body="Sign up, copy your unique <script> tag, paste it before </body>. Done — the badge is live." />
            <Step n="2" title="User reports" body="A user hits a bug. They click the badge, type what broke, optionally snap a screenshot, hit submit." />
            <Step n="3" title="You review" body="In your inbox: full context, screenshot, page URL, browser. Approve, decline, or reply for more info." />
            <Step n="4" title="Auto reward" body="Approve → we issue Stripe customer credit (auto-applied at next checkout) or a single-use promo code. The reporter gets an email. You move on." />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-12">What&rsquo;s in the box</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Feature title="Production context" body="Every report includes URL, browser, OS, viewport size, and an optional screenshot. Reproduce in minutes, not days." />
            <Feature title="Two-way conversation" body="Reply to a reporter for clarification before deciding. Every message is logged on the submission and emailed out." />
            <Feature title="Spam control" body="Rate-limited per IP per org. You always review before any money moves. Decline-as-spam closes the loop with the reporter." />
            <Feature title="Per-org Stripe" body="Rewards land on your Stripe account, not ours. We never touch payout money — just trigger the credit or generate a promo code." />
            <Feature title="Configurable widget" body="Pick your color, position, welcome message, default bounty. Matches your brand without code." />
            <Feature title="Built for ship-day" body="One JS file, no SDK, works on any web app. React, Next.js, Vue, plain HTML — all the same install." />
          </div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="bg-blue-100 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-3">Install in 30 seconds</h2>
          <p className="font-mono text-lg mb-8 max-w-3xl">Sign up, grab your key, paste one line.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="brutal-box-white p-6 bg-white">
              <p className="font-mono text-xs uppercase mb-3 text-gray-500">Any web app</p>
              <pre className="brutal-box-sm p-4 font-mono text-xs bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap break-all">{`<script src="https://friction-bounty.vercel.app/widget.js"
        data-key="fb_pk_yourkey..."
        async></script>`}</pre>
              <p className="text-sm text-gray-600 mt-3">Drop in before <code className="bg-gray-100 px-1">&lt;/body&gt;</code>. Works in React, Next.js, Vue, plain HTML — anywhere JS runs.</p>
            </div>

            <div className="brutal-box-white p-6 bg-gray-50 relative">
              <span className="absolute top-3 right-3 brutal-badge">Coming soon</span>
              <p className="font-mono text-xs uppercase mb-3 text-gray-500">Shopify app</p>
              <p className="text-sm text-gray-700 mb-3">
                A native Shopify app that issues store credit and gift cards directly through Shopify&rsquo;s discount API — no Stripe key required.
              </p>
              <p className="text-xs text-gray-500 font-mono">Want early access? Email <strong>hi@frictionbounty.app</strong>.</p>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/signup" className="brutal-btn-black inline-block">Get my key →</Link>
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
          <div className="flex gap-4 font-mono text-sm text-gray-600">
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
