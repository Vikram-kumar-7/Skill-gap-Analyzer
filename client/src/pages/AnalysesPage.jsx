import { useState, useMemo } from "react";
import {
  FileSearch, Trash2, Eye, CheckCircle, Search, ArrowUpDown,
  BarChart3, TrendingUp, X, ChevronRight, Copy, Target,
  GitCompare, Calendar, Sparkles
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { getAnalyses, deleteAnalysis, setActiveAnalysis } from "../utils/store";

const COLORS = ["#60a5fa", "#f87171", "#a78bfa"];

function AnalysisCard({ analysis, isActive, onView, onSetActive, onDelete }) {
  const date = new Date(analysis.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const pct = analysis.matchPercentage || analysis.summary?.matchPercentage || 0;
  const color = pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400";

  return (
    <div className={`dash-card p-4 overflow-hidden ${isActive ? "ring-1 ring-primary-500/40" : ""}`}>
      {/* Header: title + match % — match badge never squishes the title */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{analysis.targetRole || "Analysis"}</p>
          <p className="text-[11px] text-surface-200/50 flex items-center gap-1 mt-0.5">
            <Calendar size={10} /> {date}
          </p>
        </div>
        <span className={`text-xl font-bold shrink-0 ${color}`}>{pct}%</span>
      </div>

      {/* Missing skill pills — wrap gracefully, never overflow card */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(analysis.missing || []).slice(0, 3).map(s => (
          <span key={s} className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium">{s}</span>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 border-t border-white/[0.04] pt-3">
        <button onClick={() => onView(analysis)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium hover:bg-primary-500/20 transition-colors">
          <Eye size={12} /> View
        </button>
        <button onClick={() => onSetActive(analysis)} disabled={isActive}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-surface-200/60 hover:bg-white/[0.08]"}`}>
          <CheckCircle size={12} /> {isActive ? "Active" : "Set Active"}
        </button>
        <button onClick={() => onDelete(analysis.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-200/40 hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Full Report Modal ──
function ReportModal({ analysis, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!analysis) return null;

  const matched = analysis.matched || [];
  const missing = analysis.missing || [];
  const marketData = analysis.marketData || [];
  const insights = analysis.insights || {};
  const total = matched.length + missing.length;

  const donutData = [
    { name: "Matched", value: matched.length },
    { name: "Missing", value: missing.length },
  ];

  const barData = marketData.slice(0, 10).map(s => ({
    name: s.skill?.length > 12 ? s.skill.substring(0, 12) + "…" : s.skill,
    demand: s.demand,
    roi: s.roi,
  }));

  const handleCopy = () => {
    const text = `SkillGap Analysis — ${analysis.targetRole}\nMatch: ${analysis.matchPercentage}%\nMatched Skills: ${matched.join(", ")}\nMissing Skills: ${missing.join(", ")}`;
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "skills", label: "Skill Breakdown" },
    { id: "market", label: "Market Data" },
    { id: "ai", label: "AI Feedback" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-box animate-fade-in-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
          <div>
            <h2 className="text-lg font-bold text-white">{analysis.targetRole}</h2>
            <p className="text-xs text-surface-200/50">
              {new Date(analysis.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white/[0.04] text-surface-200/50 hover:text-white transition-colors" title="Copy summary">
              <Copy size={15} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04] text-surface-200/50 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar mx-5 mt-4">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? "active" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 min-h-[300px]">
          {tab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {donutData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  <span className="text-[11px] text-surface-200/60 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Matched ({matched.length})</span>
                  <span className="text-[11px] text-surface-200/60 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Missing ({missing.length})</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-3">Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-surface-200/60">Match Score</span><span className="text-white font-semibold">{analysis.matchPercentage}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-surface-200/60">Total Skills Needed</span><span className="text-white font-semibold">{total}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-surface-200/60">Skills You Have</span><span className="text-emerald-400 font-semibold">{matched.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-surface-200/60">Skills to Learn</span><span className="text-red-400 font-semibold">{missing.length}</span></div>
                </div>
              </div>
            </div>
          )}

          {tab === "skills" && (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-4 text-surface-200/50 font-semibold text-xs uppercase tracking-wide">Skill</th>
                    <th className="text-center py-3 px-4 text-surface-200/50 font-semibold text-xs uppercase tracking-wide">Have It</th>
                    <th className="text-center py-3 px-4 text-surface-200/50 font-semibold text-xs uppercase tracking-wide">Demand</th>
                    <th className="text-center py-3 px-4 text-surface-200/50 font-semibold text-xs uppercase tracking-wide">ROI</th>
                    <th className="text-center py-3 px-4 text-surface-200/50 font-semibold text-xs uppercase tracking-wide">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {matched.map(s => (
                    <tr key={s} className="border-b border-white/[0.03]">
                      <td className="py-2 px-3 text-white">{s}</td>
                      <td className="py-2 px-3 text-center"><CheckCircle size={14} className="text-emerald-400 mx-auto" /></td>
                      <td className="py-2 px-3 text-center text-surface-200/60">—</td>
                      <td className="py-2 px-3 text-center text-surface-200/60">—</td>
                      <td className="py-2 px-3 text-center text-surface-200/60">—</td>
                    </tr>
                  ))}
                  {marketData.map(s => (
                    <tr key={s.skill} className="border-b border-white/[0.03]">
                      <td className="py-2 px-3 text-white">{s.skill}</td>
                      <td className="py-2 px-3 text-center"><X size={14} className="text-red-400 mx-auto" /></td>
                      <td className="py-2 px-3 text-center text-surface-200/70">{s.demand}%</td>
                      <td className="py-2 px-3 text-center"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.roi >= 50 ? "bg-emerald-500/15 text-emerald-400" : s.roi >= 20 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>{s.roi}</span></td>
                      <td className="py-2 px-3 text-center text-surface-200/70">{s.difficulty}/5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "market" && (
            <div>
              <p className="text-sm font-semibold text-white mb-4">Top 10 In-Demand Skills for This Role</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#e2e8f0", fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="demand" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={16} name="Demand %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === "ai" && (
            <div className="space-y-4">
              {insights.summary && <p className="text-sm text-surface-200/80">{insights.summary}</p>}
              {insights.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-2">Strengths</p>
                  <ul className="space-y-1">{insights.strengths.map((s, i) => <li key={i} className="text-sm text-surface-200/70 flex items-start gap-2"><CheckCircle size={13} className="text-emerald-400 mt-0.5 shrink-0" />{s}</li>)}</ul>
                </div>
              )}
              {insights.improvements?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-2">Improvements</p>
                  <ul className="space-y-1">{insights.improvements.map((s, i) => <li key={i} className="text-sm text-surface-200/70 flex items-start gap-2"><TrendingUp size={13} className="text-amber-400 mt-0.5 shrink-0" />{s}</li>)}</ul>
                </div>
              )}
              {insights.resumeTips?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-400 mb-2">Resume Tips</p>
                  <ul className="space-y-1">{insights.resumeTips.map((s, i) => <li key={i} className="text-sm text-surface-200/70 flex items-start gap-2"><Sparkles size={13} className="text-blue-400 mt-0.5 shrink-0" />{s}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Compare Modal ──
function CompareModal({ a, b, onClose }) {
  if (!a || !b) return null;
  const aPct = a.matchPercentage || a.summary?.matchPercentage || 0;
  const bPct = b.matchPercentage || b.summary?.matchPercentage || 0;
  const delta = bPct - aPct;
  const aDate = new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const bDate = new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const aMissing = new Set(a.missing || []);
  const bMissing = new Set(b.missing || []);
  const gained = [...aMissing].filter(s => !bMissing.has(s));
  const stillMissing = [...bMissing].filter(s => aMissing.has(s));

  return (
    <div className="modal-overlay">
      <div className="modal-box animate-fade-in-up p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitCompare size={18} className="text-primary-400" /> Compare Analyses
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04] text-surface-200/50"><X size={16} /></button>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-surface-200/50 mb-1">Progress since {aDate}</p>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-3xl font-bold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>{delta >= 0 ? "+" : ""}{delta}%</span>
            <span className="text-sm text-surface-200/50">match improvement</span>
          </div>
          {gained.length > 0 && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">+{gained.length} skills gained</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xs text-surface-200/50 mb-1">{aDate} — {a.targetRole}</p>
            <p className="text-2xl font-bold text-white">{aPct}%</p>
            <p className="text-xs text-surface-200/50 mt-1">{(a.missing||[]).length} missing skills</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xs text-surface-200/50 mb-1">{bDate} — {b.targetRole}</p>
            <p className="text-2xl font-bold text-white">{bPct}%</p>
            <p className="text-xs text-surface-200/50 mt-1">{(b.missing||[]).length} missing skills</p>
          </div>
        </div>

        {gained.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-emerald-400 mb-2">Skills Gained</p>
            <div className="flex flex-wrap gap-1.5">{gained.map(s => <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">{s}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──
export default function AnalysesPage({ activeAnalysis, onSetActive, toast }) {
  const [analyses, setAnalysesState] = useState(getAnalyses());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [viewingReport, setViewingReport] = useState(null);
  const [compareSelection, setCompareSelection] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const handleDelete = (id) => {
    deleteAnalysis(id);
    setAnalysesState(getAnalyses());
    toast?.("Analysis deleted", "info");
  };

  const sorted = useMemo(() => {
    let list = analyses.filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (a.targetRole || "").toLowerCase().includes(q) ||
        (a.missing || []).some(s => s.toLowerCase().includes(q)) ||
        (a.matched || []).some(s => s.toLowerCase().includes(q));
    });
    list.sort((a, b) => {
      if (sort === "date") return new Date(b.date) - new Date(a.date);
      if (sort === "match") return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      if (sort === "title") return (a.targetRole || "").localeCompare(b.targetRole || "");
      return 0;
    });
    return list;
  }, [analyses, search, sort]);

  const toggleCompare = (analysis) => {
    setCompareSelection(prev => {
      if (prev.find(a => a.id === analysis.id)) return prev.filter(a => a.id !== analysis.id);
      if (prev.length >= 2) return [prev[1], analysis];
      return [...prev, analysis];
    });
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileSearch size={22} className="text-primary-400" />
          My Analyses
          <span className="text-sm font-normal text-surface-200/50">({analyses.length})</span>
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-200/40 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-44 pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-surface-200/30 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="date">Newest</option>
            <option value="match">Match %</option>
            <option value="title">Title</option>
          </select>
          {compareSelection.length === 2 && (
            <button
              onClick={() => setShowCompare(true)}
              className="px-3 py-2 rounded-xl bg-primary-500/20 text-primary-400 text-xs font-semibold hover:bg-primary-500/30 transition-colors flex items-center gap-1.5"
            >
              <GitCompare size={13} /> Compare
            </button>
          )}
        </div>
      </div>

      {/* Compare hint */}
      {compareSelection.length > 0 && compareSelection.length < 2 && (
        <div className="mb-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10 text-xs text-primary-400">
          Select {2 - compareSelection.length} more analysis to compare
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <FileSearch size={40} className="text-surface-200/20 mx-auto mb-3" />
          <p className="text-sm text-surface-200/40">{search ? "No matching analyses" : "No analyses yet. Run your first analysis!"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(a => (
            <div key={a.id} className="relative">
              <button
                onClick={() => toggleCompare(a)}
                className={`absolute top-3 right-3 z-10 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                  compareSelection.find(c => c.id === a.id)
                    ? "bg-primary-500 border-primary-500"
                    : "border-white/20 hover:border-primary-400"
                }`}
              >
                {compareSelection.find(c => c.id === a.id) && <CheckCircle size={12} className="text-white" />}
              </button>
              <AnalysisCard
                analysis={a}
                isActive={activeAnalysis?.id === a.id}
                onView={setViewingReport}
                onSetActive={onSetActive}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>

      {viewingReport && <ReportModal analysis={viewingReport} onClose={() => setViewingReport(null)} />}
      {showCompare && <CompareModal a={compareSelection[0]} b={compareSelection[1]} onClose={() => setShowCompare(false)} />}
    </>
  );
}
