"use server";

import { getDb } from "../../../../db";
import { submissions } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function approveSubmission(formData: FormData) {
  const id = formData.get("id") as string;
  
  if (!id) {
    throw new Error("Submission ID required");
  }

  const db = getDb();
  
  // Fetch submission
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.status !== "pending") {
    throw new Error("Submission already processed");
  }

  // Update status to approved
  await db.update(submissions)
    .set({ 
      status: "approved",
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  // Trigger reward delivery
  try {
    await deliverReward(submission);
    
    // Update to rewarded
    await db.update(submissions)
      .set({ 
        status: "rewarded",
        rewardDeliveredAt: new Date(),
      })
      .where(eq(submissions.id, id));
      
  } catch (error) {
    console.error("Reward delivery failed:", error);
    // Keep as approved, will retry or handle manually
    await db.update(submissions)
      .set({ 
        rewardError: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(submissions.id, id));
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/submissions/${id}`);
  redirect("/admin");
}

export async function rejectSubmission(formData: FormData) {
  const id = formData.get("id") as string;
  
  if (!id) {
    throw new Error("Submission ID required");
  }

  const db = getDb();

  await db.update(submissions)
    .set({ 
      status: "rejected",
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  revalidatePath("/admin");
  revalidatePath(`/admin/submissions/${id}`);
  redirect("/admin");
}

async function deliverReward(submission: typeof submissions.$inferSelect) {
  const amount = Math.round(parseFloat(submission.bountyAmount.toString()) * 100); // Convert to cents
  const currency = "usd";

  // Try to find or create Stripe customer
  let customerId = submission.stripeCustomerId;
  
  if (!customerId && submission.email) {
    // Search for existing customer by email
    const customers = await stripe.customers.list({
      email: submission.email,
      limit: 1,
    });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: submission.email,
        name: submission.name || undefined,
        metadata: {
          bounty_submission_id: submission.id,
          source: "friction_bounty",
        },
      });
      customerId = customer.id;
    }
  }

  if (!customerId) {
    // Fall back to discount code if no customer
    return await createDiscountCode(submission, amount, currency);
  }

  // Add customer credit
  await stripe.customers.createBalanceTransaction(
    customerId,
    {
      amount: -amount, // Negative = credit
      currency: currency,
      description: `Bug bounty reward: ${submission.title}`,
      metadata: {
        bounty_submission_id: submission.id,
      },
    },
    {
      idempotencyKey: `bounty-${submission.id}`,
    }
  );

  // TODO: Send email notification to user
  // This would integrate with Resend or similar

  return { method: "stripe_credit", customerId };
}

async function createDiscountCode(
  submission: typeof submissions.$inferSelect, 
  amount: number, 
  currency: string
) {
  // Create coupon
  const coupon = await stripe.coupons.create({
    amount_off: amount,
    currency: currency,
    duration: "once",
    name: `Bug Bounty Reward ($${amount / 100})`,
    max_redemptions: 1,
    metadata: {
      bounty_submission_id: submission.id,
    },
  });

  // Generate unique code
  const code = `BOUNTY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Create promotion code
  const promotionCode = await stripe.promotionCodes.create({
    code: code,
    expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    metadata: {
      bounty_submission_id: submission.id,
    },
  } as any);

  // TODO: Send email with discount code

  return { method: "stripe_discount", code: promotionCode.code };
}