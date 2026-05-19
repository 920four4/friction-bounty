import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Friction Bounty terms of service.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b-2 border-black bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold uppercase text-sm">Friction Bounty</Link>
          <Link href="/" className="font-mono text-sm uppercase hover:underline">Home</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12 prose-sm">
        <h1 className="text-3xl font-bold font-mono uppercase mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8 font-mono">Last updated: May 19, 2026</p>

        <Section title="1. What Friction Bounty is">
          Friction Bounty (&ldquo;Service&rdquo;) is a hosted widget and dashboard
          that lets your end-users submit bug reports from your website and
          lets you issue rewards (customer credit or promotion codes) on your
          own Stripe account. The Service is operated by 920four
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </Section>

        <Section title="2. Your account">
          You must be at least 18 years old and authorized to bind your
          organization. You&rsquo;re responsible for everything that happens
          under your account, including any API keys you embed in your
          website.
        </Section>

        <Section title="3. Acceptable use">
          You may not (a) use the Service to host or distribute illegal,
          malicious, or infringing content, including by uploading screenshots
          that contain such material; (b) probe, scan, or attempt to bypass
          rate limits or authentication; (c) use the Service to send spam or
          unsolicited communications.
        </Section>

        <Section title="4. Rewards & Stripe">
          You connect your own Stripe account. We trigger credit issuance and
          promo-code creation on your behalf but never receive, hold, or
          custody funds. You&rsquo;re solely responsible for tax treatment of
          bounties, customer balance accounting, and compliance with Stripe&rsquo;s
          terms.
        </Section>

        <Section title="5. Data & privacy">
          See our <Link className="underline" href="/privacy">Privacy Policy</Link> for
          how we handle data. Reporter submissions are stored to enable triage
          and rewards. You may delete a report or your entire organization at
          any time.
        </Section>

        <Section title="6. Fees">
          Free tier and paid tiers are described on the
          <Link className="underline mx-1" href="/pricing">Pricing</Link>
          page. We may change pricing with at least 30 days&rsquo; notice for
          existing paid customers.
        </Section>

        <Section title="7. Termination">
          Either party may terminate at any time. We may suspend accounts that
          violate these terms or that pose a risk to the Service or other
          customers.
        </Section>

        <Section title="8. Warranty disclaimer & liability">
          The Service is provided &ldquo;as is&rdquo;, without warranties of
          any kind. To the maximum extent permitted by law, our aggregate
          liability for any claims related to the Service will not exceed the
          fees you paid us in the prior twelve (12) months.
        </Section>

        <Section title="9. Changes">
          We may update these terms; we&rsquo;ll post the new version with the
          updated date above and notify active customers by email for material
          changes.
        </Section>

        <Section title="10. Contact">
          <a className="underline" href="mailto:hi@frictionbounty.app">hi@frictionbounty.app</a>
        </Section>
      </article>

      <footer className="bg-gray-100 border-t-4 border-black mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-wrap gap-4 font-mono text-sm text-gray-600">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="mailto:hi@frictionbounty.app">Contact</a>
        </div>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="font-mono font-bold uppercase mb-2 text-sm">{title}</h2>
      <p className="text-gray-800 leading-relaxed text-sm">{children}</p>
    </section>
  );
}
