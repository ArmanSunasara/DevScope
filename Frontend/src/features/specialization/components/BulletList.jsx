function BulletList({ items = [], tone = "slate", empty = "No items." }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500 italic">{empty}</p>;
  }
  const dotColor =
    tone === "emerald"
      ? "bg-emerald-400"
      : tone === "rose"
      ? "bg-rose-400"
      : tone === "blue"
      ? "bg-blue-400"
      : tone === "amber"
      ? "bg-amber-400"
      : "bg-slate-400";

  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => {
        const text =
          typeof item === "string"
            ? item
            : item == null
            ? ""
            : JSON.stringify(item);
        if (!text) return null;
        return (
          <li
            key={i}
            className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-2 shrink-0`}
            />
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default BulletList;
