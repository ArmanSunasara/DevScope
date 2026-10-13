import { motion } from "framer-motion";

function MatchSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 mt-8"
    >
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 grid md:grid-cols-[auto_1fr] gap-6 items-center animate-pulse">
        <div className="w-56 h-56 rounded-full bg-slate-700/40 mx-auto" />
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-700/50" />
            <div className="grid gap-2">
              <div className="h-4 w-40 rounded bg-slate-700/50" />
              <div className="h-3 w-24 rounded bg-slate-700/30" />
            </div>
          </div>
          <div className="h-3 w-2/3 rounded bg-slate-700/40" />
          <div className="h-3 w-5/6 rounded bg-slate-700/30" />
          <div className="h-3 w-3/4 rounded bg-slate-700/30" />
        </div>
      </div>

      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 grid gap-4 animate-pulse"
        >
          <div className="h-4 w-44 rounded bg-slate-700/50" />
          <div className="h-3 w-full rounded bg-slate-700/30" />
          <div className="h-3 w-4/5 rounded bg-slate-700/30" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-slate-700/40" />
            <div className="h-6 w-24 rounded-full bg-slate-700/40" />
            <div className="h-6 w-16 rounded-full bg-slate-700/40" />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export default MatchSkeleton;
