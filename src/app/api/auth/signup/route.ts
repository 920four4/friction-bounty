import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, users } from "@/db/schema";
import { generateApiKey, generateSlug, hashPassword, setSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  orgName: z.string().min(1).max(255),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, orgName, websiteUrl } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const db = getDb();

  // Block duplicate accounts
  const existing = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  // Create org + owner in a single chain
  const [org] = await db.insert(organizations).values({
    name: orgName,
    slug: generateSlug(orgName),
    apiKey: generateApiKey(),
    websiteUrl: websiteUrl || null,
  }).returning();

  const [user] = await db.insert(users).values({
    email: normalizedEmail,
    name,
    passwordHash: hashPassword(password),
    role: "org_owner",
    orgId: org.id,
  }).returning();

  await setSession({ uid: user.id, role: "org_owner", oid: org.id });

  return NextResponse.json({ ok: true, redirect: "/dashboard/getting-started" });
}
