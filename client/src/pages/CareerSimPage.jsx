import { useState, useEffect, useMemo } from "react";
import {
  Rocket, ToggleLeft, ToggleRight, Clock, DollarSign,
  TrendingUp, Save, Trash2, ArrowRight, Target, Zap
} from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { getScenarios, saveScenario, deleteScenario } from "../utils/store";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Engineer", "Data Scientist", "DevOps Engineer", "Mobile Developer", "ML Engineer"];

export default function CareerSimPage({ activeAnalysis, toast }) {
  const [toggled, setToggled] = useState({});
  const [targetRole, setTargetRole] = useState(activeAnalysis?.targetRole || "Full Stack Engineer");
  const [scenarios, setScenariosState] = useState(getScenarios());
  const [scenarioName, setScenarioName] = useState("");
  const [salaries, setSalaries] = useState({});

  const missing = activeAnalysis?.missing || [];
  const matched = activeAnalysis?.matched || [];
  const marketData = activeAnalysis?.marketData || [];

  useEffect(() => {
    fetch("/api/data/salaries").then(r => r.json()).then(d => setSalaries(d)).catch(() => {});
  }, []);

  const toggledSkills = Object.entries(toggled).filter(([, v]) => v).map(([k]) => k);
  const totalToggled = toggledSkills.length;
  const totalHours = toggledSkills.reduce((sum, sk) => {
    const md = marketData.find(m => m.skill === sk);
    return sum + (md ? md.difficulty * 15 : 30);
  }, 0);

  // Current match
  const total = matched.length + missing.length;
  const currentPct = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  // Projected match
  const projectedMatched = matched.length + totalToggled;
  const projectedPct = total > 0 ? Math.round((projectedMatched / total) * 100) : currentPct;

  // Salary estimation
  const currentSalary = useMemo(() => {
    let sum = 0, count = 0;
    matched.forEach(s => { if (salaries[s.toLowerCase()]) { sum += salaries[s.toLowerCase()].avgSalary; count++; } });
    return count > 0 ? Math.round(sum / count) : 90000;
  }, [matched, salaries]);

  const projectedSalary = useMemo(() => {
    let sum = 0, count = 0;
    [...matched, ...toggledSkills].forEach(s => { if (salaries[s.toLowerCase()]) { sum += salaries[s.toLowerCase()].avgSalary; count++; } });
    return count > 0 ? Math.round(sum / count) : currentSalary;
  }, [matched, toggledSkills, salaries, currentSalary]);

  // Hireability score
  const hireability = useMemo(() => {
    const avgDemand = toggledSkills.length > 0 ?
      toggledSkills.reduce((s, sk) => s + (marketData.find(m => m.skill === sk)?.demand || 20), 0) / toggledSkills.length : 30;
    const salaryGrowth = ((projectedSalary - currentSalary) / currentSalary) * 100;
    const roleMatch = projectedPct;
    return Math.min(100, Math.round(avgDemand * 0.4 + Math.min(30, salaryGrowth) * 0.3 + roleMatch * 0.3));
  }, [toggledSkills, marketData, projectedSalary, currentSalary, projectedPct]);

  // Time to job-ready
  const weeksToReady = Math.ceil(totalHours / 20);

  // Scatter plot data
  const scatterData = marketData.map(s => ({
    name: s.skill,
    difficulty: s.difficulty,
    salaryImpact: s.salary ? s.salary.avgSalary / 1000 : 80,
    demand: s.demand,
    quadrant: s.difficulty <= 3 && (s.salary?.avgSalary || 0) > 110000 ? "Quick Win" :
      s.difficulty > 3 && (s.salary?.avgSalary || 0) > 110000 ? "Long Haul" :
      s.difficulty <= 3 ? "Low Impact" : "Skip",
  }));

  const quadrantColors = { "Quick Win": "#4ade80", "Long Haul": "#60a5fa", "Low Impact": "#facc15", "Skip": "#f87171" };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) return;
    saveScenario({
      name: scenarioName,
      skills: toggledSkills,
      projectedMatch: projectedPct,
      projectedSalary,
      hireability,
      weeksToReady,
      role: targetRole,
    });
    setScenariosState(getScenarios());
    setScenarioName("");
    toast?.("Scenario saved!", "success");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Rocket size={22} className="text-primary-400" /> Career Simulator
      </h2>

      {/* Role Switcher */}
      <div className="dash-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <span className="text-xs text-surface-200/50 shrink-0">Target Role:</span>
          <select
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none cursor-pointer"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {targetRole !== (activeAnalysis?.targetRole || "") && (
            <span className="text-xs text-amber-400">⚠ Different from your analyzed role</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Skill Toggle Panel */}
        <div className="dash-card p-4">
          <h3 className="text-sm font-semibold text-white mb-1">Toggle Skills to Learn</h3>
          <p className="text-[11px] text-surface-200/50 mb-3">{totalToggled} selected • {totalHours} total hours</p>
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-hide">
            {missing.map(sk => (
              <button key={sk} onClick={() => setToggled(p => ({ ...p, [sk]: !p[sk] }))}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                  toggled[sk] ? "bg-primary-500/15 text-primary-400 border border-primary-500/20" : "bg-white/[0.02] text-surface-200/60 border border-white/[0.04] hover:bg-white/[0.04]"
                }`}>
                {toggled[sk] ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                <span className="flex-1">{sk}</span>
                {toggled[sk] && <Zap size={10} />}
              </button>
            ))}
            {missing.length === 0 && <p className="text-xs text-surface-200/40 text-center py-4">No missing skills. Run an analysis first.</p>}
          </div>
        </div>

        {/* Outcome Dashboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="dash-card p-4 text-center">
              <Target size={16} className="text-blue-400 mx-auto mb-2" />
              <p className="text-base font-bold text-white leading-tight">{currentPct}%<ArrowRight size={11} className="inline text-surface-200/30 mx-1" /><span className="text-emerald-400">{projectedPct}%</span></p>
              <p className="text-[10px] text-surface-200/50 mt-1">Match Score</p>
            </div>
            <div className="dash-card p-4 text-center">
              <DollarSign size={16} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-base font-bold text-white">${Math.round(projectedSalary / 1000)}k</p>
              <p className="text-[10px] text-surface-200/50 mt-1">Projected Salary</p>
            </div>
            <div className="dash-card p-4 text-center">
              <TrendingUp size={16} className="text-violet-400 mx-auto mb-2" />
              <p className="text-base font-bold text-white">{hireability}</p>
              <p className="text-[10px] text-surface-200/50 mt-1">Hireability Score</p>
            </div>
            <div className="dash-card p-4 text-center">
              <Clock size={16} className="text-amber-400 mx-auto mb-2" />
              <p className="text-base font-bold text-white">{weeksToReady} wks</p>
              <p className="text-[10px] text-surface-200/50 mt-1">Time to Ready</p>
            </div>
          </div>

          {/* Effort vs Reward Scatter */}
          {scatterData.length > 0 && (
            <div className="dash-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Effort vs Reward</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" dataKey="difficulty" name="Difficulty" domain={[0, 6]} tick={{ fill: "#94a3b8", fontSize: 10 }} label={{ value: "Learning Difficulty →", position: "bottom", fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis type="number" dataKey="salaryImpact" name="Salary (K)" tick={{ fill: "#94a3b8", fontSize: 10 }} label={{ value: "Salary Impact →", angle: -90, position: "left", fill: "#94a3b8", fontSize: 10 }} />
                  <ZAxis type="number" dataKey="demand" range={[40, 400]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#1e293b] border border-white/10 rounded-lg p-2.5 text-xs">
                          <p className="text-white font-semibold">{d.name}</p>
                          <p className="text-surface-200/60">Difficulty: {d.difficulty}/5 • Demand: {d.demand}%</p>
                          <p className="text-surface-200/60">Avg Salary: ${d.salaryImpact}K</p>
                          <p className={`font-medium mt-1`} style={{ color: quadrantColors[d.quadrant] }}>{d.quadrant}</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData}>
                    {scatterData.map((d, i) => <Cell key={i} fill={quadrantColors[d.quadrant]} fillOpacity={0.7} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {Object.entries(quadrantColors).map(([label, color]) => (
                  <span key={label} className="flex items-center gap-1.5 text-[10px] text-surface-200/50">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} /> {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Save Scenario */}
          <div className="dash-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Save Scenario</h3>
            <div className="flex items-center gap-2">
              <input
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                placeholder="Scenario name..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-surface-200/30 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
              <button
                onClick={handleSaveScenario}
                disabled={!scenarioName.trim() || totalToggled === 0}
                className="px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <Save size={13} /> Save
              </button>
            </div>

            {scenarios.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-2 text-surface-200/50 font-medium">Name</th>
                      <th className="text-center py-2 text-surface-200/50 font-medium">Match</th>
                      <th className="text-center py-2 text-surface-200/50 font-medium">Salary</th>
                      <th className="text-center py-2 text-surface-200/50 font-medium">Time</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(s => (
                      <tr key={s.id} className="border-b border-white/[0.03]">
                        <td className="py-2 text-white">{s.name}</td>
                        <td className="py-2 text-center text-emerald-400">{s.projectedMatch}%</td>
                        <td className="py-2 text-center text-surface-200/70">${Math.round(s.projectedSalary / 1000)}k</td>
                        <td className="py-2 text-center text-surface-200/70">{s.weeksToReady}w</td>
                        <td className="py-2 text-right">
                          <button onClick={() => { deleteScenario(s.id); setScenariosState(getScenarios()); }}
                            className="p-1 hover:text-red-400 text-surface-200/30"><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
