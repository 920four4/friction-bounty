import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getPlatformStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Platform billing webhooks. Updates plan / subscription status on the org.
 * Configure endpoint: https://frictionbounty.app/api/stripe/webhook
 * Events: checkout.session.completed, customer.subscription.*
 */
export async function POST(request: NextRequest) {
  const stripe = getPlatformStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const db = getDb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.friction_bounty_org_id || session.client_reference_id;
        if (!orgId || session.mode !== "subscription") break;
        const subId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
        const custId = typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
        await db
          .update(organizations)
          .set({
            plan: "pro",
            billingStatus: "active",
            billingSubscriptionId: subId ?? undefined,
            billingCustomerId: custId ?? undefined,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, orgId));
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.friction_bounty_org_id;
        const status = sub.status;
        const active = status === "active" || status === "trialing";

        if (orgId) {
          await db
            .update(organizations)
            .set({
              plan: active ? "pro" : "free",
              billingStatus: mapSubStatus(status),
              billingSubscriptionId: sub.id,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, orgId));
        } else if (typeof sub.customer === "string") {
          // Fallback: match by billing customer id
          await db
            .update(organizations)
            .set({
              plan: active ? "pro" : "free",
              billingStatus: mapSubStatus(status),
              billingSubscriptionId: sub.id,
              updatedAt: new Date(),
            })
            .where(eq(organizations.billingCustomerId, sub.customer));
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapSubStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return status;
  }
}
