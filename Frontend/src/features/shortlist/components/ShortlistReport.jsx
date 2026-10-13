import { motion } from "framer-motion";
import { FiAlertTriangle, FiBriefcase } from "react-icons/fi";

import CandidateCard from "./CandidateCard";

const SKIP_LABELS = {
  invalid_github_url: "Invalid GitHub URL",
  duplicate: "Duplicate profile",
  profile_not_found: "Profile not found",
  github_rate_limited: "GitHub rate limit",
  github_fetch_failed: "Could not fetch profile",
};

function SkillList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-2.5 py-1 rounded-full border border-slate-700/60 bg-slate-800/60 text-xs text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ShortlistReport({ data }) {
  if (!data) return null;
  const {
    total_candidates = 0,
    shortlist_count = 0,
    jd_requirements,
    shortlisted = [],
    skipped = [],
  } = data;

  return (
    <motion.section
      key="shortlist-report"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 mt-8"
    >
      <header className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 grid gap-5">
        <div className="flex flex-wrap items-baseline gap-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiBriefcase className="text-fuchsia-300" />
            JD requirements
          </h3>
          <p className="text-xs text-slate-500">
            Ranked {shortlist_count} of {total_candidates} candidates
          </p>
          {jd_requirements?.seniority_level && (
            <span className="ml-auto text-xs text-slate-400 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-full">
              Seniority: {jd_requirements.seniority_level}
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <SkillList
            title="Required skills"
            items={jd_requirements?.required_skills}
          />
          <SkillList
            title="Preferred skills"
            items={jd_requirements?.preferred_skills}
          />
          <SkillList
            title="Experience areas"
            items={jd_requirements?.experience_areas}
          />
          <SkillList
            title="Project types"
            items={jd_requirements?.project_types}
          />
        </div>
      </header>

      {shortlisted.length === 0 ? (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 text-center text-slate-400">
          No candidates met the matching threshold.
        </div>
      ) : (
        <div className="grid gap-4">
          {shortlisted.map((c, i) => (
            <CandidateCard
              key={`${c.github_username}-${c.rank}`}
              candidate={c}
              delay={Math.min(i * 0.04, 0.3)}
            />
          ))}
        </div>
      )}

      {skipped.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <header className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="text-amber-300" />
            <h4 className="text-sm font-semibold text-amber-200">
              Skipped rows ({skipped.length})
            </h4>
          </header>
          <ul className="grid gap-1.5 text-xs text-amber-100/80">
            {skipped.slice(0, 20).map((row, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-400">·</span>
                <span className="truncate">
                  {row.github_url || row.name || "(empty row)"}
                </span>
                <span className="ml-auto text-amber-300/80">
                  {SKIP_LABELS[row.reason] || row.reason}
                </span>
              </li>
            ))}
            {skipped.length > 20 && (
              <li className="text-amber-300/70">
                …and {skipped.length - 20} more
              </li>
            )}
          </ul>
        </section>
      )}
    </motion.section>
  );
}

export default ShortlistReport;
