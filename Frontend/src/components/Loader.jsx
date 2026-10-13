import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiFolder, FiCpu, FiCheckCircle, FiZap } from "react-icons/fi";

const steps = [
  { icon: FiUser, label: "Fetching GitHub profile", color: "cyan" },
  { icon: FiFolder, label: "Analyzing repositories", color: "indigo" },
  { icon: FiCpu, label: "Generating AI feedback", color: "purple" },
  { icon: FiCheckCircle, label: "Compiling results", color: "emerald" },
];

function Loader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color, type) => {
    const colors = {
      cyan: {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/15',
        border: 'border-cyan-500/30',
        glow: 'shadow-cyan-500/20',
      },
      indigo: {
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/15',
        border: 'border-indigo-500/30',
        glow: 'shadow-indigo-500/20',
      },
      purple: {
        text: 'text-purple-400',
        bg: 'bg-purple-500/15',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/20',
      },
      emerald: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/20',
      },
    };
    return colors[color][type];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-12 max-w-md"
    >
      <div className="glass-card relative overflow-hidden rounded-3xl p-8"
        style={{
          boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
        }}
      >
        {/* Animated background gradient */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Animated spinner */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-20 w-20 rounded-full border-4 border-slate-800"
                style={{
                  borderTopColor: '#6366f1',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                }}
              />

              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-4 border-transparent"
                style={{
                  borderRightColor: '#a78bfa',
                }}
              />

              {/* Inner glow */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="h-10 w-10 rounded-full bg-indigo-500/20" />
              </motion.div>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <FiZap className="text-2xl text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;
              const isPending = index > currentStep;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? `border ${getColorClasses(step.color, 'border')} ${getColorClasses(step.color, 'bg')}`
                      : isDone
                      ? 'border border-emerald-500/20 bg-emerald-500/5'
                      : 'border border-slate-800 bg-slate-900/30'
                  }`}
                  style={{
                    boxShadow: isActive ? `0 4px 16px ${getColorClasses(step.color, 'glow')}` : 'none',
                  }}
                >
                  {/* Animated progress bar for active step */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 4, ease: "linear" }}
                        className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${getColorClasses(step.color, 'bg')}`}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <div 
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : isActive
                        ? `${getColorClasses(step.color, 'bg')} ${getColorClasses(step.color, 'text')}`
                        : 'bg-slate-800/60 text-slate-600'
                    }`}
                  >
                    <Icon className={`text-lg ${isActive && 'animate-pulse'}`} />
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isDone
                          ? 'text-emerald-400'
                          : isActive
                          ? 'text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4, ease: "linear" }}
                        className="mt-1 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent"
                      />
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="shrink-0">
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      >
                        <FiCheckCircle className="text-lg text-emerald-400" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className={`h-4 w-4 rounded-full border-2 border-slate-700 ${getColorClasses(step.color, 'border')}`}
                        style={{
                          borderTopColor: 'transparent',
                        }}
                      />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-xs text-slate-500"
          >
            This usually takes 15-30 seconds
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default Loader;
