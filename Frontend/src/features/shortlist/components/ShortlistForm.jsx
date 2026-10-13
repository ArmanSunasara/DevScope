import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiFileText, FiSearch, FiUploadCloud, FiUsers } from "react-icons/fi";

const MIN_JD = 20;
const MAX_JD = 8000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXT = ["xlsx", "xls", "xlsm"];

function ShortlistForm({ onSubmit, loading, defaults = {} }) {
  const [jobDescription, setJobDescription] = useState(
    defaults.jobDescription || ""
  );
  const [shortlistCount, setShortlistCount] = useState(
    defaults.shortlistCount || 10
  );
  const [excelFile, setExcelFile] = useState(defaults.excelFile || null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const jdLength = jobDescription.trim().length;
  const jdValid = jdLength >= MIN_JD && jdLength <= MAX_JD;
  const countValid =
    Number.isFinite(shortlistCount) && shortlistCount >= 1 && shortlistCount <= 100;
  const canSubmit = excelFile && jdValid && countValid && !loading;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setExcelFile(null);
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      setFileError("Only .xlsx, .xls, or .xlsm files are supported");
      setExcelFile(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("File is too large (5 MB max)");
      setExcelFile(null);
      return;
    }
    setFileError("");
    setExcelFile(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      excelFile,
      jobDescription: jobDescription.trim(),
      shortlistCount,
    });
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
          Candidate roster (Excel)
        </span>
        <div className="mt-2 flex items-center gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-fuchsia-400 transition-colors">
          <FiUploadCloud className="text-slate-500 text-lg shrink-0" />
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.xlsm"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-sm font-medium text-fuchsia-300 hover:text-fuchsia-200 disabled:text-slate-500 cursor-pointer"
          >
            {excelFile ? "Choose another file" : "Choose Excel file"}
          </button>
          <span className="text-sm text-slate-500 truncate">
            {excelFile ? excelFile.name : "No file selected"}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          The sheet must include a <code className="text-fuchsia-300">github_url</code>{" "}
          column. Optional: name, email, college, resume_url, linkedin_url.
        </p>
        {fileError && (
          <span className="mt-2 block text-xs text-rose-400">{fileError}</span>
        )}
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
        <div className="mt-2 flex gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-fuchsia-400 transition-colors">
          <FiFileText className="text-slate-500 text-lg mt-1 shrink-0" />
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description. The more specific, the sharper the ranking."
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

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Candidates to shortlist
        </span>
        <div className="mt-2 flex items-center gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-fuchsia-400 transition-colors">
          <FiUsers className="text-slate-500 text-lg shrink-0" />
          <input
            type="number"
            value={shortlistCount}
            onChange={(e) =>
              setShortlistCount(Number.parseInt(e.target.value, 10))
            }
            disabled={loading}
            min={1}
            max={100}
            className="w-24 bg-transparent text-white focus:outline-none text-sm"
            required
          />
          <span className="text-sm text-slate-500">
            top candidates (1–100)
          </span>
        </div>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 inline-flex items-center justify-center gap-2 bg-fuchsia-500 text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-fuchsia-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
            <span>Shortlisting…</span>
          </>
        ) : (
          <>
            <FiSearch className="text-lg" />
            <span>Run Shortlist</span>
          </>
        )}
      </button>
    </motion.form>
  );
}

export default ShortlistForm;
