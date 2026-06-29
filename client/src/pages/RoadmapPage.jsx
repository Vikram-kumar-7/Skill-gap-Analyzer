import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Plus, Lock, Clock, TrendingUp, Move } from 'lucide-react';
import { getAnalyses } from '../utils/storage.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ROLE_REQUIREMENTS } from '../utils/skillDb.js';

const EMERALD = '#4edea3';
const EMERALD_DIM = 'rgba(78,222,163,0.12)';
const EMERALD_GLOW = 'rgba(78,222,163,0.20)';

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

const glassCard = (extra = {}) => ({
  background: 'linear-gradient(135deg, rgba(5,20,36,0.90) 0%, rgba(13,28,45,0.65) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(78,222,163,0.18)',
  boxShadow:
    '0 4px 6px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.08)',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  ...extra,
});

function RimGlow() {
  return (
    <>
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit',
        background:'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)',
        pointerEvents:'none', zIndex:0 }} />
      <style>{`@keyframes rim-db{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit', padding:'1px',
        background:'linear-gradient(135deg,rgba(78,222,163,.7) 0%,rgba(78,222,163,0) 40%,rgba(78,222,163,0) 70%,rgba(78,222,163,.55) 100%)',
        WebkitMask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
        WebkitMaskComposite:'xor', maskComposite:'exclude',
        pointerEvents:'none', animation:'rim-db 4s ease-in-out infinite', zIndex:0 }} />
    </>
  );
}

const CareerSimTooltip = ({ active, payload }) => {
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

function CareerRoleCard({ role, stats, roles, onChange }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(5,20,36,0.88) 0%, rgba(13,28,45,0.65) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(78,222,163,0.14)',
        borderRadius: '18px',
        padding: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.35), 0 16px 32px rgba(0,0,0,0.50)',
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
          minHeight: '44px',
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
      <div style={{ marginBottom: '14px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
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
          <span
            key={s}
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '5px',
              background: stats.have.includes(s) ? 'rgba(16,185,129,0.09)' : 'rgba(255,255,255,0.04)',
              border: stats.have.includes(s) ? '1px solid rgba(16,185,129,0.20)' : '1px solid rgba(255,255,255,0.08)',
              color: stats.have.includes(s) ? '#10b981' : 'rgba(255,255,255,0.40)'
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function CareerSimContent({ analyses }) {
  const [roleA, setRoleA] = useState(ROLES[0]);
  const [roleB, setRoleB] = useState(ROLES[1]);

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
    background: 'linear-gradient(135deg, rgba(5,20,36,0.88) 0%, rgba(13,28,45,0.65) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(78,222,163,0.14)',
    borderRadius: '18px',
    padding: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.35), 0 16px 32px rgba(0,0,0,0.50)',
    position: 'relative',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Salary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={cardStyle}>
          <RimGlow />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Estimated Salary</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#a5b4fc', marginTop: '6px' }}>
              ₹{currentSalary} LPA
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
              Based on your current skills
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <RimGlow />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projected After Learning</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
              ₹{projectedSalary} LPA
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
              +₹{Math.max(0, projectedSalary - currentSalary)} LPA after roadmap completion
            </div>
          </div>
        </div>
      </div>

      {/* ROI Bar chart */}
      <div style={cardStyle}>
        <RimGlow />
        <div style={{ position: 'relative', zIndex: 1 }}>
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
                <Tooltip content={<CareerSimTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                  {roiData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#4edea3' : `rgba(78,222,163,${0.9 - i * 0.07})`} />
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
      </div>

      {/* Role comparison */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginTop: '8px' }}>Role Comparison</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <CareerRoleCard role={roleA} stats={statsA} roles={ROLES} onChange={setRoleA} />
        <CareerRoleCard role={roleB} stats={statsB} roles={ROLES} onChange={setRoleB} />
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'simulator' ? 'simulator' : 'roadmap');
  const [analyses, setAnalyses] = useState(() => getAnalyses());
  const [showAddModal, setShowAddModal] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');

  useEffect(() => {
    const handler = () => setAnalyses(getAnalyses());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const active = analyses.find(a => a.isActive);
  const enriched = active?.enrichedMissing || [];
  const completed = enriched.filter(s => s.completed);
  const total = enriched.length;
  const progressPct = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  const highImpact = enriched.filter(s => !s.completed && (s.roi || 0) >= 70);
  const growth = enriched.filter(s => !s.completed && (s.roi || 0) >= 40 && (s.roi || 0) < 70);
  const niceToHave = enriched.filter(s => !s.completed && (s.roi || 0) < 40);

  const markSkillComplete = (skillName) => {
    if (!active) return;
    
    const enriched = (active.enrichedMissing || []).map(s =>
      s.name === skillName ? { ...s, completed: true } : s
    );

    const missing = (active.missingSkills || []).filter(s => s !== skillName);
    const present = [...(active.presentSkills || [])];
    if (!present.includes(skillName)) {
      present.push(skillName);
    }

    const totalRequired = present.length + missing.length;
    const matchPct = totalRequired > 0 ? Math.round((present.length / totalRequired) * 100) : 0;

    const updated = {
      ...active,
      enrichedMissing: enriched,
      missingSkills: missing,
      presentSkills: present,
      matchPct,
    };

    const all = getAnalyses().map(a => (a.id === updated.id ? updated : a));
    localStorage.setItem('sga_analyses', JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddCustomSkill = () => {
    if (!customSkillName.trim() || !active) return;
    const skillName = customSkillName.trim();

    // Check for duplicates
    if (
      (active.presentSkills || []).includes(skillName) ||
      (active.missingSkills || []).includes(skillName)
    ) {
      alert("This skill already exists in your analysis!");
      return;
    }

    const newSkill = {
      name: skillName,
      category: 'Other',
      roi: 50,
      timeEstimate: '2-3 wks',
      demand: 3,
      difficulty: 3,
      completed: false,
      tasks: [],
      courses: [],
    };

    const enriched = [...(active.enrichedMissing || []), newSkill];
    const missing = [...(active.missingSkills || []), skillName];
    const present = [...(active.presentSkills || [])];

    const totalRequired = present.length + missing.length;
    const matchPct = totalRequired > 0 ? Math.round((present.length / totalRequired) * 100) : 0;

    const updated = {
      ...active,
      enrichedMissing: enriched,
      missingSkills: missing,
      matchPct,
    };

    const all = getAnalyses().map(a => (a.id === updated.id ? updated : a));
    localStorage.setItem('sga_analyses', JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
    setCustomSkillName('');
    setShowAddModal(false);
  };

  const columns = [
    {
      id: 'highImpact',
      title: 'High-Impact',
      skills: highImpact,
      accentColor: EMERALD,
      rgb: '78,222,163',
      roiLabel: 'High',
      roiIcon: TrendingUp,
    },
    {
      id: 'growth',
      title: 'Growth Skills',
      skills: growth,
      accentColor: '#8b5cf6',
      rgb: '139,92,246',
      roiLabel: 'Med',
      roiIcon: Move,
    },
  ];

  const cardStyle = {
    background: 'rgba(5,20,36,0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.15)',
    borderRadius: '16px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  };

  const SkillCard = ({ skill, col, onComplete, isLocked }) => (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', borderRadius: '16px 0 0 16px', backgroundColor: col.accentColor, opacity: 0.8 }} />
      
      <div style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: '4px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          border: `1px solid ${col.accentColor}4D`,
          backgroundColor: `${col.accentColor}1A`,
          color: col.accentColor,
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <col.roiIcon size={12} />
          <span>ROI: {col.roiLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(187,202,191,0.50)' }}>
          <Clock size={13} />
          <span>{skill.timeEstimate || '2-3 wks'}</span>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#d4e4fa', lineHeight: 1.3, marginBottom: '4px' }}>
          {skill.name}
        </h4>
        <p style={{ fontSize: '12px', color: 'rgba(187,202,191,0.45)', lineHeight: 1.5 }}>
          Learn and apply {skill.name} to strengthen your {skill.category || 'Other'} skills.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
        {!isLocked ? (
          <button
            onClick={onComplete}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(187,202,191,0.45)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = EMERALD;
              e.currentTarget.style.borderColor = EMERALD;
              e.currentTarget.style.color = '#003824';
              e.currentTarget.style.boxShadow = `0 0 10px ${EMERALD_GLOW}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.color = 'rgba(187,202,191,0.45)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Check size={16} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              color: 'rgba(187,202,191,0.45)',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              Locked: Complete higher priority skills first
            </div>
            <Lock size={14} style={{ color: 'rgba(187,202,191,0.25)' }} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', boxSizing: 'border-box' }}>
      
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {[
          { id: 'roadmap',   label: '🗺️ Roadmap'    },
          { id: 'simulator', label: '💰 Career Sim' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: activeTab === tab.id
                ? '1px solid rgba(78,222,163,0.4)'
                : '1px solid var(--border)',
              background: activeTab === tab.id
                ? 'rgba(78,222,163,0.12)'
                : 'transparent',
              color: activeTab === tab.id
                ? '#4edea3'
                : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              minHeight: '38px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'roadmap' && !active && (
        <div style={{ ...glassCard({ padding: '48px 24px', textAlign: 'center' }), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <RimGlow />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'rgba(78,222,163,0.08)', border: '1px solid rgba(78,222,163,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(78,222,163,0.12)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: EMERALD, opacity: 0.7 }}>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#d4e4fa', marginBottom: '8px' }}>No Active Analysis</h3>
            <p style={{ fontSize: '13px', color: 'rgba(187,202,191,0.50)', marginBottom: '24px', lineHeight: 1.6 }}>
              Run an analysis first to see your personalized roadmap.
            </p>
            <button onClick={() => navigate('/new-analysis')} className="btn-primary" style={{ padding: '12px 28px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start New Analysis
            </button>
          </div>
        </div>
      )}

      {activeTab === 'roadmap' && active && (
        <>
          {/* HEADER */}
          <div style={{
            ...glassCard({ padding: '28px' }),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <RimGlow />
              <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 280 }}>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#d4e4fa', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  System Architecture Path
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'rgba(187,202,191,0.50)', fontFamily: 'monospace' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: EMERALD, opacity: 0.7 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Week {total > 0 ? Math.min(12, Math.ceil((completed.length / total) * 12)) : 4}/12</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: EMERALD, opacity: 0.7 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>{completed.length}/{total} skills completed</span>
                  </span>
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '14px',
                  background: `conic-gradient(${EMERALD} ${progressPct}%, rgba(255,255,255,0.05) 0%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 20px ${EMERALD_GLOW}`,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(5,20,36,0.90) 0%, rgba(13,28,45,0.65) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: EMERALD, lineHeight: 1 }}>{progressPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CHECKLIST LIST SYSTEM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Active Skills to Learn */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#d4e4fa', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🎯 Skills to Learn</span>
                  <span style={{ fontSize: '12px', color: 'rgba(187,202,191,0.50)', fontWeight: 500 }}>
                    {enriched.filter(s => !s.completed).length} remaining
                  </span>
                </div>

                {enriched.filter(s => !s.completed).length === 0 ? (
                  <div style={{ ...glassCard({ padding: '32px', textAlign: 'center' }) }}>
                    <RimGlow />
                    <div style={{ position: 'relative', zIndex: 1, color: EMERALD, fontSize: '14px', fontWeight: 600 }}>
                      🎉 All skills learned! You are fully placement-ready.
                    </div>
                  </div>
                ) : (
                  [...enriched]
                    .filter(s => !s.completed)
                    .sort((a, b) => (b.roi || 0) - (a.roi || 0))
                    .map((skill) => {
                      const isHigh = (skill.roi || 0) >= 70;
                      const isGrowth = (skill.roi || 0) >= 40 && (skill.roi || 0) < 70;
                      const accentColor = isHigh ? EMERALD : isGrowth ? '#8b5cf6' : 'rgba(255,255,255,0.3)';
                      const roiLabel = isHigh ? 'High ROI' : isGrowth ? 'Med ROI' : 'Low ROI';

                      return (
                        <div
                          key={skill.name}
                          style={{
                            ...glassCard({ padding: '16px 20px' }),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                          }}
                        >
                          <RimGlow />
                          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '260px' }}>
                            {/* Checkbox circle */}
                            <button
                              onClick={() => markSkillComplete(skill.name)}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                minHeight: '24px',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = EMERALD;
                                e.currentTarget.style.background = 'rgba(78,222,163,0.1)';
                                e.currentTarget.style.color = EMERALD;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.color = 'transparent';
                              }}
                            >
                              <Check size={14} />
                            </button>

                            {/* Info */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#d4e4fa', margin: 0 }}>
                                  {skill.name}
                                </h4>
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                  {skill.category || 'Other'}
                                </span>
                              </div>
                              <p style={{ fontSize: '12px', color: 'rgba(187,202,191,0.50)', margin: 0, lineHeight: 1.4 }}>
                                Learn and apply {skill.name} to strengthen your placement portfolio.
                              </p>
                            </div>
                          </div>

                          {/* Right Side Stats */}
                          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(187,202,191,0.45)' }}>
                              <Clock size={13} />
                              <span>{skill.timeEstimate || '2-3 wks'}</span>
                            </div>

                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: `1px solid ${accentColor}40`,
                              backgroundColor: `${accentColor}15`,
                              color: accentColor,
                              fontSize: '11px',
                              fontWeight: 700,
                            }}>
                              <span>{roiLabel}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}

                {/* Add Custom Skill trigger */}
                <button
                  onClick={() => { setShowAddModal(true); setCustomSkillName(''); }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px dashed rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'rgba(187,202,191,0.45)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    minHeight: '44px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${EMERALD}80`; e.currentTarget.style.color = EMERALD; e.currentTarget.style.background = 'rgba(78,222,163,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(187,202,191,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <Plus size={16} />
                  <span>Add Custom Skill</span>
                </button>
              </div>

              {/* Completed Skills */}
              {completed.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(187,202,191,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✅ Completed Skills</span>
                    <span>{completed.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {completed.map((skill) => (
                      <div
                        key={skill.name}
                        style={{
                          ...glassCard({ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)' }),
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          justifyContent: 'space-between',
                        }}
                      >
                        <RimGlow />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: `1px solid ${EMERALD}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: EMERALD,
                            }}
                          >
                            <Check size={12} />
                          </div>
                          <span style={{ fontSize: '13px', color: 'rgba(187,202,191,0.6)', textDecoration: 'line-through' }}>
                            {skill.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'rgba(187,202,191,0.4)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
                          {skill.category || 'Other'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ADD CUSTOM SKILL MODAL */}
            {showAddModal && (
              <div
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(0,0,0,0.80)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'fadeIn 0.15s ease',
                }}
                onClick={() => { setShowAddModal(false); setCustomSkillName(''); }}
              >
                <div
                  style={{ ...glassCard({ padding: '28px' }), width: '100%', maxWidth: '380px', margin: '0 16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#d4e4fa', marginBottom: '20px' }}>
                    Add Custom Skill
                  </h3>
                  
                  <input
                    type="text"
                    placeholder="e.g. GraphQL, Terraform..."
                    value={customSkillName}
                    onChange={e => setCustomSkillName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCustomSkill(); }}
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: '#d4e4fa',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      marginBottom: '20px',
                      boxSizing: 'border-box',
                      minHeight: '44px',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = EMERALD; e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD_DIM}`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => { setShowAddModal(false); setCustomSkillName(''); }}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: 'rgba(187,202,191,0.50)',
                        fontSize: '13px',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        minHeight: '44px',
                        transition: 'border-color 0.15s ease, color 0.15s ease, background 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#d4e4fa'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'rgba(187,202,191,0.50)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomSkill}
                      disabled={!customSkillName.trim()}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${EMERALD} 0%, #34d399 100%)`,
                        border: 'none',
                        color: '#003824',
                        fontSize: '13px',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        cursor: customSkillName.trim() ? 'pointer' : 'not-allowed',
                        minHeight: '44px',
                        opacity: customSkillName.trim() ? 1 : 0.55,
                        transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out, opacity 0.15s ease',
                      }}
                      onMouseEnter={e => { if (customSkillName.trim()) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${EMERALD_GLOW}`; }}}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.25)'; }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      {activeTab === 'simulator' && (
        <CareerSimContent analyses={analyses} />
      )}
    </div>
  );
}