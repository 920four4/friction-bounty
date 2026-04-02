import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Require authentication
  await requireAuth();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-black font-mono text-sm">
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold font-mono uppercase">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="brutal-box p-6 mb-6">
          <h2 className="font-mono font-bold uppercase mb-4">Environment Variables</h2>
          <p className="text-gray-600 mb-4">
            The following environment variables need to be set in your Vercel dashboard:
          </p>
          <ul className="space-y-2 font-mono text-sm">
            <li className="brutal-box-sm p-3 bg-gray-50">
              <strong>ADMIN_PASSWORD</strong> - Password for accessing this admin panel
            </li>
            <li className="brutal-box-sm p-3 bg-gray-50">
              <strong>DATABASE_URL</strong> - PostgreSQL connection string
            </li>
            <li className="brutal-box-sm p-3 bg-gray-50">
              <strong>STRIPE_SECRET_KEY</strong> - Stripe secret key for rewards
            </li>
            <li className="brutal-box-sm p-3 bg-gray-50">
              <strong>STRIPE_PUBLISHABLE_KEY</strong> - Stripe publishable key
            </li>
            <li className="brutal-box-sm p-3 bg-gray-50">
              <strong>UPLOADTHING_TOKEN</strong> - UploadThing token for screenshots
            </li>
          </ul>
        </div>

        <div className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Widget Installation</h2>
          <p className="text-gray-600 mb-4">
            Add this script tag to your website, just before the closing &lt;/body&gt; tag:
          </p>
          <code className="brutal-box-sm block p-4 font-mono text-sm bg-gray-900 text-green-400">
            {`<script src="https://friction-bounty.vercel.app/widget.js" async></script>`}
          </code>
        </div>
      </div>
    </main>
  );
}
