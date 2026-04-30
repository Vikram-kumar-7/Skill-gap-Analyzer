import {
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { ArrowRight, TrendingUp } from "lucide-react";

// Circular progress mini component
function CircularScore({ value, size = 56, color = "#3b82f6", trackColor = "rgba(255,255,255,0.06)" }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white">{value}%</span>
    </div>
  );
}

export default function OverviewCards({ summary, marketData }) {
  const matchPct = summary.matchPercentage;
  const missingCount = summary.missingCount;

  // Determine demand level
  const avgDemand = marketData && marketData.length > 0
    ? marketData.reduce((s, m) => s + m.demand, 0) / marketData.length
    : 0;
  const demandLevel = avgDemand >= 30 ? "High" : avgDemand >= 15 ? "Medium" : "Low";

  // Estimate salary boost
  const avgSalary = marketData && marketData.length > 0
    ? marketData.filter(m => m.salary).reduce((s, m) => s + (m.salary?.avgSalary || 0), 0) / Math.max(marketData.filter(m => m.salary).length, 1)
    : 0;
  const salaryLPA = (avgSalary / 100000).toFixed(1);
  const salaryBoost = "+32%";

  // Profile strength
  const strength = Math.min(Math.round(matchPct * 0.7 + (summary.totalResumeSkills > 10 ? 30 : summary.totalResumeSkills * 3)), 100);
  const strengthLabel = strength >= 70 ? "Strong" : strength >= 40 ? "Moderate" : "Weak";

  const matchLabel = matchPct >= 80 ? "Excellent" : matchPct >= 60 ? "Good Match" : matchPct >= 40 ? "Fair" : "Needs Work";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
      {/* 1 — Overall Match Score */}
      <div className="stat-card flex flex-col items-center text-center">
        <p className="text-[11px] text-surface-200/50 font-medium mb-3 uppercase tracking-wider">Overall Match Score</p>
        <CircularScore value={matchPct} size={64} color="#3b82f6" />
        <p className={`text-xs font-semibold mt-2 ${matchPct >= 60 ? "text-success-400" : "text-warning-400"}`}>
          {matchLabel}
        </p>
        <p className="text-[10px] text-surface-200/40 mt-0.5">Keep improving!</p>
      </div>

      {/* 2 — Missing Skills */}
      <div className="stat-card">
        <p className="text-[11px] text-surface-200/50 font-medium mb-3 uppercase tracking-wider">Missing Skills</p>
        <p className="text-3xl font-bold text-danger-400 animate-count-up">{missingCount}</p>
        <p className="text-[11px] text-surface-200/40 mt-1">High priority to focus</p>
        <button className="flex items-center gap-1 text-[11px] text-primary-400 font-medium mt-3 hover:text-primary-300 transition-colors">
          View Skills <ArrowRight size={11} />
        </button>
      </div>

      {/* 3 — Market Demand */}
      <div className="stat-card">
        <p className="text-[11px] text-surface-200/50 font-medium mb-3 uppercase tracking-wider">Market Demand</p>
        <p className={`text-2xl font-bold ${demandLevel === "High" ? "text-success-400" : demandLevel === "Medium" ? "text-warning-400" : "text-surface-200"}`}>
          {demandLevel}
        </p>
        <p className="text-[11px] text-surface-200/40 mt-1">Top {avgDemand >= 30 ? "30" : "50"}% in demand</p>
      </div>

      {/* 4 — Potential Salary Boost */}
      <div className="stat-card">
        <p className="text-[11px] text-surface-200/50 font-medium mb-3 uppercase tracking-wider">Potential Salary Boost</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">₹{salaryLPA}</span>
          <span className="text-[11px] text-surface-200/40">LPA</span>
          <span className="text-xs font-semibold text-success-400">{salaryBoost}</span>
        </div>
        <p className="text-[11px] text-surface-200/40 mt-1">After closing the gap</p>
      </div>

      {/* 5 — Skills to Learn */}
      <div className="stat-card">
        <p className="text-[11px] text-surface-200/50 font-medium mb-3 uppercase tracking-wider">Skills to Learn</p>
        <p className="text-3xl font-bold text-accent-400 animate-count-up">{marketData?.length || 0}</p>
        <p className="text-[11px] text-surface-200/40 mt-1">Recommended</p>
        <button className="flex items-center gap-1 text-[11px] text-primary-400 font-medium mt-3 hover:text-primary-300 transition-colors">
          View Roadmap <ArrowRight size={11} />
        </button>
      </div>

      {/* 6 — Profile Strength */}
      <div className="stat-card flex flex-col items-center text-center">
        <p className="text-[11px] text-surface-200/50 font-medium mb-3 uppercase tracking-wider">Profile Strength</p>
        <CircularScore value={strength} size={64} color={strength >= 70 ? "#22c55e" : strength >= 40 ? "#eab308" : "#ef4444"} />
        <p className={`text-xs font-semibold mt-2 ${strength >= 70 ? "text-success-400" : strength >= 40 ? "text-warning-400" : "text-danger-400"}`}>
          {strengthLabel}
        </p>
      </div>
    </div>
  );
}
