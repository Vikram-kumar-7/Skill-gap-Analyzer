import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, FileText, Map,
  BarChart2, TrendingUp, FolderOpen, MessageSquare, Settings, Zap,
} from 'lucide-react';
import { getUser } from '../utils/storage.js';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',       to: '/',              end: true },
  { icon: PlusCircle,      label: 'New Analysis',    to: '/new-analysis' },
  { icon: FileText,        label: 'My Analyses',     to: '/analyses' },
  { icon: Map,             label: 'Roadmap',         to: '/roadmap' },
  { icon: BarChart2,       label: 'Skill Tracker',   to: '/skill-tracker' },
  { icon: TrendingUp,      label: 'Career Simulator',to: '/career-sim' },
  { icon: FolderOpen,      label: 'Projects',        to: '/projects' },
  { icon: MessageSquare,   label: 'Interview Prep',  to: '/interview' },
  { icon: Settings,        label: 'Settings',        to: '/settings' },
];

export default function Sidebar() {
  const u = getUser() || {};
  const initials = u.name
    ? u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '200px', height: '100vh', flexShrink: 0,
      background: '#0a1020',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Zap size={16} color="white" fill="white" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>SkillGap</div>
          <div style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ANALYZER</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ icon: Icon, label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '9px',
              width: '100%', marginBottom: '2px',
              textDecoration: 'none',
              color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'background 0.15s, color 0.15s',
              minWidth: 0,
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.style.background.includes('99,102,241,0.15')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes('99,102,241,0.15')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }
            }}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{
        flexShrink: 0, padding: '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: 'white',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.course || 'No course set'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
