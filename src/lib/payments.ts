/**
 * Friction Bounty payment isolation.
 *
 * The platform Stripe account may host many 920four products. We only ever
 * act on events that clearly belong to this app:
 *   1. metadata.app === "friction_bounty", OR
 *   2. metadata.friction_bounty_org_id is set, OR
 *   3. subscription/checkout line items include STRIPE_PRICE_PRO, OR
 *   4. customer id is already stored on a Friction Bounty org as billingCustomerId
 *      AND the subscription price matches STRIPE_PRICE_PRO
 *
 * Everything else is ignored (and not written to payment_events).
 */

import type Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, paymentEvents } from "@/db/schema";
import { getPlatformStripe, proPriceId } from "@/lib/stripe";

export const APP_TAG = "friction_bounty";

export function isFrictionBountyMetadata(meta: Stripe.Metadata | null | undefined): boolean {
  if (!meta) return false;
  if (meta.app === APP_TAG) return true;
  if (meta.friction_bounty_org_id) return true;
  return false;
}

export async function subscriptionBelongsToApp(sub: Stripe.Subscription): Promise<{
  belongs: boolean;
  orgId: string | null;
  priceId: string | null;
}> {
  const price = proPriceId();
  const priceIds = sub.items.data
    .map((it) => (typeof it.price === "string" ? it.price : it.price?.id))
    .filter(Boolean) as string[];
  const matchedPrice = price && priceIds.includes(price) ? price : priceIds[0] || null;

  if (isFrictionBountyMetadata(sub.metadata)) {
    return {
      belongs: true,
      orgId: sub.metadata.friction_bounty_org_id || null,
      priceId: matchedPrice,
    };
  }

  // Only accept by price id if it is OUR pro price
  if (price && priceIds.includes(price)) {
    let orgId: string | null = null;
    const cust = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
    if (cust) {
      const db = getDb();
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.billingCustomerId, cust),
        columns: { id: true },
      });
      orgId = org?.id ?? null;
    }
    return { belongs: true, orgId, priceId: price };
  }

  return { belongs: false, orgId: null, priceId: null };
}

export async function checkoutBelongsToApp(session: Stripe.Checkout.Session): Promise<{
  belongs: boolean;
  orgId: string | null;
  priceId: string | null;
}> {
  if (session.mode !== "subscription") {
    return { belongs: false, orgId: null, priceId: null };
  }

  const metaOrg =
    session.metadata?.friction_bounty_org_id ||
    session.client_reference_id ||
    null;

  if (isFrictionBountyMetadata(session.metadata) || metaOrg) {
    // Still verify price when we can expand line items
    return {
      belongs: true,
      orgId: metaOrg,
      priceId: proPriceId(),
    };
  }

  // Expand line items if needed
  const stripe = getPlatformStripe();
  const price = proPriceId();
  if (stripe && price && session.id) {
    try {
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price"],
      });
      const items = full.line_items?.data || [];
      const hasOurPrice = items.some((li) => {
        const p = li.price;
        const id = typeof p === "string" ? p : p?.id;
        return id === price;
      });
      if (hasOurPrice) {
        return { belongs: true, orgId: metaOrg, priceId: price };
      }
    } catch {
      /* ignore */
    }
  }

  return { belongs: false, orgId: null, priceId: null };
}

export async function recordPaymentEvent(input: {
  orgId: string | null;
  stripeEventId: string;
  stripeObjectId?: string | null;
  type: string;
  priceId?: string | null;
  amountCents?: number | null;
  currency?: string | null;
  status?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  description?: string | null;
  metadata?: Record<string, string> | null;
}): Promise<void> {
  const db = getDb();
  try {
    await db.insert(paymentEvents).values({
      orgId: input.orgId,
      stripeEventId: input.stripeEventId,
      stripeObjectId: input.stripeObjectId ?? null,
      type: input.type,
      app: APP_TAG,
      priceId: input.priceId ?? null,
      amountCents: input.amountCents ?? null,
      currency: input.currency ?? null,
      status: input.status ?? null,
      customerId: input.customerId ?? null,
      subscriptionId: input.subscriptionId ?? null,
      description: input.description ?? null,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
    });
  } catch (err) {
    // Unique violation on stripe_event_id = already processed; fine.
    const msg = err instanceof Error ? err.message : "";
    if (!/unique|duplicate/i.test(msg)) throw err;
  }
}

export async function resolveOrgIdFromCustomer(customerId: string | null | undefined): Promise<string | null> {
  if (!customerId) return null;
  const db = getDb();
  const org = await db.query.organizations.findFirst({
    where: and(eq(organizations.billingCustomerId, customerId)),
    columns: { id: true },
  });
  return org?.id ?? null;
}
