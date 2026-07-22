import type { SeoReport } from "@/lib/seo/validate-post";

export function SeoReportPanel({ report }: { report: SeoReport | null }) {
  if (!report) {
    return (
      <div className="brutal-box-sm p-4 bg-gray-50 font-mono text-sm text-gray-500">
        Save or run SEO check to see the score.
      </div>
    );
  }

  const color =
    report.score >= 75 ? "bg-green-100" : report.score >= 50 ? "bg-yellow-100" : "bg-red-100";

  return (
    <div className="brutal-box p-4 space-y-3">
      <div className={`brutal-box-sm ${color} p-3 flex items-center justify-between gap-3`}>
        <div>
          <p className="font-mono text-xs uppercase text-gray-600">SEO score</p>
          <p className="text-3xl font-bold font-mono">{report.score}<span className="text-base text-gray-500">/100</span></p>
        </div>
        <div className="text-right text-sm">
          <p className="font-mono text-xs uppercase text-gray-500">{report.wordCount} words</p>
          <p className="font-mono text-xs mt-1 max-w-[14rem]">{report.summary}</p>
        </div>
      </div>

      {!report.readyToPublish && (
        <p className="font-mono text-xs text-red-700">
          Publishing is blocked until required checks pass (or force-publish).
        </p>
      )}

      <ul className="space-y-1.5 max-h-80 overflow-y-auto">
        {report.checks.map((c) => (
          <li
            key={c.id}
            className="flex gap-2 text-xs border-b border-gray-100 pb-1.5"
          >
            <span
              className={
                "font-mono uppercase shrink-0 w-10 " +
                (c.status === "pass"
                  ? "text-green-700"
                  : c.status === "warn"
                    ? "text-amber-700"
                    : "text-red-700")
              }
            >
              {c.status}
            </span>
            <div className="min-w-0">
              <p className="font-medium">{c.label}</p>
              <p className="text-gray-500 truncate">{c.detail}</p>
            </div>
            <span className="ml-auto font-mono text-gray-400 shrink-0">
              {c.earned}/{c.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
