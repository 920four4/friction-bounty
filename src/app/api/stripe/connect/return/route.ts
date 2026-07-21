import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getPlatformStripe } from "@/lib/stripe";
import { appBaseUrlFromRequest } from "@/lib/url";

export const runtime = "nodejs";

/**
 * Stripe redirects here after Connect onboarding. Refresh account status, then
 * send the merchant back to their account page.
 */
export async function GET(request: NextRequest) {
  const base = appBaseUrlFromRequest(request);
  try {
    const session = await getSession();
    if (!session || session.role !== "org_owner" || !session.oid) {
      return NextResponse.redirect(`${base}/login`);
    }
    const orgId = session.oid;
    const stripe = getPlatformStripe();
    const db = getDb();
    const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });

    if (stripe && org?.stripeAccountId) {
      const account = await stripe.accounts.retrieve(org.stripeAccountId);
      await db
        .update(organizations)
        .set({
          stripeChargesEnabled: account.charges_enabled ?? false,
          stripeDetailsSubmitted: account.details_submitted ?? false,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      const ready = account.charges_enabled;
      return NextResponse.redirect(
        `${base}/dashboard/account?connect=${ready ? "connected" : "pending"}`,
      );
    }
  } catch {
    // fall through
  }
  return NextResponse.redirect(`${base}/dashboard/account?connect=error`);
}
