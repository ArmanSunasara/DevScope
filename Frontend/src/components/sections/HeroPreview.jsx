import { motion } from "framer-motion";
import { FiCheck, FiTrendingUp, FiStar } from "react-icons/fi";

/**
 * Decorative product mock shown in the hero — a stylised "recruiter review"
 * card with an animated score ring, feedback lines and language chips, plus
 * two floating accent chips. Purely visual; marked aria-hidden.
 */
function ScoreRing({ score = 87 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Score
        </span>
      </div>
    </div>
  );
}

function HeroPreview() {
  const feedback = [
    "Strong commit consistency",
    "Add READMEs to 3 repos",
    "Pin your best projects",
  ];
  const chips = ["TypeScript", "React", "Python", "Go"];

  return (
    <div className="relative" aria-hidden="true">
      {/* Soft neutral light behind the card */}
      <div className="absolute inset-0 -z-10 bg-white/10 blur-3xl" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="glass relative rounded-3xl p-6 shadow-2xl shadow-indigo-950/50"
      >
        {/* Window dots */}
        <div className="mb-5 flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs font-medium text-slate-400">
            Recruiter Review
          </span>
        </div>

        <div className="flex items-center gap-5">
          <ScoreRing score={87} />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
                JD
              </span>
              <div>
                <p className="text-sm font-semibold text-white">@jane-dev</p>
                <p className="text-xs text-slate-400">42 repos · 1.2k contributions</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {feedback.map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                <FiCheck className="text-xs" />
              </span>
              <span className="text-sm text-slate-300">{f}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating accent chips */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -left-4 top-10 hidden items-center gap-2 rounded-xl px-3 py-2 shadow-xl sm:flex"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-500/15 text-cyan-300">
          <FiTrendingUp className="text-sm" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-white">ATS Ready</p>
          <p className="text-[10px] text-slate-400">+12% this week</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glass absolute -right-3 bottom-8 hidden items-center gap-2 rounded-xl px-3 py-2 shadow-xl sm:flex"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400/15 text-amber-300">
          <FiStar className="text-sm" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-white">Top 8%</p>
          <p className="text-[10px] text-slate-400">of analyzed devs</p>
        </div>
      </motion.div>
    </div>
  );
}

export default HeroPreview;
