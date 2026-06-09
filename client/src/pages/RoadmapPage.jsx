import { useState, useEffect } from "react";
import {
  Map as MapIcon, CheckCircle2, Lock, ChevronRight, ExternalLink, Clock,
  Star, TrendingUp, RotateCcw, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import { getRoadmapProgress, toggleSubTask, markRoadmapSkillComplete, setRoadmapStart, getRoadmapStart, getCurrentRoadmapWeek } from "../utils/store";
import { fireConfetti, fireBigConfetti } from "../utils/confetti";

function DifficultyStars({ level }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={10} className={i <= Math.round(level) ? "text-amber-400 fill-amber-400" : "text-white/10"} />
      ))}
    </span>
  );
}

function SubTaskList({ skill, subtasks, progress, onToggle, onComplete }) {
  const completedCount = subtasks.filter((_, i) => progress?.tasks?.[i]).length;
  const allDone = completedCount === subtasks.length;
  const pct = Math.round((completedCount / subtasks.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] text-surface-200/50">{pct}%</span>
      </div>
      {subtasks.map((task, i) => (
        <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={!!progress?.tasks?.[i]}
            onChange={() => onToggle(skill, i)}
            className="w-4 h-4 rounded border border-white/20 bg-transparent checked:bg-primary-500 checked:border-primary-500 appearance-none cursor-pointer relative
              after:content-['✓'] after:text-white after:text-[10px] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:opacity-0 checked:after:opacity-100"
          />
          <span className={`text-xs transition-colors ${progress?.tasks?.[i] ? "text-surface-200/40 line-through" : "text-surface-200/70 group-hover:text-white"}`}>
            {task}
          </span>
        </label>
      ))}
      {allDone && !progress?.completed && (
        <button onClick={() => onComplete(skill)}
          className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <CheckCircle2 size={14} /> Mark Skill Complete 🎉
        </button>
      )}
      {progress?.completed && (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          <CheckCircle2 size={14} /> Completed!
        </div>
      )}
    </div>
  );
}

