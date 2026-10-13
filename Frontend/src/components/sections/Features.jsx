import { motion } from "framer-motion";
import {
  FiFileText,
  FiTarget,
  FiUserCheck,
  FiUserPlus,
  FiRepeat,
  FiArrowRight,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { routes } from "../../routes";

const groups = [
  {
    id: "students",
    label: "For Students",
    icon: FiUsers,
    blurb: "Sharpen your profile before recruiters ever see it.",
    accent: "text-cyan-300",
    iconBg: "bg-cyan-500/15",
    ring: "hover:border-cyan-400/50 hover:shadow-cyan-500/10",
    cta: { label: "Explore Student Tools", route: routes.students },
    tools: [
      {
        icon: FiFileText,
        title: "ATS Score & Resume Suggestions",
        description:
          "Score your profile and get practical, prioritized fixes to pass automated screening.",
        route: routes.ats,
      },
      {
        icon: FiTarget,
        title: "Specialization Fit Checker",
        description:
          "See how your skills and projects map to a focused career path — and what to build next.",
        route: routes.specialization,
      },
    ],
  },
  {
    id: "recruiters",
    label: "For Recruiters",
    icon: FiBriefcase,
    blurb: "Evaluate real work, not just resumes.",
    accent: "text-violet-300",
    iconBg: "bg-violet-500/15",
    ring: "hover:border-violet-400/50 hover:shadow-violet-500/10",
    cta: { label: "Explore Recruiter Tools", route: routes.recruiters },
    tools: [
      {
        icon: FiUserCheck,
        title: "Candidate Shortlist",
        description:
          "Rank candidates by portfolio strength and fit so you focus on the right people first.",
        route: routes.shortlist,
      },
      {
        icon: FiUserPlus,
        title: "Resume vs GitHub Match",
        description:
          "Verify claimed skills against actual repository work to spot mismatches early.",
        route: routes.resumeGithub,
      },
      {
        icon: FiRepeat,
        title: "GitHub Profile Compare",
        description:
          "Put two profiles side by side and make a confident, evidence-based hiring call.",
        route: routes.githubCompare,
      },
    ],
  },
];

function ToolCard({ tool, accent, iconBg, ring, navigate, delay }) {
  return (
    <motion.button
      type="button"
      onClick={() => navigate(tool.route)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay }}
      className={`group flex h-full w-full flex-col items-start rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-left shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-slate-900 ${ring} cursor-pointer`}
    >
      <span className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${iconBg} ${accent}`}>
        <tool.icon className="text-xl" />
      </span>
      <h4 className="text-base font-semibold text-white">{tool.title}</h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
        {tool.description}
      </p>
      <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${accent}`}>
        Open tool
        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
}

function Features({ navigate }) {
  return (
    <section id="features" className="scroll-mt-24 py-20 lg:py-28 relative section-flow">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.02) 0%, transparent 70%)',
            filter: 'blur(150px)',
          }}
        />
      </div>
      
      <Container className="relative z-10">
        <SectionHeading
          eyebrow="Features"
          title="Two toolkits, one platform"
          description="Whether you're building a standout profile or screening dozens of them, there's a focused tool for the job."
        />

        <div className="mt-16 space-y-16">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${group.iconBg} ${group.accent}`}>
                  <group.icon className="text-lg" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">{group.label}</h3>
                  <p className="text-sm text-slate-400">{group.blurb}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(group.cta.route)}
                  className={`ml-auto hidden items-center gap-1.5 text-sm font-medium sm:inline-flex ${group.accent} transition-opacity hover:opacity-80 cursor-pointer`}
                >
                  {group.cta.label}
                  <FiArrowRight />
                </button>
              </div>

              <div
                className={`grid gap-5 ${
                  group.tools.length === 2
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {group.tools.map((tool, i) => (
                  <ToolCard
                    key={tool.title}
                    tool={tool}
                    accent={group.accent}
                    iconBg={group.iconBg}
                    ring={group.ring}
                    navigate={navigate}
                    delay={i * 0.08}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Features;
