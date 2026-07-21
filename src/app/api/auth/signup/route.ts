import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, users } from "@/db/schema";
import { generateApiKey, generateSlug, hashPassword, setSession } from "@/lib/auth";
import { ipRateLimit } from "@/lib/rate-limit";

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

  try {
    const { limited } = await ipRateLimit({
      request,
      bucket: "signup",
      limit: 5,
      windowMs: 60 * 60 * 1000,
      emailHint: normalizedEmail,
    });
    if (limited) {
      return NextResponse.json(
        { error: "Too many signup attempts from this IP. Try again later." },
        { status: 429 }
      );
    }

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
  } catch (err) {
    console.error("[signup] failed", err);
    const message = err instanceof Error ? err.message : "Signup failed";
    // Surface schema-mismatch / missing-column issues clearly in non-prod;
    // keep a friendly message in production while still logging the real cause.
    const friendly =
      /column .* does not exist|relation .* does not exist/i.test(message)
        ? "Database is missing a required schema update. Run /migrate as super admin, then try again."
        : "Something went wrong creating your account. Please try again.";
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
