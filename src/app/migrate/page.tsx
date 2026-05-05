"use client";

import Link from "next/link";
import { useState } from "react";

type RunResult = { ok: boolean; ran?: string[]; error?: string };

export default function MigratePage() {
  const [password, setPassword] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as RunResult;
      setResult(json);
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "Network error" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-yellow-300 flex items-center justify-center p-4 py-12">
      <div className="brutal-box-white p-8 md:p-10 w-full max-w-lg bg-white">
        <Link href="/" className="font-mono text-xs uppercase text-gray-500 hover:underline">← Friction Bounty</Link>
        <h1 className="text-3xl font-bold font-mono uppercase mt-4 mb-1">Database setup</h1>
        <p className="text-gray-600 mb-6 font-mono text-sm">
          One-shot migration runner. Idempotent — safe to run repeatedly. Use this once after deploy, or after schema changes.
        </p>

        <form onSubmit={handleRun} className="space-y-4">
          <div>
            <label className="brutal-label">Super-admin password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="brutal-input"
              placeholder="Matches SUPER_ADMIN_PASSWORD env var"
            />
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Set in Vercel → Settings → Environment Variables.
            </p>
          </div>

          <button type="submit" disabled={running} className="brutal-btn-black w-full disabled:opacity-50">
            {running ? "Running migrations…" : "Run migrations"}
          </button>
        </form>

        {result && (
          <div className={`mt-6 brutal-box-sm px-4 py-3 font-mono text-sm ${result.ok ? "bg-green-100" : "bg-red-100 text-red-800"}`}>
            {result.ok ? (
              <>
                <p className="font-bold">✓ Migrations applied</p>
                <ul className="list-disc pl-5 mt-1 text-xs">
                  {(result.ran ?? []).map((n) => <li key={n}>{n}</li>)}
                </ul>
                <p className="mt-3">
                  <Link href="/signup" className="underline">Now create your first account →</Link>
                </p>
              </>
            ) : (
              <>
                <p className="font-bold">Migration failed</p>
                <p className="mt-1 break-words">{result.error}</p>
                {result.ran && result.ran.length > 0 && (
                  <p className="text-xs mt-2">Successfully ran before failure: {result.ran.join(", ")}</p>
                )}
              </>
            )}
          </div>
        )}

        <details className="mt-6">
          <summary className="font-mono text-xs uppercase cursor-pointer text-gray-500">What this does</summary>
          <ul className="list-disc pl-5 mt-2 text-xs text-gray-600 space-y-1">
            <li>Creates <code>organizations</code>, <code>users</code>, <code>submission_messages</code> tables</li>
            <li>Creates or upgrades <code>submissions</code> + <code>rate_limit_log</code></li>
            <li>Backfills any existing single-tenant submissions to a &ldquo;Default&rdquo; org</li>
            <li>Drops legacy <code>app_settings</code> table (config now lives on organizations)</li>
          </ul>
        </details>
      </div>
    </main>
  );
}
