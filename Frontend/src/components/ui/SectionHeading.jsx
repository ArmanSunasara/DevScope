import { motion } from "framer-motion";

/**
 * Shared section header: a small pill "eyebrow", a title and an optional
 * description. Reveals on scroll so every section has a consistent rhythm.
 */
function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}) {
  const isCenter = align === "center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`${isCenter ? "mx-auto text-center" : "text-left"} max-w-2xl ${className}`}
    >
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300 ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          {eyebrow}
        </span>
      )}
      <h2 className="heading-2 mt-4 text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-slate-400" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
          {description}
        </p>
      )}
    </motion.div>
  );
}

export default SectionHeading;
