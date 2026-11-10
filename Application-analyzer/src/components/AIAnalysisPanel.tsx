import { useState } from "react";
import { toast } from "react-toastify";
import { AIAnalysis, Application, applicationService } from "../api/services";
import { apiError } from "../utils/errors";

interface Props {
  applicationId: number;
  analysis: AIAnalysis;
  /** called with the refreshed application after a (re)run is requested */
  onUpdated: (application: Application) => void;
}

const asList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))) : [];

const scoreColor = (score: number) =>
  score >= 75 ? "text-green-600" : score >= 50 ? "text-amber-500" : "text-red-500";
const barColor = (score: number) =>
  score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-400" : "bg-red-400";

function Chips({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  if (items.length === 0) return <span className="text-sm text-gray-400">None listed</span>;
  const cls = tone === "good" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{item}</span>
      ))}
    </div>
  );
}

function Verdict({ label, data }: { label: string; data: any }) {
  if (!data || typeof data !== "object") return null;
  const verdict = data.verdict ? String(data.verdict) : "";
  const required = data.required_years ?? data.required;
  const candidate = data.candidate_years ?? data.candidate;
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-sm">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      {verdict && <p className="font-semibold capitalize text-gray-800">{verdict}</p>}
      {(required != null || candidate != null) && (
        <p className="text-xs text-gray-500">
          {required != null && <>Required: {String(required)}</>}
          {required != null && candidate != null && " · "}
          {candidate != null && <>Candidate: {String(candidate)}</>}
        </p>
      )}
    </div>
  );
}

/**
 * The ML model's read on this application. RECRUITER-ONLY: the API never sends
 * this to job seekers, and this panel only appears on the recruiter candidate page.
 */
export default function AIAnalysisPanel({ applicationId, analysis, onUpdated }: Props) {
  const [running, setRunning] = useState(false);
  const { status, details } = analysis;

  const run = async () => {
    setRunning(true);
    try {
      onUpdated(await applicationService.analyzeApplication(applicationId));
    } catch (err: any) {
      toast.error(err?.response?.status === 503 ? "The AI analysis service isn't set up yet." : apiError(err));
    } finally {
      setRunning(false);
    }
  };

  const header = (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
        <i className="fa-solid fa-wand-magic-sparkles text-purple-500"></i>AI analysis
      </h3>
      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-600">
        Recruiters only
      </span>
    </div>
  );

  if (status === "pending" || status === "processing") {
    return (
      <div className="modern-card p-6">
        {header}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <i className="fa-solid fa-spinner loading-spinner text-purple-500"></i>
          <span>The model is analysing this application. This usually takes a moment; the result will appear here.</span>
        </div>
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="modern-card p-6">
        {header}
        <p className="text-sm text-gray-600">
          This application hasn't been analysed. New applications are analysed automatically once the
          model is switched on, and you can run it for this one now.
        </p>
        <button onClick={run} disabled={running}
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          {running ? "Starting..." : "Run AI analysis"}
        </button>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="modern-card p-6">
        {header}
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {analysis.error || "The analysis could not be completed."}
        </div>
        <button onClick={run} disabled={running}
          className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
          {running ? "Retrying..." : "Retry analysis"}
        </button>
      </div>
    );
  }

  // ---- completed ----
  const score = analysis.match_score;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const breakdown: Record<string, number> =
    details.score_breakdown && typeof details.score_breakdown === "object" ? details.score_breakdown : {};
  const breakdownRows = Object.entries(breakdown).filter(([k, v]) => k !== "overall" && typeof v === "number");
  const matched = asList(details.matched_skills);
  const missing = asList(details.missing_skills);
  const strengths = asList(details.strengths);
  const weaknesses = asList(details.weaknesses);

  return (
    <div className="modern-card p-6">
      {header}

      <div className="mb-4 flex items-center gap-5">
        {score != null && (
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r={radius} stroke="#e5e7eb" strokeWidth="9" fill="none" />
              <circle cx="48" cy="48" r={radius} strokeWidth="9" fill="none" strokeLinecap="round"
                stroke="currentColor" className={scoreColor(score)}
                strokeDasharray={circumference} strokeDashoffset={circumference - (score / 100) * circumference} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
              <span className="text-[10px] uppercase text-gray-400">match</span>
            </div>
          </div>
        )}
        <div>
          {analysis.recommendation && <p className="font-semibold text-gray-800">{analysis.recommendation}</p>}
          {details.confidence && <p className="text-xs capitalize text-gray-500">Confidence: {String(details.confidence)}</p>}
          {analysis.analyzed_at && (
            <p className="mt-1 text-xs text-gray-400">
              Analysed {new Date(analysis.analyzed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              {details.model_version ? ` · model ${String(details.model_version)}` : ""}
            </p>
          )}
        </div>
      </div>

      {analysis.summary && <p className="mb-4 text-sm text-gray-700">{analysis.summary}</p>}

      {breakdownRows.length > 0 && (
        <div className="mb-4 space-y-2">
          {breakdownRows.map(([name, value]) => (
            <div key={name}>
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span className="capitalize">{name.replace(/_/g, " ")}</span><span>{Math.round(value)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className={`h-2 rounded-full ${barColor(value)}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(matched.length > 0 || missing.length > 0) && (
        <div className="mb-4 space-y-3">
          <div><p className="mb-1.5 text-xs uppercase text-gray-500">Matched skills</p><Chips items={matched} tone="good" /></div>
          <div><p className="mb-1.5 text-xs uppercase text-gray-500">Missing skills</p><Chips items={missing} tone="bad" /></div>
        </div>
      )}

      {(details.experience_match || details.education_match) && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Verdict label="Experience" data={details.experience_match} />
          <Verdict label="Education" data={details.education_match} />
        </div>
      )}

      {strengths.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs uppercase text-gray-500">Strengths</p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-gray-700">{strengths.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
      {weaknesses.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs uppercase text-gray-500">Weaknesses</p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-gray-700">{weaknesses.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
      {details.next_steps && (
        <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-800">
          <span className="font-semibold">Suggested next step: </span>{String(details.next_steps)}
        </div>
      )}

      <button onClick={run} disabled={running}
        className="mt-4 text-xs font-semibold text-gray-500 hover:text-purple-600 disabled:opacity-50">
        <i className="fa-solid fa-rotate mr-1"></i>{running ? "Re-running..." : "Re-run analysis"}
      </button>
    </div>
  );
}
