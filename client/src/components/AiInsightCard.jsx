import { Sparkles, ArrowRight } from "lucide-react";

export default function AiInsightCard({ insights, missing }) {
  // If we don't have AI insights, build a generic one from missing skills
  let content = "";
  if (insights?.summary) {
    // Truncate to fit card
    content = insights.summary.length > 200 ? insights.summary.substring(0, 197) + "..." : insights.summary;
  } else if (missing && missing.length > 0) {
    const topSkills = missing.slice(0, 2);
    content = `You have strong foundational skills! Focus on ${topSkills[0]} and ${topSkills[1] ? topSkills[1] : 'Cloud Technologies'} to significantly boost your profile. These skills have high market demand and excellent ROI.`;
  } else {
    content = "You have an excellent profile! Consider working on advanced architectural concepts or contributing to open source to stand out.";
  }

  // Highlight specific tech words like "System Design" or "Cloud Technologies"
  // For demonstration, we'll just boldly render the first two missing skills if they appear
  let renderContent = content;
  if (missing && missing.length > 0) {
    missing.slice(0, 3).forEach(skill => {
      // Very basic replace for bolding
      const regex = new RegExp(skill, 'gi');
      renderContent = renderContent.replace(regex, `<span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white font-semibold text-[11px]">${skill}</span>`);
    });
  }

  return (
    <div className="dash-card p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl group-hover:bg-accent-500/20 transition-all duration-500" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Sparkles size={16} className="text-accent-400" />
        <h3 className="text-[15px] font-semibold text-white">AI Career Insight</h3>
      </div>

      <div className="flex-1 relative z-10">
        <p className="text-sm text-surface-200/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContent }} />
      </div>

      <button className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-600/80 to-primary-600/80 hover:from-accent-500 hover:to-primary-500 text-white text-[13px] font-medium transition-all flex items-center justify-center gap-2 relative z-10">
        Ask AI Anything <ArrowRight size={14} />
      </button>
    </div>
  );
}
