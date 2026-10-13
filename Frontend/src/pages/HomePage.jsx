import { motion } from "framer-motion";
import Hero from "../components/sections/Hero";
import HowItWorks from "../components/sections/HowItWorks";
import Features from "../components/sections/Features";
import About from "../components/sections/About";
import CTABanner from "../components/sections/CTABanner";

/**
 * The landing experience. Composes the marketing sections; the global Navbar
 * and Footer live in Dashboard so they wrap every route consistently.
 *
 * `navigate` drives the SPA router; `scrollToSection` is forwarded for any
 * in-page anchor jumps (used by the nav, passed through for completeness).
 */
function HomePage({ navigate }) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <Hero navigate={navigate} />
      <HowItWorks />
      <Features navigate={navigate} />
      <About />
      <CTABanner navigate={navigate} />
    </motion.div>
  );
}

export default HomePage;
