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
