import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiFileText, FiGithub, FiSearch, FiUploadCloud } from "react-icons/fi";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXT = ["pdf", "docx", "txt", "md"];

function ResumeMatchForm({ onSubmit, loading, defaults = {} }) {
  const [url, setUrl] = useState(defaults.url || "");
  const [resumeFile, setResumeFile] = useState(defaults.resumeFile || null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const urlValid = url.trim().length > 0 && url.trim().length <= 256;
  const canSubmit = resumeFile && urlValid && !loading;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setResumeFile(null);
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      setFileError("Only PDF, DOCX, or TXT resumes are supported");
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("File is too large (5 MB max)");
      setResumeFile(null);
      return;
    }
    setFileError("");
    setResumeFile(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ url: url.trim(), resumeFile });
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
          GitHub profile URL
        </span>
        <div className="mt-2 flex items-center gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-violet-400 transition-colors">
          <FiGithub className="text-slate-500 text-lg shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username"
            disabled={loading}
            maxLength={256}
            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
            required
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Resume (PDF, DOCX, or TXT)
        </span>
        <div className="mt-2 flex items-center gap-3 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-violet-400 transition-colors">
          <FiUploadCloud className="text-slate-500 text-lg shrink-0" />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-sm font-medium text-violet-300 hover:text-violet-200 disabled:text-slate-500 cursor-pointer"
          >
            {resumeFile ? "Choose another file" : "Choose resume file"}
          </button>
          <span className="text-sm text-slate-500 truncate">
            {resumeFile ? resumeFile.name : "No file selected"}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          We extract the text from your resume — scanned/image-only PDFs won't
          work.
        </p>
        {fileError && (
          <span className="mt-2 block text-xs text-rose-400">{fileError}</span>
        )}
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 inline-flex items-center justify-center gap-2 bg-violet-500 text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
            <span>Analyzing…</span>
          </>
        ) : (
          <>
            <FiSearch className="text-lg" />
            <span>Analyze Match</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-600">
        <FiFileText className="inline mr-1" />
        Only public repositories are analyzed. Private/archived work may show as
        “missing”.
      </p>
    </motion.form>
  );
}

export default ResumeMatchForm;
