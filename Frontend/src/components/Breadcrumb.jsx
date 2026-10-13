import { motion } from "framer-motion";
import { FiChevronRight, FiHome } from "react-icons/fi";

/**
 * Premium Breadcrumb component for navigation hierarchy
 * 
 * Usage:
 * <Breadcrumb
 *   items={[
 *     { label: "Home", onClick: () => navigate(routes.home) },
 *     { label: "Student Tools", onClick: () => navigate(routes.students) },
 *     { label: "ATS Score", current: true }
 *   ]}
 * />
 */
function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center gap-2">
              {index === 0 ? (
                // Home icon for first item
                <motion.button
                  type="button"
                  onClick={item.onClick}
                  disabled={isCurrent}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    isCurrent
                      ? 'text-white bg-indigo-500/15 cursor-default'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <FiHome className="text-base" />
                  <span>{item.label}</span>
                </motion.button>
              ) : (
                // Regular breadcrumb items
                <motion.button
                  type="button"
                  onClick={item.onClick}
                  disabled={isCurrent}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    isCurrent
                      ? 'text-white bg-indigo-500/15 cursor-default'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </motion.button>
              )}

              {/* Separator */}
              {!isLast && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.05 }}
                >
                  <FiChevronRight className="text-slate-600" />
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}

export default Breadcrumb;
