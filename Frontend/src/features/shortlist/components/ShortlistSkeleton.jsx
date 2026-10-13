import { motion } from "framer-motion";

const SkeletonCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4, delay }}
    className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 grid gap-4 animate-pulse"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-700/60" />
      <div className="flex-1 grid gap-2">
        <div className="h-4 w-40 rounded bg-slate-700/60" />
        <div className="h-3 w-24 rounded bg-slate-700/40" />
      </div>
      <div className="w-16 h-12 rounded-xl bg-slate-700/60" />
    </div>
    <div className="h-3 w-3/4 rounded bg-slate-700/40" />
    <div className="h-3 w-2/3 rounded bg-slate-700/40" />
    <div className="flex gap-2">
      <div className="h-6 w-20 rounded-full bg-slate-700/40" />
      <div className="h-6 w-24 rounded-full bg-slate-700/40" />
      <div className="h-6 w-16 rounded-full bg-slate-700/40" />
    </div>
  </motion.div>
);

function ShortlistSkeleton() {
  return (
    <div className="grid gap-4 mt-8">
      <SkeletonCard delay={0} />
      <SkeletonCard delay={0.05} />
      <SkeletonCard delay={0.1} />
    </div>
  );
}

export default ShortlistSkeleton;
