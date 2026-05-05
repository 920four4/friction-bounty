import Link from "next/link";
import { requireOrgOwner, getCurrentOrg, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireOrgOwner();
  const [org, user] = await Promise.all([getCurrentOrg(), getCurrentUser()]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-mono font-bold uppercase text-sm">Friction Bounty</Link>
            <span className="hidden md:inline font-mono text-xs text-gray-400">/</span>
            <span className="font-mono text-sm">{org?.name}</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="font-mono text-sm uppercase hover:underline">Inbox</Link>
            <Link href="/dashboard/getting-started" className="font-mono text-sm uppercase hover:underline">Setup</Link>
            <Link href="/dashboard/settings" className="font-mono text-sm uppercase hover:underline">Settings</Link>
            <span className="font-mono text-xs text-gray-400 hidden md:inline">{user?.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="brutal-btn text-xs">Logout</button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
