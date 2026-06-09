import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ToastContainer from "./components/ToastContainer";
import { useToast } from "./utils/useToast";
import { getUser, setUser, getSettings, setSettings, getActiveAnalysis, setActiveAnalysis, saveAnalysis, logActivity } from "./utils/store";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnalysesPage from "./pages/AnalysesPage";
import UploadPage from "./pages/UploadPage";
import RoadmapPage from "./pages/RoadmapPage";
import SkillTrackerPage from "./pages/SkillTrackerPage";
import CareerSimPage from "./pages/CareerSimPage";
import ProjectsPage from "./pages/ProjectsPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import SettingsPage from "./pages/SettingsPage";

import "./App.css";

// ── Read login state from localStorage ──────────────────────────────────────
function getLoginUser() {
  try {
    const raw = localStorage.getItem("skillgap_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Must have at least a name
    if (!parsed?.name || parsed.name === "User") return null;
    return parsed;
  } catch {
    return null;
  }
}

function App() {
  const [loggedIn, setLoggedIn]           = useState(() => !!getLoginUser());
  const [activeView, setActiveView]       = useState("dashboard");
  const [user, setUserState]              = useState(() => {
    const lu = getLoginUser();
    return lu || getUser();
  });
  const [settings, setSettingsState]      = useState(getSettings());
  const [activeAnalysis, setActiveAnalysisState] = useState(getActiveAnalysis());
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const { toasts, toast, dismiss }        = useToast();

  // ── Login handler called by LoginPage ──────────────────────────────────────
  const handleLogin = useCallback((userData) => {
    // Merge login data into the app user store as well
    const merged = {
      ...getUser(),
      name:            userData.name,
      course:          userData.course,
      initials:        userData.initials || userData.name.slice(0, 2).toUpperCase(),
      email:           userData.email || "",
      targetRole:      userData.targetRole || "Full Stack Engineer",
      experienceLevel: userData.experienceLevel || "Fresher",
    };
    setUser(merged);
    setUserState(merged);
    setLoggedIn(true);
  }, []);

  // ── Persist user changes ───────────────────────────────────────────────────
  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    // Keep localStorage login record in sync
    const loginRaw = localStorage.getItem("skillgap_user");
    if (loginRaw) {
      try {
        const loginData = JSON.parse(loginRaw);
        localStorage.setItem("skillgap_user", JSON.stringify({ ...loginData, ...data }));
      } catch {}
    }
    setUserState(updated);
    setUser(data);
  }, [user]);

  // ── Persist settings changes ───────────────────────────────────────────────
  const updateSettings = useCallback((data) => {
    const updated = { ...settings, ...data };
    setSettingsState(updated);
    setSettings(data);
  }, [settings]);

  // ── Handle analysis completion from UploadPage ─────────────────────────────
  const handleAnalysisComplete = useCallback((data) => {
    const saved = saveAnalysis({
      ...data,
      targetRole:       data.targetRole || user.targetRole,
      matchPercentage:  data.matchPercentage || data.summary?.matchPercentage,
    });
    setActiveAnalysisState(saved);
    setActiveAnalysis(saved);
    setActiveView("dashboard");
    toast("Analysis complete! Viewing results.", "success");
  }, [user.targetRole, toast]);

  // ── Set active analysis ────────────────────────────────────────────────────
  const handleSetActive = useCallback((analysis) => {
    setActiveAnalysisState(analysis);
    setActiveAnalysis(analysis);
    toast("Set as active analysis", "success");
  }, [toast]);

  // ── Navigate ───────────────────────────────────────────────────────────────
  const handleNavigate = useCallback((view) => {
    setActiveView(view);
    setSidebarOpen(false);
  }, []);

  // ── New analysis shortcut ──────────────────────────────────────────────────
  const handleNewAnalysis = useCallback(() => {
    setActiveView("upload");
    setSidebarOpen(false);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loggedIn) return;
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "n": handleNewAnalysis(); break;
        case "r": handleNavigate("roadmap"); break;
        case "t": handleNavigate("tracker"); break;
        case "i": handleNavigate("interview"); break;
        default: break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loggedIn, handleNewAnalysis, handleNavigate]);

  const pageProps = {
    user,
    settings,
    activeAnalysis,
    toast,
    onNavigate:   handleNavigate,
    onSetActive:  handleSetActive,
  };

  // ── Login gate ─────────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <ToastContainer toasts={toasts} dismiss={dismiss} />
      </>
    );
  }

  // ── Main App ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#080d1a]">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div
        className="main-content-area flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{ marginLeft: "220px" }}
      >
        <TopBar
          user={user}
          settings={settings}
          onToggleAi={() => updateSettings({ aiEnabled: !settings.aiEnabled })}
          onNewAnalysis={handleNewAnalysis}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page scroll area — the ONLY scroll container */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 xl:px-10 pt-6 pb-10">
          {activeView === "dashboard"  && <DashboardPage  {...pageProps} />}
          {activeView === "upload"     && (
            <UploadPage
              onAnalysisComplete={handleAnalysisComplete}
              aiMode={settings.aiEnabled}
            />
          )}
          {activeView === "analyses"   && <AnalysesPage   {...pageProps} />}
          {activeView === "roadmap"    && <RoadmapPage    {...pageProps} />}
          {activeView === "tracker"    && <SkillTrackerPage {...pageProps} />}
          {activeView === "simulator"  && <CareerSimPage   {...pageProps} />}
          {activeView === "projects"   && <ProjectsPage    {...pageProps} />}
          {activeView === "interview"  && <InterviewPrepPage {...pageProps} />}
          {activeView === "settings"   && (
            <SettingsPage
              {...pageProps}
              onUpdateUser={updateUser}
              onUpdateSettings={updateSettings}
            />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

export default App;
