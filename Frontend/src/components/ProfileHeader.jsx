import { motion } from "framer-motion";
import { FiGithub, FiUsers, FiBookOpen, FiCalendar, FiExternalLink } from "react-icons/fi";

function ProfileHeader({ data }) {
  const joinYear = data.createdAt
    ? new Date(data.createdAt).getFullYear()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="glass-card relative overflow-hidden rounded-3xl p-8"
      style={{
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
      }}
    >
      {/* Background gradient */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.1), transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row">
        {/* Avatar */}
        {data.avatarUrl && (
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)',
                filter: 'blur(20px)',
              }}
            />
            <img
              src={data.avatarUrl}
              alt={data.username}
              className="relative h-24 w-24 shrink-0 rounded-full ring-2 ring-indigo-500/30"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          {/* Name and GitHub link */}
          <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-start">
            <h2 className="text-2xl font-bold text-white">{data.username}</h2>
            <a
              href={`https://github.com/${data.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition-all hover:bg-slate-700/60 hover:text-white"
            >
              <FiGithub className="text-base" />
              <span>View Profile</span>
              <FiExternalLink className="text-xs" />
            </a>
          </div>

          {/* Bio */}
          {data.bio && (
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              {data.bio}
            </p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
            <div className="flex items-center justify-center gap-2.5 sm:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FiBookOpen className="text-blue-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold text-white">{data.publicRepos}</span>
                <span className="text-xs text-slate-500">repos</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <FiUsers className="text-purple-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold text-white">{data.followers}</span>
                <span className="text-xs text-slate-500">followers</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/30">
                <FiUsers className="text-slate-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold text-white">{data.following}</span>
                <span className="text-xs text-slate-500">following</span>
              </div>
            </div>

            {joinYear && (
              <div className="flex items-center justify-center gap-2.5 sm:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <FiCalendar className="text-emerald-400" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-white">{joinYear}</span>
                  <span className="text-xs text-slate-500">joined</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileHeader;
