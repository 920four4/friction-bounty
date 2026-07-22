import { validateBlogPost } from "./seo/validate-post";

function scorePostFields(input: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  ctaLabel: string;
  ctaHref: string;
  relatedSlugs: string[];
  authorName: string;
  status: string;
}) {
  const report = validateBlogPost(input);
  return {
    seoScore: report.score,
    seoReport: JSON.stringify(report),
    wordCount: report.wordCount,
    report,
  };
}

/** Seed posts — honest, educational, SEO-oriented. No fake stats. */
export const SEED_POSTS = [
  {
    slug: "silent-bugs-cost-more-than-loud-ones",
    title: "Silent bugs cost more than loud ones",
    category: "guides",
    primaryKeyword: "silent bugs",
    secondaryKeywords: ["unreported bugs", "product friction", "user feedback", "software churn"],
    tags: ["product", "qa", "feedback"],
    relatedSlugs: ["pay-users-to-report-bugs", "install-bug-report-widget", "bug-bounty-for-product-teams"],
    excerpt:
      "The bugs that never become tickets are often the ones that quietly erode conversion. Here is how to think about silent failures — without invented statistics.",
    metaTitle: "Silent bugs cost more than loud ones",
    metaDescription:
      "Why unreported product bugs drain revenue quietly, how to spot silent friction, and a practical way to turn users into paid reporters — without fake metrics.",
    content: `# Silent bugs cost more than loud ones

Loud bugs get Slack threads. Silent bugs get a closed tab.

A checkout button that fails on one iOS version, a coupon field that clips on mobile, a form that loses state when the keyboard opens — none of these always generate support tickets. Many people simply leave. You feel it later as “conversion was soft this week,” with no root cause attached.

This article is about **silent bugs**: failures users experience but do not report. No fabricated percentages. Just a practical way to reduce the blind spot.

## What “silent” actually means

A silent bug is not necessarily rare. It is **under-reported relative to how often it hurts someone**.

Common reasons users stay quiet:

- They assume it is their device, network, or account
- They do not know who to tell, or the path is support-ticket hell
- They are not blocked enough to fight — they just abandon
- They already paid or will not return, so the pain is “done”

Your support volume is a lagging, incomplete sample of product reality.

## Why support tickets undercount friction

Support captures motivated people who believe writing will help. That is a biased sample.

Product analytics show drop-offs, but drop-offs are ambiguous: price, trust, distraction, or a broken control. Without a description of what failed, you guess.

The missing piece is **structured, in-context reports** from the people standing on the bug — with URL, browser, viewport, and optionally a screenshot.

## A practical response: make reporting worth it

You cannot force everyone to file tickets. You can change the economics of speaking up.

That is the idea behind paying users for useful reports:

1. Put a lightweight report control on the page where friction happens
2. Capture context automatically (page URL, browser, OS, viewport)
3. Review every report yourself — nothing pays out automatically
4. Reward approved reports with **customer credit or a promo code on your own Stripe**

Tools like [Friction Bounty](/) exist so you can do this with one script tag. You do not need a security-style bug-bounty program or a large research team.

## What to measure instead of vanity stats

Skip invented “X% of bugs go unreported” claims. Measure what you can verify:

- Number of in-product reports per week
- Share of reports that reproduce
- Time from report → fix → release
- Whether rewarded reporters return (if you can see it in your own data)

Honest measurement beats a fake industry number every time.

## How this differs from classic bug bounties

Security bug bounties target skilled researchers hunting vulnerabilities. Product friction reporting targets **everyday users** who hit UX and functional failures during normal use.

You still need spam controls, human review, and a budget. You do not need CVE workflows.

If you want the full product-team angle, read [Bug bounties for product teams (not just security)](/blog/bug-bounty-for-product-teams).

## Getting started without overbuilding

1. Instrument one high-value funnel (checkout, onboarding, billing)
2. Add an in-page report control — [install a bug report widget](/blog/install-bug-report-widget) in minutes
3. Decide a default bounty that is meaningful but not reckless
4. Set a monthly spend cap so costs stay predictable
5. Review for a week before expanding the widget site-wide

If you want a ready-made path: [start free on Friction Bounty](/signup), paste one snippet, connect Stripe without pasting API keys, and pay users when a report helps you ship.

## Related reading

- [Pay users to report bugs — without the chaos](/blog/pay-users-to-report-bugs)
- [How to install a bug report widget in one script tag](/blog/install-bug-report-widget)

Clear feedback beats silent churn. Start where the money is.
`,
  },
  {
    slug: "pay-users-to-report-bugs",
    title: "Pay users to report bugs — without the chaos",
    category: "playbooks",
    primaryKeyword: "pay users to report bugs",
    secondaryKeywords: ["user reported bugs", "reward bug reports", "product feedback rewards", "customer credit reward"],
    tags: ["playbook", "rewards", "stripe"],
    relatedSlugs: ["silent-bugs-cost-more-than-loud-ones", "bug-bounty-for-product-teams", "install-bug-report-widget"],
    excerpt:
      "A calm playbook for rewarding user-reported product bugs: budgets, review rules, Stripe credits vs promo codes, and spam control — written in plain language.",
    metaTitle: "Pay users to report bugs without chaos",
    metaDescription:
      "A practical playbook for paying users who report product bugs: budgets, review rules, Stripe rewards, and spam control — honest and clear.",
    content: `# Pay users to report bugs — without the chaos

Paying people for useful bug reports sounds messy until you separate three jobs: **collect**, **review**, and **reward**. Chaos shows up when those collapse into one automatic pipe.

This playbook keeps them separate.

## Principles before tooling

1. **Nothing pays without a human.** Auto-payouts invite farming.
2. **Context beats essays.** URL + browser + screenshot often matter more than a long story.
3. **Budgets beat vibes.** A monthly hard cap keeps finance calm.
4. **Rewards on your rails.** Credits or promo codes on *your* Stripe keep you in control of money movement.

## Step 1 — Collect in the moment

Put a report control on the pages that matter: checkout, signup, settings, billing.

Good reports include:

- What the user expected
- What happened instead
- Page URL
- Browser / OS / viewport
- Optional annotated screenshot

A single script-tag widget is enough for most teams. See [install a bug report widget](/blog/install-bug-report-widget).

## Step 2 — Review with a simple rubric

For each report, decide:

| Outcome | When |
| --- | --- |
| Approve & reward | Reproducible or clearly real, actionable |
| Reply first | Missing detail, need order ID / steps |
| Decline | Spam, abuse, not a bug, duplicate |

Write a short reason when you decline. Users tolerate “no” better than silence.

## Step 3 — Reward with clear types

Two clean patterns on Stripe:

- **Customer credit** — balance applied to the reporter’s customer record; great for subscriptions and repeat buyers
- **Promo code** — single-use code emailed to them; great for one-off shoppers

You choose per approval. Platforms like [Friction Bounty](/) issue either on the merchant’s connected Stripe account — the platform never holds bounty funds.

## Step 4 — Cap spend

Set a default bounty (for example $10–$25) and a **monthly budget**. When the budget is hit, approvals that would exceed it should hard-stop. That is finance-friendly and easy to explain.

## Spam and farming

Expect noise. Control it with:

- Rate limits per IP / org
- Mandatory human review
- Decline reasons that do not train abusers on your filters
- Lower bounties while you learn volume

If someone is testing your system for free money, decline and move on.

## What not to promise

Do not claim “every user will report” or invent conversion lifts. Promise only what you control: a shorter path from real friction to a reproducible report, and a fair thank-you when the report helps.

## Soft start checklist

1. Instrument one funnel
2. Default bounty + monthly cap
3. Connect Stripe (hosted Connect — no API key paste in a good setup)
4. Review daily for one week
5. Expand surface area once quality is steady

Ready to try it end-to-end? [Create a free inbox](/signup) and follow the three-step setup.

## Keep reading

- [Silent bugs cost more than loud ones](/blog/silent-bugs-cost-more-than-loud-ones)
- [Bug bounties for product teams](/blog/bug-bounty-for-product-teams)
`,
  },
  {
    slug: "install-bug-report-widget",
    title: "How to install a bug report widget in one script tag",
    category: "engineering",
    primaryKeyword: "bug report widget",
    secondaryKeywords: ["javascript feedback widget", "in app bug reporting", "script tag widget", "user feedback widget"],
    tags: ["install", "engineering", "widget"],
    relatedSlugs: ["pay-users-to-report-bugs", "silent-bugs-cost-more-than-loud-ones", "bug-bounty-for-product-teams"],
    excerpt:
      "A straight install guide for an in-page bug report widget: plain HTML, Next.js, and what context the widget should capture — no SDK required.",
    metaTitle: "Install a bug report widget in one script tag",
    metaDescription:
      "Install an in-page bug report widget with one script tag. Plain HTML and Next.js examples, plus what context to capture for useful reports.",
    content: `# How to install a bug report widget in one script tag

You do not need an npm package to collect in-product bug reports. A single script tag can load a badge, open a form, and send structured reports to your inbox.

This guide covers the pattern used by tools like [Friction Bounty](/): one public key in the page, config loaded from your account, no redeploy to change color or copy.

## What the widget should capture

Minimum useful payload:

- Title / short summary
- Description
- Reporter email (so you can reward and reply)
- Page URL
- Browser, OS, viewport
- Optional screenshot

Without URL and environment, reproduction becomes guesswork.

## Plain HTML

Place the tag before \`</body>\`:

\`\`\`html
<script
  src="https://frictionbounty.app/widget.js"
  data-key="fb_pk_your_key_here"
  async
></script>
\`\`\`

Replace the key with the one from your dashboard after [signup](/signup).

## Next.js (App Router)

In your root layout:

\`\`\`tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://frictionbounty.app/widget.js"
          data-key="fb_pk_your_key_here"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
\`\`\`

## Shopify themes

Theme liquid can include the same script tag in \`theme.liquid\` before \`</body>\`. Rewards via Stripe promo codes can work today; native Shopify gift cards are a separate integration path.

## Configuration without redeploys

Prefer loading welcome message, color, and position from your account API so marketers can change copy without engineering. The script key identifies the org; the server returns config.

## Security notes (keep it boring)

- The public key is **not** a secret — it only allows creating reports for that org
- Rate-limit by IP on the server
- Validate URLs (https only) and screenshot types/sizes
- Never put Stripe secret keys in the browser

## After install

1. Submit a test report from a real page
2. Confirm it lands in your inbox with context
3. Connect Stripe for rewards when you are ready to pay — see [pay users to report bugs](/blog/pay-users-to-report-bugs)

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No badge | Script blocked, wrong key, CSP |
| Report fails | Network tab, CORS, rate limit |
| Screenshot missing | Upload auth, file type, size cap |

## Related

- [Silent bugs cost more than loud ones](/blog/silent-bugs-cost-more-than-loud-ones)
- [Bug bounties for product teams](/blog/bug-bounty-for-product-teams)

Want the keys and inbox ready-made? [Start free](/signup) and copy your snippet from Setup.
`,
  },
  {
    slug: "bug-bounty-for-product-teams",
    title: "Bug bounties for product teams (not just security)",
    category: "product",
    primaryKeyword: "bug bounty for product teams",
    secondaryKeywords: ["product bug bounty", "user research rewards", "ux bug reporting", "continuous discovery"],
    tags: ["product", "process", "qa"],
    relatedSlugs: ["silent-bugs-cost-more-than-loud-ones", "pay-users-to-report-bugs", "install-bug-report-widget"],
    excerpt:
      "Security bug bounties inspired a useful idea for product teams: pay outsiders who find real failures. Here is how product-focused bounties differ — and how to run one sanely.",
    metaTitle: "Bug bounties for product teams, not just security",
    metaDescription:
      "How product-focused bug bounties differ from security programs, when they help, and how to run rewards, review, and scope without chaos.",
    content: `# Bug bounties for product teams (not just security)

“Bug bounty” usually means security researchers and CVEs. Product teams can borrow the **incentive design** without borrowing the whole security apparatus.

A product bug bounty pays people who report **functional and UX failures** in real flows — the kind that never show up as CVEs but do show up as churn.

## Security bounty vs product bounty

| | Security bounty | Product bounty |
| --- | --- | --- |
| Hunters | Security researchers | Everyday users + power users |
| Scope | Vulnerabilities | Broken UX, logic, mobile edge cases |
| Severity model | CVSS-like | Repro + user impact |
| Payout rail | Often cash via platform | Store credit, promo, account credit |
| Risk | Data exposure | Spam / low-quality noise |

Both need clear scope, human triage, and budget discipline.

## When a product bounty helps

- You ship fast and QA is thin on long-tail devices
- Analytics show drop-offs you cannot explain
- Support only hears from the loudest customers
- You want continuous signal without scheduling interviews for every issue

It is not a replacement for QA, design critique, or session replay. It is a **tripwire** for live friction.

## Scope it tightly at first

Start with:

- Checkout or upgrade
- Onboarding
- Billing portal

Write a short public note in the widget: what counts (broken UI, errors, dead clicks) and what does not (feature ideas you will not pay for, abuse).

## Operating model

1. **Collect** with an [in-page widget](/blog/install-bug-report-widget)
2. **Triage** daily with a three-way decision (reward / reply / decline)
3. **Reward** via Stripe credit or promo code on your account
4. **Feed** engineering with reproducible packets (URL + env + screenshot)

Read the full reward playbook: [Pay users to report bugs — without the chaos](/blog/pay-users-to-report-bugs).

## Honesty about outcomes

A product bounty will not magically “10x conversion.” It will increase the chance that a painful failure becomes a ticket with evidence. That is enough to justify a modest budget for many teams.

Avoid case-study theater. Track your own: reports received, % actionable, fixes shipped, bounty spend.

## How Friction Bounty fits

[Friction Bounty](/) is built for this shape of program:

- One script tag install
- Inbox with context
- Human approve/decline
- Rewards on your Stripe via Connect (no key paste)
- Monthly budget hard caps
- Free tier to try, Pro when volume grows — see [pricing](/pricing)

## Next steps

1. Pick one funnel
2. Install the widget
3. Set a small default bounty and a monthly cap
4. Review for a week
5. Expand only if report quality earns its keep

[Start free](/signup) when you want the plumbing done for you.

## Related

- [Silent bugs cost more than loud ones](/blog/silent-bugs-cost-more-than-loud-ones)
- [Install a bug report widget](/blog/install-bug-report-widget)
`,
  },
].map((p) => {
  const scored = scorePostFields({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    primaryKeyword: p.primaryKeyword,
    secondaryKeywords: p.secondaryKeywords,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    category: p.category,
    tags: p.tags,
    ctaLabel: "Start free",
    ctaHref: "/signup",
    relatedSlugs: p.relatedSlugs,
    authorName: "Friction Bounty",
    status: "published",
  });
  return {
    ...p,
    status: "published" as const,
    authorName: "Friction Bounty",
    ctaLabel: "Start free",
    ctaHref: "/signup",
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    wordCount: scored.wordCount,
    seoScore: scored.seoScore,
    seoReport: scored.seoReport,
    tagsJson: JSON.stringify(p.tags),
    secondaryJson: JSON.stringify(p.secondaryKeywords),
    relatedJson: JSON.stringify(p.relatedSlugs),
  };
});
