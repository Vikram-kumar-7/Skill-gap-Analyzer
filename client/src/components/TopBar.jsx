import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, Plus } from 'lucide-react';

const PAGE_TITLES = {
  '/':             { title: 'Dashboard',        subtitle: 'Your learning overview' },
  '/new-analysis': { title: 'New Analysis',     subtitle: 'Analyze your skill gap' },
  '/analyses':     { title: 'My Analyses',      subtitle: 'View and manage past results' },
  '/roadmap':      { title: 'Learning Roadmap', subtitle: 'Your personalized skill path' },
  '/skill-tracker':{ title: 'Skill Tracker',    subtitle: 'Track your progress' },
  '/career-sim':   { title: 'Career Simulator', subtitle: 'Explore earning potential' },
  '/projects':     { title: 'Projects',         subtitle: 'Showcase your work' },
  '/interview':    { title: 'Interview Prep',   subtitle: 'Practice with flashcards' },
  '/settings':     { title: 'Settings',         subtitle: 'Manage your account' },
};

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { title, subtitle } = PAGE_TITLES[pathname] || { title: 'SkillGap Analyzer', subtitle: '' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '0 20px', height: '52px', flexShrink: 0,
      background: '#0a1020',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Page info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{subtitle}</div>
        )}
      </div>

      {/* Right side */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* AI ON badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '8px', padding: '4px 10px',
        }}>
          <Zap size={10} color="#10b981" fill="#10b981" />
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>AI ON</span>
        </div>

        {/* New Analysis button */}
        <button
          onClick={() => navigate('/new-analysis')}
          className="btn-primary"
          style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
        >
          <Plus size={13} />
          New Analysis
        </button>
      </div>
    </div>
  );
}
