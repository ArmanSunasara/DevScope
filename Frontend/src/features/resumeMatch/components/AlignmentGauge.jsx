import { motion } from "framer-motion";

const tier = (score) => {
  if (score >= 85) return { label: "Strongly Aligned", color: "#34d399", text: "text-emerald-400" };
  if (score >= 70) return { label: "Well Aligned", color: "#a78bfa", text: "text-violet-400" };
  if (score >= 50) return { label: "Partially Aligned", color: "#facc15", text: "text-yellow-400" };
  if (score >= 30) return { label: "Weakly Aligned", color: "#fb923c", text: "text-orange-400" };
  return { label: "Misaligned", color: "#f87171", text: "text-red-400" };
};

function AlignmentGauge({ score = 0, confidence = 0 }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (safeScore / 100) * circumference;
  const t = tier(safeScore);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={t.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl font-bold ${t.text}`}>{safeScore}</span>
          <span className="text-sm text-slate-500">Alignment</span>
        </div>
      </div>
      <span
        className={`mt-4 px-4 py-1.5 rounded-full text-sm font-medium ${t.text} bg-slate-800/80 border border-slate-700`}
      >
        {t.label}
      </span>
      <span className="mt-2 text-xs text-slate-500">
        Confidence: {Math.round(confidence)}%
      </span>
    </motion.div>
  );
}

export default AlignmentGauge;
