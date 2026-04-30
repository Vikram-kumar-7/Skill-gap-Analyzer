import { Zap } from "lucide-react";

export default function MissingSkillsTable({ skills, marketData, full = false }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="dash-card p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-14 h-14 rounded-2xl bg-success-500/15 flex items-center justify-center mb-3">
          <Zap size={24} className="text-success-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">Perfect Match!</h3>
        <p className="text-xs text-surface-200/50">Your resume covers all required skills.</p>
      </div>
    );
  }

  // Sort by ROI (highest first)
  const sortedSkills = [...skills].sort((a, b) => {
    const dataA = marketData?.find(m => m.skill.toLowerCase() === a.toLowerCase());
    const dataB = marketData?.find(m => m.skill.toLowerCase() === b.toLowerCase());
    return (dataB?.roi || 0) - (dataA?.roi || 0);
  });

  const displaySkills = full ? sortedSkills : sortedSkills.slice(0, 5);

  return (
    <div className="dash-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-semibold text-white">Top Missing Skills</h3>
        {!full && skills.length > 5 && (
          <button className="text-[11px] font-medium text-surface-200/60 hover:text-white px-2 py-1 rounded-md bg-white/5 border border-white/10 transition-colors">
            View All
          </button>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="pb-3 text-[11px] font-medium text-surface-200/50 uppercase tracking-wider">Skill</th>
              <th className="pb-3 text-[11px] font-medium text-surface-200/50 uppercase tracking-wider w-[40%]">Demand</th>
              <th className="pb-3 text-[11px] font-medium text-surface-200/50 uppercase tracking-wider text-right">ROI Score</th>
            </tr>
          </thead>
          <tbody className="stagger-children">
            {displaySkills.map((skill) => {
              const data = marketData?.find(m => m.skill.toLowerCase() === skill.toLowerCase());
              const demand = data?.demand || 0;
              const roi = data?.roi || 0;
              
              const colorClass = roi >= 50 ? "text-success-400 border-success-500/20" 
                               : roi >= 30 ? "text-primary-400 border-primary-500/20" 
                               : "text-warning-400 border-warning-500/20";
              const barClass = roi >= 50 ? "bg-success-400" 
                             : roi >= 30 ? "bg-primary-400" 
                             : "bg-warning-400";

              return (
                <tr key={skill} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <span className="text-[10px] font-bold text-white/70 uppercase">
                          {skill.substring(0, 2)}
                        </span>
                      </div>
                      <span className="text-[13px] font-medium text-white capitalize">{skill}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-surface-200/70 w-8">{Math.min(demand, 100).toFixed(0)}%</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(demand, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border bg-transparent ${colorClass}`}>
                      {roi.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
