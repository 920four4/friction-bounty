import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Friction Bounty handles user data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b-2 border-black bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold uppercase text-sm">Friction Bounty</Link>
          <Link href="/" className="font-mono text-sm uppercase hover:underline">Home</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12 prose-sm">
        <h1 className="text-3xl font-bold font-mono uppercase mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8 font-mono">Last updated: May 19, 2026</p>

        <Section title="Summary">
          We collect the minimum data we need to operate Friction Bounty:
          email addresses, bug reports, screenshots you choose to attach,
          and a small amount of context (page URL, browser, OS, viewport,
          IP address). We never sell your data. We never see your or your
          customers&rsquo; payment information.
        </Section>

        <Section title="What we collect">
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><strong>Account data</strong>: name, work email, hashed password.</li>
            <li><strong>Organization data</strong>: org name, widget settings, your Stripe restricted key (encrypted at rest).</li>
            <li><strong>Report data</strong>: reporter email, title, description, optional screenshot (stored in Vercel Blob), page URL, browser, OS, viewport, IP address, optional anonymous fingerprint.</li>
            <li><strong>Operational data</strong>: rate-limit records, request logs (Vercel platform, 24h retention).</li>
          </ul>
        </Section>

        <Section title="What we don't collect">
          We do not embed third-party trackers or analytics in the widget.
          We never see end-user payment details — those flow exclusively to
          your Stripe account.
        </Section>

        <Section title="Sub-processors">
          We use the following vendors to operate the Service:
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><strong>Vercel</strong> — hosting, function logs, blob storage</li>
            <li><strong>Neon</strong> — Postgres database (via Vercel Marketplace)</li>
            <li><strong>Resend</strong> — transactional email</li>
            <li><strong>Stripe</strong> — reward issuance (per-org, on your account)</li>
          </ul>
        </Section>

        <Section title="Data retention">
          We keep reports until you delete them or your organization. Rate-limit
          logs are pruned periodically. If you delete your account, we remove
          your records within 30 days.
        </Section>

        <Section title="Your rights (GDPR / CCPA)">
          Email <a className="underline" href="mailto:hi@frictionbounty.app">hi@frictionbounty.app</a>
          {" "}with a request to access, correct, export, or delete data
          we hold about you. We respond within 30 days.
        </Section>

        <Section title="Security">
          We use scrypt with per-user salt for password hashing, HTTPS for
          all traffic, HMAC-signed session cookies, encryption at rest for
          Stripe keys, and Postgres-backed rate limits on the public widget
          and auth endpoints. Report security issues to
          {" "}<a className="underline" href="mailto:security@frictionbounty.app">security@frictionbounty.app</a>.
        </Section>

        <Section title="Changes">
          We&rsquo;ll update the date above and notify customers by email for
          material changes.
        </Section>

        <Section title="Contact">
          <a className="underline" href="mailto:hi@frictionbounty.app">hi@frictionbounty.app</a>
        </Section>
      </article>

      <footer className="bg-gray-100 border-t-4 border-black mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-wrap gap-4 font-mono text-sm text-gray-600">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/terms">Terms</Link>
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
      <div className="text-gray-800 leading-relaxed text-sm">{children}</div>
    </section>
  );
}
