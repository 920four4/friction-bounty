import type { NextRequest } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimitLog } from "@/db/schema";

/**
 * Postgres-backed sliding-window rate limit. Returns `true` if the caller
 * is over the limit and should be denied. Otherwise records the attempt.
 *
 * Server-action and API-route safe; works on serverless (no in-process cache).
 */
export async function ipRateLimit(opts: {
  request: NextRequest;
  bucket: string; // e.g. "login", "signup"
  limit: number;
  windowMs: number;
  emailHint?: string | null;
}): Promise<{ limited: boolean; ip: string }> {
  const ip = extractIp(opts.request);
  const db = getDb();
  const cutoff = new Date(Date.now() - opts.windowMs);
  const key = `${opts.bucket}:${ip}`;

  const recent = await db.query.rateLimitLog.findMany({
    where: and(
      eq(rateLimitLog.ipAddress, ip),
      eq(rateLimitLog.fingerprint, key),
      gte(rateLimitLog.attemptedAt, cutoff),
    ),
  });

  if (recent.length >= opts.limit) {
    return { limited: true, ip };
  }

  await db.insert(rateLimitLog).values({
    ipAddress: ip,
    email: opts.emailHint ?? null,
    fingerprint: key,
  });

  return { limited: false, ip };
}

export function extractIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}
