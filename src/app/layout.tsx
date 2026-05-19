import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://frictionbounty.app"),
  title: {
    default: "Friction Bounty — Pay your users to find your bugs",
    template: "%s · Friction Bounty",
  },
  description:
    "One script tag turns silent bug-victims into paid bug-reporters. Approve reports, auto-issue Stripe credit or promo codes. Built for SaaS and DTC.",
  applicationName: "Friction Bounty",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://frictionbounty.app",
    siteName: "Friction Bounty",
    title: "Pay your users to find your bugs.",
    description:
      "One script tag, one inbox, automatic Stripe rewards. Stop losing users to silent bugs.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Friction Bounty" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pay your users to find your bugs.",
    description:
      "One script tag. One inbox. Stripe-credit rewards. Friction Bounty.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFE100",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
