import { motion } from "framer-motion";
import { FiEye, FiZap, FiCheckCircle, FiGift } from "react-icons/fi";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

const values = [
  {
    icon: FiEye,
    title: "A recruiter's lens",
    description:
      "Feedback framed the way hiring teams actually read a profile — signal over vanity metrics.",
  },
  {
    icon: FiZap,
    title: "Fast & frictionless",
    description:
      "No account, no config. A link is all it takes to get a full report in under a minute.",
  },
  {
    icon: FiCheckCircle,
    title: "Actionable, not vague",
    description:
      "Every suggestion is concrete and prioritized, so you always know the next best move.",
  },
  {
    icon: FiGift,
    title: "Free for students",
    description:
      "The tools that help you land the role shouldn't cost anything while you're learning.",
  },
];

const highlights = [
  { value: "5", label: "Purpose-built tools" },
  { value: "2", label: "Audiences served" },
  { value: "60s", label: "To a full report" },
  { value: "0", label: "Setup required" },
];

function About() {
  return (
    <section id="about" className="scroll-mt-24 py-20 lg:py-28 relative section-flow">
      {/* Subtle side glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute right-0 top-1/2 h-[500px] w-[600px] translate-x-1/3 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.015) 0%, transparent 70%)',
            filter: 'blur(140px)',
          }}
        />
      </div>
      
      <Container className="relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Pitch + values */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Why use us"
              title="Built to close the gap between code and getting hired"
              description="Great work goes unnoticed when a profile doesn't tell the story. We translate raw GitHub activity into the signals recruiters look for — and tell you exactly how to strengthen them."
            />

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex gap-3"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
                    <v.icon className="text-lg" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{v.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {v.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-white/5 blur-2xl" />
            <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="bg-slate-900/40 p-8 text-center transition-colors hover:bg-slate-900/70"
                >
                  <p className="text-4xl font-extrabold text-gradient">
                    {h.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{h.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export default About;
