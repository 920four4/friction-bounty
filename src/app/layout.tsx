import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friction Bounty",
  description: "Turn user friction into product insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brutal-white">
        {children}
      </body>
    </html>
  );
}
