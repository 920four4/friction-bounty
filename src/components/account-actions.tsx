"use client";

import { useState } from "react";

export function ConnectStripeButton({
  connected,
  pending,
}: {
  connected: boolean;
  pending: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not start Stripe Connect");
        return;
      }
      if (json.url) window.location.href = json.url;
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect Stripe? You won’t be able to issue rewards until you reconnect.")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/connect/disconnect", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Disconnect failed");
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {connected ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={start} disabled={loading} className="brutal-btn text-sm disabled:opacity-50">
            {loading ? "Opening…" : "Manage Stripe account"}
          </button>
          <button type="button" onClick={disconnect} disabled={loading} className="brutal-btn text-sm text-red-700 disabled:opacity-50">
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="brutal-btn-black text-sm disabled:opacity-50"
        >
          {loading ? "Opening Stripe…" : pending ? "Continue Stripe setup →" : "Connect with Stripe →"}
        </button>
      )}
      {error && <p className="font-mono text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upgrade() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Checkout failed");
        return;
      }
      if (json.url) window.location.href = json.url;
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={upgrade} disabled={loading} className="brutal-btn-black text-sm disabled:opacity-50">
        {loading ? "Redirecting…" : "Upgrade to Pro — $29/mo"}
      </button>
      {error && <p className="font-mono text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not open billing portal");
        return;
      }
      if (json.url) window.location.href = json.url;
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={openPortal} disabled={loading} className="brutal-btn text-sm disabled:opacity-50">
        {loading ? "Opening…" : "Manage billing →"}
      </button>
      {error && <p className="font-mono text-xs text-red-700">{error}</p>}
    </div>
  );
}
