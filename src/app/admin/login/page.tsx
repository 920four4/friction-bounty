"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
      <div className="brutal-box-white p-8 md:p-12 w-full max-w-md bg-white">
        <h1 className="text-3xl font-bold font-mono uppercase mb-2">Admin Login</h1>
        <p className="text-gray-600 mb-8 font-mono text-sm">
          Friction Bounty Dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="password" 
              className="block font-mono font-bold uppercase text-sm mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black font-mono focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="brutal-box-sm bg-red-100 text-red-800 px-4 py-2 font-mono text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-mono font-bold uppercase border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            style={{ color: '#ffffff', backgroundColor: '#000000' }}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 font-mono">
          Default password is set via ADMIN_PASSWORD env variable.
        </p>
      </div>
    </main>
  );
}