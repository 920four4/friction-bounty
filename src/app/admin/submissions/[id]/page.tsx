import Link from "next/link";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { approveSubmission, rejectSubmission } from "./actions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params;
  
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
  });

  if (!submission) {
    redirect("/admin");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="brutal-badge-yellow text-base px-3 py-1">Pending Review</span>;
      case "approved":
        return <span className="brutal-badge-blue text-base px-3 py-1">Approved — Awaiting Reward</span>;
      case "rewarded":
        return <span className="inline-block border-2 border-black bg-green-500 text-white px-3 py-1 text-base font-mono uppercase">Rewarded</span>;
      case "rejected":
        return <span className="inline-block border-2 border-black bg-gray-400 text-white px-3 py-1 text-base font-mono uppercase">Rejected</span>;
      default:
        return <span className="brutal-badge">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-8">
          <Link href="/admin" className="text-gray-500 hover:text-black font-mono text-sm">
            ← Back to Inbox
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">
        {/* Status Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {getStatusBadge(submission.status)}
            <span className="font-mono text-gray-500">
              #{submission.id.slice(0, 8)}
            </span>
          </div>
          <span className="font-mono text-yellow-400 text-xl font-bold">
            ${submission.bountyAmount} bounty
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Screenshot & Context */}
          <div className="md:col-span-2 space-y-6">
            {/* Screenshot */}
            {submission.screenshotUrl ? (
              <div className="brutal-box overflow-hidden">
                <div className="border-b-2 border-black bg-gray-100 px-4 py-2">
                  <span className="font-mono text-sm uppercase">Screenshot</span>
                </div>
                <div className="p-1">
                  <img 
                    src={submission.screenshotUrl} 
                    alt="Bug screenshot"
                    className="w-full h-auto max-h-[500px] object-contain bg-gray-200"
                  />
                </div>
              </div>
            ) : (
              <div className="brutal-box p-8 text-center bg-gray-100">
                <p className="font-mono text-gray-500">No screenshot provided</p>
              </div>
            )}

            {/* Description */}
            <div className="brutal-box p-6">
              <h2 className="font-mono text-sm uppercase text-gray-500 mb-2">
                Issue Description
              </h2>
              <h1 className="text-2xl font-bold mb-4">{submission.title}</h1>
              <p className="text-lg whitespace-pre-wrap">{submission.description}</p>
            </div>

            {/* Technical Context */}
            <div className="brutal-box p-6">
              <h2 className="font-mono text-sm uppercase text-gray-500 mb-4">
                Technical Context
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-mono text-gray-500 block">Browser</span>
                  <span className="font-medium">{submission.browser || "Unknown"}</span>
                </div>
                <div>
                  <span className="font-mono text-gray-500 block">OS</span>
                  <span className="font-medium">{submission.os || "Unknown"}</span>
                </div>
                <div>
                  <span className="font-mono text-gray-500 block">Viewport</span>
                  <span className="font-medium">
                    {submission.viewportWidth && submission.viewportHeight 
                      ? `${submission.viewportWidth}×${submission.viewportHeight}`
                      : "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-gray-500 block">Page URL</span>
                  <a 
                    href={submission.pageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-blue-600 truncate block"
                  >
                    {submission.pageUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Metadata */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <div className="brutal-box p-6">
              <h2 className="font-mono text-sm uppercase text-gray-500 mb-4">
                Reporter
              </h2>
              <p className="font-medium">{submission.email}</p>
              {submission.name && <p className="text-gray-600">{submission.name}</p>}
              <p className="font-mono text-xs text-gray-400 mt-2">
                Submitted {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            {submission.status === "pending" && (
              <div className="brutal-box-yellow p-6">
                <h2 className="font-mono text-sm uppercase mb-4">Actions</h2>
                
                <form action={approveSubmission} className="mb-3">
                  <input type="hidden" name="id" value={submission.id} />
                  <button 
                    type="submit"
                    className="brutal-btn-black w-full text-center"
                  >
                    Approve & Reward ${submission.bountyAmount}
                  </button>
                </form>

                <form action={rejectSubmission}>
                  <input type="hidden" name="id" value={submission.id} />
                  <button 
                    type="submit"
                    className="brutal-btn w-full text-center"
                  >
                    Reject Submission
                  </button>
                </form>

                <p className="font-mono text-xs text-gray-600 mt-4">
                  Approving will trigger Stripe to deliver the reward.
                </p>
              </div>
            )}

            {submission.status === "approved" && (
              <div className="brutal-box p-6" style={{ backgroundColor: "rgba(255, 225, 0, 0.2)" }}>
                <h2 className="font-mono text-sm uppercase mb-2">Status</h2>
                <p className="font-medium">Approved — Reward processing</p>
                <p className="font-mono text-xs text-gray-600 mt-2">
                  If reward hasn&apos;t been delivered, check Stripe dashboard.
                </p>
              </div>
            )}

            {submission.status === "rewarded" && (
              <div className="brutal-box p-6" style={{ backgroundColor: "rgba(0, 204, 102, 0.2)", borderColor: "#00CC66" }}>
                <h2 className="font-mono text-sm uppercase mb-2">Reward Delivered</h2>
                <p className="font-medium">
                  ${submission.bountyAmount} {submission.rewardType === "stripe_credit" ? "account credit" : "discount code"}
                </p>
                {submission.rewardDeliveredAt && (
                  <p className="font-mono text-xs text-gray-600 mt-2">
                    Delivered {new Date(submission.rewardDeliveredAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {submission.status === "rejected" && (
              <div className="brutal-box p-6 bg-gray-200">
                <h2 className="font-mono text-sm uppercase mb-2">Rejected</h2>
                {submission.reviewerNotes && (
                  <p className="text-sm">{submission.reviewerNotes}</p>
                )}
              </div>
            )}

            {/* Reviewer Notes */}
            <div className="brutal-box p-6">
              <h2 className="font-mono text-sm uppercase text-gray-500 mb-4">
                Reviewer Notes
              </h2>
              {submission.reviewerNotes ? (
                <p className="text-sm">{submission.reviewerNotes}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">No notes added</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
