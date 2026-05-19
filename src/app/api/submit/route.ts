import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UAParser } from "ua-parser-js";
import { and, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations, submissions, rateLimitLog, users } from "@/db/schema";
import { corsPreflight, withCors } from "@/lib/cors";
import { sendNewSubmissionToOwner, sendSubmissionReceiptToReporter } from "@/lib/email";
import { appBaseUrlFromRequest } from "@/lib/url";

const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), { message: "Only http(s) URLs are allowed" });

const submissionSchema = z.object({
  apiKey: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  issueType: z.enum(["bug", "ux_confusion", "feature_request"]),
  title: z.string().min(1).max(255),
  description: z.string().min(10),
  pageUrl: httpUrl,
  screenshotUrl: httpUrl.optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  viewportWidth: z.number().optional(),
  viewportHeight: z.number().optional(),
  referrer: z.string().optional(),
  fingerprint: z.string().optional(),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  const result = submissionSchema.safeParse(body);
  if (!result.success) {
    return withCors(NextResponse.json(
      { error: "Invalid input", details: result.error.flatten() },
      { status: 400 }
    ));
  }
  const data = result.data;

  const db = getDb();

  // Resolve org by API key
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.apiKey, data.apiKey),
  });
  if (!org || !org.isActive) {
    return withCors(NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 }));
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                    request.headers.get("x-real-ip") ||
                    "unknown";

  // Rate limit: 3 submissions / hour / IP / org
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentAttempts = await db.query.rateLimitLog.findMany({
    where: and(
      eq(rateLimitLog.orgId, org.id),
      eq(rateLimitLog.ipAddress, ipAddress),
      gte(rateLimitLog.attemptedAt, oneHourAgo),
    ),
  });
  if (recentAttempts.length >= 3) {
    return withCors(NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    ));
  }

  await db.insert(rateLimitLog).values({
    orgId: org.id,
    ipAddress,
    email: data.email,
    fingerprint: data.fingerprint,
  });

  // Fill in browser/os from UA if widget didn't supply them
  let browser = data.browser;
  let os = data.os;
  if (!browser || !os) {
    const userAgent = request.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    browser = browser || parser.getBrowser().name || "Unknown";
    os = os || parser.getOS().name || "Unknown";
  }

  const [submission] = await db.insert(submissions).values({
    orgId: org.id,
    email: data.email,
    name: data.name,
    issueType: data.issueType,
    title: data.title,
    description: data.description,
    pageUrl: data.pageUrl,
    screenshotUrl: data.screenshotUrl,
    browser,
    os,
    viewportWidth: data.viewportWidth,
    viewportHeight: data.viewportHeight,
    referrer: data.referrer,
    ipAddress,
    fingerprint: data.fingerprint,
    status: "pending",
    bountyAmount: org.defaultBountyAmount,
  }).returning();

  // Notify owner + send receipt to reporter — runs after the response is sent.
  after(async () => {
    try {
      const appBaseUrl = appBaseUrlFromRequest(request);

      // Resolve recipient: org's notification_email override → first owner's email
      let ownerEmail = org.notificationEmail;
      if (!ownerEmail) {
        const owner = await db.query.users.findFirst({ where: eq(users.orgId, org.id) });
        ownerEmail = owner?.email ?? null;
      }

      const tasks: Promise<unknown>[] = [];
      if (ownerEmail && org.notifyOnSubmission) {
        tasks.push(sendNewSubmissionToOwner({
          toEmail: ownerEmail,
          orgName: org.name,
          submissionId: submission.id,
          submissionTitle: submission.title,
          reporterEmail: submission.email,
          description: submission.description,
          pageUrl: submission.pageUrl,
          bountyAmount: submission.bountyAmount.toString(),
          appBaseUrl,
        }));
      }
      tasks.push(sendSubmissionReceiptToReporter({
        toEmail: submission.email,
        orgName: org.name,
        submissionTitle: submission.title,
        bountyAmount: submission.bountyAmount.toString(),
        ownerReplyTo: ownerEmail ?? undefined,
      }));
      await Promise.allSettled(tasks);
    } catch (err) {
      console.error("submission notification failed", err);
    }
  });

  return withCors(NextResponse.json(
    {
      success: true,
      id: submission.id,
      message: "Submission received. We'll review and notify you via email.",
    },
    { status: 201 }
  ));
}
