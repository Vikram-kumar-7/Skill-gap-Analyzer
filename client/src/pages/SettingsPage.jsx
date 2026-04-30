import { useState } from "react";
import {
  Settings, User, Brain, Bell, Database, Palette, Info,
  Download, Upload, Trash2, AlertTriangle, Key, Check, X,
  Monitor, Moon, Sun, HardDrive
} from "lucide-react";
import { exportAllData, importAllData, clearSection, getStorageUsage } from "../utils/store";

const ACCENT_COLORS = [
  { name: "Purple", value: "purple", color: "#a78bfa" },
  { name: "Blue", value: "blue", color: "#60a5fa" },
  { name: "Green", value: "green", color: "#4ade80" },
  { name: "Orange", value: "orange", color: "#fb923c" },
  { name: "Rose", value: "rose", color: "#fb7185" },
  { name: "Cyan", value: "cyan", color: "#22d3ee" },
];

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Engineer", "Data Scientist", "DevOps Engineer", "Mobile Developer", "ML Engineer", "Security Engineer", "Cloud Architect"];
const EXP_LEVELS = ["Fresher", "1-3 yrs", "3-5 yrs", "5+ yrs"];

function Section({ icon: Icon, title, children }) {
  return (
    <div className="dash-card p-5 mb-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <Icon size={15} className="text-primary-400" /> {title}
      </h3>
      {children}
    </div>
  );
}

