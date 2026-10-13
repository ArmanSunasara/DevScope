import { motion } from "framer-motion";

/**
 * Self-contained SVG radar chart. Avoids pulling in a chart library so
 * the feature stays lightweight. Up to 6 axes look best.
 */
function RadarChart({ axes = [], size = 320 }) {
  if (!axes.length) return null;

  const radius = size / 2 - 56;
  const cx = size / 2;
  const cy = size / 2;
  const count = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / count - Math.PI / 2;

  const point = (i, scoreRatio) => {
    const r = radius * scoreRatio;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const gridPolygon = (ratio) =>
    axes
      .map((_, i) => {
        const [x, y] = point(i, ratio);
        return `${x},${y}`;
      })
      .join(" ");

  const dataPoints = axes.map((a, i) => {
    const ratio = Math.max(0, Math.min(100, a.score)) / 100;
    return point(i, ratio);
  });
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-md mx-auto"
    >
      {gridLevels.map((level, idx) => (
        <polygon
          key={level}
          points={gridPolygon(level)}
          fill="none"
          stroke="#1e293b"
          strokeWidth={idx === gridLevels.length - 1 ? 1.5 : 1}
        />
      ))}

      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#1e293b"
            strokeWidth={1}
          />
        );
      })}

      <motion.polygon
        points={dataPolygon}
        fill="rgba(52, 211, 153, 0.18)"
        stroke="#34d399"
        strokeWidth={2}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      />

      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#34d399" />
      ))}

      {axes.map((a, i) => {
        const [lx, ly] = point(i, 1.18);
        return (
          <text
            key={a.axis}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-300"
            style={{ fontSize: 11 }}
          >
            {a.axis}
          </text>
        );
      })}
    </motion.svg>
  );
}

export default RadarChart;
