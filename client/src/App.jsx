import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ToastContainer from "./components/ToastContainer";
import { useToast } from "./utils/useToast";
import { getUser, setUser, getSettings, setSettings, getActiveAnalysis, setActiveAnalysis, saveAnalysis, logActivity } from "./utils/store";

// Pages
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


function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [user, setUserState] = useState(getUser());
  const [settings, setSettingsState] = useState(getSettings());
  const [activeAnalysis, setActiveAnalysisState] = useState(getActiveAnalysis());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, toast, dismiss } = useToast();

  // Persist user changes
  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    setUserState(updated);
    setUser(data);
  }, [user]);

  // Persist settings changes
  const updateSettings = useCallback((data) => {
    const updated = { ...settings, ...data };
    setSettingsState(updated);
    setSettings(data);
  }, [settings]);

  // Handle analysis completion from UploadPage
  const handleAnalysisComplete = useCallback((data) => {
    const saved = saveAnalysis({
      ...data,
      targetRole: data.targetRole || user.targetRole,
      matchPercentage: data.matchPercentage || data.summary?.matchPercentage,
    });
    setActiveAnalysisState(saved);
    setActiveAnalysis(saved);
    setActiveView("dashboard");
    toast("Analysis complete! Viewing results.", "success");
  }, [user.targetRole, toast]);

  // Set active analysis
  const handleSetActive = useCallback((analysis) => {
    setActiveAnalysisState(analysis);
    setActiveAnalysis(analysis);
    toast("Set as active analysis", "success");
  }, [toast]);

  // Navigate
  const handleNavigate = useCallback((view) => {
    setActiveView(view);
    setSidebarOpen(false);
  }, []);

  // New analysis
  const handleNewAnalysis = useCallback(() => {
    setActiveView("upload");
    setSidebarOpen(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "n": handleNewAnalysis(); break;
        case "r": handleNavigate("roadmap"); break;
        case "t": handleNavigate("tracker"); break;
        case "i": handleNavigate("interview"); break;
        case "escape": break; // handled by modals
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNewAnalysis, handleNavigate]);

  // Init first-time user
  useEffect(() => {
    if (!user.name || user.name === "User") {
      updateUser({ name: "Aryan", email: "aryan@example.com", initials: "AK" });
    }
  }, []);

  const pageProps = {
    user,
    settings,
    activeAnalysis,
    toast,
    onNavigate: handleNavigate,
    onSetActive: handleSetActive,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d1a]">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset by sidebar width on desktop, full width on mobile */}
      <div
        className="main-content-area flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{ marginLeft: '220px' }}
      >
        <TopBar
          user={user}
          settings={settings}
          onToggleAi={() => updateSettings({ aiEnabled: !settings.aiEnabled })}
          onNewAnalysis={handleNewAnalysis}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page area — the ONLY scroll container; never overflows parent */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 xl:px-10 pt-6 pb-10">
          {activeView === "dashboard" && <DashboardPage {...pageProps} />}
          {activeView === "upload" && (
            <UploadPage
              onAnalysisComplete={handleAnalysisComplete}
              aiMode={settings.aiEnabled}
            />
          )}
          {activeView === "analyses" && <AnalysesPage {...pageProps} />}
          {activeView === "roadmap" && <RoadmapPage {...pageProps} />}
          {activeView === "tracker" && <SkillTrackerPage {...pageProps} />}
          {activeView === "simulator" && <CareerSimPage {...pageProps} />}
          {activeView === "projects" && <ProjectsPage {...pageProps} />}

          {activeView === "interview" && <InterviewPrepPage {...pageProps} />}
          {activeView === "settings" && (
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