export default function SettingsPage({ user, settings, onUpdateUser, onUpdateSettings, toast }) {
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(null);

  const storageUsed = getStorageUsage();
  const storageKB = (storageUsed / 1024).toFixed(1);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `skillgap_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    toast?.("Data exported!", "success");
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      importAllData(data);
      setImportText("");
      setShowImport(false);
      toast?.("Data imported! Refresh to see changes.", "success");
    } catch {
      toast?.("Invalid JSON data", "error");
    }
  };

  const handleClear = (section) => {
    clearSection(section);
    setConfirmReset(null);
    toast?.(`${section} data cleared`, "info");
  };

  return (
    <div className="animate-fade-in-up max-w-2xl">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
        <Settings size={22} className="text-primary-400" /> Settings
      </h2>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-surface-200/50 uppercase mb-1 block">Name</label>
            <input value={user.name || ""} onChange={e => onUpdateUser({ name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-primary-500/40" />
          </div>
          <div>
            <label className="text-[10px] text-surface-200/50 uppercase mb-1 block">Email</label>
            <input value={user.email || ""} onChange={e => onUpdateUser({ email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-primary-500/40" />
          </div>
          <div>
            <label className="text-[10px] text-surface-200/50 uppercase mb-1 block">Avatar Initials</label>
            <input value={user.initials || ""} onChange={e => onUpdateUser({ initials: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-primary-500/40" />
          </div>
          <div>
            <label className="text-[10px] text-surface-200/50 uppercase mb-1 block">Target Role</label>
            <select value={user.targetRole || ""} onChange={e => onUpdateUser({ targetRole: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none appearance-none cursor-pointer">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-surface-200/50 uppercase mb-1 block">Experience Level</label>
            <select value={user.experienceLevel || ""} onChange={e => onUpdateUser({ experienceLevel: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none appearance-none cursor-pointer">
              {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-surface-200/50 uppercase mb-1 block">Location</label>
            <input value={user.location || ""} onChange={e => onUpdateUser({ location: e.target.value })} placeholder="City, Country"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-surface-200/30 focus:outline-none focus:border-primary-500/40" />
          </div>
        </div>
      </Section>

      {/* AI Settings */}
      <Section icon={Brain} title="AI Settings">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
            <div>
              <p className="text-sm text-white">AI Mode</p>
              <p className="text-[11px] text-surface-200/50">Using GPT-4o-mini. No key? Rule-based engine activates.</p>
            </div>
            <button onClick={() => onUpdateSettings({ aiEnabled: !settings.aiEnabled })}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.aiEnabled ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.04] text-surface-200/50"}`}>
              {settings.aiEnabled ? "ON" : "OFF"}
            </button>
          </div>
          <div>
            <label className="text-[10px] text-surface-200/50 uppercase mb-1 flex items-center gap-1">
              <Key size={10} /> OpenAI API Key
            </label>
            <div className="flex gap-2">
              <input type="password" value={settings.apiKey || ""} onChange={e => onUpdateSettings({ apiKey: e.target.value })}
                placeholder="sk-..." className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-surface-200/30 focus:outline-none font-mono" />
              {settings.apiKey && (
                <button onClick={() => onUpdateSettings({ apiKey: "" })} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20">Clear</button>
              )}
            </div>
            <p className="text-[10px] text-surface-200/40 mt-1">Stored locally. Never sent to our backend. Only used for direct API calls.</p>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-surface-200/50 mb-2">Accent Color</p>
            <div className="flex gap-2">
              {ACCENT_COLORS.map(c => (
                <button key={c.value} onClick={() => onUpdateSettings({ accentColor: c.value })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${settings.accentColor === c.value ? "border-white scale-110" : "border-transparent"}`}
                  style={{ background: c.color }} title={c.name} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Reduce Animations</p>
              <p className="text-[11px] text-surface-200/50">Accessibility: disable animations</p>
            </div>
            <button onClick={() => onUpdateSettings({ reduceAnimations: !settings.reduceAnimations })}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium ${settings.reduceAnimations ? "bg-amber-500/15 text-amber-400" : "bg-white/[0.04] text-surface-200/50"}`}>
              {settings.reduceAnimations ? "ON" : "OFF"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Font Size</p>
              <p className="text-[11px] text-surface-200/50">Normal or Large</p>
            </div>
            <select value={settings.fontSize || "normal"} onChange={e => onUpdateSettings({ fontSize: e.target.value })}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white appearance-none cursor-pointer">
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Data Management */}
      <Section icon={Database} title="Data Management">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            <HardDrive size={16} className="text-surface-200/40" />
            <div className="flex-1">
              <p className="text-xs text-white">Storage Usage</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, (storageUsed / (5 * 1024 * 1024)) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-surface-200/50">{storageKB}KB / 5MB</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium hover:bg-primary-500/20">
              <Download size={13} /> Export All Data
            </button>
            <button onClick={() => setShowImport(!showImport)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/[0.04] text-surface-200/60 text-xs font-medium hover:bg-white/[0.08]">
              <Upload size={13} /> Import Data
            </button>
          </div>

          {showImport && (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={4} placeholder="Paste exported JSON here..."
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-surface-200/30 focus:outline-none resize-none font-mono mb-2" />
              <button onClick={handleImport} className="px-4 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold">Import & Restore</button>
            </div>
          )}

          <div className="border-t border-white/[0.04] pt-3">
            <p className="text-xs text-surface-200/50 mb-2">Reset Sections</p>
            <div className="flex flex-wrap gap-2">
              {["analyses", "roadmap", "tracker", "interview", "resume", "projects"].map(section => (
                <div key={section}>
                  {confirmReset === section ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleClear(section)} className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-medium">Confirm</button>
                      <button onClick={() => setConfirmReset(null)} className="px-2 py-1 rounded bg-white/[0.04] text-surface-200/50 text-[10px]">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmReset(section)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] text-surface-200/50 text-[10px] hover:bg-red-500/10 hover:text-red-400 transition-colors capitalize">
                      {section}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setConfirmReset(confirmReset === "all" ? null : "all")}
              className="mt-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] hover:bg-red-500/20 flex items-center gap-1">
              <Trash2 size={10} /> {confirmReset === "all" ? (
                <span onClick={() => handleClear("all")}>Click again to confirm FULL RESET</span>
              ) : "Full Reset"}
            </button>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section icon={Info} title="About">
        <div className="space-y-2 text-xs text-surface-200/60">
          <p><span className="text-white font-medium">SkillGap Analyzer</span> v2.0.0</p>
          <p>Built with React, Vite, Tailwind CSS, Recharts, Lucide React, Node.js, Express</p>
          <p>100% free. No paywalls. All features unlocked.</p>
          <p className="text-surface-200/40 mt-3">All data stored locally in your browser. No external database.</p>
        </div>
      </Section>
    </div>
  );
}
