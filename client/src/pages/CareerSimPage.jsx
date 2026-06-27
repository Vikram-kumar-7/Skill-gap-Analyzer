import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAnalyses } from '../utils/storage.js';
import { SKILL_DB, ROLE_REQUIREMENTS } from '../utils/skillDb.js';

const ROLES = Object.keys(ROLE_REQUIREMENTS);

const SALARY_MAP = {
  'Full Stack Developer': 12,
  'Frontend Developer': 10,
  'Backend Developer': 11,
  'Data Scientist': 13,
  'DevOps Engineer': 14,
  'ML Engineer': 15,
  'Mobile Developer': 10,
  'UI/UX Designer': 8,
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0e1525',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '8px 12px',
      }}
    >
      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
        {payload[0]?.payload?.name}
      </div>
      <div style={{ color: '#a5b4fc', fontSize: '11px' }}>ROI: {payload[0]?.value}</div>
    </div>
  );
};

export default function CareerSimPage() {
  const [analyses, setAnalyses] = useState(() => getAnalyses());
  const [roleA, setRoleA] = useState(ROLES[0]);
  const [roleB, setRoleB] = useState(ROLES[1]);

  useEffect(() => {
    const r = () => setAnalyses(getAnalyses());
    window.addEventListener('storage', r);
    return () => window.removeEventListener('storage', r);
  }, []);

  const latest = analyses.find((a) => a.isActive) || analyses[0] || null;
  const present = latest?.presentSkills || [];
  const currentSalary = latest?.currentSalary || 4;
  const projectedSalary = latest?.projectedSalary || 8;

  // ROI chart data
  const roiData = (latest?.enrichedMissing || [])
    .slice(0, 10)
    .map((s) => ({ name: s.name, roi: s.roi }))
    .sort((a, b) => b.roi - a.roi);

  // Role comparison
  const roleStats = (role) => {
    const required = ROLE_REQUIREMENTS[role] || [];
    const have = required.filter((s) => present.includes(s));
    const need = required.filter((s) => !present.includes(s));
    const pct = required.length > 0 ? Math.round((have.length / required.length) * 100) : 0;
    const salary = SALARY_MAP[role] || 10;
    return { required, have, need, pct, salary };
  };

  const statsA = roleStats(roleA);
  const statsB = roleStats(roleB);

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>Career Simulator</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
          See how learning skills impacts your earning potential
        </div>
      </div>

      {/* Salary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div style={cardStyle}>
          <div className="label">Current Estimated Salary</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#a5b4fc', marginTop: '6px' }}>
            ₹{currentSalary} LPA
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            Based on your current skills
          </div>
        </div>
        <div style={cardStyle}>
          <div className="label">Projected After Learning</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
            ₹{projectedSalary} LPA
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            +₹{Math.max(0, projectedSalary - currentSalary)} LPA after roadmap completion
          </div>
        </div>
      </div>

      {/* ROI Bar chart */}
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
          Skills ROI Comparison
        </div>
        {roiData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roiData} margin={{ top: 4, right: 8, bottom: 40, left: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                {roiData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#6366f1' : `rgba(99,102,241,${0.9 - i * 0.07})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '13px',
            }}
          >
            Run an analysis to see ROI data
          </div>
        )}
      </div>

      {/* Role comparison */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Role Comparison</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RoleCard role={roleA} stats={statsA} roles={ROLES} onChange={setRoleA} />
        <RoleCard role={roleB} stats={statsB} roles={ROLES} onChange={setRoleB} />
      </div>
    </div>
  );
}

function RoleCard({ role, stats, roles, onChange }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      <select
        value={role}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '9px',
          padding: '10px 12px',
          color: 'white',
          fontSize: '13px',
          fontFamily: 'inherit',
          outline: 'none',
          marginBottom: '14px',
          minHeight: '44px', // ensure 44px tap target
        }}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
            Salary
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#a5b4fc' }}>
            ₹{stats.salary} LPA
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
            Match
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: stats.pct >= 60 ? '#10b981' : '#f87171',
            }}
          >
            {stats.pct}%
          </div>
        </div>
      </div>

      {/* Match bar */}
      <div className="progress-track" style={{ marginBottom: '14px' }}>
        <div
          style={{
            width: `${stats.pct}%`,
            height: '100%',
            background: stats.pct >= 60 ? '#10b981' : '#6366f1',
            borderRadius: '9999px',
            maxWidth: '100%',
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px' }}>
        <span style={{ color: '#10b981' }}>✓ {stats.have.length} have</span>
        <span style={{ color: '#f87171' }}>✗ {stats.need.length} need</span>
      </div>

      {/* Key skills */}
      <div
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Key Skills
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {stats.required.slice(0, 6).map((s) => (
          <span key={s} className={`pill ${stats.have.includes(s) ? 'pill-green' : 'pill-muted'}`}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
