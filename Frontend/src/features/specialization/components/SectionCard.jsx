import { motion } from "framer-motion";

const TONE_CLASSES = {
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
  blue: "border-blue-500/30 bg-blue-500/5",
  purple: "border-purple-500/30 bg-purple-500/5",
  amber: "border-amber-500/30 bg-amber-500/5",
  slate: "border-slate-700/60 bg-slate-800/40",
};

const ICON_TONE = {
  emerald: "text-emerald-300",
  rose: "text-rose-300",
  blue: "text-blue-300",
  purple: "text-purple-300",
  amber: "text-amber-300",
  slate: "text-slate-300",
};

function SectionCard({ icon: Icon, title, tone = "slate", count, children, delay = 0 }) {
  const cls = TONE_CLASSES[tone] || TONE_CLASSES.slate;
  const iconCls = ICON_TONE[tone] || ICON_TONE.slate;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`border rounded-xl p-6 backdrop-blur-sm ${cls}`}
    >
      <header className="flex items-center gap-3 mb-4">
        {Icon && <Icon className={`text-xl ${iconCls}`} />}
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {typeof count === "number" && count > 0 && (
          <span className="ml-auto text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </header>
      {children}
    </motion.section>
  );
}

export default SectionCard;
