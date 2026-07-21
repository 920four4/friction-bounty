import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getSession, getCurrentUser } from "@/lib/auth";
import { getPlatformStripe, proPriceId } from "@/lib/stripe";
import { appBaseUrlFromRequest } from "@/lib/url";

export const runtime = "nodejs";

/** Create a Checkout Session to upgrade the org to Pro. */
export async function POST(request: NextRequest) {
  const auth = await getSession();
  if (!auth || auth.role !== "org_owner" || !auth.oid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.oid;
  const user = await getCurrentUser();
  const stripe = getPlatformStripe();
  const priceId = proPriceId();

  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: "Billing is not configured yet. Email hi@frictionbounty.app to upgrade." },
      { status: 503 },
    );
  }

  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  if (org.plan === "pro" && org.billingStatus === "active") {
    return NextResponse.json({ error: "Already on Pro" }, { status: 400 });
  }

  let customerId = org.billingCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email || undefined,
      name: org.name,
      metadata: { friction_bounty_org_id: org.id },
    });
    customerId = customer.id;
    await db
      .update(organizations)
      .set({ billingCustomerId: customerId, updatedAt: new Date() })
      .where(eq(organizations.id, orgId));
  }

  const base = appBaseUrlFromRequest(request);
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/dashboard/account?billing=success`,
    cancel_url: `${base}/dashboard/account?billing=cancel`,
    allow_promotion_codes: true,
    client_reference_id: orgId,
    subscription_data: {
      metadata: { friction_bounty_org_id: orgId },
    },
    metadata: { friction_bounty_org_id: orgId },
  });

  return NextResponse.json({ url: checkout.url });
}
