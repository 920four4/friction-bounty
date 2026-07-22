"use client";

import { useState } from "react";

export function SeedBlogButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    if (!confirm("Upsert the 4 educational seed posts?")) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/admin/seed-blog", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json.error || "Seed failed");
        return;
      }
      setMsg(`Seeded: ${(json.upserted || []).join(", ")}`);
      window.location.reload();
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={loading} className="brutal-btn text-sm disabled:opacity-50">
        {loading ? "Seeding…" : "Seed starter posts"}
      </button>
      {msg && <p className="font-mono text-[10px] text-gray-600 max-w-xs">{msg}</p>}
    </div>
  );
}
