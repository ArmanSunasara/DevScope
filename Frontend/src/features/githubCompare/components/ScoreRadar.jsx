import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const AXES = [
  { key: "consistency", label: "Consistency" },
  { key: "technical_depth", label: "Technical Depth" },
  { key: "project_quality", label: "Project Quality" },
  { key: "open_source", label: "Open Source" },
  { key: "impact", label: "Impact" },
];

function ScoreRadar({ scoresA, scoresB, nameA, nameB }) {
  const data = AXES.map(({ key, label }) => ({
    axis: label,
    [nameA]: scoresA?.[key] ?? 0,
    [nameB]: scoresB?.[key] ?? 0,
  }));

  return (
    <div className="w-full" style={{ height: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#cbd5e1", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            stroke="#334155"
          />
          <Radar
            name={nameA}
            dataKey={nameA}
            stroke="#818cf8"
            fill="#818cf8"
            fillOpacity={0.35}
          />
          <Radar
            name={nameB}
            dataKey={nameB}
            stroke="#f472b6"
            fill="#f472b6"
            fillOpacity={0.25}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              color: "#e2e8f0",
            }}
            labelStyle={{ color: "#94a3b8" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreRadar;
