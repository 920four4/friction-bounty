import Link from "next/link";
import { widgetBaseUrl } from "@/lib/url";
import { InstallCopy } from "@/components/landing/install-copy";
import { LiveInbox } from "@/components/landing/live-inbox";

export default function Home() {
  const widgetSrc = `${widgetBaseUrl()}/widget.js`;
  const snippet = `<script src="${widgetSrc}" data-key="fb_pk_yourkey..." async></script>`;

  return (
    <main className="lp">
      {/* ── Nav ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo">
            <span className="lp-logo-mark" aria-hidden>
              $
            </span>
            <span>Friction Bounty</span>
          </Link>
          <div className="lp-nav-links">
            <a href="#how">How</a>
            <a href="#who">Who</a>
            <a href="#faq">FAQ</a>
            <Link href="/blog">Blog</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login" className="lp-nav-login">
              Log in
            </Link>
            <Link href="/signup" className="lp-nav-cta">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-grid" aria-hidden>
          <div className="lp-hero-grid-lines" />
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <div className="lp-stamp">
              <span>No credit card</span>
              <span className="lp-stamp-dot" />
              <span>0% of your rewards</span>
            </div>

            <h1 className="lp-h1">
              Your users found
              <br />
              the bug.
              <br />
              <em className="lp-h1-em">Pay them to tell you.</em>
            </h1>

            <p className="lp-lead">
              Most people who hit a broken checkout just leave — quietly, forever.
              Friction Bounty puts a reward on every report so the bugs costing you
              customers land in your inbox, not your churn stats.
            </p>

            <div className="lp-hero-actions">
              <Link href="/signup" className="lp-btn-primary">
                Get your snippet
                <span aria-hidden>→</span>
              </Link>
              <a href="#how" className="lp-btn-ghost">
                See the 30-second install
              </a>
            </div>

            <ul className="lp-proof">
              <li>
                <strong>1 line</strong> of code
              </li>
              <li>
                <strong>Your Stripe</strong>, your money
              </li>
              <li>
                <strong>Hard budget</strong> caps
              </li>
            </ul>
          </div>

          <div className="lp-hero-stage">
            <div className="lp-stage-glow" aria-hidden />
            <LiveInbox />
            <p className="lp-stage-caption">
              Live preview · reports stream in as users hit real bugs
            </p>
          </div>
        </div>
      </section>

      {/* ── Marquee of silent failures ── */}
      <section className="lp-marquee" aria-label="Bugs that usually go unreported">
        <div className="lp-marquee-track">
          {[...SILENT, ...SILENT].map((item, i) => (
            <span key={i} className="lp-marquee-item">
              <span className="lp-marquee-x">✕</span>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Problem / trade ── */}
      <section className="lp-problem">
        <div className="lp-section-inner lp-problem-grid">
          <div>
            <p className="lp-kicker">The expensive silence</p>
            <h2 className="lp-h2">
              Silent bugs are
              <br />
              your most
              <br />
              <span className="lp-highlight">expensive bugs.</span>
            </h2>
            <p className="lp-body">
              For every user who bothers to email support, a crowd of others just
              close the tab. You never see the broken flow — you only feel it later,
              in a churn number nobody can trace.
            </p>
            <p className="lp-body">
              A reward flips that math. Suddenly the fastest, cheapest QA team you
              have is the people already standing on the bug — and they&rsquo;re happy
              to point at it.
            </p>
          </div>

          <div className="lp-trade">
            <div className="lp-trade-card lp-trade-bad">
              <p className="lp-trade-label">Without Friction Bounty</p>
              <p className="lp-trade-big">A churned customer</p>
              <p className="lp-trade-sub">Gone silently. LTV lost. No idea why.</p>
              <div className="lp-trade-path" aria-hidden>
                <span>hits bug</span>
                <span>→</span>
                <span>closes tab</span>
                <span>→</span>
                <span className="lp-trade-end">ghosted</span>
              </div>
            </div>
            <div className="lp-trade-card lp-trade-good">
              <p className="lp-trade-label">With Friction Bounty</p>
              <p className="lp-trade-big">A $20 credit</p>
              <p className="lp-trade-sub">
                Fixed bug. Happy reporter. Customer who stayed.
              </p>
              <div className="lp-trade-path" aria-hidden>
                <span>hits bug</span>
                <span>→</span>
                <span>reports</span>
                <span>→</span>
                <span className="lp-trade-end">rewarded</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lp-how">
        <div className="lp-section-inner">
          <div className="lp-how-head">
            <p className="lp-kicker">Four moves. No engineering team required.</p>
            <h2 className="lp-h2">How it works</h2>
          </div>

          <ol className="lp-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="lp-step">
                <div className="lp-step-n">{s.n}</div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Install ── */}
      <section id="install" className="lp-install">
        <div className="lp-section-inner lp-install-grid">
          <div>
            <p className="lp-kicker">Ship-day integration</p>
            <h2 className="lp-h2">
              Install in
              <br />
              ~30 seconds.
            </h2>
            <p className="lp-body">
              One script tag. No SDK, no npm package, no build step. React, Next.js,
              Vue, Svelte, plain HTML, Shopify themes — same single line.
            </p>
            <Link href="/signup" className="lp-btn-primary lp-btn-mt">
              Get my key →
            </Link>
          </div>
          <InstallCopy code={snippet} />
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="lp-features">
        <div className="lp-section-inner">
          <div className="lp-features-head">
            <p className="lp-kicker">What&rsquo;s in the box</p>
            <h2 className="lp-h2">Built for people who ship.</h2>
          </div>
          <div className="lp-feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="lp-feature">
                <span className="lp-feature-icon" aria-hidden>
                  {f.icon}
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reward types ── */}
      <section className="lp-rewards">
        <div className="lp-section-inner">
          <p className="lp-kicker">You choose per approval</p>
          <h2 className="lp-h2 lp-h2-center">Two ways to pay a bounty</h2>
          <p className="lp-body lp-body-center">
            Both run on <strong>your</strong> Stripe. We never hold or touch payout funds.
          </p>
          <div className="lp-reward-grid">
            <article className="lp-reward">
              <div className="lp-reward-top">
                <h3>Customer credit</h3>
                <span className="lp-pill">Default</span>
              </div>
              <p>
                We add the bounty as a balance credit on the reporter&rsquo;s Stripe
                customer. Next checkout with the same email — auto-deducted. Zero
                friction. Nothing to remember.
              </p>
              <p className="lp-reward-best">Best for subscriptions &amp; repeat purchases</p>
            </article>
            <article className="lp-reward lp-reward-alt">
              <div className="lp-reward-top">
                <h3>Promo code</h3>
              </div>
              <p>
                We create a single-use Stripe promotion code and email it. They paste
                it at checkout. Expires in 30 days. Tangible and immediate.
              </p>
              <p className="lp-reward-best">Best for one-offs &amp; first-time buyers</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section id="who" className="lp-who">
        <div className="lp-section-inner">
          <p className="lp-kicker">Same install. Two payback styles.</p>
          <h2 className="lp-h2">Who it&rsquo;s for</h2>
          <div className="lp-who-grid">
            <article className="lp-who-card">
              <p className="lp-who-tag">SaaS &amp; software</p>
              <h3>Ship faster. Churn less.</h3>
              <ul>
                <li>Drop one script into any web app</li>
                <li>Screenshot + browser + OS + exact URL on every report</li>
                <li>Reward with Stripe credit on their next invoice</li>
                <li>Perfect when the reporter is already a customer</li>
              </ul>
              <Link href="/signup" className="lp-btn-primary">
                Create your inbox →
              </Link>
            </article>
            <article className="lp-who-card lp-who-card-shop">
              <div className="lp-who-top">
                <p className="lp-who-tag">Ecommerce &amp; Shopify</p>
                <span className="lp-pill lp-pill-dark">Native app in beta</span>
              </div>
              <h3>Catch the checkout bug before it costs the sale.</h3>
              <ul>
                <li>Widget installs on any theme today</li>
                <li>Reward hunters now with Stripe promo codes</li>
                <li>
                  <strong>Coming:</strong> native gift-card &amp; store-credit payouts
                </li>
                <li>A broken cart on mobile Safari is a lost order</li>
              </ul>
              <p className="lp-who-note">
                Want the native Shopify app first? Start free and email{" "}
                <strong>hi@frictionbounty.app</strong> for beta access.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Stats honesty strip ── */}
      <section className="lp-stats">
        <div className="lp-section-inner lp-stats-grid">
          <Stat big="1 line" small="to install — one script tag" />
          <Stat big="~30s" small="from paste to live badge" />
          <Stat big="0%" small="we take from your rewards" />
          <Stat big="100%" small="of payouts on your Stripe" />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="lp-faq">
        <div className="lp-section-inner lp-faq-inner">
          <p className="lp-kicker">No fluff</p>
          <h2 className="lp-h2">Straight answers</h2>
          <div className="lp-faq-list">
            <Faq q="What does it cost?">
              Free to start — no credit card. You fund the bounties you approve, and we
              take <strong>0%</strong> of them. See{" "}
              <Link href="/pricing">pricing</Link>.
            </Faq>
            <Faq q="Where does the reward money come from?">
              Your Stripe account. You connect a restricted key; on approval we issue
              the credit or promo code on your account. We never hold payout funds.
            </Faq>
            <Faq q="Does it actually work on Shopify?">
              Yes — the widget installs on any Shopify theme today, and you can reward
              with a Stripe promo code. Native gift-card payouts are in private beta.
            </Faq>
            <Faq q="Do reporters need to sign up?">
              No. They type the issue, optionally attach a screenshot, and submit. Email
              is only so you can reward and reply.
            </Faq>
            <Faq q="How do you stop people farming rewards?">
              Rate-limited per IP per org, and <strong>nothing pays automatically</strong>
              — you review every report. Spam gets declined in one click.
            </Faq>
            <Faq q="Can I control how much I spend?">
              Set a monthly budget. It&rsquo;s a hard cap: a live meter tracks payouts,
              and approvals that would exceed it are blocked.
            </Faq>
            <Faq q="What do I add to my code?">
              One <code>&lt;script&gt;</code> tag. No SDK, no npm package, no build step.
            </Faq>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <p className="lp-kicker lp-kicker-on-dark">Ready when you are</p>
          <h2 className="lp-h2 lp-h2-on-dark">
            Catch the bugs that
            <br />
            cost you customers.
          </h2>
          <p className="lp-cta-sub">
            The cheapest bug report is the one a user willingly hands you.
            Make it worth their time.
          </p>
          <div className="lp-cta-actions">
            <Link href="/signup" className="lp-btn-yellow">
              Start free — get your snippet
            </Link>
            <Link href="/login" className="lp-btn-outline-light">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <Link href="/" className="lp-logo">
              <span className="lp-logo-mark" aria-hidden>
                $
              </span>
              <span>Friction Bounty</span>
            </Link>
            <p>Built by 920four · Pay users to find your bugs.</p>
          </div>
          <div className="lp-footer-links">
            <a href="#faq">FAQ</a>
            <Link href="/blog">Blog</Link>
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

const SILENT = [
  "Checkout freezes on Safari",
  "CTA dead on mobile",
  "Coupon field clips",
  "Dark mode breaks labels",
  "Gallery overscrolls",
  "Password reset 500s",
  "Paywall loops forever",
  "Search returns empty wrong",
  "Form loses draft on blur",
  "iOS keyboard covers submit",
];

const STEPS = [
  {
    n: "01",
    title: "Install",
    body: "Sign up, copy your script tag, paste before </body>. Badge is live — no redeploy to change color or copy.",
  },
  {
    n: "02",
    title: "User reports",
    body: "They hit a bug, click the badge, describe it, optionally annotate a screenshot. No account needed.",
  },
  {
    n: "03",
    title: "You review",
    body: "Inbox gets full context: URL, browser, OS, screenshot. Approve, decline as spam, or reply for more info.",
  },
  {
    n: "04",
    title: "Auto reward",
    body: "Approve → Stripe credit or promo code on your account. Reporter gets email. Monthly budget keeps spend capped.",
  },
];

const FEATURES = [
  {
    icon: "◎",
    title: "Production context",
    body: "Every report includes URL, browser, OS, viewport, and an optional annotated screenshot. Reproduce in minutes.",
  },
  {
    icon: "⇄",
    title: "Two-way conversation",
    body: "Reply before you decide. Every message is logged on the submission and emailed out.",
  },
  {
    icon: "⊘",
    title: "Spam control",
    body: "Rate-limited per IP per org. You review before any money moves. Decline closes the loop.",
  },
  {
    icon: "▣",
    title: "Monthly budget cap",
    body: "Hard spend ceiling. Live meter. Approvals that would blow past it are blocked automatically.",
  },
  {
    icon: "◈",
    title: "Your Stripe, your money",
    body: "We never hold payout funds. Rewards land on your Stripe as credit or promo codes.",
  },
  {
    icon: "✦",
    title: "Configurable widget",
    body: "Color, position, welcome message, default bounty. Match your brand without code.",
  },
];

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div className="lp-stat">
      <p className="lp-stat-big">{big}</p>
      <p className="lp-stat-small">{small}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="lp-faq-item">
      <summary>
        <span>{q}</span>
        <span className="lp-faq-plus" aria-hidden>
          +
        </span>
      </summary>
      <div className="lp-faq-answer">{children}</div>
    </details>
  );
}
