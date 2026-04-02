import Link from "next/link";

// SVG Icons
const BugIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-yellow-300 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-32">
          <div className="brutal-box-white p-8 md:p-12 inline-block mb-8 transform -rotate-1">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-mono uppercase leading-none">
              Friction<br/>Bounty
            </h1>
          </div>
          <p className="text-xl md:text-2xl max-w-2xl font-mono leading-relaxed mb-8">
            Your users find bugs. Most never tell you—they just leave. 
            Change that with a simple feedback widget and automatic rewards.
          </p>
          
          {/* Buttons - using table layout for perfect alignment */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/admin"
              className="brutal-box bg-black text-white px-8 py-4 font-mono font-bold uppercase text-center"
            >
              Open Admin →
            </Link>
            <a 
              href="#how-it-works"
              className="brutal-box bg-white text-black px-8 py-4 font-mono font-bold uppercase text-center"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-12">
            The Silent Churn
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="brutal-box p-8">
              <div className="brutal-box-sm bg-yellow-300 w-12 h-12 flex items-center justify-center mb-4 text-black">
                <BugIcon />
              </div>
              <h3 className="font-mono font-bold text-lg uppercase mb-3">User Hits a Bug</h3>
              <p className="text-gray-700 leading-relaxed">
                They're confused. Your support form is buried or requires signup. 
                They give up and switch to a competitor.
              </p>
            </div>
            <div className="brutal-box p-8">
              <div className="brutal-box-sm bg-yellow-300 w-12 h-12 flex items-center justify-center mb-4 text-black text-2xl">
                👻
              </div>
              <h3 className="font-mono font-bold text-lg uppercase mb-3">You Never Know</h3>
              <p className="text-gray-700 leading-relaxed">
                The bug stays live. More users hit it. Some churn. 
                You lose revenue, unaware of the simple fix that could have saved them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section id="how-it-works" className="bg-green-100 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-4">
            A Simple Trade
          </h2>
          <p className="text-xl font-mono mb-12 max-w-3xl">
            Users give you quality bug reports. You give them account credit. Everyone wins.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="brutal-box-white p-6">
              <div className="brutal-box-sm bg-black text-white w-12 h-12 flex items-center justify-center font-mono font-bold text-xl mb-4">1</div>
              <h3 className="font-mono font-bold uppercase mb-3">Widget Appears</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                A small button sits on your site. When users hit friction, they click it.
              </p>
            </div>
            <div className="brutal-box-white p-6">
              <div className="brutal-box-sm bg-black text-white w-12 h-12 flex items-center justify-center font-mono font-bold text-xl mb-4">2</div>
              <h3 className="font-mono font-bold uppercase mb-3">Quick Report</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Dead simple form: what happened, where, optional screenshot. 
                No account required.
              </p>
            </div>
            <div className="brutal-box-white p-6">
              <div className="brutal-box-sm bg-black text-white w-12 h-12 flex items-center justify-center font-mono font-bold text-xl mb-4">3</div>
              <h3 className="font-mono font-bold uppercase mb-3">Auto Reward</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                You review and approve. Stripe credit is applied automatically. 
                No manual payouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-12">
            What You Get
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="brutal-box p-6">
              <div className="flex items-start gap-4">
                <div className="brutal-box-sm bg-red-400 w-12 h-12 flex items-center justify-center mb-4 text-black shrink-0">
                  <LocationIcon />
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase mb-2">Production Context</h3>
                  <p className="text-gray-700 text-sm">
                    Every report includes exact URL, browser, OS, viewport, and screenshot. 
                    Reproduce issues exactly as users see them.
                  </p>
                </div>
              </div>
            </div>
            <div className="brutal-box p-6">
              <div className="flex items-start gap-4">
                <div className="brutal-box-sm bg-blue-400 w-12 h-12 flex items-center justify-center mb-4 text-black shrink-0">
                  <ZapIcon />
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase mb-2">Automatic Rewards</h3>
                  <p className="text-gray-700 text-sm">
                    Approve a report → Stripe creates customer (if needed) + 
                    account credit applied instantly.
                  </p>
                </div>
              </div>
            </div>
            <div className="brutal-box p-6">
              <div className="flex items-start gap-4">
                <div className="brutal-box-sm bg-red-400 w-12 h-12 flex items-center justify-center mb-4 text-black shrink-0">
                  <ShieldIcon />
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase mb-2">Spam Protection</h3>
                  <p className="text-gray-700 text-sm">
                    Max 3 submissions per hour per IP. You review before any credit is awarded.
                  </p>
                </div>
              </div>
            </div>
            <div className="brutal-box p-6">
              <div className="flex items-start gap-4">
                <div className="brutal-box-sm bg-yellow-300 w-12 h-12 flex items-center justify-center mb-4 text-black shrink-0">
                  <DollarIcon />
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase mb-2">Cost Efficient</h3>
                  <p className="text-gray-700 text-sm">
                    A $20 credit bounty beats losing a customer worth hundreds in LTV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="bg-blue-100 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-8">
            Installation
          </h2>
          
          <div className="brutal-box-white p-8 bg-white">
            <p className="mb-6 text-gray-700">
              Add this script to your website, just before the closing <code className="bg-gray-100 px-2 py-1 font-mono text-sm">&lt;/body&gt;</code> tag:
            </p>
            <code className="brutal-box-sm block p-6 font-mono text-sm bg-gray-900 text-green-400 overflow-x-auto mb-6 border-2 border-black">
              {`<script src="https://friction-bounty.vercel.app/widget.js" async></script>`}
            </code>
            <p className="text-sm text-gray-600">
              The widget auto-detects your domain. No configuration needed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="brutal-box-white bg-white text-black p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-4">
              Ready to Catch More Bugs?
            </h2>
            <p className="font-mono text-lg mb-8 max-w-2xl">
              Review submissions, approve bounties, and see what's actually 
              happening on your site.
            </p>
            <Link 
              href="/admin" 
              className="brutal-box bg-yellow-300 text-black px-8 py-4 font-mono font-bold uppercase hover:bg-yellow-400 transition-colors inline-block"
            >
              Open Admin Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="font-mono text-sm text-gray-600">
            Friction Bounty — Built by 920four
          </p>
        </div>
      </footer>
    </main>
  );
}