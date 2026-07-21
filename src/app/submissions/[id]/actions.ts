"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { organizations, submissionMessages, submissions } from "@/db/schema";
import { getCurrentUser, requireSession } from "@/lib/auth";
import { reporterReplyTemplate, sendEmail } from "@/lib/email";
import { connectOpts, getOrgStripeClient } from "@/lib/stripe";
import { checkBudgetForReward } from "@/lib/budget";

async function loadOwnedSubmission(id: string) {
  const session = await requireSession();
  const db = getDb();

  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
  });
  if (!submission) throw new Error("Submission not found");

  // Super admin can act on any submission; org owners only their own.
  if (session.role !== "super_admin") {
    if (!session.oid || submission.orgId !== session.oid) throw new Error("Not authorized");
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, submission.orgId),
  });
  if (!org) throw new Error("Organization not found");

  return { submission, org, session };
}

async function recordMessage(opts: {
  submissionId: string;
  body: string;
  toEmail: string;
  subject: string;
  ownerEmail?: string;
  status?: string;
  bountyAmount?: string;
  orgName: string;
  submissionTitle: string;
}) {
  const db = getDb();
  const user = await getCurrentUser();
  const text = reporterReplyTemplate({
    orgName: opts.orgName,
    submissionTitle: opts.submissionTitle,
    body: opts.body,
    status: opts.status,
    bountyAmount: opts.bountyAmount,
  });
  const send = await sendEmail({
    to: opts.toEmail,
    subject: opts.subject,
    text,
    replyTo: opts.ownerEmail,
  });
  await db.insert(submissionMessages).values({
    submissionId: opts.submissionId,
    senderType: user?.role === "super_admin" ? "admin" : "owner",
    senderUserId: user && user.id !== "super" ? user.id : undefined,
    senderEmail: user?.email,
    body: opts.body,
    emailedAt: send.ok ? new Date() : null,
    emailError: send.ok ? null : (send as { ok: false; error: string }).error,
  });
}

