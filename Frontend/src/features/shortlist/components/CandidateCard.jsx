import { motion } from "framer-motion";
import { FiAward, FiExternalLink, FiGithub } from "react-icons/fi";

const scoreTone = (score) => {
  if (score >= 85) return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (score >= 70) return "text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-500/10";
  if (score >= 50) return "text-amber-300 border-amber-500/40 bg-amber-500/10";
  return "text-rose-300 border-rose-500/40 bg-rose-500/10";
};

const Chip = ({ children, tone = "slate" }) => {
  const styles =
    tone === "matched"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : tone === "missing"
      ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
      : tone === "spec"
      ? "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30"
      : "bg-slate-700/40 text-slate-300 border-slate-600/40";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  );
};

function CandidateCard({ candidate, delay = 0 }) {
  const {
    rank,
    candidate_name,
    github_url,
    github_username,
    avatar_url,
    match_score,
    confidence,
    specializations = [],
    matched_skills = [],
    missing_skills = [],
    strengths = [],
    notable_projects = [],
    reason_for_shortlist,
    email,
    college,
  } = candidate;

  const displayName = candidate_name || github_username;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 grid gap-5"
    >
      <header className="flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={displayName}
              className="w-12 h-12 rounded-full border border-slate-600"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <FiGithub className="text-slate-300" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                #{rank}
              </span>
              <h3 className="text-lg font-semibold text-white truncate">
                {displayName}
              </h3>
            </div>
            <a
              href={github_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-fuchsia-300 inline-flex items-center gap-1 mt-1"
            >
              @{github_username}
              <FiExternalLink className="text-[10px]" />
            </a>
            {(email || college) && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                {[email, college].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div
          className={`ml-auto flex flex-col items-center justify-center px-4 py-2 rounded-xl border ${scoreTone(
            match_score
          )}`}
        >
          <span className="text-2xl font-bold tabular-nums leading-none">
            {match_score}
          </span>
          <span className="text-[10px] uppercase tracking-wider opacity-80 mt-1">
            match
          </span>
        </div>
      </header>

      {reason_for_shortlist && (
        <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-fuchsia-500/60 pl-3">
          {reason_for_shortlist}
        </p>
      )}

      {specializations.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Specializations
          </p>
          <div className="flex flex-wrap gap-2">
            {specializations.map((s) => (
              <Chip key={s} tone="spec">
                <FiAward className="mr-1 text-xs" />
                {s}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {strengths.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Strengths
          </p>
          <ul className="text-sm text-slate-300 grid gap-1.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-400 shrink-0">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {matched_skills.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Matched skills
            </p>
            <div className="flex flex-wrap gap-2">
              {matched_skills.slice(0, 12).map((s) => (
                <Chip key={s} tone="matched">
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {missing_skills.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Missing skills
            </p>
            <div className="flex flex-wrap gap-2">
              {missing_skills.slice(0, 12).map((s) => (
                <Chip key={s} tone="missing">
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      {notable_projects.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Notable projects
          </p>
          <ul className="text-sm text-slate-300 grid gap-1.5">
            {notable_projects.slice(0, 5).map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-fuchsia-400 shrink-0">▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="text-[11px] text-slate-500 tabular-nums flex justify-between">
        <span>Confidence {confidence}%</span>
      </footer>
    </motion.article>
  );
}

export default CandidateCard;
