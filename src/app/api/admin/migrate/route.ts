import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import { timingSafeEqual } from "node:crypto";
import { migrations } from "@/db/migrations";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

// Hard-gated migration runner.
//
// Authorization options (any of):
//   - an active super-admin session (cookie), OR
//   - { password: SUPER_ADMIN_PASSWORD } in the JSON body — only when
//     MIGRATE_ENABLED=1 in the environment.
//
// In production you should leave MIGRATE_ENABLED unset and only flip it
// briefly when you actually need to run a migration. The session path
// remains open so a real super-admin can always migrate from the UI.

function constantTimeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  let authorized = session?.role === "super_admin";

  let body: { password?: string } = {};
  try { body = await request.json(); } catch { /* allow empty body when session-authed */ }

  if (!authorized) {
    if (process.env.MIGRATE_ENABLED !== "1") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    const expected = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (expected && body.password && constantTimeStringEqual(body.password, expected)) {
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
