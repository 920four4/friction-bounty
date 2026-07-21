import Link from "next/link";
import { requireOrgOwner, getCurrentOrg, getCurrentUser } from "@/lib/auth";
import { orgCanIssueRewards } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireOrgOwner();
  const [org, user] = await Promise.all([getCurrentOrg(), getCurrentUser()]);
  const stripeReady = org ? orgCanIssueRewards(org) : false;
  const isPro = org?.plan === "pro";

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <header className="border-b-2 border-black bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="font-mono font-bold uppercase text-sm shrink-0">
              Friction Bounty
            </Link>
            <span className="hidden sm:inline font-mono text-xs text-gray-300">/</span>
            <span className="font-mono text-sm truncate">{org?.name}</span>
            {isPro && (
              <span className="hidden sm:inline brutal-badge bg-black text-white text-[10px]">Pro</span>
            )}
          </div>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            <NavLink href="/dashboard">Inbox</NavLink>
            <NavLink href="/dashboard/getting-started">Setup</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
            <NavLink href="/dashboard/account">
              Account
              {!stripeReady && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-red-500" title="Connect Stripe" />
              )}
            </NavLink>
            <span className="hidden lg:inline font-mono text-xs text-gray-400 ml-2">{user?.email}</span>
            <form action="/api/auth/logout" method="POST" className="ml-1">
              <button type="submit" className="brutal-btn text-xs py-1 px-2">Logout</button>
            </form>
          </nav>
        </div>
        {!stripeReady && (
          <div className="border-t-2 border-black bg-yellow-300">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs sm:text-sm">
                Connect Stripe to issue rewards — one click, no API keys.
              </p>
              <Link href="/dashboard/account" className="font-mono text-xs uppercase font-bold underline">
                Connect now →
              </Link>
            </div>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-mono text-xs sm:text-sm uppercase px-2 py-1 hover:bg-yellow-300 border border-transparent hover:border-black transition-colors"
    >
      {children}
    </Link>
  );
}
