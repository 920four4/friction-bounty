import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import { migrations } from "@/db/migrations";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

// Accepts either:
//   - an active super-admin session (cookie), OR
//   - { password: SUPER_ADMIN_PASSWORD } in the JSON body
// The password path is critical because the user may not be able to log in
// before tables exist (login itself is fine — env-only — but the dashboards
// query DB tables that don't exist yet).
export async function POST(request: NextRequest) {
  const session = await getSession();
  let authorized = session?.role === "super_admin";

  let body: { password?: string } = {};
  try { body = await request.json(); } catch { /* allow empty body when session-authed */ }

  if (!authorized) {
    const expected = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (expected && body.password && body.password === expected) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 500 });
  }

  // Neon requires SSL; pg infers from sslmode in the URL but we also force it.
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  const ran: string[] = [];
  try {
    await client.connect();
    for (const m of migrations) {
      await client.query(m.sql);
      ran.push(m.name);
    }
    return NextResponse.json({ ok: true, ran });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Migration failed";
    return NextResponse.json({ ok: false, error: msg, ran }, { status: 500 });
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}
