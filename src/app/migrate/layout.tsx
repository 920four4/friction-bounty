import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Database setup",
};

export default function MigrateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
