import { useState } from "react";
import { Zap, User, BookOpen, ArrowRight, Sparkles, Target, Map, BarChart3 } from "lucide-react";

const COURSE_SUGGESTIONS = [
  "B.Tech CSE", "B.Tech IT", "B.Tech ECE", "B.Tech EEE",
  "MCA", "MBA", "BCA", "BSc Computer Science",
  "M.Tech CSE", "MSc Data Science", "BBA", "B.Com",
];

export default function LoginPage({ onLogin }) {
  const [name, setName]     = useState("");
  const [course, setCourse] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim())   { setError("Please enter your name."); return; }
    if (!course.trim()) { setError("Please enter your course."); return; }

    setLoading(true);
    // Small animation delay for feel
    setTimeout(() => {
      const userData = {
        name: name.trim(),
        course: course.trim(),
        initials: name.trim().slice(0, 2).toUpperCase(),
        email: "",
        targetRole: "Full Stack Engineer",
        experienceLevel: "Fresher",
      };
      localStorage.setItem("skillgap_user", JSON.stringify(userData));
      onLogin(userData);
    }, 600);
  };

  const features = [
    { icon: Target,   label: "Skill Gap Analysis",    desc: "AI-powered resume analysis" },
    { icon: Map,      label: "Learning Roadmap",      desc: "3-phase personalized plan" },
    { icon: BarChart3, label: "Skill Tracker",        desc: "Track your progress daily" },
  ];

  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center animate-fade-in-up">

        {/* ── Left: branding + feature list ── */}
        <div className="hidden lg:flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">SkillGap</h1>
              <p className="text-[10px] text-surface-200/50 tracking-widest uppercase">Analyzer</p>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Bridge the gap between<br />
              <span className="gradient-text">you and your dream role.</span>
            </h2>
            <p className="text-surface-200/60 text-base leading-relaxed">
              Upload your resume, analyze skill gaps against real job descriptions, and follow a personalized learning roadmap to land your next role.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary-500/20 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-surface-200/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-surface-200/30">
            100% free · All data stored locally · No signup required
          </p>
        </div>

        {/* ── Right: login card ── */}
        <div className="w-full">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">SkillGap Analyzer</h1>
            </div>
          </div>

          <div className="glass-card p-8">
            {/* Card header */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-4">
                <Sparkles size={12} /> Welcome
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Let's get started</h3>
              <p className="text-sm text-surface-200/50">Tell us a little about yourself to personalize your experience.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-surface-200/70 mb-2 uppercase tracking-wider">
                  <User size={12} className="text-primary-400" /> Your Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(""); }}
                  placeholder="e.g. Vikram Kumar"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-surface-200/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Course field with datalist */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-surface-200/70 mb-2 uppercase tracking-wider">
                  <BookOpen size={12} className="text-accent-400" /> Course / Programme
                </label>
                <input
                  id="login-course"
                  type="text"
                  list="course-list"
                  value={course}
                  onChange={e => { setCourse(e.target.value); setError(""); }}
                  placeholder="e.g. B.Tech CSE, MBA, BCA…"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-surface-200/30 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all"
                />
                <datalist id="course-list">
                  {COURSE_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
                <p className="text-[11px] text-surface-200/40 mt-1.5">Used to personalise your dashboard subtitle</p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  loading
                    ? "bg-white/5 text-surface-200/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg hover:shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Setting up your dashboard…
                  </>
                ) : (
                  <>Get Started <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="text-[11px] text-surface-200/30 text-center mt-5">
              No account needed · Data stays in your browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
