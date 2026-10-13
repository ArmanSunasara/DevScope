import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiExternalLink,
  FiGithub,
  FiTarget,
  FiThumbsUp,
  FiTool,
  FiXCircle,
} from "react-icons/fi";

import AlignmentGauge from "./AlignmentGauge";

const severityTone = {
  high: "border-rose-500/30 bg-rose-500/5 text-rose-300",
  medium: "border-amber-500/30 bg-amber-500/5 text-amber-200",
  low: "border-slate-600/40 bg-slate-800/40 text-slate-300",
};

const importanceTone = {
  high: "text-violet-300 border-violet-500/40 bg-violet-500/10",
  medium: "text-slate-300 border-slate-600/40 bg-slate-700/40",
  low: "text-slate-400 border-slate-700/40 bg-slate-800/40",
};

const matchTone = (score) => {
  if (score >= 80) return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (score >= 55) return "text-violet-300 border-violet-500/40 bg-violet-500/10";
  return "text-amber-300 border-amber-500/40 bg-amber-500/10";
};

function Section({ icon: Icon, title, accent, count, children }) {
  return (
    <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 grid gap-4">
      <header className="flex items-center gap-2">
        <Icon className={accent} />
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {typeof count === "number" && (
          <span className="text-xs text-slate-500">({count})</span>
        )}
      </header>
      {children}
    </section>
  );
}

function Chip({ children, tone = "slate" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${tone}`}
    >
      {children}
    </span>
  );
}

function ResumeMatchReport({ data }) {
  if (!data?.report) return null;
  const { report, profile, avatarUrl, htmlUrl } = data;
  const {
    alignment_score = 0,
    confidence = 0,
    summary = "",
    verdict = "",
    resume = {},
    matched_projects = [],
    missing_projects = [],
    github_only_projects = [],
    unsupported_claims = [],
    skill_verification = [],
    recommendations = [],
  } = report;

  const verifiedSkills = skill_verification.filter((s) => s.verified);
  const unverifiedSkills = skill_verification.filter((s) => !s.verified);
  const displayName = resume.candidate_name || profile?.name || profile?.username;

  return (
    <motion.section
      key="resume-match-report"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 mt-8"
    >
      {/* Overview */}
      <header className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 grid md:grid-cols-[auto_1fr] gap-6 items-center">
        <AlignmentGauge score={alignment_score} confidence={confidence} />
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-11 h-11 rounded-full border border-slate-600"
                loading="lazy"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center">
                <FiGithub className="text-slate-300" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">
                {displayName}
              </h3>
              {profile?.username && (
                <a
                  href={htmlUrl || `https://github.com/${profile.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-violet-300 inline-flex items-center gap-1"
                >
                  @{profile.username}
                  <FiExternalLink className="text-[10px]" />
                </a>
              )}
            </div>
          </div>
          {verdict && (
            <p className="text-sm font-medium text-violet-200 border-l-2 border-violet-500/60 pl-3">
              {verdict}
            </p>
          )}
          {summary && (
            <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
          )}
        </div>
      </header>

      {/* Matched projects */}
      {matched_projects.length > 0 && (
        <Section
          icon={FiCheckCircle}
          title="Verified projects"
          accent="text-emerald-300"
          count={matched_projects.length}
        >
          <div className="grid gap-3">
            {matched_projects.map((p, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 grid gap-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">
                    {p.resume_project}
                  </span>
                  {p.github_repo && (
                    <>
                      <span className="text-slate-600">→</span>
                      <span className="inline-flex items-center gap-1 text-sm text-violet-300">
                        <FiGithub className="text-xs" />
                        {p.github_repo}
                      </span>
                    </>
                  )}
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-md border text-xs font-semibold tabular-nums ${matchTone(
                      p.match_score
                    )}`}
                  >
                    {p.match_score}% match
                  </span>
                </div>
                {p.notes && (
                  <p className="text-sm text-slate-400">{p.notes}</p>
                )}
                {p.verified_technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.verified_technologies.map((t) => (
                      <Chip
                        key={t}
                        tone="bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      >
                        {t}
                      </Chip>
                    ))}
                  </div>
                )}
                {p.evidence?.length > 0 && (
                  <ul className="text-xs text-slate-500 grid gap-1">
                    {p.evidence.map((e, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-emerald-500/70 shrink-0">·</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Missing projects */}
      {missing_projects.length > 0 && (
        <Section
          icon={FiXCircle}
          title="Missing from GitHub"
          accent="text-rose-300"
          count={missing_projects.length}
        >
          <ul className="grid gap-2.5">
            {missing_projects.map((p, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-white">
                  {p.resume_project}
                </span>
                {p.reason && (
                  <span className="text-slate-400"> — {p.reason}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Unsupported claims */}
      {unsupported_claims.length > 0 && (
        <Section
          icon={FiAlertTriangle}
          title="Claims to scrutinize"
          accent="text-amber-300"
          count={unsupported_claims.length}
        >
          <div className="grid gap-2.5">
            {unsupported_claims.map((c, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  severityTone[c.severity] || severityTone.medium
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.claim}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider opacity-80">
                    {c.severity}
                  </span>
                </div>
                {c.reason && (
                  <p className="text-xs opacity-90 mt-1">{c.reason}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skill verification */}
      {skill_verification.length > 0 && (
        <Section
          icon={FiThumbsUp}
          title="Skill verification"
          accent="text-violet-300"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            {verifiedSkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Supported by repos
                </p>
                <div className="flex flex-wrap gap-2">
                  {verifiedSkills.map((s) => (
                    <Chip
                      key={s.skill}
                      tone="bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    >
                      {s.skill}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            {unverifiedSkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Not evidenced
                </p>
                <div className="flex flex-wrap gap-2">
                  {unverifiedSkills.map((s) => (
                    <Chip
                      key={s.skill}
                      tone="bg-slate-700/40 text-slate-400 border-slate-600/40"
                    >
                      {s.skill}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* GitHub-only projects */}
      {github_only_projects.length > 0 && (
        <Section
          icon={FiGithub}
          title="On GitHub, not on resume"
          accent="text-indigo-300"
          count={github_only_projects.length}
        >
          <div className="flex flex-wrap gap-2">
            {github_only_projects.map((p) => (
              <Chip
                key={p.repo_name}
                tone={importanceTone[p.importance] || importanceTone.medium}
              >
                {p.repo_name}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Section
          icon={FiTool}
          title="Recommendations"
          accent="text-cyan-300"
        >
          <ul className="grid gap-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <FiTarget className="text-cyan-400 shrink-0 mt-1" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </motion.section>
  );
}

export default ResumeMatchReport;
