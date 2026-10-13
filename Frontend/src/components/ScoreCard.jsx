import { motion } from "framer-motion";

function ScoreCard({ score }) {
  const getScoreColor = (s) => {
    if (s >= 80) return { 
      text: "text-emerald-400", 
      stroke: "#34d399", 
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/20",
      label: "Excellent" 
    };
    if (s >= 60) return { 
      text: "text-yellow-400", 
      stroke: "#facc15", 
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      glow: "shadow-yellow-500/20",
      label: "Good" 
    };
    if (s >= 40) return { 
      text: "text-orange-400", 
      stroke: "#fb923c", 
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/20",
      label: "Fair" 
    };
    return { 
      text: "text-red-400", 
      stroke: "#f87171", 
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      glow: "shadow-red-500/20",
      label: "Needs Work" 
    };
  };

  const colors = getScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="glass-card relative flex flex-col items-center rounded-3xl p-8"
      style={{
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
      }}
    >
      {/* Background glow effect */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
        style={{
          background: `radial-gradient(circle at center, ${colors.stroke}15, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-sm font-semibold uppercase tracking-widest text-slate-400"
        >
          Portfolio Score
        </motion.h2>

        <div className="relative">
          {/* Outer glow ring */}
          <div 
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              boxShadow: `0 0 60px ${colors.stroke}`,
              filter: 'blur(20px)',
            }}
          />

          {/* Score ring */}
          <div className="relative h-52 w-52">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
              {/* Background track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="12"
              />
              {/* Progress arc */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={colors.stroke}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ 
                  duration: 1.8, 
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3 
                }}
                style={{
                  filter: `drop-shadow(0 0 8px ${colors.stroke})`,
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={`text-6xl font-bold ${colors.text}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.8,
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              >
                {score}
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm text-slate-500"
              >
                / 100
              </motion.span>
            </div>
          </div>
        </div>

        {/* Label badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className={`mt-8 rounded-full border px-6 py-2 text-sm font-semibold backdrop-blur-sm ${colors.bg} ${colors.border} ${colors.text}`}
          style={{
            boxShadow: `0 8px 16px ${colors.glow}`,
          }}
        >
          {colors.label}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ScoreCard;
