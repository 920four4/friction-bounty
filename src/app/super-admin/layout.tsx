import Link from "next/link";
import { getCurrentUser, requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-mono font-bold uppercase text-sm">Friction Bounty</Link>
            <span className="font-mono text-xs uppercase bg-yellow-300 text-black px-2 py-0.5">Super Admin</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/super-admin" className="font-mono text-sm uppercase hover:underline">Overview</Link>
            <span className="font-mono text-xs text-gray-300 hidden md:inline">{user?.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="border-2 border-white px-3 py-1 font-mono text-xs uppercase">Logout</button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
