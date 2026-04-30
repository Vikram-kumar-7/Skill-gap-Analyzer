import { useState, useEffect, useMemo } from "react";
import {
  BarChart3, Search, Plus, AlertTriangle, CheckCircle2, Clock,
  BookOpen, TrendingUp, RefreshCcw, Flame, Filter
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  getSkillTracker, addSkill, updateSkill, getHeatmap, getStreak, recordHeatmapEntry
} from "../utils/store";

const CATEGORIES = ["All", "Frontend", "Backend", "Database", "DevOps", "Data & AI", "Mobile", "Testing", "Soft Skills", "Other"];
const STATUSES = ["All", "Not Started", "Learning", "Completed", "Needs Refresh"];
const PROFICIENCY = ["Beginner", "Intermediate", "Advanced", "Expert"];

function CategoryRing({ category, skills }) {
  const inCategory = skills.filter(s => s.category === category);
  const intermediate = inCategory.filter(s => ["Intermediate", "Advanced", "Expert"].includes(s.proficiency)).length;
  const pct = inCategory.length > 0 ? Math.round((intermediate / inCategory.length) * 100) : 0;
  const colors = { Frontend: "#60a5fa", Backend: "#a78bfa", DevOps: "#4ade80", "Data & AI": "#f472b6", Database: "#facc15", Mobile: "#38bdf8", Testing: "#fb923c", "Soft Skills": "#818cf8" };
  const color = colors[category] || "#94a3b8";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={[{ v: pct }, { v: 100 - pct }]} cx="50%" cy="50%" innerRadius={18} outerRadius={26} dataKey="v" startAngle={90} endAngle={-270} strokeWidth={0}>
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.04)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{pct}%</span>
      </div>
      <span className="text-[10px] text-surface-200/50 text-center">{category}</span>
    </div>
  );
}

function Heatmap() {
  const heatmap = getHeatmap();
  const streak = getStreak();
  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: heatmap[key] || 0 });
  }
  const max = Math.max(1, ...days.map(d => d.count));

  return (
    <div className="dash-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white">Activity Heatmap (90 days)</h3>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
            <Flame size={13} /> {streak}-day streak
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-[3px]">
        {days.map(d => {
          const intensity = d.count / max;
          const bg = d.count === 0 ? "bg-white/[0.03]" :
            intensity < 0.33 ? "bg-emerald-500/20" :
            intensity < 0.66 ? "bg-emerald-500/40" : "bg-emerald-500/70";
          return (
            <div key={d.date} className={`w-3 h-3 rounded-sm ${bg}`} title={`${d.date}: ${d.count} activities`} />
          );
        })}
      </div>
    </div>
  );
}

