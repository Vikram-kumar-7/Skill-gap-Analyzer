import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function RoadmapProgress({ roadmap }) {
  const [learningSkills, setLearningSkills] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("skillgap_progress");
    if (saved) {
      try {
        setLearningSkills(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  let totalSkills = 0;
  let learnedSkills = 0;
  
  // Find current phase based on first uncompleted skill
  let currentPhase = null;
  let phaseTotal = 0;
  let phaseLearned = 0;

  if (roadmap) {
    roadmap.forEach(p => {
      totalSkills += p.skills.length;
      let phaseCompletedCount = 0;
      
      p.skills.forEach(s => {
        if (learningSkills[s.skill]) {
          learnedSkills++;
          phaseCompletedCount++;
        }
      });

      // If phase is not fully complete and we haven't set a current phase yet
      if (phaseCompletedCount < p.skills.length && !currentPhase) {
        currentPhase = p.phase;
        phaseTotal = p.skills.length;
        phaseLearned = phaseCompletedCount;
      }
    });

    // If all complete, set to last phase
    if (!currentPhase && roadmap.length > 0) {
      const last = roadmap[roadmap.length - 1];
      currentPhase = last.phase;
      phaseTotal = last.skills.length;
      phaseLearned = last.skills.length;
    }
  }

  const totalProgress = totalSkills ? Math.round((learnedSkills / totalSkills) * 100) : 0;
  
  // Total weeks
  const totalWeeks = roadmap?.reduce((acc, p) => acc + parseInt(p.timeline), 0) || 0;
  const weeksCompleted = totalSkills ? Math.round((learnedSkills / totalSkills) * totalWeeks) : 0;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Top Card: My Roadmap Progress */}
      <div className="dash-card p-6 flex-1">
        <h3 className="text-[15px] font-semibold text-white mb-5">My Roadmap Progress</h3>
        
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[11px] font-medium text-white">Overall Progress</span>
            <span className="text-xl font-bold text-accent-400">{totalProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-800 overflow-hidden mb-2 border border-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500" style={{ width: `${totalProgress}%` }} />
          </div>
          <p className="text-[10px] text-surface-200/50">{weeksCompleted} of {totalWeeks} weeks completed</p>
        </div>

        {/* Current Phase */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mt-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[11px] font-medium text-surface-200/60 mb-0.5">Current Phase</p>
              <p className="text-[12px] font-medium text-white">Complete the high ROI skills first</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-warning-400 bg-warning-500/10 border border-warning-500/20">
              {currentPhase || "Phase 1: Foundation"}
            </span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[11px] text-surface-200/60">{phaseLearned} / {phaseTotal} skills completed</p>
            <span className="text-surface-200/30">›</span>
          </div>
        </div>
      </div>

      {/* Bottom Card: Recent Activity */}
      <div className="dash-card p-6">
        <h3 className="text-[15px] font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <CheckCircle2 size={14} className="text-success-400" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-white">Analysis completed for <br/><span className="font-semibold">Target Role</span></p>
            </div>
            <span className="text-[10px] text-surface-200/50 shrink-0">Just now</span>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <CheckCircle2 size={14} className="text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-white">Roadmap generated</p>
            </div>
            <span className="text-[10px] text-surface-200/50 shrink-0">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
