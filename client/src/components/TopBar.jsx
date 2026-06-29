import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, Plus, Menu } from 'lucide-react';

const PAGE_TITLES = {
  '/':             { title: 'Dashboard',          subtitle: 'Your learning overview' },
  '/new-analysis': { title: 'New Analysis',       subtitle: 'Analyze your skill gap' },
  '/analyses':     { title: 'My Analyses',        subtitle: 'View and manage past results' },
  '/roadmap':      { title: 'Roadmap & Career Sim',subtitle: 'Your personalized skill path & earning potential' },
  '/dsa-tracker':  { title: 'DSA Tracker',        subtitle: 'Track and practice DSA problems' },
  '/interview':    { title: 'Interview Prep',     subtitle: 'Practice with AI-driven questions' },
  '/projects':     { title: 'Projects & Skills',  subtitle: 'Showcase your work and track skills' },
  '/placement':    { title: 'Placement Readiness',subtitle: 'Industry-ready assessment' },
  '/settings':     { title: 'Settings',           subtitle: 'Manage your account' },
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
        padding: '0 20px',
        height: '56px',
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Subtle accent line at very top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, var(--accent-glow) 40%, var(--accent-glow) 60%, transparent 100%)',
          opacity: 0.6,
        }}
      />

      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center rounded-lg cursor-pointer"
        style={{
          minWidth: '36px',
          minHeight: '36px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          transition: 'background var(--dur-med) ease, color var(--dur-med) ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
        aria-label="Open sidebar"
      >
        <Menu size={17} />
      </button>

      {/* Page info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className="hidden sm:block"
            style={{
              fontSize: '11px',
              color: 'var(--text-faint)',
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
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* AI ON badge */}
        <div
          className="hidden xs:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.20)',
            boxShadow: '0 0 8px rgba(16,185,129,0.10)',
          }}
        >
          <Zap size={9} color="#10b981" fill="#10b981" />
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, letterSpacing: '0.04em' }}>
            AI ON
          </span>
        </div>

        <button
          onClick={() => navigate('/new-analysis')}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            minHeight: '36px',
            borderRadius: '9px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#6ee7b7',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
          }}
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Analysis</span>
        </button>
      </div>
    </div>
  );
}