export default function SkillTrackerPage({ activeAnalysis, toast }) {
  const [skills, setSkills] = useState(getSkillTracker());
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newCat, setNewCat] = useState("Other");
  const [skillsMeta, setSkillsMeta] = useState({ categories: {} });

  useEffect(() => {
    fetch("/api/data/skills-meta").then(r => r.json()).then(d => setSkillsMeta(d)).catch(() => {});
  }, []);

  // Auto-populate from active analysis
  useEffect(() => {
    if (activeAnalysis && skills.length === 0) {
      const matched = (activeAnalysis.matched || []);
      const missing = (activeAnalysis.missing || []);
      const all = [];
      const cats = skillsMeta.categories || {};

      matched.forEach(s => {
        let cat = "Other";
        for (const [c, sk] of Object.entries(cats)) { if (sk.includes(s.toLowerCase())) { cat = c; break; } }
        all.push({ name: s, category: cat, proficiency: "Intermediate", status: "Completed", lastPracticed: new Date().toISOString() });
      });
      missing.forEach(s => {
        let cat = "Other";
        for (const [c, sk] of Object.entries(cats)) { if (sk.includes(s.toLowerCase())) { cat = c; break; } }
        all.push({ name: s, category: cat, proficiency: "Beginner", status: "Not Started" });
      });

      if (all.length > 0) {
        all.forEach(s => addSkill(s));
        setSkills(getSkillTracker());
      }
    }
  }, [activeAnalysis, skillsMeta]);

  // Skill decay check
  const decaySkills = useMemo(() => {
    const now = Date.now();
    return skills.filter(s => s.status === "Completed" && s.lastPracticed && (now - new Date(s.lastPracticed).getTime()) > 90 * 24 * 60 * 60 * 1000);
  }, [skills]);

  const filtered = useMemo(() => {
    return skills.filter(s => {
      if (catFilter !== "All" && s.category !== catFilter) return false;
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [skills, search, catFilter, statusFilter]);

  const handleAdd = () => {
    if (!newSkill.trim()) return;
    const success = addSkill({ name: newSkill.trim(), category: newCat });
    if (success) {
      setSkills(getSkillTracker());
      setNewSkill("");
      setShowAdd(false);
      toast?.(`Added skill: ${newSkill}`, "success");
    } else {
      toast?.("Skill already exists", "warning");
    }
  };

  const handleUpdate = (name, field, value) => {
    const updates = { [field]: value };
    if (field === "status" && value === "Completed") updates.lastPracticed = new Date().toISOString();
    if (field === "proficiency" || field === "status") { updates.lastPracticed = new Date().toISOString(); recordHeatmapEntry(); }
    updateSkill(name, updates);
    setSkills(getSkillTracker());
  };

  const uniqueCategories = [...new Set(skills.map(s => s.category))].filter(c => c !== "All");

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={22} className="text-primary-400" />
          Skill Tracker
          <span className="text-sm font-normal text-surface-200/50">({skills.length} skills)</span>
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500/20 text-primary-400 text-xs font-semibold hover:bg-primary-500/30 transition-colors"
        >
          <Plus size={14} /> Add Skill
        </button>
      </div>

      {/* Decay alert */}
      {decaySkills.length > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/15">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400 flex-1">{decaySkills.length} skill{decaySkills.length > 1 ? "s" : ""} may need refreshing (not practiced in 90+ days)</p>
          <button onClick={() => setStatusFilter("Needs Refresh")} className="text-xs text-amber-400 underline shrink-0">View</button>
        </div>
      )}

      {/* Category Rings */}
      {uniqueCategories.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {uniqueCategories.map(cat => (
            <button key={cat} onClick={() => setCatFilter(catFilter === cat ? "All" : cat)}>
              <CategoryRing category={cat} skills={skills} />
            </button>
          ))}
        </div>
      )}

      {/* Add Skill form */}
      {showAdd && (
        <div className="dash-card p-4 flex items-center gap-3 animate-fade-in flex-wrap">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Skill name..."
            className="flex-1 min-w-[160px] px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-surface-200/30 focus:outline-none focus:border-primary-500/50 transition-colors"
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <select
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none cursor-pointer"
          >
            {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-400 transition-colors">Add</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-200/40 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-surface-200/30 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none cursor-pointer">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none cursor-pointer">
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Skill Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Skill</th>
              <th className="hidden sm:table-cell">Category</th>
              <th className="text-center">Proficiency</th>
              <th className="text-center">Status</th>
              <th className="text-center hidden md:table-cell">Last Practiced</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(skill => {
              const statusColors = {
                "Not Started": "bg-surface-200/10 text-surface-200/60",
                "Learning": "bg-blue-500/10 text-blue-400",
                "Completed": "bg-emerald-500/10 text-emerald-400",
                "Needs Refresh": "bg-amber-500/10 text-amber-400",
              };
              return (
                <tr key={skill.name} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                  <td className="py-2.5 px-4 text-white font-medium">{skill.name}</td>
                  <td className="py-2.5 px-3 text-surface-200/60 text-xs hidden sm:table-cell">{skill.category}</td>
                  <td className="py-2.5 px-3 text-center">
                    <select value={skill.proficiency} onChange={e => handleUpdate(skill.name, "proficiency", e.target.value)}
                      className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-xs text-white focus:outline-none appearance-none cursor-pointer">
                      {PROFICIENCY.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <select value={skill.status} onChange={e => handleUpdate(skill.name, "status", e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium focus:outline-none appearance-none cursor-pointer border-0 ${statusColors[skill.status] || ""}`}>
                      {STATUSES.filter(s => s !== "All").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs text-surface-200/40 hidden md:table-cell">
                    {skill.lastPracticed ? new Date(skill.lastPracticed).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-surface-200/40">
            {search ? "No matching skills" : "No skills tracked yet"}
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="mt-5">
        <Heatmap />
      </div>
    </div>
  );
}
