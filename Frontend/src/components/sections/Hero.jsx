import { motion } from "framer-motion";
import { FiArrowRight, FiZap, FiBriefcase } from "react-icons/fi";
import Container from "../ui/Container";
import Button from "../ui/Button";
import HeroPreview from "./HeroPreview";
import { routes } from "../../routes";

const stats = [
  { value: "<60s", label: "Per analysis" },
  { value: "5", label: "Focused tools" },
  { value: "100%", label: "Free for students" },
];

function Hero({ navigate }) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft atmospheric background layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top central glow - very subtle */}
        <div 
          className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.025) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        
        {/* Left ambient glow */}
        <div 
          className="absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
        
        {/* Right ambient glow */}
        <div 
          className="absolute right-0 top-1/3 h-[500px] w-[500px] translate-x-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />

        {/* Subtle depth gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #050505 0%, #070707 40%, #090909 100%)',
            opacity: 0.6,
          }}
        />
      </div>

      <Container className="relative py-20 lg:py-32">
        {/* Centered hero content */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <FiZap className="text-sm" />
              AI-powered GitHub reviews
            </span>

            {/* Main heading */}
            <h1 className="hero-text mt-6 text-white">
              See your GitHub the way a{" "}
              <span className="text-shimmer">recruiter does</span>
            </h1>

            {/* Supporting description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
              Paste a profile and get a recruiter-style score, repo-by-repo
              feedback and clear next steps — in under 60 seconds. Built for
              students who want to stand out and recruiters who want to decide
              faster.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="group w-full sm:w-auto"
                iconRight={FiArrowRight}
                onClick={() => navigate(routes.ats)}
              >
                Analyze My Profile
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={FiBriefcase}
                className="w-full sm:w-auto"
                onClick={() => navigate(routes.recruiters)}
              >
                I'm a Recruiter
              </Button>
            </div>

            {/* Trust stats */}
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-white sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Centered preview visual - below CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mx-auto mt-16 w-full max-w-2xl"
          >
            <HeroPreview />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
