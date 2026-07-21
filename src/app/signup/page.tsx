"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, orgName, websiteUrl }),
      });
      let json: { error?: string; redirect?: string } = {};
      try {
        json = await res.json();
      } catch {
        setError(res.ok ? "Unexpected response" : `Signup failed (${res.status})`);
        return;
      }
      if (!res.ok) {
        setError(json.error || "Signup failed");
        return;
      }
      router.push(json.redirect || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-blue-100 flex items-center justify-center p-4 py-12">
      <div className="brutal-box-white p-8 md:p-10 w-full max-w-md bg-white">
        <Link href="/" className="font-mono text-xs uppercase text-gray-500 hover:underline">← Friction Bounty</Link>
        <h1 className="text-3xl font-bold font-mono uppercase mt-4 mb-1">Create your inbox</h1>
        <p className="text-gray-600 mb-6 font-mono text-sm">Free. No credit card. Get an install snippet on the next screen.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="brutal-label">Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="brutal-input" autoFocus />
          </div>
          <div>
            <label className="brutal-label">Work email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="brutal-input" />
          </div>
          <div>
            <label className="brutal-label">Password (8+ characters)</label>
            <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className="brutal-input" />
          </div>
          <div>
            <label className="brutal-label">Store / app name</label>
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required placeholder="Acme Shop" className="brutal-input" />
          </div>
          <div>
            <label className="brutal-label">Website URL (optional)</label>
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://acme.shop" className="brutal-input" />
          </div>
          {error && <div className="brutal-box-sm bg-red-100 text-red-800 px-3 py-2 font-mono text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="brutal-btn-black w-full disabled:opacity-50">
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm font-mono">
          Already have an account? <Link href="/login" className="underline">Log in →</Link>
        </p>
      </div>
    </main>
  );
}
