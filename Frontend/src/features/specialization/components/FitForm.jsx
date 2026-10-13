import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiBriefcase, FiFileText, FiGithub, FiSearch } from "react-icons/fi";

const MIN_JD = 20;
const MAX_JD = 8000;

function FitForm({ roles = [], onSubmit, loading, defaults = {} }) {
  const [url, setUrl] = useState(defaults.url || "");
  const [roleId, setRoleId] = useState(defaults.roleId || "");
  const [jobDescription, setJobDescription] = useState(
    defaults.jobDescription || ""
  );

  const groupedRoles = useMemo(() => {
    const groups = new Map();
    for (const role of roles) {
      const key = role.category || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(role);
    }
    return [...groups.entries()];
  }, [roles]);

  const jdLength = jobDescription.trim().length;
  const jdValid = jdLength >= MIN_JD && jdLength <= MAX_JD;
  const canSubmit = url.trim() && roleId && jdValid && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ url: url.trim(), roleId, jobDescription: jobDescription.trim() });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl grid gap-5"
    >
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          GitHub URL or username
        </span>
        <div className="mt-2 flex items-center gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
          <FiGithub className="text-slate-500 text-lg shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/torvalds  or  torvalds"
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
            autoComplete="off"
            spellCheck={false}
            maxLength={256}
            required
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Target role
        </span>
        <div className="mt-2 flex items-center gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
          <FiBriefcase className="text-slate-500 text-lg shrink-0" />
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={loading || !roles.length}
            className="flex-1 bg-transparent text-white focus:outline-none text-sm"
            required
          >
            <option value="" disabled className="bg-slate-900">
              {roles.length ? "Choose a specialization…" : "Loading roles…"}
            </option>
            {groupedRoles.map(([group, items]) => (
              <optgroup key={group} label={group} className="bg-slate-900">
                {items.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                    className="bg-slate-900"
                  >
                    {role.name}
                    {role.faang_relevant ? " · FAANG-ready" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </label>

      <label className="block">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Job description
          </span>
          <span
            className={`text-xs tabular-nums ${
              jdLength > MAX_JD ? "text-rose-400" : "text-slate-500"
            }`}
          >
            {jdLength}/{MAX_JD}
          </span>
        </div>
        <div className="mt-2 flex gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
          <FiFileText className="text-slate-500 text-lg mt-1 shrink-0" />
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here. The more detail, the sharper the fit analysis."
            disabled={loading}
            rows={8}
            maxLength={MAX_JD}
            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm leading-relaxed resize-y"
            required
          />
        </div>
        {jdLength > 0 && jdLength < MIN_JD && (
          <span className="text-xs text-amber-400 mt-2 block">
            Add at least {MIN_JD - jdLength} more characters of job description.
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 inline-flex items-center justify-center gap-2 bg-emerald-500 text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
            <span>Analyzing…</span>
          </>
        ) : (
          <>
            <FiSearch className="text-lg" />
            <span>Run Fit Analysis</span>
          </>
        )}
      </button>
    </motion.form>
  );
}

export default FitForm;
