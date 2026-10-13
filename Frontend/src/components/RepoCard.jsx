import { motion } from "framer-motion";
import { FiStar, FiGitCommit, FiFileText, FiCode, FiExternalLink } from "react-icons/fi";

function RepoCard({ repo, index = 0, username }) {
  const repoUrl = username
    ? `https://github.com/${username}/${repo.name}`
    : `https://github.com/search?q=${repo.name}`;

  return (
    <motion.a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="glass-card group relative block overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
      style={{
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 60%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-indigo-300 flex-1 mr-3">
            {repo.name}
          </h3>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 transition-all group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
            <FiExternalLink className="text-base" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
              <FiStar className="text-yellow-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{repo.stars}</span>
              <span className="text-xs text-slate-500">stars</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <FiGitCommit className="text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{repo.commitCount}</span>
              <span className="text-xs text-slate-500">commits</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              repo.hasReadme ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              <FiFileText className={repo.hasReadme ? 'text-emerald-400' : 'text-red-400'} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {repo.hasReadme ? 'Yes' : 'No'}
              </span>
              <span className="text-xs text-slate-500">README</span>
            </div>
          </div>

          {repo.languages && repo.languages.length > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <FiCode className="text-purple-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">
                  {repo.languages[0]}
                </span>
                <span className="text-xs text-slate-500">
                  {repo.languages.length > 1 ? `+${repo.languages.length - 1} more` : 'language'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.a>
  );
}

export default RepoCard;
