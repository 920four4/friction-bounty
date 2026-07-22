import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getSession, getCurrentUser } from "@/lib/auth";
import { appBaseUrlFromRequest } from "@/lib/url";
import { getPlatformStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Start (or resume) Stripe Connect Express onboarding.
 * Creates a connected account if needed, then returns an Account Link URL.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "org_owner" || !session.oid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.oid;
  const user = await getCurrentUser();
  const stripe = getPlatformStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe Connect is not configured on the platform yet. Contact support." },
      { status: 503 },
    );
  }

  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  let accountId = org.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user?.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: org.name,
        url: org.websiteUrl || undefined,
        product_description: "Customer rewards for bug reports via Friction Bounty",
      },
      metadata: {
        app: "friction_bounty",
        friction_bounty_org_id: org.id,
      },
    });
    accountId = account.id;
    await db
      .update(organizations)
      .set({
        stripeAccountId: accountId,
        stripeChargesEnabled: account.charges_enabled ?? false,
        stripeDetailsSubmitted: account.details_submitted ?? false,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, orgId));
  }

  const base = appBaseUrlFromRequest(request);
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${base}/dashboard/account?connect=refresh`,
    return_url: `${base}/api/stripe/connect/return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
