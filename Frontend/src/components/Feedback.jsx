import { motion } from "framer-motion";
import { FiCheckCircle, FiAlertTriangle, FiZap, FiTrendingUp } from "react-icons/fi";

function Feedback({ feedback }) {
  if (!feedback) return null;

  const parseFeedback = (feedbackData) => {
    if (typeof feedbackData === "string") {
      try {
        return JSON.parse(feedbackData);
      } catch {
        return null;
      }
    }
    return feedbackData;
  };

  const parsed = parseFeedback(feedback);

  if (!parsed) return null;

  const sections = [
    {
      key: "strengths",
      title: "Strengths",
      items: parsed.strengths,
      icon: FiCheckCircle,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      borderColor: "border-emerald-500/20",
      bgGradient: "from-emerald-500/10 to-emerald-500/5",
      accentColor: "emerald",
    },
    {
      key: "red_flags",
      title: "Red Flags",
      items: parsed.red_flags,
      icon: FiAlertTriangle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/15",
      borderColor: "border-red-500/20",
      bgGradient: "from-red-500/10 to-red-500/5",
      accentColor: "red",
    },
    {
      key: "suggestions",
      title: "Action Plan",
      items: parsed.suggestions,
      icon: FiTrendingUp,
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/15",
      borderColor: "border-indigo-500/20",
      bgGradient: "from-indigo-500/10 to-indigo-500/5",
      fullWidth: true,
      accentColor: "indigo",
    },
  ];

  return (
    <div className="mb-12 grid gap-6 md:grid-cols-2">
      {sections.map(
        (section, sectionIdx) =>
          section.items &&
          section.items.length > 0 && (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: sectionIdx * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={`glass-card relative overflow-hidden rounded-2xl p-6 ${
                section.fullWidth ? "md:col-span-2" : ""
              }`}
              style={{
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Background gradient */}
              <div 
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-40 ${section.bgGradient}`}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                  {/* Icon */}
                  <div 
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${section.iconBg}`}
                    style={{
                      boxShadow: `0 4px 12px rgba(${
                        section.accentColor === 'emerald' ? '16, 185, 129' :
                        section.accentColor === 'red' ? '248, 113, 113' :
                        '99, 102, 241'
                      }, 0.2)`,
                    }}
                  >
                    <section.icon className={`text-xl ${section.iconColor}`} />
                  </div>

                  {/* Title */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {section.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Count badge */}
                  <div 
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${section.iconBg}`}
                  >
                    <span className={`text-sm font-bold ${section.iconColor}`}>
                      {section.items.length}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <ul className="space-y-3">
                  {section.items.map((item, i) => {
                    const text =
                      typeof item === "string"
                        ? item
                        : item == null
                        ? ""
                        : JSON.stringify(item);
                    if (!text) return null;
                    
                    return (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: sectionIdx * 0.15 + i * 0.05,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="group flex items-start gap-3"
                      >
                        {/* Bullet point */}
                        <span 
                          className={`mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full ${section.iconBg} transition-transform group-hover:scale-125`}
                        >
                          <span className={`h-1 w-1 rounded-full ${section.iconColor.replace('text-', 'bg-')}`} />
                        </span>

                        {/* Text */}
                        <span className="flex-1 text-sm leading-relaxed text-slate-300 transition-colors group-hover:text-white">
                          {text}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              {/* Bottom accent line */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${section.accentColor}-500/50 to-transparent`}
              />
            </motion.div>
          )
      )}
    </div>
  );
}

export default Feedback;
