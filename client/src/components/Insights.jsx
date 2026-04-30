import {
  Brain,
  Sparkles,
  ThumbsUp,
  AlertCircle,
  FileEdit,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Code
} from "lucide-react";

export default function Insights({ insights, matched, missing }) {
  if (!insights) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-surface-200/50">No insights available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Source Badge */}
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            insights.source === "ai"
              ? "bg-accent-500/10 border border-accent-500/20 text-accent-400"
              : "bg-primary-500/10 border border-primary-500/20 text-primary-400"
          }`}
        >
          {insights.source === "ai" ? (
            <Sparkles size={12} />
          ) : (
            <Brain size={12} />
          )}
          {insights.source === "ai"
            ? "AI-Powered Analysis"
            : "Rule-Based Analysis"}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shrink-0">
            <Lightbulb size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              Overall Assessment
            </h3>
            <p className="text-sm text-surface-200/70 leading-relaxed">
              {insights.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        {insights.strengths && insights.strengths.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <ThumbsUp size={16} className="text-success-400" />
              Your Strengths
            </h3>
            <div className="space-y-2 stagger-children">
              {insights.strengths.map((strength, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-success-500/5 border border-success-500/10"
                >
                  <CheckCircle2
                    size={14}
                    className="text-success-400 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-surface-200/80">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {insights.improvements && insights.improvements.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-warning-400" />
              Areas to Improve
            </h3>
            <div className="space-y-2 stagger-children">
              {insights.improvements.map((improvement, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-warning-400/5 border border-warning-400/10"
                >
                  <XCircle
                    size={14}
                    className="text-warning-400 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-surface-200/80">{improvement}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Projects */}
      {insights.recommendedProjects && insights.recommendedProjects.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Code size={16} className="text-success-400" />
            Project Generator (Build to learn)
          </h3>
          <div className="space-y-4 stagger-children">
            {insights.recommendedProjects.map((proj, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-800/50 border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-semibold text-white">{proj.title}</h4>
                </div>
                <p className="text-xs text-surface-200/70 mb-3 leading-relaxed">{proj.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.focusSkills?.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-success-500/10 text-success-400 rounded text-[10px] uppercase font-bold tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Tips */}
        {insights.resumeTips && insights.resumeTips.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <FileEdit size={16} className="text-primary-400" />
              Resume Rewrite Tips
            </h3>
            <div className="space-y-3 stagger-children">
              {insights.resumeTips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <span className="text-xs font-bold text-primary-400 bg-primary-500/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-surface-200/70">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interview Prep */}
        {insights.interviewPrep && insights.interviewPrep.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-accent-400" />
              Targeted Interview Prep
            </h3>
            <div className="space-y-3 stagger-children">
              {insights.interviewPrep.map((item, i) => {
                const isObject = typeof item === 'object';
                const question = isObject ? item.question : item;
                const reason = isObject ? item.reason : null;
                
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/10"
                  >
                    <p className="text-sm font-medium text-white mb-1.5">{question}</p>
                    {reason && (
                      <p className="text-xs text-accent-400/80 flex items-center gap-1.5">
                        <Lightbulb size={12} />
                        {reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
