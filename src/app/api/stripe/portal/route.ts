import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getPlatformStripe } from "@/lib/stripe";
import { appBaseUrlFromRequest } from "@/lib/url";

export const runtime = "nodejs";

/** Open Stripe Customer Portal for invoices, payment method, cancel. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "org_owner" || !session.oid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.oid;
  const stripe = getPlatformStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }

  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  if (!org?.billingCustomerId) {
    return NextResponse.json({ error: "No billing account yet — upgrade first." }, { status: 400 });
  }

  const base = appBaseUrlFromRequest(request);
  const portal = await stripe.billingPortal.sessions.create({
    customer: org.billingCustomerId,
    return_url: `${base}/dashboard/account`,
  });

  return NextResponse.json({ url: portal.url });
}
