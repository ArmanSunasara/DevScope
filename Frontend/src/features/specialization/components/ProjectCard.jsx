import { FiBookmark, FiClock } from "react-icons/fi";

const DIFFICULTY_STYLES = {
  beginner: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  intermediate: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  advanced: "text-purple-300 bg-purple-500/10 border-purple-500/30",
};

function ProjectCard({ project }) {
  if (!project) return null;
  const diffKey = (project.difficulty || "intermediate").toLowerCase();
  const diffCls = DIFFICULTY_STYLES[diffKey] || DIFFICULTY_STYLES.intermediate;

  return (
    <article className="border border-slate-700/60 bg-slate-800/40 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-3 mb-2">
        <FiBookmark className="text-purple-300 mt-1 shrink-0" />
        <h4 className="text-white font-semibold text-sm leading-snug">
          {project.title}
        </h4>
      </div>
      {project.why && (
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          {project.why}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wider ${diffCls}`}
        >
          {diffKey}
        </span>
        {project.estimated_weeks ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <FiClock className="text-slate-500" />
            ~{project.estimated_weeks} weeks
          </span>
        ) : null}
      </div>
      {project.key_tech?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {project.key_tech.map((tech) => (
            <span
              key={tech}
              className="text-[10px] uppercase tracking-wide bg-slate-900/70 border border-slate-700 text-slate-300 px-2 py-0.5 rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default ProjectCard;
