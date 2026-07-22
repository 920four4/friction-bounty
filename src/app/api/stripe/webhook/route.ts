import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getPlatformStripe } from "@/lib/stripe";
import {
  APP_TAG,
  checkoutBelongsToApp,
  recordPaymentEvent,
  resolveOrgIdFromCustomer,
  subscriptionBelongsToApp,
} from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Platform billing webhooks — **Friction Bounty only**.
 * Events from other 920four apps on the same Stripe account are ignored.
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
        const { belongs, orgId, priceId } = await checkoutBelongsToApp(session);
        if (!belongs) {
          console.info("[stripe webhook] ignore checkout (not friction_bounty)", session.id);
          break;
        }

        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const custId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const resolvedOrg = orgId || (await resolveOrgIdFromCustomer(custId));

        if (resolvedOrg) {
          await db
            .update(organizations)
            .set({
              plan: "pro",
              billingStatus: "active",
              billingSubscriptionId: subId ?? undefined,
              billingCustomerId: custId ?? undefined,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, resolvedOrg));
        }

        await recordPaymentEvent({
          orgId: resolvedOrg,
          stripeEventId: event.id,
          stripeObjectId: session.id,
          type: event.type,
          priceId,
          amountCents: session.amount_total,
          currency: session.currency,
          status: session.payment_status || "completed",
          customerId: custId,
          subscriptionId: subId,
          description: "Pro subscription checkout",
          metadata: {
            app: APP_TAG,
            ...(session.metadata || {}),
          },
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { belongs, orgId, priceId } = await subscriptionBelongsToApp(sub);
        if (!belongs) {
          console.info("[stripe webhook] ignore subscription (not friction_bounty)", sub.id);
          break;
        }

        const status = sub.status;
        const active = status === "active" || status === "trialing";
        const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        const resolvedOrg = orgId || (await resolveOrgIdFromCustomer(custId));

        if (resolvedOrg) {
          await db
            .update(organizations)
            .set({
              plan: active ? "pro" : "free",
              billingStatus: mapSubStatus(status),
              billingSubscriptionId: sub.id,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, resolvedOrg));
        }

        await recordPaymentEvent({
          orgId: resolvedOrg,
          stripeEventId: event.id,
          stripeObjectId: sub.id,
          type: event.type,
          priceId,
          amountCents: null,
          currency: sub.currency || "usd",
          status,
          customerId: custId,
          subscriptionId: sub.id,
          description: `Subscription ${status}`,
          metadata: { app: APP_TAG, ...(sub.metadata || {}) },
        });
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Only track if subscription is ours
        const subRef = (invoice as { subscription?: string | { id: string } | null }).subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (!subId || !stripe) break;

        let sub: Stripe.Subscription;
        try {
          sub = await stripe.subscriptions.retrieve(subId);
        } catch {
          break;
        }
        const { belongs, orgId, priceId } = await subscriptionBelongsToApp(sub);
        if (!belongs) {
          console.info("[stripe webhook] ignore invoice (not friction_bounty)", invoice.id);
          break;
        }

        const custId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        const resolvedOrg = orgId || (await resolveOrgIdFromCustomer(custId));

        await recordPaymentEvent({
          orgId: resolvedOrg,
          stripeEventId: event.id,
          stripeObjectId: invoice.id,
          type: event.type,
          priceId,
          amountCents: invoice.amount_paid ?? invoice.amount_due,
          currency: invoice.currency,
          status: invoice.status,
          customerId: custId,
          subscriptionId: subId,
          description: event.type === "invoice.paid" ? "Invoice paid" : "Invoice payment failed",
          metadata: { app: APP_TAG },
        });
        break;
      }

      default:
        // Explicitly ignore everything else (other apps' payment_intent, etc.)
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
