import Stripe from "stripe";

/**
 * Platform Stripe client (Friction Bounty's account).
 * Used for:
 *  - Connect account creation / Account Links (merchant onboarding)
 *  - Issuing rewards on a connected account via { stripeAccount }
 *  - SaaS billing (Checkout + Customer Portal for Pro)
 *
 * Merchants never paste API keys. They click "Connect with Stripe".
 */

const API_VERSION = "2026-03-25.dahlia" as const;

let platform: Stripe | null | undefined;

export function getPlatformStripe(): Stripe | null {
  if (platform !== undefined) return platform;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    platform = null;
    return null;
  }
  platform = new Stripe(key, { apiVersion: API_VERSION });
  return platform;
}

export function isStripePlatformConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export type OrgStripeSource = {
  stripeAccountId?: string | null;
  stripeSecretKey?: string | null; // legacy only
  stripeChargesEnabled?: boolean | null;
};

/**
 * How to talk to Stripe for a given merchant.
 * Prefer Connect (platform key + stripeAccount). Fall back to a legacy
 * per-org restricted key only if one is already stored.
 */
export type OrgStripeClient =
  | { mode: "connect"; stripe: Stripe; stripeAccount: string; ready: boolean }
  | { mode: "legacy"; stripe: Stripe; stripeAccount?: undefined; ready: true }
  | { mode: "none"; stripe: null; stripeAccount?: undefined; ready: false };

export function getOrgStripeClient(org: OrgStripeSource): OrgStripeClient {
  const platformStripe = getPlatformStripe();

  if (org.stripeAccountId && platformStripe) {
    return {
      mode: "connect",
      stripe: platformStripe,
      stripeAccount: org.stripeAccountId,
      ready: !!org.stripeChargesEnabled,
    };
  }

  // Legacy path — existing orgs that pasted a restricted key before Connect.
  if (org.stripeSecretKey) {
    return {
      mode: "legacy",
      stripe: new Stripe(org.stripeSecretKey, { apiVersion: API_VERSION }),
      ready: true,
    };
  }

  return { mode: "none", stripe: null, ready: false };
}

/** Request options for Connect-scoped API calls. */
export function connectOpts(client: OrgStripeClient): { stripeAccount: string } | undefined {
  if (client.mode === "connect") return { stripeAccount: client.stripeAccount };
  return undefined;
}

/** True when the org can issue rewards (Connect complete, or legacy key). */
export function orgCanIssueRewards(org: OrgStripeSource): boolean {
  return getOrgStripeClient(org).ready;
}

/** @deprecated use getOrgStripeClient — kept for any lingering imports */
export function getStripeForOrg(secretKey: string | null | undefined): Stripe | null {
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: API_VERSION });
}

export function proPriceId(): string | null {
  return process.env.STRIPE_PRICE_PRO || null;
}
