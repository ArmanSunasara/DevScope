import { motion } from "framer-motion";

/**
 * Premium page header component
 * Provides consistent header styling across all pages
 * 
 * Usage:
 * <PageHeader
 *   title="ATS Score Analyzer"
 *   description="Get your GitHub profile scored by AI"
 *   icon={FiFileText}
 *   badge="For Students"
 * />
 */
function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  badge,
  accentColor = "indigo",
  children 
}) {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-500/15',
      iconText: 'text-indigo-300',
      badgeBg: 'bg-indigo-500/10',
      badgeText: 'text-indigo-300',
      badgeBorder: 'border-indigo-500/20',
    },
    cyan: {
      iconBg: 'bg-cyan-500/15',
      iconText: 'text-cyan-300',
      badgeBg: 'bg-cyan-500/10',
      badgeText: 'text-cyan-300',
      badgeBorder: 'border-cyan-500/20',
    },
    purple: {
      iconBg: 'bg-purple-500/15',
      iconText: 'text-purple-300',
      badgeBg: 'bg-purple-500/10',
      badgeText: 'text-purple-300',
      badgeBorder: 'border-purple-500/20',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15',
      iconText: 'text-emerald-300',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/20',
    },
  };

  const colors = colorMap[accentColor] || colorMap.indigo;

  return (
    <div className="mb-12">
      <div className="flex items-start gap-6">
        {/* Icon */}
        {Icon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.1,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${colors.iconBg}`}
            style={{
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Icon className={`text-3xl ${colors.iconText}`} />
          </motion.div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          {badge && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-3"
            >
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${colors.iconBg}`} />
                {badge}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="heading-2 mb-3 text-white"
          >
            {title}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-slate-400"
              style={{ lineHeight: 'var(--line-height-relaxed)' }}
            >
              {description}
            </motion.p>
          )}

          {/* Additional content */}
          {children && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-4"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 h-px origin-left bg-gradient-to-r from-slate-800 via-slate-700 to-transparent"
      />
    </div>
  );
}

export default PageHeader;
