import { motion } from "framer-motion";
import {
  FiAward,
  FiCheckCircle,
  FiExternalLink,
  FiMinusCircle,
  FiStar,
  FiUsers,
} from "react-icons/fi";

import ScoreRadar from "./ScoreRadar";

const AXIS_LABELS = {
  consistency: "Consistency",
  technical_depth: "Technical Depth",
  project_quality: "Project Quality",
  open_source: "Open Source",
  impact: "Impact",
};

const sideTone = (side) =>
  side === "A"
    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
    : side === "B"
    ? "border-pink-500/40 bg-pink-500/10 text-pink-200"
    : "border-slate-600/40 bg-slate-700/30 text-slate-200";

function ProfileCard({ side, candidate, overallScore, isWinner }) {
  const accent = side === "A" ? "indigo" : "pink";
  const accentClasses =
    side === "A"
      ? "border-indigo-500/40 hover:border-indigo-400/60"
      : "border-pink-500/40 hover:border-pink-400/60";

  return (
    <div
      className={`rounded-xl border ${accentClasses} bg-slate-800/50 p-6 grid gap-4 transition-colors relative`}
    >
      {isWinner && (
        <span className="absolute -top-3 right-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider bg-amber-400 text-slate-900 px-3 py-1 rounded-full shadow">
          <FiAward /> Winner
        </span>
      )}
      <div className="flex items-center gap-4">
        {candidate.avatarUrl && (
          <img
            src={candidate.avatarUrl}
            alt={candidate.profile.username}
            className={`w-14 h-14 rounded-full border-2 border-${accent}-500/40 object-cover`}
          />
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Candidate {side}
          </p>
          <a
            href={candidate.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-bold text-white hover:text-white/90 inline-flex items-center gap-1.5"
          >
            @{candidate.profile.username}
            <FiExternalLink className="text-sm text-slate-500" />
          </a>
          {candidate.profile.name && (
            <p className="text-sm text-slate-400 truncate">
              {candidate.profile.name}
            </p>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Overall
          </p>
          <p
            className={`text-3xl font-bold ${
              side === "A" ? "text-indigo-300" : "text-pink-300"
            }`}
          >
            {overallScore}
          </p>
        </div>
      </div>

      {candidate.profile.bio && (
        <p className="text-sm text-slate-400 line-clamp-2">
          {candidate.profile.bio}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-lg bg-slate-900/60 py-2">
          <p className="text-slate-500 uppercase tracking-wider">Repos</p>
          <p className="text-white font-semibold text-sm mt-0.5">
            {candidate.profile.public_repos}
          </p>
        </div>
        <div className="rounded-lg bg-slate-900/60 py-2">
          <p className="text-slate-500 uppercase tracking-wider inline-flex items-center justify-center gap-1">
            <FiUsers className="text-[10px]" /> Followers
          </p>
          <p className="text-white font-semibold text-sm mt-0.5">
            {candidate.profile.followers}
          </p>
        </div>
        <div className="rounded-lg bg-slate-900/60 py-2">
          <p className="text-slate-500 uppercase tracking-wider inline-flex items-center justify-center gap-1">
            <FiStar className="text-[10px]" /> Stars
          </p>
          <p className="text-white font-semibold text-sm mt-0.5">
            {candidate.profile.total_stars}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ side, value }) {
  const colour = side === "A" ? "bg-indigo-400" : "bg-pink-400";
  return (
    <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
      <div
        className={`${colour} h-full transition-all`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function ScoreBreakdownTable({ scoresA, scoresB, nameA, nameB }) {
  return (
    <div className="grid gap-3">
      {Object.entries(AXIS_LABELS).map(([key, label]) => {
        const a = scoresA?.[key] ?? 0;
        const b = scoresB?.[key] ?? 0;
        const leader = a > b ? "A" : b > a ? "B" : null;
        return (
          <div key={key} className="grid gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{label}</span>
              <span
                className={`text-xs uppercase tracking-wider ${
                  leader === "A"
                    ? "text-indigo-300"
                    : leader === "B"
                    ? "text-pink-300"
                    : "text-slate-500"
                }`}
              >
                {leader ? `${leader} leads` : "Even"}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-indigo-300 font-medium">{nameA}</span>
                  <span className="text-slate-400">{a}</span>
                </div>
                <ScoreBar side="A" value={a} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-pink-300 font-medium">{nameB}</span>
                  <span className="text-slate-400">{b}</span>
                </div>
                <ScoreBar side="B" value={b} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonSection({ title, body }) {
  if (!body) return null;
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1.5">
        {title}
      </p>
      <p className="text-sm text-slate-300 leading-relaxed">{body}</p>
    </div>
  );
}

function StrengthList({ items, side, nameA, nameB }) {
  const name = side === "A" ? nameA : nameB;
  if (!items?.length) return null;
  return (
    <div>
      <p className={`text-xs font-semibold mb-2 ${sideTone(side).split(" ").pop()}`}>
        {name}
      </p>
      <ul className="grid gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-300 flex gap-2">
            <span className="text-slate-500">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareReport({ data }) {
  const { report, candidates } = data;
  const nameA = candidates.A.profile.username;
  const nameB = candidates.B.profile.username;
  const winnerSide = report.winner; // "A" | "B" | "tie"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 mt-8"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <ProfileCard
          side="A"
          candidate={candidates.A}
          overallScore={report.scores_a.overall}
          isWinner={winnerSide === "A"}
        />
        <ProfileCard
          side="B"
          candidate={candidates.B}
          overallScore={report.scores_b.overall}
          isWinner={winnerSide === "B"}
        />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 grid gap-4 text-center">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${sideTone(
              winnerSide
            )}`}
          >
            <FiAward />
            {winnerSide === "tie"
              ? "Too close to call"
              : `${report.winner_username || (winnerSide === "A" ? nameA : nameB)} wins`}
          </span>
          <span className="text-xs text-slate-500">
            AI confidence: {report.confidence}%
          </span>
        </div>
        {report.summary && (
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {report.summary}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 grid gap-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Score Radar
        </p>
        <ScoreRadar
          scoresA={report.scores_a}
          scoresB={report.scores_b}
          nameA={nameA}
          nameB={nameB}
        />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 grid gap-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Score Breakdown
        </p>
        <ScoreBreakdownTable
          scoresA={report.scores_a}
          scoresB={report.scores_b}
          nameA={nameA}
          nameB={nameB}
        />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Detailed Comparison
        </p>
        <div className="grid gap-3">
          <ComparisonSection
            title="Consistency"
            body={report.detailed?.consistency}
          />
          <ComparisonSection
            title="Technical Depth"
            body={report.detailed?.technical_depth}
          />
          <ComparisonSection
            title="Project Quality"
            body={report.detailed?.project_quality}
          />
          <ComparisonSection
            title="Collaboration"
            body={report.detailed?.collaboration}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 grid gap-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300 inline-flex items-center gap-2">
            <FiCheckCircle /> Strengths
          </p>
          <StrengthList
            items={report.detailed?.strengths_a}
            side="A"
            nameA={nameA}
            nameB={nameB}
          />
          <StrengthList
            items={report.detailed?.strengths_b}
            side="B"
            nameA={nameA}
            nameB={nameB}
          />
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 grid gap-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-300 inline-flex items-center gap-2">
            <FiMinusCircle /> Weaknesses
          </p>
          <StrengthList
            items={report.detailed?.weaknesses_a}
            side="A"
            nameA={nameA}
            nameB={nameB}
          />
          <StrengthList
            items={report.detailed?.weaknesses_b}
            side="B"
            nameA={nameA}
            nameB={nameB}
          />
        </div>
      </div>

      {report.final_verdict && (
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Final Verdict
          </p>
          <p className="text-base text-white font-medium">
            {report.final_verdict}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-500">
        {[
          { side: "A", name: nameA, repos: candidates.A.topRepoNames },
          { side: "B", name: nameB, repos: candidates.B.topRepoNames },
        ].map(({ side, name, repos }) => (
          <div key={side}>
            <p className="uppercase tracking-wider mb-1.5">
              Top repos sampled for @{name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {repos.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/60"
                >
                  {r}
                </span>
              ))}
              {!repos.length && (
                <span className="italic">No public repositories found.</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default CompareReport;
