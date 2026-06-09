import { useState, useEffect } from "react";
import {
  Target, TrendingUp, BookOpen, Brain, Rocket, Sparkles,
  Clock, CheckCircle2, BarChart3, ChevronRight, Activity,
  FileSearch, MessageSquare, FolderCode, ExternalLink,
  ChevronDown, ChevronUp, Zap, Map as MapIcon
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import {
  getCompletedSkillsCount, getCurrentRoadmapWeek, getInterviewCount,
  getActivityLog, getDailyTip, setDailyTip, isTipFresh, getSettings
} from "../utils/store";
import axios from "axios";

// ── Hero Stat Card ──
function StatCard({ icon: Icon, label, value, sub, color, pulse }) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400",
    green: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
    purple: "from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400",
    red: "from-red-500/20 to-red-600/10 border-red-500/20 text-red-400",
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${colorMap[color]} border ${pulse ? "animate-pulse-subtle" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        {sub && <span className="text-[11px] text-surface-200/50">{sub}</span>}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white mb-1 animate-count-up">{value}</p>
      <p className="text-xs text-surface-200/50">{label}</p>
    </div>
  );
}

// ── Radar Chart Widget ──
function SkillRadar({ activeAnalysis, onNavigate }) {
  const radarData = [
    { axis: "Technical Skills", you: 0, benchmark: 85 },
    { axis: "Tools & DevOps", you: 0, benchmark: 70 },
    { axis: "Soft Skills", you: 0, benchmark: 60 },
    { axis: "Domain Knowledge", you: 0, benchmark: 75 },
    { axis: "Project Experience", you: 0, benchmark: 80 },
    { axis: "Certifications", you: 0, benchmark: 50 },
  ];

  if (activeAnalysis) {
    const matched = activeAnalysis.matched || [];
    const total = (activeAnalysis.matched?.length || 0) + (activeAnalysis.missing?.length || 0);
    const pct = total > 0 ? Math.round((matched.length / total) * 100) : 0;
    radarData[0].you = Math.min(100, pct + 10);
    radarData[1].you = Math.min(100, pct - 5);
    radarData[2].you = Math.min(100, 50 + Math.random() * 30);
    radarData[3].you = Math.min(100, pct);
    radarData[4].you = Math.min(100, pct - 10);
    radarData[5].you = Math.min(100, 30 + Math.random() * 20);
  }

  return (
    <div className="dash-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Target size={15} className="text-blue-400" />
          Skill Gap Radar
        </h3>
        <button onClick={() => onNavigate("tracker")} className="text-[11px] text-primary-400 hover:text-primary-300 flex items-center gap-1">
          View Tracker <ChevronRight size={12} />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
          <Radar name="Your Profile" dataKey="you" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} strokeWidth={2} />
          <Radar name="Benchmark" dataKey="benchmark" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-surface-200/60">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Your Profile
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-surface-200/60">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> Target Benchmark
        </span>
      </div>
    </div>
  );
}

