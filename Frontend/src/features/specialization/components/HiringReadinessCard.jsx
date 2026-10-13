import { FiBriefcase } from "react-icons/fi";

const LEVEL_TONE = {
  Ready: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
  High: "text-blue-300 border-blue-400/40 bg-blue-500/10",
  Moderate: "text-amber-300 border-amber-400/40 bg-amber-500/10",
  Low: "text-rose-300 border-rose-400/40 bg-rose-500/10",
};

function HiringReadinessCard({ readiness, faang, timeline }) {
  if (!readiness) return null;
  const tone = LEVEL_TONE[readiness.level] || LEVEL_TONE.Moderate;
  return (
    <div className="border border-slate-700/60 bg-slate-800/40 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <FiBriefcase className="text-emerald-300 text-xl" />
        <h3 className="text-base font-semibold text-white">Hiring Readiness</h3>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${tone}`}
        >
          {readiness.level}
        </span>
        <span className="text-xs text-slate-400">
          ETA: {readiness.estimated_time_to_ready}
        </span>
      </div>
      {readiness.rationale && (
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {readiness.rationale}
        </p>
      )}
      {timeline && (
        <p className="text-xs text-slate-500">
          Timeline to job-ready: <span className="text-slate-300">{timeline}</span>
        </p>
      )}
      {faang && faang.level && (
        <div className="mt-5 pt-5 border-t border-slate-700/60">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            FAANG Readiness
          </p>
          <p className="text-sm font-semibold text-white mb-1">{faang.level}</p>
          {faang.advice && (
            <p className="text-xs text-slate-400 leading-relaxed">
              {faang.advice}
            </p>
          )}
          {faang.gaps?.length ? (
            <ul className="mt-2 text-xs text-slate-400 list-disc ml-5">
              {faang.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default HiringReadinessCard;
