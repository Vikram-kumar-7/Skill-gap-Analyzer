import { Zap, ArrowLeft, BrainCircuit } from "lucide-react";

export default function Header({ onReset, showBack, aiMode, setAiMode }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-900/60 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={onReset}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-1"
                id="back-button"
              >
                <ArrowLeft size={20} className="text-surface-200" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  SkillGap
                </h1>
                <p className="text-[10px] text-surface-200/60 -mt-0.5 tracking-wider uppercase">
                  Analyzer
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAiMode(!aiMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                aiMode
                  ? "bg-success-500/10 border-success-500/20 text-success-400"
                  : "bg-surface-700/50 border-white/10 text-surface-200/50"
              }`}
            >
              <BrainCircuit size={14} />
              <span className="text-xs font-medium">AI Mode {aiMode ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
