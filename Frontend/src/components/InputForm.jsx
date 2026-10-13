import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiGithub, FiCheck } from "react-icons/fi";

function InputForm({ onAnalyze, loading, placeholder = "Enter GitHub profile URL or username..." }) {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onAnalyze(url.trim());
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const hasValue = url.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="mx-auto mb-12 max-w-2xl"
    >
      <form onSubmit={handleSubmit}>
        {/* Input container with glass morphism */}
        <div
          className={`glass-card relative overflow-hidden rounded-2xl transition-all duration-300 ${
            focused ? 'ring-2 ring-indigo-500/50' : ''
          }`}
          style={{
            boxShadow: focused 
              ? '0 8px 32px rgba(99, 102, 241, 0.25), var(--shadow-glow)' 
              : 'var(--shadow-md)',
          }}
        >
          {/* Animated gradient overlay on focus */}
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.1), transparent 60%)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Input field */}
          <div className="relative z-10 flex items-center gap-4 p-5">
            {/* GitHub icon */}
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
              focused ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800/60 text-slate-400'
            }`}>
              <FiGithub className="text-xl" />
            </div>

            {/* Input */}
            <input
              type="text"
              className="flex-1 bg-transparent text-base text-white placeholder-slate-500 focus:outline-none"
              placeholder={placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={loading}
            />

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || !hasValue}
              whileHover={!loading && hasValue ? { scale: 1.02 } : {}}
              whileTap={!loading && hasValue ? { scale: 0.98 } : {}}
              className={`group relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                loading || !hasValue
                  ? 'cursor-not-allowed bg-slate-800/60 text-slate-500'
                  : 'cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400'
              }`}
              style={{
                boxShadow: !loading && hasValue ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
              }}
            >
              {/* Button content */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    <span>Analyzing</span>
                  </motion.div>
                ) : showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <FiCheck className="text-lg" />
                    <span>Submitted</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <FiSearch className="text-lg transition-transform group-hover:scale-110" />
                    <span>Analyze</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Progress bar for loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-gradient-to-r from-indigo-500 to-cyan-500"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 text-center text-sm text-slate-500"
        >
          e.g., <span className="text-slate-400">https://github.com/torvalds</span> or just <span className="text-slate-400">&quot;torvalds&quot;</span>
        </motion.p>
      </form>
    </motion.div>
  );
}

export default InputForm;
