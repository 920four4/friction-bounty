import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free for the first 50 reports per month. Pro for unlimited. We never take a cut of your bounties.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <nav className="border-b-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold uppercase text-sm">Friction Bounty</Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="font-mono text-sm uppercase hover:underline">Home</Link>
            <Link href="/login" className="font-mono text-sm uppercase hover:underline">Log in</Link>
            <Link href="/signup" className="brutal-btn-black text-sm">Start free</Link>
          </div>
        </div>
      </nav>

      <section className="bg-yellow-300 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-mono uppercase leading-[1.05] mb-4">
            Pricing
          </h1>
          <p className="text-lg md:text-xl font-mono leading-relaxed max-w-3xl">
            Pay nothing until your team starts triaging real reports.
            We never take a cut of the bounties you pay your users —
            those run on your Stripe account, not ours.
          </p>
        </div>
      </section>

      <section className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
          <Tier
            name="Free"
            price="$0"
            interval="forever"
            tagline="For founders trying it out."
            features={[
              "Up to 50 reports / month",
              "Unlimited team members",
              "Stripe credit + promo code rewards",
              "Per-org rate limiting & spam filters",
              "Email + community support",
            ]}
            cta="Create your inbox"
            ctaHref="/signup"
          />

          <Tier
            name="Pro"
            price="$29"
            interval="/ month"
            tagline="When reports become routine."
            highlight
            features={[
              "Unlimited reports",
              "Remove “Powered by Friction Bounty” badge",
              "Slack & webhook notifications (coming soon)",
              "Priority email support",
              "Same Stripe-credit & promo-code rewards",
            ]}
            cta="Start free, upgrade anytime"
            ctaHref="/signup"
          />

          <Tier
            name="Scale"
            price="Custom"
            interval="annual"
            tagline="For larger teams & compliance needs."
            features={[
              "SSO / SAML",
              "SOC 2 in progress",
              "Dedicated Slack channel",
              "DPA & custom MSA",
              "Implementation help",
            ]}
            cta="Email us"
            ctaHref="mailto:hi@frictionbounty.app"
          />
        </div>
      </section>

      <section className="bg-blue-100 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-mono font-bold uppercase mb-4">FAQ</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Faq q="Do you take a cut of the bounties?">
              No. Rewards are issued as customer credit or a Stripe
              promotion code on <strong>your</strong> Stripe account.
              We&rsquo;re never in the payment flow, so we couldn&rsquo;t
              take a cut even if we wanted to.
            </Faq>
            <Faq q="What counts as a report?">
              Any new submission that lands in your inbox via the widget,
              whether you approve or decline it. Spam blocked by the per-IP
              rate limit doesn&rsquo;t count.
            </Faq>
            <Faq q="Can I cancel anytime?">
              Yes. Cancel from the dashboard. Your widget keeps working on
              the free tier (50 reports / month) automatically.
            </Faq>
            <Faq q="Do you offer annual discounts?">
              On Scale, yes — usually two months free. Email us.
            </Faq>
          </div>
        </div>
      </section>

      <footer className="bg-gray-100 border-t-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-3">
          <p className="font-mono text-sm text-gray-600">Friction Bounty — built by 920four</p>
          <div className="flex flex-wrap gap-4 font-mono text-sm text-gray-600">
            <Link href="/">Home</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:hi@frictionbounty.app">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Tier({
  name,
  price,
  interval,
  tagline,
  features,
  cta,
  ctaHref,
  highlight,
}: {
  name: string;
  price: string;
  interval: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "brutal-box-yellow p-6" : "brutal-box p-6"}>
      <p className="font-mono text-xs uppercase text-gray-700 mb-2">{name}</p>
      <p className="text-4xl font-bold font-mono mb-1">
        {price} <span className="text-base font-normal text-gray-700">{interval}</span>
      </p>
      <p className="font-mono text-sm text-gray-700 mb-4">{tagline}</p>
      <ul className="space-y-2 mb-6 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden className="font-mono">→</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={highlight ? "brutal-btn-black inline-block w-full text-center" : "brutal-btn inline-block w-full text-center"}
      >
        {cta}
      </Link>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="brutal-box-white bg-white p-4">
      <p className="font-mono font-bold uppercase text-sm mb-2">{q}</p>
      <p className="text-sm text-gray-800 leading-relaxed">{children}</p>
    </div>
  );
}