export async function approveSubmission(formData: FormData) {
  const id = String(formData.get("id") || "");
  const replyBody = String(formData.get("body") || "").trim();
  const customAmount = String(formData.get("bountyAmount") || "").trim();
  const rewardTypeRaw = String(formData.get("rewardType") || "stripe_credit");
  const rewardType: "stripe_credit" | "stripe_coupon" =
    rewardTypeRaw === "stripe_coupon" ? "stripe_coupon" : "stripe_credit";
  if (!id) throw new Error("Submission ID required");

  const { submission, org } = await loadOwnedSubmission(id);
  if (submission.status !== "pending") throw new Error("Submission already processed");

  const db = getDb();
  const user = await getCurrentUser();
  const amountStr = customAmount || submission.bountyAmount.toString();

  // Enforce the monthly spend cap before any money moves. Bounce back with a
  // clear banner rather than throwing an opaque error page.
  const budgetBlock = await checkBudgetForReward(org, parseFloat(amountStr) || 0);
  if (budgetBlock) {
    redirect(`/submissions/${id}?error=budget`);
  }

  await db.update(submissions)
    .set({
      status: "approved",
      reviewedAt: new Date(),
      reviewedByUserId: user && user.id !== "super" ? user.id : undefined,
      bountyAmount: amountStr,
      rewardType,
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  // Try to deliver Stripe reward (credit or coupon)
  let rewardDelivered = false;
  let rewardError: string | null = null;
  let issuedCode: string | null = null;
  try {
    if (rewardType === "stripe_coupon") {
      issuedCode = await deliverCouponReward({ ...submission, bountyAmount: amountStr }, org);
    } else {
      await deliverCreditReward({ ...submission, bountyAmount: amountStr }, org);
    }
    rewardDelivered = true;
  } catch (err) {
    rewardError = err instanceof Error ? err.message : "Reward delivery failed";
  }

  await db.update(submissions)
    .set({
      status: rewardDelivered ? "rewarded" : "approved",
      rewardDeliveredAt: rewardDelivered ? new Date() : null,
      rewardError,
      rewardCode: issuedCode,
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  // Send email to reporter — include code when issuing a coupon
  const codeLine = rewardType === "stripe_coupon" && issuedCode
    ? `\n\nYour code: ${issuedCode}\nApply it at checkout. Single-use, expires in 30 days.`
    : "";
  await recordMessage({
    submissionId: id,
    body: (replyBody || `We've reviewed your report and approved a bounty.`) + codeLine,
    toEmail: submission.email,
    subject: rewardDelivered
      ? `Your bug bounty has been awarded — ${org.name}`
      : `Your bug bounty was approved — ${org.name}`,
    ownerEmail: user?.email,
    status: rewardDelivered ? "rewarded" : "approved",
    bountyAmount: amountStr,
    orgName: org.name,
    submissionTitle: submission.title,
  });

  revalidatePath(`/submissions/${id}`);
  revalidatePath("/dashboard");
  redirect(`/submissions/${id}`);
}

export async function rejectSubmission(formData: FormData) {
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("body") || "").trim();
  if (!id) throw new Error("Submission ID required");

  const { submission, org } = await loadOwnedSubmission(id);
  if (submission.status !== "pending") throw new Error("Submission already processed");

  const db = getDb();
  const user = await getCurrentUser();

  await db.update(submissions)
    .set({
      status: "rejected",
      reviewerNotes: reason || null,
      reviewedAt: new Date(),
      reviewedByUserId: user && user.id !== "super" ? user.id : undefined,
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  await recordMessage({
    submissionId: id,
    body: reason || `Thanks for the report. After review, we won't be issuing a bounty for this one.`,
    toEmail: submission.email,
    subject: `Update on your report — ${org.name}`,
    ownerEmail: user?.email,
    status: "rejected",
    orgName: org.name,
    submissionTitle: submission.title,
  });

  revalidatePath(`/submissions/${id}`);
  revalidatePath("/dashboard");
  redirect(`/submissions/${id}`);
}

export async function replyToSubmission(formData: FormData) {
  const id = String(formData.get("id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!id || !body) throw new Error("Reply body required");

  const { submission, org } = await loadOwnedSubmission(id);
  const user = await getCurrentUser();

  await recordMessage({
    submissionId: id,
    body,
    toEmail: submission.email,
    subject: `Re: ${submission.title}`,
    ownerEmail: user?.email,
    orgName: org.name,
    submissionTitle: submission.title,
  });

  revalidatePath(`/submissions/${id}`);
  redirect(`/submissions/${id}`);
}

type RewardSubmission = {
  id: string;
  email: string;
  name: string | null;
  title: string;
  bountyAmount: string;
  stripeCustomerId: string | null;
};

type RewardOrg = {
  id: string;
  stripeSecretKey: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
};

async function deliverCreditReward(submission: RewardSubmission, org: RewardOrg) {
  const client = getOrgStripeClient(org);
  if (!client.stripe || !client.ready) {
    throw new Error(
      "Stripe is not connected. Open Account → Connect Stripe (one click, no API keys).",
    );
  }
  const stripe = client.stripe;
  const scoped = connectOpts(client);

  const amount = Math.round(parseFloat(submission.bountyAmount) * 100);
  const currency = "usd";

  let customerId = submission.stripeCustomerId;
  if (!customerId && submission.email) {
    const customers = await stripe.customers.list(
      { email: submission.email, limit: 1 },
      scoped,
    );
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create(
        {
          email: submission.email,
          name: submission.name || undefined,
          metadata: { bounty_submission_id: submission.id, source: "friction_bounty" },
        },
        scoped,
      );
      customerId = customer.id;
    }
  }

  if (!customerId) throw new Error("No customer email; cannot issue credit");

  await stripe.customers.createBalanceTransaction(
    customerId,
    {
      amount: -amount,
      currency,
      description: `Bug bounty reward: ${submission.title}`,
      metadata: { bounty_submission_id: submission.id },
    },
    { ...scoped, idempotencyKey: `bounty-${submission.id}` },
  );

  const db = getDb();
  await db.update(submissions)
    .set({ stripeCustomerId: customerId })
    .where(and(eq(submissions.id, submission.id)));
}

async function deliverCouponReward(
  submission: RewardSubmission,
  org: RewardOrg,
): Promise<string> {
  const client = getOrgStripeClient(org);
  if (!client.stripe || !client.ready) {
    throw new Error(
      "Stripe is not connected. Open Account → Connect Stripe (one click, no API keys).",
    );
  }
  const stripe = client.stripe;
  const scoped = connectOpts(client);

  const amount = Math.round(parseFloat(submission.bountyAmount) * 100);
  const currency = "usd";

  // Idempotent: same submission always produces the same coupon
  const coupon = await stripe.coupons.create(
    {
      amount_off: amount,
      currency,
      duration: "once",
      name: `Bug bounty reward ($${(amount / 100).toFixed(2)})`,
      max_redemptions: 1,
      metadata: { bounty_submission_id: submission.id, source: "friction_bounty" },
    },
    { ...scoped, idempotencyKey: `bounty-coupon-${submission.id}` },
  );

  const code = `BOUNTY-${submission.id.slice(0, 8).toUpperCase()}`;
  const promo = await stripe.promotionCodes.create(
    {
      promotion: { type: "coupon", coupon: coupon.id },
      code,
      max_redemptions: 1,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      metadata: { bounty_submission_id: submission.id },
    },
    { ...scoped, idempotencyKey: `bounty-promo-${submission.id}` },
  );

  return promo.code;
}
