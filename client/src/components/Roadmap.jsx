import { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  GraduationCap,
  Star,
  DollarSign,
  PlayCircle,
  CheckCircle2
} from "lucide-react";

export default function Roadmap({ roadmap }) {
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [learningSkills, setLearningSkills] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("skillgap_progress");
    if (saved) {
      try {
        setLearningSkills(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleLearning = (skillName) => {
    const updated = { ...learningSkills, [skillName]: !learningSkills[skillName] };
    setLearningSkills(updated);
    localStorage.setItem("skillgap_progress", JSON.stringify(updated));
  };

  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-success-500/15 flex items-center justify-center mb-3 mx-auto">
          <Zap size={24} className="text-success-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">
          No Gaps Found!
        </h3>
        <p className="text-sm text-surface-200/50">
          Your skills perfectly match the requirements.
        </p>
      </div>
    );
  }

  const phaseColors = [
    {
      bg: "from-primary-500/15 to-primary-600/5",
      border: "border-primary-500/20",
      badge: "bg-primary-500/15 text-primary-400",
      dot: "bg-primary-400",
      line: "from-primary-400 to-primary-600",
    },
    {
      bg: "from-accent-500/15 to-accent-600/5",
      border: "border-accent-500/20",
      badge: "bg-accent-500/15 text-accent-400",
      dot: "bg-accent-400",
      line: "from-accent-400 to-accent-600",
    },
    {
      bg: "from-success-500/15 to-success-600/5",
      border: "border-success-500/20",
      badge: "bg-success-500/15 text-success-400",
      dot: "bg-success-400",
      line: "from-success-400 to-success-600",
    },
  ];

  let totalSkills = 0;
  let learnedSkills = 0;
  roadmap.forEach(p => {
    totalSkills += p.skills.length;
    p.skills.forEach(s => {
      if (learningSkills[s.skill]) learnedSkills++;
    });
  });
  const totalProgress = totalSkills ? Math.round((learnedSkills / totalSkills) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Personalized Learning Roadmap
              </h3>
              <p className="text-xs text-surface-200/50">
                Skills prioritized by ROI score • Track your progress
              </p>
            </div>
          </div>
          <div className="bg-surface-800/50 px-4 py-2 rounded-xl border border-white/5 text-right">
            <div className="text-xs text-surface-200/50 uppercase tracking-wider mb-1">Overall Progress</div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-surface-900 rounded-full overflow-hidden">
                <div className="h-full bg-success-400 rounded-full transition-all duration-500" style={{ width: `${totalProgress}%` }} />
              </div>
              <span className="text-sm font-bold text-white">{totalProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary-500/30 via-accent-500/30 to-success-500/30 hidden sm:block" />

        <div className="space-y-4">
          {roadmap.map((phase, phaseIndex) => {
            const colors = phaseColors[phaseIndex] || phaseColors[0];
            const isExpanded = expandedPhase === phaseIndex;
            
            let phaseLearned = 0;
            phase.skills.forEach(s => {
              if (learningSkills[s.skill]) phaseLearned++;
            });

            return (
              <div key={phaseIndex} className="relative">
                {/* Phase dot */}
                <div
                  className={`absolute left-4 top-6 w-3 h-3 rounded-full ${colors.dot} ring-4 ring-surface-900 z-10 hidden sm:block`}
                />

                <div
                  className={`sm:ml-12 glass-card overflow-hidden transition-all duration-300`}
                >
                  {/* Phase Header */}
                  <button
                    onClick={() =>
                      setExpandedPhase(isExpanded ? -1 : phaseIndex)
                    }
                    className={`w-full flex items-center justify-between p-5 text-left bg-gradient-to-r ${colors.bg} hover:brightness-110 transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${colors.badge}`}
                      >
                        Weeks {phase.timeline}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {phase.phase}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-surface-200/50">
                            {phaseLearned} / {phase.skills.length} skills learned
                          </p>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-surface-200/50" />
                    ) : (
                      <ChevronDown size={18} className="text-surface-200/50" />
                    )}
                  </button>

                  {/* Phase Skills */}
                  {isExpanded && (
                    <div className="p-5 space-y-4 animate-fade-in">
                      {phase.skills.map((skill, skillIndex) => {
                        const isLearning = learningSkills[skill.skill];
                        
                        return (
                        <div
                          key={skillIndex}
                          className={`p-4 rounded-xl bg-white/[0.03] border transition-all ${isLearning ? 'border-success-500/30 bg-success-500/[0.02]' : 'border-white/5 hover:border-white/10'}`}
                        >
                          {/* Skill Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg ${colors.badge} flex items-center justify-center text-xs font-bold`}
                              >
                                {skillIndex + 1}
                              </div>
                              <div>
                                <h5 className="text-sm font-semibold text-white capitalize">
                                  {skill.skill}
                                </h5>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-surface-200/40 flex items-center gap-1">
                                    <Clock size={10} />
                                    {skill.estimatedWeeks}
                                  </span>
                                  <span className="text-xs text-surface-200/40">
                                    Difficulty: {skill.difficulty}/5
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <div
                                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                  skill.roi >= 50
                                    ? "bg-success-500/15 text-success-400"
                                    : skill.roi >= 30
                                    ? "bg-primary-500/15 text-primary-400"
                                    : "bg-white/5 text-surface-200/50"
                                }`}
                              >
                                ROI: {skill.roi}
                              </div>
                              <button 
                                onClick={() => toggleLearning(skill.skill)}
                                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded flex items-center gap-1 transition-all ${
                                  isLearning 
                                    ? "bg-success-500/20 text-success-400 hover:bg-success-500/30" 
                                    : "bg-surface-800 text-surface-200 hover:bg-surface-700 hover:text-white border border-white/5"
                                }`}
                              >
                                {isLearning ? <CheckCircle2 size={12}/> : <PlayCircle size={12}/>}
                                {isLearning ? "Completed" : "Mark Complete"}
                              </button>
                            </div>
                          </div>

                          {/* Courses */}
                          {skill.courses && skill.courses.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-surface-200/40 font-medium flex items-center gap-1.5">
                                <BookOpen size={12} />
                                Recommended Resources
                              </p>
                              {skill.courses.map((course, ci) => (
                                <a
                                  key={ci}
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Star
                                      size={12}
                                      className="text-warning-400 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs text-white font-medium truncate">
                                        {course.name}
                                      </p>
                                      <p className="text-[10px] text-surface-200/40">
                                        {course.platform} •{" "}
                                        {course.type === "free" ? (
                                          <span className="text-success-400">
                                            Free
                                          </span>
                                        ) : (
                                          <span className="text-warning-400">
                                            Paid
                                          </span>
                                        )}{" "}
                                        • {course.duration}
                                      </p>
                                    </div>
                                  </div>
                                  <ExternalLink
                                    size={12}
                                    className="text-surface-200/20 group-hover:text-primary-400 shrink-0 ml-2 transition-colors"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
