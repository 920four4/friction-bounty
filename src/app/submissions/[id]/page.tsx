import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { submissions, submissionMessages } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { approveSubmission, rejectSubmission, replyToSubmission } from "./actions";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const db = getDb();
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
  });
  if (!submission) redirect(session.role === "super_admin" ? "/super-admin" : "/dashboard");
  if (session.role === "org_owner" && submission.orgId !== session.oid) redirect("/dashboard");

  const isSuperAdmin = session.role === "super_admin";
  const backHref = isSuperAdmin ? `/super-admin/orgs/${submission.orgId}` : "/dashboard";

  const thread = await db.query.submissionMessages.findMany({
    where: eq(submissionMessages.submissionId, id),
    orderBy: [asc(submissionMessages.createdAt)],
  });

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <Link href={backHref} className="text-gray-500 hover:text-black font-mono text-sm">← Back</Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-8">
        <div className="flex items-center gap-3">
          <StatusBadge status={submission.status} />
          <span className="font-mono text-gray-500">#{submission.id.slice(0, 8)}</span>
        </div>
        <span className="font-mono text-xl font-bold">${submission.bountyAmount} bounty</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {submission.screenshotUrl ? (
            <div className="brutal-box overflow-hidden">
              <div className="border-b-2 border-black bg-gray-100 px-4 py-2 font-mono text-sm uppercase">Screenshot</div>
              <Image
                src={submission.screenshotUrl}
                alt="Bug screenshot"
                width={1280}
                height={720}
                unoptimized
                className="w-full h-auto max-h-[500px] object-contain bg-gray-200"
              />
            </div>
          ) : (
            <div className="brutal-box p-8 text-center bg-gray-100 font-mono text-gray-500">No screenshot provided</div>
          )}

          <div className="brutal-box p-6">
            <h2 className="font-mono text-xs uppercase text-gray-500 mb-2">Issue</h2>
            <h1 className="text-2xl font-bold mb-3">{submission.title}</h1>
            <p className="whitespace-pre-wrap">{submission.description}</p>
          </div>

          <div className="brutal-box p-6">
            <h2 className="font-mono text-xs uppercase text-gray-500 mb-3">Technical context</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <KV k="Browser" v={submission.browser ?? "Unknown"} />
              <KV k="OS" v={submission.os ?? "Unknown"} />
              <KV k="Viewport" v={submission.viewportWidth && submission.viewportHeight ? `${submission.viewportWidth}×${submission.viewportHeight}` : "Unknown"} />
              <div>
                <span className="font-mono text-gray-500 block text-xs uppercase">URL</span>
                <a href={submission.pageUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline truncate block">{submission.pageUrl}</a>
              </div>
            </div>
          </div>

          {/* Thread */}
          <div className="brutal-box p-6">
            <h2 className="font-mono text-xs uppercase text-gray-500 mb-4">Conversation</h2>
            {thread.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No messages yet.</p>
            ) : (
              <ul className="space-y-3">
                {thread.map((m) => (
                  <li key={m.id} className="brutal-box-sm p-3 bg-gray-50">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-1">
                      <span className="uppercase">{m.senderType}</span>
                      {m.senderEmail && <span>· {m.senderEmail}</span>}
                      <span>· {new Date(m.createdAt).toLocaleString()}</span>
                      {m.emailedAt ? <span className="text-green-700">· emailed</span> : m.emailError ? <span className="text-red-600">· not sent ({m.emailError})</span> : null}
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                  </li>
                ))}
              </ul>
            )}

            <form action={replyToSubmission} className="mt-4 space-y-2">
              <input type="hidden" name="id" value={submission.id} />
              <label className="brutal-label">Send reply (emailed to {submission.email})</label>
              <textarea name="body" rows={3} required className="brutal-input" placeholder="Type a message…" />
              <button type="submit" className="brutal-btn-black">Send reply</button>
            </form>
          </div>
        </div>

        {/* Right column: actions */}
        <div className="space-y-6">
          <div className="brutal-box p-6">
            <h2 className="font-mono text-xs uppercase text-gray-500 mb-3">Reporter</h2>
            <p className="font-medium">{submission.email}</p>
            {submission.name && <p className="text-gray-600">{submission.name}</p>}
            <p className="font-mono text-xs text-gray-400 mt-2">Submitted {new Date(submission.createdAt).toLocaleString()}</p>
          </div>

          {submission.status === "pending" && (
            <div className="brutal-box-yellow p-6 space-y-4">
              <h2 className="font-mono text-xs uppercase">Decision</h2>

              <form action={approveSubmission} className="space-y-2">
                <input type="hidden" name="id" value={submission.id} />
                <label className="brutal-label">Bounty amount</label>
                <input
                  type="number"
                  step="0.01"
                  name="bountyAmount"
                  defaultValue={submission.bountyAmount}
                  className="brutal-input"
                />
                <label className="brutal-label">Message to reporter (optional)</label>
                <textarea name="body" rows={3} className="brutal-input" placeholder="Nice catch! We'll fix this in our next release." />
                <button type="submit" className="brutal-btn-black w-full">Approve & reward</button>
              </form>

              <div className="border-t-2 border-black pt-4">
                <form action={rejectSubmission} className="space-y-2">
                  <input type="hidden" name="id" value={submission.id} />
                  <label className="brutal-label">Decline reason (emailed to reporter)</label>
                  <textarea name="body" rows={2} className="brutal-input" placeholder="Couldn't reproduce, marking as spam, etc." />
                  <button type="submit" className="brutal-btn w-full">Decline as spam / invalid</button>
                </form>
              </div>
            </div>
          )}

          {submission.status === "approved" && (
            <div className="brutal-box p-6 bg-yellow-50">
              <h2 className="font-mono text-xs uppercase mb-1">Approved</h2>
              <p className="text-sm">Reward not yet delivered. {submission.rewardError && <span className="text-red-600">Stripe error: {submission.rewardError}</span>}</p>
              <p className="text-xs text-gray-500 mt-2">Configure Stripe in Settings, then re-approve from the API or contact support.</p>
            </div>
          )}

          {submission.status === "rewarded" && (
            <div className="brutal-box p-6" style={{ backgroundColor: "rgba(0,204,102,0.15)", borderColor: "#00CC66" }}>
              <h2 className="font-mono text-xs uppercase">Rewarded</h2>
              <p className="font-medium">${submission.bountyAmount} credit issued</p>
              {submission.rewardDeliveredAt && (
                <p className="font-mono text-xs text-gray-600 mt-1">Delivered {new Date(submission.rewardDeliveredAt).toLocaleString()}</p>
              )}
            </div>
          )}

          {submission.status === "rejected" && (
            <div className="brutal-box p-6 bg-gray-100">
              <h2 className="font-mono text-xs uppercase mb-1">Rejected</h2>
              {submission.reviewerNotes && <p className="text-sm">{submission.reviewerNotes}</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="font-mono text-gray-500 block text-xs uppercase">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "brutal-badge-yellow text-base px-3 py-1",
    approved: "brutal-badge-blue text-base px-3 py-1",
    rewarded: "inline-block border-2 border-black bg-green-500 text-white px-3 py-1 text-base font-mono uppercase",
    rejected: "inline-block border-2 border-black bg-gray-400 text-white px-3 py-1 text-base font-mono uppercase",
  };
  return <span className={map[status] ?? "brutal-badge"}>{status.replace("_", " ")}</span>;
}
