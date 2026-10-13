import { motion } from "framer-motion";
import { FiRepeat, FiUserCheck, FiUserPlus } from "react-icons/fi";
import BackButton from "../../components/BackButton";
import FeatureButton from "../../components/FeatureButton";
import { routes } from "../../routes";

function RecruiterToolsPage({ navigate }) {
  return (
    <motion.section
      key="recruiters"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl"
    >
      <BackButton label="Back to home" onClick={() => navigate(routes.home)} />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Recruiter Tools</h2>
        <p className="mt-2 text-slate-400">
          Pick a hiring workflow and review candidates with more context.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureButton
          title="Candidate Shortlist"
          description="Filter students by portfolio strength and fit."
          icon={FiUserCheck}
          onClick={() => navigate(routes.shortlist)}
          accent={{
            border: "border-fuchsia-400/25",
            hoverBg: "hover:bg-fuchsia-950/50",
            hoverBorder: "hover:border-fuchsia-300/70",
            shadow: "hover:shadow-fuchsia-500/10",
            iconBg: "bg-fuchsia-500/15",
            iconText: "text-fuchsia-300",
          }}
        />
        <FeatureButton
          title="Resume vs GitHub Match"
          description="Compare claimed skills with real repository work."
          icon={FiUserPlus}
          onClick={() => navigate(routes.resumeGithub)}
          accent={{
            border: "border-violet-400/25",
            hoverBg: "hover:bg-violet-950/50",
            hoverBorder: "hover:border-violet-300/70",
            shadow: "hover:shadow-violet-500/10",
            iconBg: "bg-violet-500/15",
            iconText: "text-violet-300",
          }}
        />
        <FeatureButton
          title="GitHub Profile Compare"
          description="Review two profiles side by side for hiring decisions."
          icon={FiRepeat}
          onClick={() => navigate(routes.githubCompare)}
          accent={{
            border: "border-indigo-400/25",
            hoverBg: "hover:bg-indigo-950/50",
            hoverBorder: "hover:border-indigo-300/70",
            shadow: "hover:shadow-indigo-500/10",
            iconBg: "bg-indigo-500/15",
            iconText: "text-indigo-300",
          }}
        />
      </div>
    </motion.section>
  );
}

export default RecruiterToolsPage;
