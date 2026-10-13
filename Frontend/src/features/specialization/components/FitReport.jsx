import { motion } from "framer-motion";
import {
  FiActivity,
  FiAlertTriangle,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiCpu,
  FiEdit3,
  FiFileText,
  FiHelpCircle,
  FiPackage,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import BulletList from "./BulletList";
import FitGauge from "./FitGauge";
import HiringReadinessCard from "./HiringReadinessCard";
import LearningTimeline from "./LearningTimeline";
import ProjectCard from "./ProjectCard";
import RadarChart from "./RadarChart";
import ScoreBreakdown from "./ScoreBreakdown";
import SectionCard from "./SectionCard";
import SkillChips from "./SkillChips";

function FitReport({ data }) {
  if (!data?.report) return null;
  const { report, profile, avatarUrl, htmlUrl } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-10 grid gap-6"
    >
      <div className="border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div className="flex items-center gap-5">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={profile.username}
              className="w-20 h-20 rounded-full ring-2 ring-emerald-500/40"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-300 mb-1">
              {report.role_name}
            </p>
            <h2 className="text-2xl font-bold text-white">
              {profile.name || profile.username}
            </h2>
            {htmlUrl ? (
              <a
                href={htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-emerald-300"
              >
                github.com/{profile.username}
              </a>
            ) : (
              <span className="text-sm text-slate-400">
                @{profile.username}
              </span>
            )}
            {report.summary && (
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                {report.summary}
              </p>
            )}
          </div>
        </div>
        <div className="lg:ml-auto">
          <FitGauge score={report.fit_score} confidence={report.confidence} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          icon={FiActivity}
          title="Score Breakdown"
          tone="slate"
          delay={0.05}
        >
          <ScoreBreakdown breakdown={report.score_breakdown} />
        </SectionCard>
        <SectionCard
          icon={FiAward}
          title="Skill Radar"
          tone="slate"
          delay={0.1}
        >
          <RadarChart axes={report.radar} />
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          icon={FiCheckCircle}
          title="Strengths"
          tone="emerald"
          count={report.strengths?.length}
          delay={0.15}
        >
          <BulletList
            items={report.strengths}
            tone="emerald"
            empty="No standout strengths surfaced yet."
          />
        </SectionCard>
        <SectionCard
          icon={FiAlertTriangle}
          title="Weak Areas"
          tone="rose"
          count={report.weak_areas?.length}
          delay={0.2}
        >
          <BulletList
            items={report.weak_areas}
            tone="rose"
            empty="No major weak areas detected."
          />
        </SectionCard>
      </div>

      <SectionCard
        icon={FiAlertTriangle}
        title="GitHub Weaknesses"
        tone="amber"
        count={report.github_weaknesses?.length}
        delay={0.22}
      >
        <BulletList
          items={report.github_weaknesses}
          tone="amber"
          empty="GitHub profile looks solid."
        />
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          icon={FiCheckCircle}
          title="Matched Skills"
          tone="emerald"
          count={report.matched_skills?.length}
          delay={0.25}
        >
          <SkillChips items={report.matched_skills} tone="matched" />
        </SectionCard>
        <SectionCard
          icon={FiAlertTriangle}
          title="Missing Skills"
          tone="rose"
          count={report.missing_skills?.length}
          delay={0.3}
        >
          <SkillChips items={report.missing_skills} tone="missing" />
        </SectionCard>
      </div>

      <SectionCard
        icon={FiPackage}
        title="Missing Project Experience"
        tone="purple"
        count={report.missing_projects?.length}
        delay={0.32}
      >
        <BulletList items={report.missing_projects} tone="blue" />
      </SectionCard>

      <SectionCard
        icon={FiZap}
        title="Recommended Improvements"
        tone="blue"
        count={report.recommended_improvements?.length}
        delay={0.35}
      >
        <BulletList items={report.recommended_improvements} tone="blue" />
      </SectionCard>

      {report.recommended_projects?.length ? (
        <SectionCard
          icon={FiPackage}
          title="Suggested Projects to Build"
          tone="purple"
          count={report.recommended_projects.length}
          delay={0.4}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {report.recommended_projects.map((p) => (
              <ProjectCard key={p.title} project={p} />
            ))}
          </div>
        </SectionCard>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          icon={FiBookOpen}
          title="Suggested Learning Path"
          tone="blue"
          count={report.learning_path?.length}
          delay={0.45}
        >
          <LearningTimeline steps={report.learning_path} />
        </SectionCard>
        <SectionCard
          icon={FiCpu}
          title="Technologies to Learn"
          tone="purple"
          count={report.technologies_to_learn?.length}
          delay={0.5}
        >
          <SkillChips items={report.technologies_to_learn} tone="tech" />
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          icon={FiFileText}
          title="ATS Match Insights"
          tone="blue"
          count={report.ats_suggestions?.length}
          delay={0.55}
        >
          <BulletList items={report.ats_suggestions} tone="blue" />
        </SectionCard>
        <SectionCard
          icon={FiEdit3}
          title="Resume-Level Suggestions"
          tone="amber"
          count={report.resume_suggestions?.length}
          delay={0.55}
        >
          <BulletList items={report.resume_suggestions} tone="amber" />
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          icon={FiHelpCircle}
          title="Predicted Interview Questions"
          tone="slate"
          count={report.interview_questions?.length}
          delay={0.6}
        >
          <BulletList items={report.interview_questions} tone="slate" />
        </SectionCard>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <HiringReadinessCard
            readiness={report.hiring_readiness}
            faang={report.faang_readiness}
            timeline={report.timeline_to_job_ready}
          />
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-2">
        <FiTrendingUp />
        <span>
          Analyzed top {data.topRepoNames?.length || 0} repositories ·
          confidence {report.confidence}%
        </span>
      </div>
    </motion.div>
  );
}

export default FitReport;
