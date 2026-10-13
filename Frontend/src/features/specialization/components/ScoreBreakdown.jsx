const LABELS = {
  core_skills_match: "Core Skills",
  project_relevance: "Project Relevance",
  production_readiness: "Production Readiness",
  architecture_maturity: "Architecture Maturity",
  profile_quality: "Profile Quality",
  jd_keyword_match: "JD Match",
};

const WEIGHTS = {
  core_skills_match: 35,
  project_relevance: 25,
  production_readiness: 15,
  architecture_maturity: 10,
  profile_quality: 5,
  jd_keyword_match: 10,
};

const colorFor = (score) => {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 55) return "bg-blue-500";
  if (score >= 35) return "bg-amber-500";
  return "bg-rose-500";
};

function ScoreBreakdown({ breakdown = {} }) {
  const entries = Object.keys(LABELS).map((key) => ({
    key,
    label: LABELS[key],
    weight: WEIGHTS[key],
    score: Math.max(0, Math.min(100, breakdown[key] || 0)),
  }));

  return (
    <div className="space-y-3">
      {entries.map(({ key, label, weight, score }) => (
        <div key={key}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-300">
              {label}
              <span className="text-slate-500 ml-1.5">({weight}%)</span>
            </span>
            <span className="text-xs text-slate-400 tabular-nums">{score}</span>
          </div>
          <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden">
            <div
              className={`${colorFor(score)} h-full transition-all duration-700`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScoreBreakdown;
