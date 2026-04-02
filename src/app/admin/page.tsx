import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Require authentication
  await requireAuth();
  
  // Fetch submissions with error handling
  let allSubmissions: any[] = [];
  let dbError = null;
  
  try {
    const db = getDb();
    allSubmissions = await db.query.submissions.findMany({
      orderBy: [desc(submissions.createdAt)],
      limit: 50,
    });
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Database error';
    console.error('Admin page DB error:', err);
  }

  const pendingCount = allSubmissions.filter(s => s.status === "pending").length;
  const approvedCount = allSubmissions.filter(s => s.status === "approved").length;
  const rewardedCount = allSubmissions.filter(s => s.status === "rewarded").length;
  
  if (dbError) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="brutal-box p-8 border-red-500">
            <h1 className="text-2xl font-bold font-mono uppercase mb-4 text-red-600">Database Error</h1>
            <p className="font-mono text-sm mb-4">Could not connect to database:</p>
            <code className="block bg-gray-100 p-4 font-mono text-sm">{dbError}</code>
            <p className="mt-4 text-sm text-gray-600">Check your DATABASE_URL environment variable.</p>
          </div>
        </div>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="brutal-badge-yellow">Pending</span>;
      case "approved":
        return <span className="brutal-badge-blue">Approved</span>;
      case "rewarded":
        return <span className="inline-block border border-black bg-green-500 text-white px-2 py-0.5 text-xs font-mono uppercase">Rewarded</span>;
      case "rejected":
        return <span className="inline-block border border-black bg-gray-400 text-white px-2 py-0.5 text-xs font-mono uppercase">Rejected</span>;
      default:
        return <span className="brutal-badge">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link href="/" className="text-gray-500 hover:text-black font-mono text-sm">
                ← Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold font-mono uppercase mt-2">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/settings" className="brutal-btn text-sm">
                Settings
              </Link>
              <form action="/api/admin/logout" method="POST">
                <button type="submit" className="brutal-box px-4 py-2 font-mono text-sm uppercase hover:bg-gray-100">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b-2 border-black bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-8 py-4">
            <div>
              <p className="font-mono text-xs uppercase text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold font-mono">{pendingCount}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-gray-500">Approved</p>
              <p className="text-2xl font-bold font-mono">{approvedCount}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-gray-500">Rewarded</p>
              <p className="text-2xl font-bold font-mono">{rewardedCount}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-gray-500">Total</p>
              <p className="text-2xl font-bold font-mono">{allSubmissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {allSubmissions.length === 0 ? (
          <div className="brutal-box p-12 text-center">
            <p className="font-mono text-lg mb-2">No submissions yet</p>
            <p className="text-gray-500">When users submit bug reports, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allSubmissions.map((submission) => (
              <div 
                key={submission.id} 
                className="brutal-box p-4 md:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {getStatusBadge(submission.status)}
                      <span className="font-mono text-xs text-gray-500">
                        {submission.issueType}
                      </span>
                      <span className="font-mono text-xs text-gray-400">
                        ${submission.bountyAmount}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1 truncate">
                      {submission.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {submission.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
                      <span>{submission.email}</span>
                      <span>{submission.pageUrl}</span>
                      <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {submission.screenshotUrl && (
                      <span className="brutal-badge">Screenshot</span>
                    )}
                    <Link 
                      href={`/admin/submissions/${submission.id}`}
                      className="brutal-btn text-sm whitespace-nowrap"
                    >
                      Review →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}