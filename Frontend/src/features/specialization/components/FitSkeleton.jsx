import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiCpu,
  FiFolder,
  FiSearch,
  FiUser,
} from "react-icons/fi";

const STEPS = [
  { icon: FiUser, label: "Reading GitHub profile" },
  { icon: FiFolder, label: "Mining repositories for tech signals" },
  { icon: FiSearch, label: "Comparing against role + JD" },
  { icon: FiCpu, label: "Synthesizing recommendations" },
  { icon: FiCheckCircle, label: "Compiling fit report" },
];

const SkeletonBlock = ({ className = "" }) => (
  <div className={`bg-slate-800/60 rounded-lg animate-pulse ${className}`} />
);

function FitSkeleton() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c < STEPS.length - 1 ? c + 1 : c));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto mt-10 max-w-5xl grid lg:grid-cols-[280px_1fr] gap-6"
    >
      <aside className="border border-slate-700/60 bg-slate-800/40 rounded-xl p-5 h-fit">
        <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-4">
          Analysis pipeline
        </h4>
        <ol className="space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === current;
            const isDone = i < current;
            return (
              <li
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : isDone
                    ? "bg-emerald-500/5"
                    : ""
                }`}
              >
                <Icon
                  className={`shrink-0 ${
                    isDone
                      ? "text-emerald-400"
                      : isActive
                      ? "text-blue-300"
                      : "text-slate-600"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isDone
                      ? "text-emerald-300"
                      : isActive
                      ? "text-blue-200"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="grid gap-5">
        <div className="border border-slate-700/60 bg-slate-800/40 rounded-xl p-6 flex items-center gap-6">
          <SkeletonBlock className="w-32 h-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <SkeletonBlock className="h-4 w-1/3" />
            <SkeletonBlock className="h-3 w-2/3" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-32 md:col-span-2" />
        </div>
      </div>
    </motion.div>
  );
}

export default FitSkeleton;
