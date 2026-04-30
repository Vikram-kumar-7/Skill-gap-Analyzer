import { AlertTriangle, TrendingUp, Zap } from "lucide-react";

export default function MissingSkills({ skills, marketData }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-14 h-14 rounded-2xl bg-success-500/15 flex items-center justify-center mb-3">
          <Zap size={24} className="text-success-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">
          Perfect Match!
        </h3>
        <p className="text-sm text-surface-200/50">
          Your resume covers all required skills.
        </p>
      </div>
    );
  }

  // Sort by demand (highest first)
  const sortedSkills = [...skills].sort((a, b) => {
    const demandA = marketData?.find(
      (m) => m.skill.toLowerCase() === a.toLowerCase()
    )?.demand || 0;
    const demandB = marketData?.find(
      (m) => m.skill.toLowerCase() === b.toLowerCase()
    )?.demand || 0;
    return demandB - demandA;
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning-400" />
          Missing Skills
        </h3>
        <span className="text-xs px-2 py-1 rounded-lg bg-danger-500/10 text-danger-400 font-medium">
          {skills.length} gaps
        </span>
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 stagger-children">
        {sortedSkills.map((skill) => {
          const data = marketData?.find(
            (m) => m.skill.toLowerCase() === skill.toLowerCase()
          );
          const demand = data?.demand || 0;

          return (
            <div
              key={skill}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-danger-400 shrink-0" />
                <span className="text-sm text-white font-medium capitalize">
                  {skill}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={12}
                  className={`${
                    demand >= 20
                      ? "text-success-400"
                      : demand >= 10
                      ? "text-warning-400"
                      : "text-surface-200/30"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    demand >= 20
                      ? "text-success-400"
                      : demand >= 10
                      ? "text-warning-400"
                      : "text-surface-200/40"
                  }`}
                >
                  {demand.toFixed(0)}% demand
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
