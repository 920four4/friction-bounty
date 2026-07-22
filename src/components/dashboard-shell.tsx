"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  orgName: string;
  email: string;
  isPro: boolean;
  stripeReady: boolean;
  setupDone: number;
  setupTotal: number;
  children: React.ReactNode;
};

const NAV = [
  { href: "/dashboard", label: "Inbox", icon: "◈", match: (p: string) => p === "/dashboard" || p.startsWith("/submissions") },
  { href: "/dashboard/getting-started", label: "Setup", icon: "①", match: (p: string) => p.startsWith("/dashboard/getting-started") },
  { href: "/dashboard/settings", label: "Widget", icon: "◎", match: (p: string) => p.startsWith("/dashboard/settings") },
  { href: "/dashboard/account", label: "Account", icon: "◌", match: (p: string) => p.startsWith("/dashboard/account") },
];

export function DashboardShell({
  orgName,
  email,
  isPro,
  stripeReady,
  setupDone,
  setupTotal,
  children,
}: Props) {
  const pathname = usePathname() || "/dashboard";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="dash">
      {/* Mobile top bar */}
      <header className="dash-topbar">
        <button
          type="button"
          className="dash-icon-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
        <div className="dash-topbar-title min-w-0">
          <p className="truncate font-semibold text-sm">{orgName}</p>
          <p className="truncate font-mono text-[10px] text-gray-500 uppercase">Friction Bounty</p>
        </div>
        {isPro && <span className="dash-pill dash-pill-dark">Pro</span>}
        <Link href="/dashboard/account" className="dash-icon-btn relative" aria-label="Account">
          ◌
          {!stripeReady && <span className="dash-dot" />}
        </Link>
      </header>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          className="dash-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={"dash-sidebar " + (open ? "open" : "")}>
        <div className="dash-sidebar-brand">
          <Link href="/dashboard" className="dash-logo" onClick={() => setOpen(false)}>
            <span className="dash-logo-mark">$</span>
            <span>
              Friction Bounty
              {isPro && <span className="dash-pill dash-pill-dark ml-2 align-middle">Pro</span>}
            </span>
          </Link>
          <p className="dash-org truncate" title={orgName}>{orgName}</p>
          <p className="dash-email truncate" title={email}>{email}</p>
        </div>

        <nav className="dash-nav">
          <p className="dash-nav-label">Main</p>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={"dash-nav-link " + (active ? "active" : "")}
                onClick={() => setOpen(false)}
              >
                <span className="dash-nav-icon" aria-hidden>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.href.includes("account") && !stripeReady && (
                  <span className="dash-badge-alert">Stripe</span>
                )}
                {item.href.includes("getting-started") && setupDone < setupTotal && (
                  <span className="dash-badge-muted">{setupDone}/{setupTotal}</span>
                )}
              </Link>
            );
          })}

          <p className="dash-nav-label mt-4">Quick links</p>
          <Link href="/dashboard/settings" className="dash-nav-link subtle" onClick={() => setOpen(false)}>
            <span className="dash-nav-icon">✦</span>
            Widget look &amp; preview
          </Link>
          <Link href="/dashboard/account" className="dash-nav-link subtle" onClick={() => setOpen(false)}>
            <span className="dash-nav-icon">💳</span>
            Stripe &amp; billing
          </Link>
          <Link href="/dashboard/getting-started#connect" className="dash-nav-link subtle" onClick={() => setOpen(false)}>
            <span className="dash-nav-icon">?</span>
            How Connect works
          </Link>
          <a href="mailto:hi@frictionbounty.app" className="dash-nav-link subtle">
            <span className="dash-nav-icon">✉</span>
            Help
          </a>
        </nav>

        {!stripeReady && (
          <div className="dash-sidebar-cta">
            <p className="font-mono text-[11px] uppercase font-bold mb-1">Next step</p>
            <p className="text-xs text-gray-700 mb-2 leading-snug">
              Connect Stripe (hosted by Stripe — no API keys) so you can pay rewards.
            </p>
            <Link href="/dashboard/account" className="dash-cta-btn" onClick={() => setOpen(false)}>
              Connect Stripe →
            </Link>
          </div>
        )}

        <div className="dash-sidebar-foot">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="dash-logout">Log out</button>
          </form>
        </div>
      </aside>

      {/* Main column */}
      <div className="dash-main">
        {!stripeReady && (
          <div className="dash-alert">
            <p>
              <strong>Connect Stripe</strong> to issue rewards. One click — Stripe hosts the form. No API keys.
            </p>
            <Link href="/dashboard/account" className="dash-alert-link">
              Do it now →
            </Link>
          </div>
        )}
        <div className="dash-content">{children}</div>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="dash-tabbar" aria-label="Primary">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={"dash-tab " + (active ? "active" : "")}
            >
              <span className="dash-tab-icon" aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
              {item.href.includes("account") && !stripeReady && <span className="dash-tab-dot" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
