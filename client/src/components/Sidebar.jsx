import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Map,
  BarChart2,
  TrendingUp,
  FolderOpen,
  MessageSquare,
  Settings,
  X,
  Award,
} from 'lucide-react';
import { getUser } from '../utils/storage.js';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',         to: '/',             end: true },
  { icon: PlusCircle,      label: 'New Analysis',      to: '/new-analysis'           },
  { icon: FileText,        label: 'My Analyses',       to: '/analyses'               },
  { icon: Map,             label: 'Roadmap',           to: '/roadmap'                },
  { icon: BarChart2,       label: 'Skill Tracker',     to: '/skill-tracker'          },
  { icon: TrendingUp,      label: 'Career Simulator',  to: '/career-sim'             },
  { icon: FolderOpen,      label: 'Projects',          to: '/projects'               },
  { icon: MessageSquare,   label: 'Interview Prep',    to: '/interview'              },
  { icon: Award,           label: 'Placement',         to: '/placement'              },
  { icon: Settings,        label: 'Settings',          to: '/settings'               },
];

export default function Sidebar({ isOpen, onClose }) {
  const u = getUser() || {};
  const initials = u.name
    ? u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(3px)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[210px] h-screen transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.40)',
        }}
      >
        {/* ── Logo + close ── */}
        <div
          style={{
            padding: '18px 16px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {/* Logo mark */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.30)',
              }}
            >
              <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                SkillGap
              </div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'var(--accent-bright)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  opacity: 0.7,
                }}
              >
                ANALYZER
              </div>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center rounded-lg cursor-pointer"
            style={{
              minWidth: '36px',
              minHeight: '36px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              transition: 'background var(--dur-med) ease, color var(--dur-med) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav
          style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}
          aria-label="Main navigation"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '13px',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ── User section ── */}
        <div
          style={{
            flexShrink: 0,
            padding: '12px',
            borderTop: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: 0,
              padding: '8px 10px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 0 0 2px rgba(108,93,211,0.30)',
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {u.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-faint)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: '1px',
                }}
              >
                {u.course || 'No course set'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
