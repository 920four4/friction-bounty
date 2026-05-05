"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Login failed");
        return;
      }
      router.push(json.redirect || "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
      <div className="brutal-box-white p-8 md:p-10 w-full max-w-md bg-white">
        <Link href="/" className="font-mono text-xs uppercase text-gray-500 hover:underline">← Friction Bounty</Link>
        <h1 className="text-3xl font-bold font-mono uppercase mt-4 mb-1">Log in</h1>
        <p className="text-gray-600 mb-6 font-mono text-sm">Merchants and admins.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="brutal-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="brutal-input" autoFocus />
          </div>
          <div>
            <label className="brutal-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="brutal-input" />
          </div>
          {error && <div className="brutal-box-sm bg-red-100 text-red-800 px-3 py-2 font-mono text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="brutal-btn-black w-full disabled:opacity-50">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm font-mono">
          New here? <Link href="/signup" className="underline">Create an account →</Link>
        </p>
      </div>
    </main>
  );
}
