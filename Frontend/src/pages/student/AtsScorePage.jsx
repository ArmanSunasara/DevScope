import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";
import BackButton from "../../components/BackButton";
import Feedback from "../../components/Feedback";
import InputForm from "../../components/InputForm";
import Loader from "../../components/Loader";
import ProfileHeader from "../../components/ProfileHeader";
import RepoCard from "../../components/RepoCard";
import ScoreCard from "../../components/ScoreCard";
import { analyzeGithubProfile } from "../../services/api";
import { routes } from "../../routes";

function AtsScorePage({ navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError(null);
    setData(null);

    const result = await analyzeGithubProfile(url);

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  const handleBack = () => {
    handleReset();
    navigate(routes.students);
  };

  return (
    <motion.section
      key="ats"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl"
    >
      <BackButton label="Back to Student Tools" onClick={handleBack} />
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white">
          ATS Score & Resume Suggestions
        </h2>
        <p className="mt-2 text-slate-400">
          Enter a GitHub username or profile URL to start the analysis.
        </p>
      </div>

      <InputForm onAnalyze={handleAnalyze} loading={loading} />

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mb-8 max-w-2xl"
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

      {data && (
        <div className="mx-auto max-w-5xl">
          <ProfileHeader data={data} />
          <ScoreCard score={data.score} />
          {data.aiFeedback && <Feedback feedback={data.aiFeedback} />}

          {data.repoAnalysis && data.repoAnalysis.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-6 text-gray-300 text-center uppercase tracking-wider">
                Top Repositories
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {data.repoAnalysis.map((repo, i) => (
                  <RepoCard
                    key={repo.name}
                    repo={repo}
                    index={i}
                    username={data.username}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-500 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 mb-10"
            >
              No public repositories were available to analyze.
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-10"
          >
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-gray-400 hover:text-white border border-slate-700 hover:border-blue-500/50 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <FiRefreshCw />
              Analyze Another Profile
            </button>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}

export default AtsScorePage;
