import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  title: "Admin",
};

/** Keep auth gate; pages redirect into /admin. Only z@920four.com. */
export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  return children;
}
