import Stripe from "stripe";

/**
 * Per-org Stripe client. Each merchant supplies their own secret key in
 * dashboard settings; rewards are issued on their account.
 */
export function getStripeForOrg(secretKey: string | null | undefined): Stripe | null {
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" });
}
