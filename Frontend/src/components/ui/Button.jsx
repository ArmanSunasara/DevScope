/**
 * Single source of truth for buttons across the app. Renders a real <button>
 * (navigation is handled via onClick + the SPA router), with consistent
 * variants, sizes and an optional leading/trailing icon.
 */

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition-all duration-200 cursor-pointer select-none " +
  "focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed " +
  "whitespace-nowrap";

const variants = {
  primary:
    "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg " +
    "shadow-indigo-600/20 hover:from-blue-500 hover:to-indigo-500 " +
    "hover:shadow-indigo-500/40 hover:-translate-y-0.5",
  secondary:
    "text-slate-100 bg-slate-800/70 border border-slate-700 backdrop-blur-sm " +
    "hover:border-slate-500 hover:bg-slate-800 hover:-translate-y-0.5",
  ghost:
    "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent",
  outline:
    "text-indigo-300 border border-indigo-400/40 hover:border-indigo-300 " +
    "hover:bg-indigo-500/10 hover:-translate-y-0.5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="text-lg shrink-0" aria-hidden="true" />}
      {children}
      {IconRight && (
        <IconRight
          className="text-lg shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export default Button;
