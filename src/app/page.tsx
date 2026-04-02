import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="brutal-box-yellow p-6 inline-block mb-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-mono uppercase">
              Friction Bounty
            </h1>
          </div>
          <p className="text-lg md:text-xl max-w-2xl font-mono">
            Turn user frustration into product insights. 
            Reward real bug reports with account credits.
          </p>
        </header>

        {/* Navigation */}
        <nav className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Link 
            href="/admin" 
            className="brutal-box p-6 hover:bg-brutal-accent-yellow transition-colors group"
          >
            <h2 className="font-mono text-lg font-bold uppercase mb-2 group-hover:underline">
              Admin Dashboard
            </h2>
            <p className="text-brutal-gray-600 text-sm">
              Review submissions, approve bounties, configure settings
            </p>
          </Link>

          <div className="brutal-box p-6">
            <h2 className="font-mono text-lg font-bold uppercase mb-2">
              Widget Status
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-brutal-accent-green border border-brutal-black"></span>
              <span className="text-sm font-mono">Operational</span>
            </div>
          </div>

          <div className="brutal-box p-6">
            <h2 className="font-mono text-lg font-bold uppercase mb-2">
              Submissions
            </h2>
            <p className="text-3xl font-mono font-bold">0</p>
            <p className="text-brutal-gray-500 text-xs uppercase mt-1">This month</p>
          </div>
        </nav>

        {/* Instructions */}
        <section className="brutal-box p-6 md:p-8">
          <h2 className="font-mono text-xl font-bold uppercase mb-6">
            Installation
          </h2>
          <p className="mb-4 text-brutal-gray-700">
            Add this script tag to your website to enable the Friction Bounty widget:
          </p>
          <code className="brutal-box-sm block p-4 font-mono text-sm bg-brutal-gray-100 overflow-x-auto">
            {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" async></script>`}
          </code>
        </section>
      </div>
    </main>
  );
}
