import { Medal, Award, Code, CheckCircle, XCircle } from "lucide-react";

export default function Benchmark({ benchmark, resumeSkills }) {
  if (!benchmark) return null;

  // Calculate tool overlap
  const userTools = resumeSkills.map(s => s.toLowerCase());
  const benchmarkTools = benchmark.tools.map(s => s.toLowerCase());
  
  const toolsMatched = benchmarkTools.filter(t => userTools.includes(t));
  const toolsMissing = benchmarkTools.filter(t => !userTools.includes(t));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Medal className="text-warning-400" />
          Top 10% Candidates Benchmark
        </h3>
        <p className="text-sm text-surface-200/60 mb-6">
          Comparing your profile against the top 10% of candidates applying for <strong className="text-white">{benchmark.role}</strong> positions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Experience & Projects */}
          <div className="space-y-4">
            <div className="bg-surface-800/50 rounded-2xl p-5 border border-white/5">
              <h4 className="text-xs font-semibold text-surface-200/50 uppercase tracking-wider mb-4">Profile Metrics</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Award size={16} className="text-primary-400" />
                    Required Experience
                  </div>
                  <span className="text-sm font-medium text-white bg-white/10 px-2 py-1 rounded">{benchmark.experience}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Code size={16} className="text-accent-400" />
                    Average Portfolio Projects
                  </div>
                  <span className="text-sm font-medium text-white bg-white/10 px-2 py-1 rounded">{benchmark.projects}+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Tools Comparison */}
          <div className="bg-surface-800/50 rounded-2xl p-5 border border-white/5">
            <h4 className="text-xs font-semibold text-surface-200/50 uppercase tracking-wider mb-4">Core Tech Stack (Top Candidates)</h4>
            
            <div className="space-y-3">
              {benchmark.tools.map((tool, idx) => {
                const hasTool = userTools.includes(tool.toLowerCase());
                return (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">{tool}</span>
                    {hasTool ? (
                      <span className="flex items-center gap-1 text-xs text-success-400 bg-success-500/10 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> You have this
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-danger-400 bg-danger-500/10 px-2 py-1 rounded-full">
                        <XCircle size={12} /> Missing
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-sm text-surface-200/70">
                You possess <strong className="text-white">{toolsMatched.length} out of {benchmark.tools.length}</strong> core tools used by top candidates.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
