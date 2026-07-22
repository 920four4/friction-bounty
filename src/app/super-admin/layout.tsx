import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Keep auth gate; pages redirect into /admin. */
export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  return children;
}
