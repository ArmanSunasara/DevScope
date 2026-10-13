import { motion } from "framer-motion";
import { FiFileText, FiTarget } from "react-icons/fi";
import BackButton from "../../components/BackButton";
import FeatureButton from "../../components/FeatureButton";
import { routes } from "../../routes";

function StudentToolsPage({ navigate }) {
  return (
    <motion.section
      key="students"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl"
    >
      <BackButton label="Back to home" onClick={() => navigate(routes.home)} />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Student Tools</h2>
        <p className="mt-2 text-slate-400">
          Choose one focused tool to improve your job readiness.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FeatureButton
          title="ATS Score & Resume Suggestions"
          description="Open the analyzer and get practical feedback for your profile."
          icon={FiFileText}
          onClick={() => navigate(routes.ats)}
          accent={{
            border: "border-cyan-400/25",
            hoverBg: "hover:bg-cyan-950/50",
            hoverBorder: "hover:border-cyan-300/70",
            shadow: "hover:shadow-cyan-500/10",
            iconBg: "bg-cyan-500/15",
            iconText: "text-cyan-300",
          }}
        />
        <FeatureButton
          title="Specialization Fit Checker"
          description="Match your skills and projects with a focused career path."
          icon={FiTarget}
          onClick={() => navigate(routes.specialization)}
          accent={{
            border: "border-emerald-400/25",
            hoverBg: "hover:bg-emerald-950/50",
            hoverBorder: "hover:border-emerald-300/70",
            shadow: "hover:shadow-emerald-500/10",
            iconBg: "bg-emerald-500/15",
            iconText: "text-emerald-300",
          }}
        />
      </div>
    </motion.section>
  );
}

export default StudentToolsPage;
