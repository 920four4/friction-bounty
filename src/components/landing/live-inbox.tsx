"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  status: "pending" | "rewarded" | "rejected";
  title: string;
  who: string;
  amount: string;
  page: string;
};

const QUEUE: Row[] = [
  {
    id: "1",
    status: "pending",
    title: "Checkout freezes on iOS Safari 17",
    who: "rachel@…",
    amount: "25",
    page: "/checkout",
  },
  {
    id: "2",
    status: "rewarded",
    title: "Coupon field clips on mobile /cart",
    who: "dev@…",
    amount: "10",
    page: "/cart",
  },
  {
    id: "3",
    status: "rejected",
    title: "please give me free stuff lol",
    who: "spam@…",
    amount: "0",
    page: "/",
  },
  {
    id: "4",
    status: "pending",
    title: "Gallery overscrolls past last product",
    who: "ben@…",
    amount: "15",
    page: "/p/tee",
  },
  {
    id: "5",
    status: "pending",
    title: "Dark mode invert breaks form labels",
    who: "mia@…",
    amount: "20",
    page: "/settings",
  },
];

export function LiveInbox() {
  const [visible, setVisible] = useState(3);
  const [pulse, setPulse] = useState(false);
  const [spent, setSpent] = useState(120);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible((v) => {
        const next = v >= QUEUE.length ? 3 : v + 1;
        if (next > v) {
          setPulse(true);
          setTimeout(() => setPulse(false), 600);
          if (QUEUE[next - 1]?.status === "rewarded") {
            setSpent((s) => Math.min(500, s + 10));
          }
        } else {
          setSpent(120);
        }
        return next;
      });
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const rows = QUEUE.slice(0, visible);
  const pending = rows.filter((r) => r.status === "pending").length;
  const pct = Math.min(100, Math.round((spent / 500) * 100));

  return (
    <div className={`lp-inbox ${pulse ? "lp-inbox-pulse" : ""}`}>
      <div className="lp-inbox-chrome">
        <div className="lp-inbox-dots">
          <span />
          <span />
          <span />
        </div>
        <span className="lp-inbox-url">app.frictionbounty / inbox</span>
        <span className={`lp-inbox-live ${pulse ? "on" : ""}`}>
          <i /> live
        </span>
      </div>

      <div className="lp-inbox-head">
        <div>
          <p className="lp-kicker">Inbox · acme.shop</p>
          <p className="lp-inbox-count">{pending} pending review</p>
        </div>
        <div className="lp-budget">
          <div className="lp-budget-meta">
            <span>Budget · this month</span>
            <span>
              ${spent} / $500
            </span>
          </div>
          <div className="lp-budget-track">
            <div className="lp-budget-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <ul className="lp-inbox-list">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="lp-inbox-row"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <StatusBadge status={r.status} />
            <div className="lp-inbox-main">
              <p className="lp-inbox-title">{r.title}</p>
              <p className="lp-inbox-meta">
                {r.who} · {r.page}
              </p>
            </div>
            <span className="lp-inbox-amt">${r.amount}</span>
          </li>
        ))}
      </ul>

      <div className="lp-widget-float" aria-hidden>
        <div className="lp-widget-badge">
          <span className="lp-widget-bug">🐛</span>
          <span>Found a bug?</span>
          <span className="lp-widget-cash">+$25</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  if (status === "pending") return <span className="lp-st lp-st-pending">pending</span>;
  if (status === "rewarded") return <span className="lp-st lp-st-rewarded">rewarded</span>;
  return <span className="lp-st lp-st-rejected">rejected</span>;
}
