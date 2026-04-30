import { Moon, Bell, Plus, BrainCircuit, Menu } from "lucide-react";

export default function TopBar({ user, settings, onToggleAi, onNewAnalysis, onMenuToggle }) {
  return (
    <header className="topbar">
      {/* Left — hamburger + welcome */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="btn-icon lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h2 className="text-base sm:text-[17px] font-semibold text-white leading-snug truncate">
            Welcome back, {user?.name || "User"}! 👋
          </h2>
          <p className="text-[11px] text-surface-200/50 hidden sm:block truncate">
            Track your progress and close the gap to land your dream role.
          </p>
        </div>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* AI toggle */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            settings?.aiEnabled
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-white/[0.04] border-white/[0.06] text-surface-200/50"
          }`}
        >
          <BrainCircuit size={13} />
          <span className="hidden sm:inline">AI {settings?.aiEnabled ? "ON" : "OFF"}</span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer shrink-0">
          {user?.initials || "U"}
        </div>

        {/* New Analysis */}
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-400 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Analysis</span>
        </button>
      </div>
    </header>
  );
}