// ── Weekly Focus Panel ──
function WeeklyFocus({ activeAnalysis, onNavigate }) {
  const skills = activeAnalysis?.roadmap?.[0]?.skills?.slice(0, 3) || [];

  if (!skills.length) {
    return (
      <div className="dash-card p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Zap size={15} className="text-amber-400" />
          Weekly Focus
        </h3>
        <div className="text-center py-8">
          <p className="text-sm text-surface-200/50 mb-3">Run an analysis to get weekly focus skills</p>
          <button onClick={() => onNavigate("upload")} className="px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium hover:bg-primary-500/30 transition-colors">
            New Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-card p-5">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <Zap size={15} className="text-amber-400" />
        Weekly Focus — Phase 1 Priority
      </h3>
      <div className="space-y-3">
        {skills.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-bold">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{s.skill}</p>
              <p className="text-[11px] text-surface-200/50">
                {s.estimatedWeeks} • Difficulty {s.difficulty}/5 • ROI {s.roi}
              </p>
            </div>
            {s.courses?.[0]?.url && (
              <a href={s.courses[0].url} target="_blank" rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-primary-500/15 text-primary-400 text-[11px] font-medium hover:bg-primary-500/25 transition-colors flex items-center gap-1">
                Learn <ExternalLink size={10} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Daily Brief ──
function AiDailyBrief({ activeAnalysis, settings }) {
  const [tip, setTip] = useState(getDailyTip()?.tip || "");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTipFresh() && getDailyTip()?.tip) {
      setTip(getDailyTip().tip);
      return;
    }
    fetchTip();
  }, []);

  async function fetchTip() {
    setLoading(true);
    const week = getCurrentRoadmapWeek();
    try {
      if (settings?.aiEnabled) {
        const { data } = await axios.post("/api/ai/daily-tip", {
          week,
          topMissingCategory: "Technical",
          targetRole: activeAnalysis?.targetRole || "Full Stack Engineer",
          matchPercentage: activeAnalysis?.matchPercentage || 50,
          apiKey: settings?.apiKey || "",
        });
        if (data.tip) {
          setTip(data.tip);
          setDailyTip({ tip: data.tip });
          setLoading(false);
          return;
        }
      }
    } catch {}
    // Fallback
    const fallbacks = [
      "Focus on one high-ROI skill today. Depth beats breadth in the early weeks.",
      "Review your skill gaps and pick the one that appears most in job postings.",
      "Build something small today — even 30 minutes of coding compounds over time.",
      "Check your roadmap progress. Are you on track for this week's goals?",
      "Practice one interview question today. Consistency builds confidence.",
    ];
    const fb = fallbacks[week % fallbacks.length];
    setTip(fb);
    setDailyTip({ tip: fb });
    setLoading(false);
  }

  return (
    <div className="dash-card p-5">
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-between w-full mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles size={15} className="text-violet-400" />
          AI Daily Brief
        </h3>
        {collapsed ? <ChevronDown size={14} className="text-surface-200/40" /> : <ChevronUp size={14} className="text-surface-200/40" />}
      </button>
      {!collapsed && (
        <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
          {loading ? (
            <div className="skeleton h-12 w-full" />
          ) : (
            <p className="text-sm text-surface-200/80 leading-relaxed">{tip}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Activity Timeline ──
function ActivityTimeline() {
  const log = getActivityLog().slice(0, 8);
  const iconMap = {
    analysis: FileSearch,
    skill: BarChart3,
    skill_complete: CheckCircle2,
    interview: MessageSquare,
    project: FolderCode,
    default: Activity,
  };
  const colorMap = {
    analysis: "text-blue-400 bg-blue-500/10",
    skill: "text-cyan-400 bg-cyan-500/10",
    skill_complete: "text-emerald-400 bg-emerald-500/10",
    interview: "text-amber-400 bg-amber-500/10",
    project: "text-violet-400 bg-violet-500/10",
    default: "text-surface-200/50 bg-white/5",
  };

  return (
    <div className="dash-card p-5">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <Activity size={15} className="text-cyan-400" />
        Activity Timeline
      </h3>
      {log.length === 0 ? (
        <p className="text-sm text-surface-200/40 text-center py-6">No activity yet. Start an analysis!</p>
      ) : (
        /* max-height + overflow-y auto keeps the timeline contained — never pushes sibling panels */
        <div className="space-y-2.5 overflow-y-auto scrollbar-hide" style={{ maxHeight: '320px' }}>
          {log.map((entry) => {
            const Icon = iconMap[entry.type] || iconMap.default;
            const color = colorMap[entry.type] || colorMap.default;
            const time = new Date(entry.timestamp);
            const relative = getRelativeTime(time);
            return (
              <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white leading-snug truncate">{entry.message}</p>
                  <p className="text-[10px] text-surface-200/40 mt-0.5">{relative}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Quick Actions ──
function QuickActions({ onNavigate }) {
  const actions = [
    { label: "New Analysis", icon: FileSearch, view: "upload", color: "bg-blue-500/10 text-blue-400 border-blue-500/15" },
    { label: "Continue Roadmap", icon: MapIcon, view: "roadmap", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" },
    { label: "Practice Interview", icon: MessageSquare, view: "interview", color: "bg-amber-500/10 text-amber-400 border-amber-500/15" },
    { label: "Build Project", icon: FolderCode, view: "projects", color: "bg-violet-500/10 text-violet-400 border-violet-500/15" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={() => onNavigate(a.view)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] min-w-0 overflow-hidden ${a.color}`}
        >
          <a.icon size={20} className="shrink-0" />
          <span className="text-xs font-medium text-center">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Helpers ──
function getRelativeTime(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Main Dashboard ──
export default function DashboardPage({ activeAnalysis, settings, onNavigate }) {
  const matchPct = activeAnalysis?.matchPercentage || activeAnalysis?.summary?.matchPercentage || 0;
  const skillsAcquired = getCompletedSkillsCount();
  const roadmapWeek = getCurrentRoadmapWeek();
  const interviewCount = getInterviewCount();

  const matchColor = matchPct >= 70 ? "green" : matchPct >= 40 ? "amber" : "red";

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Stats — always 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Target}       label="Skill Match"          value={`${matchPct}%`}      sub="Latest"  color={matchColor} pulse={matchPct > 80} />
        <StatCard icon={CheckCircle2} label="Skills Acquired"      value={skillsAcquired}      sub="All time" color="green" />
        <StatCard icon={Clock}        label="Roadmap Week"         value={`${roadmapWeek}/12`} sub="Active"   color="purple" />
        <StatCard icon={Brain}        label="Interviews Practiced" value={interviewCount}       sub="Total"   color="blue" />
      </div>

      {/* Radar + Right panel (Weekly Focus + AI Brief) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — Skill Gap Radar */}
        <div className="min-w-0 overflow-hidden">
          <SkillRadar activeAnalysis={activeAnalysis} onNavigate={onNavigate} />
        </div>
        {/* Right — stacked panels; flex-col so they stack cleanly */}
        <div className="flex flex-col gap-4 min-w-0 overflow-hidden">
          <WeeklyFocus activeAnalysis={activeAnalysis} onNavigate={onNavigate} />
          <AiDailyBrief activeAnalysis={activeAnalysis} settings={settings} />
        </div>
      </div>

      {/* Quick Actions (2/3) + Activity Timeline (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 min-w-0">
          <QuickActions onNavigate={onNavigate} />
        </div>
        <div className="min-w-0 overflow-hidden">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
