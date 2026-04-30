import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, XCircle } from "lucide-react";

const COLORS = {
  matched: "#22c55e",
  missing: "#ef4444",
};

export default function SkillMatchChart({ matched, missing }) {
  const data = [
    { name: "Matched", value: matched.length, color: COLORS.matched },
    { name: "Missing", value: missing.length, color: COLORS.missing },
  ];

  const total = matched.length + missing.length;
  const pct = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-3 py-2 text-xs">
          <span className="text-white font-medium">
            {payload[0].name}: {payload[0].value} skills
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-white mb-4">Skill Match</h3>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{pct}%</span>
            <span className="text-[10px] text-surface-200/50">match</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-success-500/10 border border-success-500/15">
            <CheckCircle2 size={16} className="text-success-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">
                {matched.length} Matched
              </p>
              <p className="text-xs text-surface-200/50 line-clamp-1">
                {matched.slice(0, 4).join(", ")}
                {matched.length > 4 ? ` +${matched.length - 4}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-danger-500/10 border border-danger-500/15">
            <XCircle size={16} className="text-danger-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">
                {missing.length} Missing
              </p>
              <p className="text-xs text-surface-200/50 line-clamp-1">
                {missing.slice(0, 4).join(", ")}
                {missing.length > 4 ? ` +${missing.length - 4}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
