import { motion } from "framer-motion";

function CompareSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 mt-8"
    >
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 grid md:grid-cols-2 gap-6 animate-pulse">
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-700/50" />
              <div className="grid gap-2">
                <div className="h-4 w-32 rounded bg-slate-700/50" />
                <div className="h-3 w-20 rounded bg-slate-700/30" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-slate-700/40" />
            <div className="h-3 w-4/5 rounded bg-slate-700/30" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 animate-pulse">
        <div className="mx-auto w-64 h-64 rounded-full bg-slate-700/30" />
      </div>

      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 grid gap-3 animate-pulse"
        >
          <div className="h-4 w-44 rounded bg-slate-700/50" />
          <div className="h-3 w-full rounded bg-slate-700/30" />
          <div className="h-3 w-5/6 rounded bg-slate-700/30" />
        </div>
      ))}
    </motion.div>
  );
}

export default CompareSkeleton;
