import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import TopBar  from './components/TopBar.jsx';
import LoginPage        from './pages/LoginPage.jsx';
import DashboardPage    from './pages/DashboardPage.jsx';
import NewAnalysisPage  from './pages/NewAnalysisPage.jsx';
import AnalysesPage     from './pages/AnalysesPage.jsx';
import RoadmapPage      from './pages/RoadmapPage.jsx';
import SkillTrackerPage from './pages/SkillTrackerPage.jsx';
import CareerSimPage    from './pages/CareerSimPage.jsx';
import ProjectsPage     from './pages/ProjectsPage.jsx';
import InterviewPage    from './pages/InterviewPage.jsx';
import SettingsPage     from './pages/SettingsPage.jsx';

function AppShell() {
  return (
    <div id="app-shell" style={{
      display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', background: '#080d1a',
    }}>
      <Sidebar />
      <div id="main" style={{
        flex: 1, minWidth: 0, display: 'flex',
        flexDirection: 'column', height: '100vh', overflow: 'hidden',
      }}>
        <TopBar />
        <main id="page-area" style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '24px', minHeight: 0,
        }}>
          <Routes>
            <Route path="/"               element={<DashboardPage />} />
            <Route path="/new-analysis"   element={<NewAnalysisPage />} />
            <Route path="/analyses"       element={<AnalysesPage />} />
            <Route path="/roadmap"        element={<RoadmapPage />} />
            <Route path="/skill-tracker"  element={<SkillTrackerPage />} />
            <Route path="/career-sim"     element={<CareerSimPage />} />
            <Route path="/projects"       element={<ProjectsPage />} />
            <Route path="/interview"      element={<InterviewPage />} />
            <Route path="/settings"       element={<SettingsPage />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sga_user') || 'null'); }
    catch { return null; }
  });

  useEffect(() => {
    const onStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem('sga_user') || 'null')); }
      catch { setUser(null); }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <BrowserRouter>
      {user ? <AppShell /> : <LoginPage onLogin={setUser} />}
    </BrowserRouter>
  );
}
