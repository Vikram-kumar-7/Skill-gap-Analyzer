import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Agentation } from 'agentation';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import GetStarted from './pages/GetStarted.jsx';
import SaveProgress from './pages/SaveProgress.jsx';
import CheckEmail from './pages/CheckEmail.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NewAnalysisPage from './pages/NewAnalysisPage.jsx';
import AnalysesPage from './pages/AnalysesPage.jsx';
import RoadmapPage from './pages/RoadmapPage.jsx';
import SkillTrackerPage from './pages/SkillTrackerPage.jsx';
import CareerSimPage from './pages/CareerSimPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PlacementPage from './pages/PlacementPage.jsx';
import { supabase } from './utils/supabase';
import { syncRemoteToLocal } from './utils/storage.js';

function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      id="app-shell"
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--color-base)',
      }}
    >
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div
        id="main"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <TopBar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main
          id="page-area"
          className="p-4 md:p-6"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
          }}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/new-analysis" element={<NewAnalysisPage />} />
            <Route path="/analyses" element={<AnalysesPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/skill-tracker" element={<SkillTrackerPage />} />
            <Route path="/career-sim" element={<CareerSimPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/placement" element={<PlacementPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('sga_user') || 'null');
      return u && !u.onboardingTemp ? u : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const u = JSON.parse(localStorage.getItem('sga_user') || 'null');
        setUser(u && !u.onboardingTemp ? u : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const currentLocal = JSON.parse(localStorage.getItem('sga_user') || '{}');
        const profile = {
          name: u.user_metadata?.name || currentLocal.name || u.email?.split('@')[0] || 'User',
          course: u.user_metadata?.course || currentLocal.course || '',
          targetRole: u.user_metadata?.target_role || currentLocal.targetRole || '',
          email: u.email,
          createdAt: currentLocal.createdAt || Date.now(),
        };
        localStorage.setItem('sga_user', JSON.stringify(profile));
        setUser(profile);

        // Sync details to Supabase 'users' table
        try {
          await supabase.from('users').upsert({
            id: u.id,
            email: u.email,
            name: profile.name,
            course: profile.course,
            target_role: profile.targetRole,
            updated_at: new Date().toISOString(),
          });
          syncRemoteToLocal();
        } catch (err) {
          console.error('Failed to sync profile to Supabase users table:', err.message);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('sga_user');
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          <Route path="/*" element={<AppShell />} />
        ) : (
          <>
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/save-progress" element={<SaveProgress />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="*" element={<Navigate to="/get-started" replace />} />
          </>
        )}
      </Routes>
      {import.meta.env.DEV && <Agentation />}
    </BrowserRouter>
  );
}
