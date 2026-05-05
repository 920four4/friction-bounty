import { Resend } from "resend";

let client: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

const FROM = process.env.RESEND_FROM_EMAIL || "Friction Bounty <noreply@frictionbounty.app>";

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    // Soft failure: we still record the message in the thread, just not delivered.
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) return { ok: false, error: error.message || "send failed" };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function sendNewSubmissionToOwner(opts: {
  toEmail: string;
  orgName: string;
  submissionId: string;
  submissionTitle: string;
  reporterEmail: string;
  description: string;
  pageUrl: string;
  bountyAmount: string;
  appBaseUrl: string;
}): Promise<SendResult> {
  const reviewUrl = `${opts.appBaseUrl}/submissions/${opts.submissionId}`;
  const subject = `[${opts.orgName}] New bug report: ${truncate(opts.submissionTitle, 80)}`;
  const text = [
    `New report on ${opts.orgName}.`,
    ``,
    `Title:    ${opts.submissionTitle}`,
    `From:     ${opts.reporterEmail}`,
    `Page:     ${opts.pageUrl}`,
    `Default bounty: $${opts.bountyAmount}`,
    ``,
    `Description:`,
    truncate(opts.description, 600),
    ``,
    `Review and decide:`,
    reviewUrl,
    ``,
    `— Friction Bounty`,
  ].join("\n");
  return sendEmail({ to: opts.toEmail, subject, text });
}

export async function sendSubmissionReceiptToReporter(opts: {
  toEmail: string;
  orgName: string;
  submissionTitle: string;
  bountyAmount: string;
  ownerReplyTo?: string;
}): Promise<SendResult> {
  const subject = `Got your report — ${opts.orgName}`;
  const text = [
    `Thanks for the report.`,
    ``,
    `${opts.orgName} received your submission: "${opts.submissionTitle}".`,
    `If approved, you'll be issued $${opts.bountyAmount} in store credit.`,
    ``,
    `We'll email you with a decision (usually within a few days). If we need more info, reply to this email.`,
    ``,
    `— ${opts.orgName} via Friction Bounty`,
  ].join("\n");
  return sendEmail({ to: opts.toEmail, subject, text, replyTo: opts.ownerReplyTo });
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

export function reporterReplyTemplate(opts: {
  orgName: string;
  submissionTitle: string;
  body: string;
  status?: string;
  bountyAmount?: string;
}) {
  const lines = [
    `Hi —`,
    ``,
    `An update on your report to ${opts.orgName}: "${opts.submissionTitle}"`,
    ``,
    opts.body,
    ``,
  ];
  if (opts.status === "rewarded" && opts.bountyAmount) {
    lines.push(`Your reward: $${opts.bountyAmount} has been issued. It should appear on your account shortly.`);
    lines.push(``);
  }
  if (opts.status === "rejected") {
    lines.push(`This report was declined. If you think this is a mistake, reply to this email.`);
    lines.push(``);
  }
  lines.push(`— ${opts.orgName} via Friction Bounty`);
  return lines.join("\n");
}
