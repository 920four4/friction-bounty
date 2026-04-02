import Link from "next/link";

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
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/admin" 
              className="brutal-box bg-black text-white px-8 py-4 font-mono font-bold uppercase hover:bg-gray-800 transition-colors inline-block"
            >
              Open Admin →
            </Link>
            <a 
              href="#how-it-works" 
              className="brutal-box bg-white px-8 py-4 font-mono font-bold uppercase hover:bg-gray-50 transition-colors inline-block"
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
              <div className="brutal-box-sm bg-yellow-300 w-12 h-12 flex items-center justify-center text-2xl mb-4">
                😤
              </div>
              <h3 className="font-mono font-bold text-lg uppercase mb-3">User Hits a Bug</h3>
              <p className="text-gray-700 leading-relaxed">
                They're confused. Your support form is buried or requires signup. 
                They give up and switch to a competitor.
              </p>
            </div>
            <div className="brutal-box p-8">
              <div className="brutal-box-sm bg-yellow-300 w-12 h-12 flex items-center justify-center text-2xl mb-4">
                👋
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
                <div className="brutal-box-sm bg-red-400 w-12 h-12 flex items-center justify-center text-2xl shrink-0">
                  📍
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
                <div className="brutal-box-sm bg-blue-400 w-12 h-12 flex items-center justify-center text-2xl shrink-0">
                  ⚡
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
                <div className="brutal-box-sm bg-red-400 w-12 h-12 flex items-center justify-center text-2xl shrink-0">
                  🛡️
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
                <div className="brutal-box-sm bg-yellow-300 w-12 h-12 flex items-center justify-center text-2xl shrink-0">
                  💰
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
          
          <div className="brutal-box-white p-8">
            <p className="mb-6 text-gray-700">
              Add this script to your website, just before the closing <code className="bg-gray-100 px-2 py-1 font-mono text-sm">&lt;/body&gt;</code> tag:
            </p>
            <code className="brutal-box-sm block p-6 font-mono text-sm bg-gray-900 text-green-400 overflow-x-auto mb-6">
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
