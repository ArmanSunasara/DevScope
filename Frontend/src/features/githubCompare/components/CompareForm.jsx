import { useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiSearch, FiUsers } from "react-icons/fi";

function CompareInput({ label, value, onChange, disabled, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-indigo-400 transition-colors">
        <FiGithub className="text-slate-500 text-lg shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={256}
          className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
          required
        />
      </div>
    </label>
  );
}

function CompareForm({ onSubmit, loading, defaults = {} }) {
  const [profileA, setProfileA] = useState(defaults.profileA || "");
  const [profileB, setProfileB] = useState(defaults.profileB || "");

  const valid =
    profileA.trim().length > 0 &&
    profileB.trim().length > 0 &&
    profileA.trim().toLowerCase() !== profileB.trim().toLowerCase();

  const canSubmit = valid && !loading;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ profileA: profileA.trim(), profileB: profileB.trim() });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl grid gap-5"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <CompareInput
          label="Candidate A"
          value={profileA}
          onChange={setProfileA}
          disabled={loading}
          placeholder="https://github.com/octocat"
        />
        <CompareInput
          label="Candidate B"
          value={profileB}
          onChange={setProfileB}
          disabled={loading}
          placeholder="github.com/torvalds"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 inline-flex items-center justify-center gap-2 bg-indigo-500 text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
            <span>Comparing…</span>
          </>
        ) : (
          <>
            <FiSearch className="text-lg" />
            <span>Compare Profiles</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-600">
        <FiUsers className="inline mr-1" />
        Only public repositories are evaluated. Both URLs and bare usernames
        work.
      </p>
    </motion.form>
  );
}

export default CompareForm;
