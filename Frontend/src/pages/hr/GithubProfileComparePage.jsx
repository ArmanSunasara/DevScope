import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";

import BackButton from "../../components/BackButton";
import CompareForm from "../../features/githubCompare/components/CompareForm";
import CompareReport from "../../features/githubCompare/components/CompareReport";
import CompareSkeleton from "../../features/githubCompare/components/CompareSkeleton";
import { useGithubCompare } from "../../features/githubCompare/useGithubCompare";
import { routes } from "../../routes";

function GithubProfileComparePage({ navigate }) {
  const { result, loading, error, runCompare, reset } = useGithubCompare();
  const [lastInputs, setLastInputs] = useState({ profileA: "", profileB: "" });

  const handleSubmit = (payload) => {
    setLastInputs(payload);
    runCompare(payload);
  };

  const handleReset = () => reset();

  const handleBack = () => {
    reset();
    navigate(routes.recruiters);
  };

  return (
    <motion.section
      key="github-profile-compare"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl"
    >
      <BackButton label="Back to Recruiter Tools" onClick={handleBack} />

      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
          Recruiter Feature
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white">
          GitHub Profile Compare
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
          Drop in two GitHub profiles and the AI compares consistency, technical
          depth, engineering maturity, project quality, and impact — then calls
          which candidate looks stronger and why.
        </p>
      </div>

      {!result && (
        <CompareForm
          onSubmit={handleSubmit}
          loading={loading}
          defaults={lastInputs}
        />
      )}

      <AnimatePresence mode="wait">
        {loading && <CompareSkeleton key="skeleton" />}
      </AnimatePresence>

      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-8 max-w-2xl"
          >
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center">
              <p className="font-medium text-red-300">{error}</p>
              <button
                onClick={handleReset}
                className="mt-3 text-sm text-red-400 underline underline-offset-2 hover:text-red-300 cursor-pointer"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && !loading && (
        <>
          <CompareReport data={result} />
          <div className="flex justify-center mt-10">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-slate-400 hover:text-white border border-slate-700 hover:border-indigo-500/50 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <FiRefreshCw />
              Run another comparison
            </button>
          </div>
        </>
      )}
    </motion.section>
  );
}

export default GithubProfileComparePage;
