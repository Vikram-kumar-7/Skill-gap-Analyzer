import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, Plus, Menu } from 'lucide-react';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Your learning overview' },
  '/new-analysis': { title: 'New Analysis', subtitle: 'Analyze your skill gap' },
  '/analyses': { title: 'My Analyses', subtitle: 'View and manage past results' },
  '/roadmap': { title: 'Learning Roadmap', subtitle: 'Your personalized skill path' },
  '/skill-tracker': { title: 'Skill Tracker', subtitle: 'Track your progress' },
  '/career-sim': { title: 'Career Simulator', subtitle: 'Explore earning potential' },
  '/projects': { title: 'Projects', subtitle: 'Showcase your work' },
  '/interview': { title: 'Interview Prep', subtitle: 'Practice with flashcards' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account' },
};

export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { title, subtitle } = PAGE_TITLES[pathname] || { title: 'SkillGap Analyzer', subtitle: '' };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        height: '52px',
        flexShrink: 0,
        background: '#0a1020',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Hamburger Menu Toggle on Mobile/Tablet */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center p-1 text-white/50 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
        style={{ minWidth: '44px', minHeight: '44px' }}
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Page info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'white',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className="hidden sm:block"
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.35)',
              marginTop: '1px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* AI ON badge - hidden on smaller mobile screens */}
        <div
          className="hidden xs:flex items-center gap-1.5 bg-green-500/10 border border-green-500/25 rounded-lg px-2 py-1"
        >
          <Zap size={9} color="#10b981" fill="#10b981" />
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>AI ON</span>
        </div>

        {/* New Analysis button */}
        <button
          onClick={() => navigate('/new-analysis')}
          className="btn-primary"
          style={{
            padding: '7px 12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            minHeight: '44px', // ensure 44px tap target height
          }}
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Analysis</span>
        </button>
      </div>
    </div>
  );
}
