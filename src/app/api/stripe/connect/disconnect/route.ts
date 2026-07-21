import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

/** Unlink Connect account from this org (does not delete the Stripe account). */
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "org_owner" || !session.oid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.oid;
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  // Unlink only — do not delete the merchant's Stripe Express account.
  await db
    .update(organizations)
    .set({
      stripeAccountId: null,
      stripeChargesEnabled: false,
      stripeDetailsSubmitted: false,
      // Also clear any legacy pasted key
      stripeSecretKey: null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  return NextResponse.json({ ok: true });
}
