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
            Your users notice bugs and UX issues before you do. 
            Most never tell you—they just leave. 
            Change that equation.
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
              className="brutal-box px-8 py-4 font-mono font-bold uppercase hover:bg-yellow-200 transition-colors inline-block"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-12">
            The Silent Problem
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="brutal-box p-8">
              <div className="text-4xl mb-4">😤</div>
              <h3 className="font-mono font-bold text-lg uppercase mb-3">User Hits a Bug</h3>
              <p className="text-gray-700 leading-relaxed">
                They're confused. Something doesn't work. They try to report it, 
                but your support form is buried, requires an account, or asks for 
                too much info. They give up.
              </p>
            </div>
            <div className="brutal-box p-8">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="font-mono font-bold text-lg uppercase mb-3">You Never Hear About It</h3>
              <p className="text-gray-700 leading-relaxed">
                The bug stays in production. More users hit it. Some churn. 
                You lose revenue and reputation—blissfully unaware of the 
                simple fix that could have saved them.
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
            Users give you quality bug reports with context. 
            You give them account credit they can actually use. 
            Everyone wins.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="brutal-box-white p-6">
              <div className="brutal-box-sm bg-black text-white w-12 h-12 flex items-center justify-center font-mono font-bold text-xl mb-4">1</div>
              <h3 className="font-mono font-bold uppercase mb-3">Widget Appears</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                A small, unobtrusive widget sits on your site. When users hit 
                friction—bug, confusion, broken flow—they click it.
              </p>
            </div>
            <div className="brutal-box-white p-6">
              <div className="brutal-box-sm bg-black text-white w-12 h-12 flex items-center justify-center font-mono font-bold text-xl mb-4">2</div>
              <h3 className="font-mono font-bold uppercase mb-3">They Report</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Dead simple form: what happened, where, screenshot. No account required. 
                We capture browser, OS, viewport automatically.
              </p>
            </div>
            <div className="brutal-box-white p-6">
              <div className="brutal-box-sm bg-black text-white w-12 h-12 flex items-center justify-center font-mono font-bold text-xl mb-4">3</div>
              <h3 className="font-mono font-bold uppercase mb-3">You Reward</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Review submissions in your admin. Approve valid reports → 
                automatic Stripe credit applied to their account. 
                No manual payout headaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Actually Get */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-12">
            What You Actually Get
          </h2>
          
          <div className="space-y-6">
            <div className="brutal-box p-6 flex gap-6 items-start">
              <div className="brutal-box-sm bg-yellow-300 p-3 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-mono font-bold uppercase mb-2">Production-Tested Context</h3>
                <p className="text-gray-700">
                  Every report includes the exact page URL, browser, OS, viewport size, 
                  and optional screenshot. You can reproduce the issue exactly as the user experienced it.
                </p>
              </div>
            </div>

            <div className="brutal-box p-6 flex gap-6 items-start">
              <div className="brutal-box-sm bg-yellow-300 p-3 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-mono font-bold uppercase mb-2">Automatic Rewards</h3>
                <p className="text-gray-700">
                  When you approve a submission, we create a Stripe customer (if needed) 
                  and apply account credit. The user gets an email notification. 
                  No spreadsheets, no manual PayPal transfers, no forgetting to follow up.
                </p>
              </div>
            </div>

            <div className="brutal-box p-6 flex gap-6 items-start">
              <div className="brutal-box-sm bg-yellow-300 p-3 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-mono font-bold uppercase mb-2">Spam Protection</h3>
                <p className="text-gray-700">
                  Built-in rate limiting: max 3 submissions per hour per IP. 
                  You review everything before any credit is awarded. 
                  No automated payouts without human eyes.
                </p>
              </div>
            </div>

            <div className="brutal-box p-6 flex gap-6 items-start">
              <div className="brutal-box-sm bg-yellow-300 p-3 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-mono font-bold uppercase mb-2">Better Than Support Tickets</h3>
                <p className="text-gray-700">
                  Support tickets are reactive—users are already angry. 
                  Bounty submissions are collaborative—users are helping you improve. 
                  The psychology is completely different.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Pricing/Value */}
      <section className="bg-blue-100 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-8">
            The Math Is Simple
          </h2>
          
          <div className="brutal-box-white p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-mono font-bold uppercase mb-4 text-gray-500">Cost of One Bounty</h3>
                <div className="text-5xl font-mono font-bold">$10-50</div>
                <p className="text-sm text-gray-600 mt-2">Account credit you control</p>
              </div>
              <div>
                <h3 className="font-mono font-bold uppercase mb-4 text-gray-500">Cost of One Churned User</h3>
                <div className="text-5xl font-mono font-bold">$100-500+</div>
                <p className="text-sm text-gray-600 mt-2">LTV lost + acquisition cost wasted</p>
              </div>
            </div>
          </div>

          <p className="font-mono text-lg max-w-3xl">
            We're not promising magic. We're offering a system to catch the bugs 
            that slip through your testing, from the people who actually use your 
            product in the wild. Sometimes that's worth a $20 credit.
          </p>
        </div>
      </section>

      {/* Installation */}
      <section className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-8">
            Installation
          </h2>
          
          <div className="brutal-box p-8">
            <p className="mb-6 text-gray-700">
              Add this single script tag to your website, just before the closing <code className="bg-gray-100 px-2 py-1 font-mono text-sm">&lt;/body&gt;</code> tag:
            </p>
            <code className="brutal-box-sm block p-6 font-mono text-sm bg-gray-900 text-green-400 overflow-x-auto mb-6">
              {`<script src="https://friction-bounty.vercel.app/widget.js" async></script>`}
            </code>
            <p className="text-sm text-gray-600">
              The widget automatically detects your domain and connects to your bounty program. 
              No configuration needed on your end.
            </p>
          </div>
        </div>
      </section>

      {/* Admin CTA */}
      <section className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="brutal-box-white bg-white text-black p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold uppercase mb-4">
              Ready to Start?
            </h2>
            <p className="font-mono text-lg mb-8 max-w-2xl">
              The admin dashboard is where you'll review submissions, approve bounties, 
              and track what's actually happening on your site.
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
            Friction Bounty — Built by 920four. No false promises, just a tool that works.
          </p>
        </div>
      </footer>
    </main>
  );
}
