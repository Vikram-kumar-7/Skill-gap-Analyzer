import {
  LayoutDashboard,
  FileSearch,
  Map as MapIcon,
  BarChart3,
  Rocket,
  FolderCode,
  MessageSquare,
  Settings,
  Zap,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { id: "upload",    label: "New Analysis",     icon: Plus },
  { id: "analyses",  label: "My Analyses",      icon: FileSearch },
  { id: "roadmap",   label: "Roadmap",          icon: MapIcon },
  { id: "tracker",   label: "Skill Tracker",    icon: BarChart3 },
  { id: "simulator", label: "Career Simulator", icon: Rocket },
  { id: "projects",  label: "Projects",         icon: FolderCode },
  { id: "interview", label: "Interview Prep",   icon: MessageSquare },
  { id: "settings",  label: "Settings",         icon: Settings },
];

export default function Sidebar({ activeView, onNavigate, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`sidebar transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
              <Zap size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[13px] font-bold text-white tracking-tight leading-none truncate">SkillGap</h1>
              <p className="text-[9px] text-surface-200/50 tracking-widest uppercase">Analyzer</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-surface-200/50 hover:text-white hover:bg-white/[0.06] transition-colors"
            onClick={onMobileClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Keyboard shortcuts */}
        <div className="px-3 pb-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
            <p className="text-[10px] text-surface-200/40 leading-relaxed">
              <span className="text-surface-200/60 font-medium">Shortcuts: </span>
              N = New&nbsp;&nbsp;R = Roadmap&nbsp;&nbsp;T = Tracker&nbsp;&nbsp;I = Interview
            </p>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-3 pb-4">
          <button
            onClick={() => onNavigate("settings")}
            className="flex items-center gap-3 px-2.5 py-2 w-full rounded-xl hover:bg-white/[0.04] transition-colors min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AK
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-white truncate">Aryan Kumar</p>
              <p className="text-[10px] text-surface-200/50 truncate">aryan@example.com</p>
            </div>
            <ChevronDown size={13} className="text-surface-200/40 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
