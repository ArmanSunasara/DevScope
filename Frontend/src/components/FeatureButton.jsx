import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

function FeatureButton({ title, description, icon: Icon, onClick, accent, index = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="glass-interactive group relative flex w-full items-start gap-5 overflow-hidden rounded-2xl p-6 text-left"
      style={{
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at top left, ${accent.gradientFrom || 'rgba(99, 102, 241, 0.1)'}, transparent 60%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full items-start gap-5">
        {/* Icon */}
        <div 
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${accent.iconBg} ${accent.iconText}`}
          style={{
            boxShadow: `0 8px 16px ${accent.shadow}`,
          }}
        >
          <Icon className="text-2xl" />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0 pt-1">
          <h4 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-white">
            {title}
          </h4>
          <p className="text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
            {description}
          </p>
        </div>

        {/* Arrow icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 transition-all duration-300 group-hover:bg-slate-700/60 group-hover:text-white">
          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.lineColor || 'rgba(99, 102, 241, 0.5)'}, transparent)`,
        }}
      />
    </motion.button>
  );
}

export default FeatureButton;
