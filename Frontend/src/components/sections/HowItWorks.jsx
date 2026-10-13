import { motion } from "framer-motion";
import { FiLink, FiCpu, FiClipboard, FiTrendingUp } from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

const steps = [
  {
    icon: FiLink,
    title: "Paste a GitHub profile",
    description:
      "Drop in a username or profile URL. No sign-up, no setup — just the link.",
  },
  {
    icon: FiCpu,
    title: "AI reviews the work",
    description:
      "We scan repos, languages, activity and READMEs the way a recruiter skims a portfolio.",
  },
  {
    icon: FiClipboard,
    title: "Get a scored report",
    description:
      "Receive a clear score with strengths, gaps and recruiter-style commentary per repo.",
  },
  {
    icon: FiTrendingUp,
    title: "Improve & re-check",
    description:
      "Act on prioritized suggestions, then re-run to watch your profile climb.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 lg:py-28 relative section-flow">
      {/* Subtle central atmospheric glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.02) 0%, transparent 65%)',
            filter: 'blur(130px)',
          }}
        />
      </div>
      
      <Container className="relative z-10">
        <SectionHeading
          eyebrow="How it works"
          title="From profile to feedback in four steps"
          description="No dashboards to learn. Paste a link and get a recruiter's read on your GitHub almost instantly."
        />

        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center lg:text-left"
              >
                <div className="relative z-10 mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-900 text-indigo-300 shadow-lg lg:mx-0">
                  <step.icon className="text-xl" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default HowItWorks;
