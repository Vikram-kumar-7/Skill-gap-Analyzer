import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Star,
  ArrowUpRight,
  GitMerge,
  Info
} from "lucide-react";

export default function MarketDemand({ marketData }) {
  if (!marketData || marketData.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-surface-200/50">No market data available.</p>
      </div>
    );
  }

  // Prepare chart data (top 10 by ROI)
  const chartData = marketData.slice(0, 10).map((item) => ({
    name: item.skill.length > 12 ? item.skill.slice(0, 12) + "…" : item.skill,
    fullName: item.skill,
    demand: item.demand,
    roi: item.roi,
    difficulty: item.difficulty,
  }));

  const getBarColor = (roi) => {
    if (roi >= 50) return "#22c55e";
    if (roi >= 30) return "#60a5fa";
    if (roi >= 15) return "#a78bfa";
    return "#64748b";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="glass-card px-4 py-3 text-xs space-y-1 min-w-[180px]">
          <p className="text-white font-semibold capitalize text-sm">
            {d.fullName}
          </p>
          <div className="flex justify-between">
            <span className="text-surface-200/50">Demand</span>
            <span className="text-primary-400 font-medium">{d.demand}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-200/50">ROI Score</span>
            <span className="text-success-400 font-medium">{d.roi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-200/50">Difficulty</span>
            <span className="text-warning-400 font-medium">
              {d.difficulty}/5
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-400" />
            Market Demand & ROI
          </h3>
          <div className="flex items-center gap-3 text-xs text-surface-200/40">
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-success-500" />
              High ROI
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-400" />
              Medium
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-surface-700" />
              Low
            </span>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Demand %",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#64748b",
                  fontSize: 11,
                  offset: 15,
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="demand" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.roi)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star size={18} className="text-warning-400" />
          Skill Details (Sorted by ROI)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-surface-200/50 font-medium text-xs uppercase tracking-wider min-w-[250px]">
                  Skill & Details
                </th>
                <th className="text-center py-3 px-4 text-surface-200/50 font-medium text-xs uppercase tracking-wider">
                  Demand
                </th>
                <th className="text-center py-3 px-4 text-surface-200/50 font-medium text-xs uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="text-center py-3 px-4 text-surface-200/50 font-medium text-xs uppercase tracking-wider">
                  ROI
                </th>
                <th className="text-right py-3 px-4 text-surface-200/50 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                  Avg Salary
                </th>
                <th className="text-right py-3 px-4 text-surface-200/50 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                  Market Trend
                </th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {marketData.map((item) => (
                <tr
                  key={item.skill}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-white font-medium capitalize text-base">
                        {item.skill}
                      </span>
                      {/* Explainability / Confidence Score */}
                      {item.confidenceReason && (
                        <div className="flex items-start gap-1.5 text-xs text-surface-200/70 max-w-xs">
                          <Info size={14} className="text-primary-400 shrink-0 mt-0.5" />
                          <p>{item.confidenceReason}</p>
                        </div>
                      )}
                      {/* Dependencies Graph */}
                      {item.prerequisites && item.prerequisites.length > 0 && (
                        <div className="flex items-start gap-1.5 text-xs text-surface-200/50 mt-1">
                          <GitMerge size={12} className="text-accent-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="mr-1">Requires:</span>
                            {item.prerequisites.map((p, idx) => (
                              <span key={p} className="text-white/80 capitalize">
                                {p}{idx < item.prerequisites.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center align-top pt-5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-400 transition-all duration-500"
                          style={{ width: `${Math.min(item.demand, 100)}%` }}
                        />
                      </div>
                      <span className="text-surface-200/70 text-xs w-10 text-right">
                        {item.demand}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center align-top pt-5">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full ${
                            level <= item.difficulty
                              ? "bg-warning-400"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center align-top pt-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.roi >= 50
                          ? "bg-success-500/15 text-success-400"
                          : item.roi >= 30
                          ? "bg-primary-500/15 text-primary-400"
                          : item.roi >= 15
                          ? "bg-accent-500/15 text-accent-400"
                          : "bg-white/5 text-surface-200/50"
                      }`}
                    >
                      {item.roi}
                      {item.roi >= 50 && <ArrowUpRight size={10} />}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right align-top pt-5 hidden sm:table-cell">
                    {item.salary ? (
                      <span className="text-success-400 font-medium flex items-center justify-end gap-1">
                        <DollarSign size={12} />
                        {(item.salary.avgSalary / 1000).toFixed(0)}k
                      </span>
                    ) : (
                      <span className="text-surface-200/30">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right align-top pt-5 hidden md:table-cell">
                    {item.salary ? (
                      <span
                        className={`text-xs font-medium ${
                          item.salary.growth > 0
                            ? "text-success-400"
                            : "text-danger-400"
                        }`}
                      >
                        {item.salary.growth > 0 ? "+" : ""}
                        {item.salary.growth}% YoY
                      </span>
                    ) : (
                      <span className="text-surface-200/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
