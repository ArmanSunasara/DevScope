function LearningTimeline({ steps = [] }) {
  if (!steps.length) {
    return (
      <p className="text-sm text-slate-500 italic">
        No learning path generated.
      </p>
    );
  }
  return (
    <ol className="relative border-l border-slate-700/70 ml-2 space-y-5">
      {steps.map((step, i) => (
        <li key={i} className="pl-5 relative">
          <span className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-[10px] font-semibold text-blue-200">
            {i + 1}
          </span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{step.step}</span>
            {step.duration && (
              <span className="text-[11px] text-slate-500">
                · {step.duration}
              </span>
            )}
          </div>
          {step.resources?.length ? (
            <ul className="text-xs text-slate-400 list-disc ml-5 space-y-1">
              {step.resources.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default LearningTimeline;
