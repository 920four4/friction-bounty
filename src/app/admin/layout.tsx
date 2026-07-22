import Link from "next/link";
import { getCurrentUser, requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <header className="border-b-2 border-black bg-black text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-mono font-bold uppercase text-sm">
              Friction Bounty
            </Link>
            <span className="font-mono text-xs uppercase bg-yellow-300 text-black px-2 py-0.5">
              Admin
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-3 font-mono text-xs sm:text-sm uppercase">
            <Link href="/admin" className="hover:underline px-1">
              Overview
            </Link>
            <Link href="/admin/users" className="hover:underline px-1">
              Users
            </Link>
            <Link href="/admin/blogs" className="hover:underline px-1">
              Blog
            </Link>
            <Link href="/admin/payments" className="hover:underline px-1">
              Payments
            </Link>
            <Link href="/migrate" className="hover:underline px-1 text-gray-400">
              Migrate
            </Link>
            <span className="hidden md:inline text-gray-400 normal-case">{user?.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="border border-white px-2 py-0.5">
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
