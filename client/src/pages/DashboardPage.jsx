import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Activity, Target, TrendingUp } from 'lucide-react';
import { getUser, getAnalyses, getActivity, formatTime } from '../utils/storage.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [u, setU] = useState(() => getUser() || {});
  const [analyses, setAnalyses] = useState(() => getAnalyses());
  const [activity, setActivity] = useState(() => getActivity());

  useEffect(() => {
    const refresh = () => {
      setU(getUser() || {});
      setAnalyses(getAnalyses());
      setActivity(getActivity());
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const latest = analyses.find((a) => a.isActive) || analyses[0] || null;
  const matchPct = latest?.matchPct ?? null;

  // Skills acquired (from sga_skills "Learned")
  const learned = JSON.parse(localStorage.getItem('sga_skills') || '[]').filter(
    (s) => s.status === 'Learned'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome banner */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Welcome back, {u.name || 'there'}! 👋
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.45)',
              marginTop: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {u.course} · {u.targetRole}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {latest ? (
            <div className="pill pill-indigo" style={{ fontSize: '13px', padding: '6px 14px' }}>
              {matchPct}% Match
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
              No analysis yet
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '16px',
        }}
        className="grid-2col"
      >
        <StatCard
          label="Skill Match"
          value={matchPct !== null ? `${matchPct}%` : '--'}
          sub="Latest analysis"
          icon={<Target size={20} color={matchPct >= 60 ? '#10b981' : '#f87171'} />}
          color={matchPct >= 60 ? '#10b981' : '#f87171'}
        />
        <StatCard
          label="Skills Acquired"
          value={learned}
          sub="All time"
          icon={<TrendingUp size={20} color="#10b981" />}
          color="#10b981"
        />
      </div>

      {/* Radar + Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '16px',
        }}
        className="grid-2col"
      >
        {/* Radar */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            Skill Gap Radar
          </div>
          {latest?.radarData ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={latest.radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                />
                <Radar
                  name="Your Profile"
                  dataKey="user"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#8b5cf6"
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
                <Tooltip
                  contentStyle={{
                    background: '#0e1525',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'white' }}
                  itemStyle={{ color: 'rgba(255,255,255,0.6)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Activity
                  size={32}
                  color="rgba(255,255,255,0.1)"
                  style={{ margin: '0 auto 8px' }}
                />
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                  Run an analysis to see your radar
                </div>
                <button
                  onClick={() => navigate('/new-analysis')}
                  className="btn-primary"
                  style={{ marginTop: '12px', padding: '7px 16px', fontSize: '12px' }}
                >
                  Start Analysis
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            Recent Activity
          </div>
          {activity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activity.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 0',
                    borderBottom:
                      i < Math.min(activity.length, 8) - 1
                        ? '1px solid rgba(255,255,255,0.04)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: '#6366f1',
                      marginTop: '3px',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.6)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.text}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.25)',
                        marginTop: '2px',
                      }}
                    >
                      {formatTime(item.time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}
              >
                No activity yet. Start with a new analysis.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          flexShrink: 0,
          background: `${color}1a`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.2,
            marginTop: '2px',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
