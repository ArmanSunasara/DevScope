function SkillChips({ items = [], tone = "missing" }) {
  if (!items.length) return null;

  const styles =
    tone === "matched"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : tone === "tech"
      ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
      : "bg-rose-500/10 text-rose-300 border-rose-500/30";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`px-3 py-1 rounded-full border text-xs font-medium ${styles}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default SkillChips;
