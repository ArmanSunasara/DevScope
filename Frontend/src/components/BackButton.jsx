import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

function BackButton({ label = "Back", onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group mb-8 inline-flex items-center gap-2.5 rounded-xl bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:text-white"
      style={{
        border: '1px solid var(--glass-border)',
      }}
    >
      <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
      {label}
    </motion.button>
  );
}

export default BackButton;