function SkillCard({ skill, skillMeta, progress, onToggle, onComplete, isLocked }) {
  const [expanded, setExpanded] = useState(false);
  const subtasks = skillMeta?.subtasks || ["Learn fundamentals", "Build a project", "Practice exercises", "Review and test", "Apply in real scenario"];
  const hours = skillMeta?.hours || 30;

  return (
    <div className={`dash-card p-4 w-full overflow-hidden transition-all ${isLocked ? "opacity-40" : ""} ${progress?.completed ? "ring-1 ring-emerald-500/20" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isLocked && <Lock size={12} className="text-surface-200/40 shrink-0" />}
            <h4 className="text-sm font-semibold text-white truncate">{skill.skill}</h4>
            {progress?.completed && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-surface-200/50">
            <span className="flex items-center gap-1"><Clock size={10} />{skill.estimatedWeeks || `${hours}h`}</span>
            <DifficultyStars level={skill.difficulty} />
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${skill.roi >= 50 ? "bg-emerald-500/15 text-emerald-400" : skill.roi >= 20 ? "bg-amber-500/15 text-amber-400" : "bg-surface-200/10 text-surface-200/50"}`}>
              ROI {skill.roi}
            </span>
          </div>
        </div>
      </div>

      {/* Course links */}
      {skill.courses?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 my-2">
          {skill.courses.slice(0, 2).map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary-500/10 text-primary-400 text-[10px] font-medium hover:bg-primary-500/20 transition-colors">
              {c.platform} <ExternalLink size={8} />
            </a>
          ))}
        </div>
      )}

      <button onClick={() => !isLocked && setExpanded(!expanded)} disabled={isLocked}
        className="flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300 mt-2 disabled:opacity-40">
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? "Hide Tasks" : "Show Tasks"}
      </button>

      {expanded && !isLocked && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <SubTaskList skill={skill.skill} subtasks={subtasks} progress={progress} onToggle={onToggle} onComplete={onComplete} />
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage({ activeAnalysis, toast }) {
  const [progress, setProgress] = useState(getRoadmapProgress());
  const [skillsMeta, setSkillsMeta] = useState({});
  const currentWeek = getCurrentRoadmapWeek();

  useEffect(() => {
    if (!getRoadmapStart() && activeAnalysis?.roadmap) {
      setRoadmapStart(new Date().toISOString());
    }
    // Load skills meta
    fetch("/api/data/skills-meta").then(r => r.json()).then(d => setSkillsMeta(d.skillMeta || {})).catch(() => {});
  }, []);

  const roadmap = activeAnalysis?.roadmap || [];

  const handleToggle = (skill, taskIndex) => {
    toggleSubTask(skill, taskIndex);
    setProgress({ ...getRoadmapProgress() });
  };

  const handleComplete = (skill) => {
    markRoadmapSkillComplete(skill);
    setProgress({ ...getRoadmapProgress() });
    fireConfetti();
    toast?.(`🎉 Completed: ${skill}!`, "success");

    // Check if entire phase is done
    const phase = roadmap.find(p => p.skills.some(s => s.skill === skill));
    if (phase) {
      const allDone = phase.skills.every(s => getRoadmapProgress()[s.skill]?.completed);
      if (allDone) {
        setTimeout(() => fireBigConfetti(), 500);
        toast?.(`🏆 Phase complete! Amazing progress!`, "success");
      }
    }
  };

  if (!roadmap.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
          <MapIcon size={32} className="text-surface-200/20" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">No Roadmap Yet</h2>
        <p className="text-sm text-surface-200/50 max-w-xs text-center">Run an analysis first to generate your personalized learning roadmap.</p>
      </div>
    );
  }

  const phaseColors = [
    { bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/15", text: "text-blue-400", bar: "from-blue-500 to-blue-400" },
    { bg: "from-violet-500/10 to-violet-600/5", border: "border-violet-500/15", text: "text-violet-400", bar: "from-violet-500 to-violet-400" },
    { bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/15", text: "text-emerald-400", bar: "from-emerald-500 to-emerald-400" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page header row with week indicator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapIcon size={22} className="text-primary-400" /> Learning Roadmap
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-200/50 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">Week {currentWeek}/12</span>
          <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all" style={{ width: `${(currentWeek / 12) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Phase summary timeline — horizontal scroll strip above the kanban */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {roadmap.map((phase, pi) => {
          const color = phaseColors[pi] || phaseColors[0];
          const totalSkills = phase.skills.length;
          const doneSkills = phase.skills.filter(s => progress[s.skill]?.completed).length;
          const phasePct = totalSkills > 0 ? Math.round((doneSkills / totalSkills) * 100) : 0;
          return (
            <div key={pi} className={`flex-1 min-w-[200px] p-4 rounded-2xl bg-gradient-to-br ${color.bg} border ${color.border}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-semibold ${color.text}`}>Phase {pi + 1}</p>
                <span className="text-[10px] text-surface-200/50">Weeks {phase.timeline}</span>
              </div>
              <p className="text-sm font-medium text-white mb-3 line-clamp-1">{phase.phase.split(":")[1]?.trim() || phase.phase}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-500`} style={{ width: `${phasePct}%` }} />
                </div>
                <span className="text-[10px] text-surface-200/50">{doneSkills}/{totalSkills}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Kanban Board: 3 phase columns ── */}
      {/*
        Each roadmap phase is a column. Skills belong only to their phase.
        grid-cols-1 on mobile collapses to single-column stacked view.
        items-start prevents columns from stretching to match tallest sibling.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {roadmap.map((phase, pi) => {
          const color = phaseColors[pi] || phaseColors[0];
          return (
            /* Each column: flex-col, min-w-0 prevents flex blowout, overflow-hidden clips children */
            <div key={pi} className="flex flex-col gap-3 min-w-0 overflow-hidden">
              {/* Column header */}
              <div className={`p-3 rounded-xl bg-gradient-to-br ${color.bg} border ${color.border}`}>
                <span className={`text-xs font-bold ${color.text}`}>Phase {pi + 1}</span>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">
                  {phase.phase.split(":")[1]?.trim() || phase.phase}
                </p>
                <p className="text-[10px] text-surface-200/50 mt-0.5">Weeks {phase.timeline}</p>
              </div>

              {/* Skill cards for this phase ONLY */}
              {phase.skills.length === 0 ? (
                <p className="text-xs text-surface-200/30 text-center py-4">No skills in this phase</p>
              ) : (
                phase.skills.map((skill) => (
                  <SkillCard
                    key={skill.skill}
                    skill={skill}
                    skillMeta={skillsMeta[skill.skill.toLowerCase()]}
                    progress={progress[skill.skill]}
                    onToggle={handleToggle}
                    onComplete={handleComplete}
                    isLocked={false}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
