import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Lock, Clock, TrendingUp, Move, Scale } from 'lucide-react';
import { getAnalyses } from '../utils/storage.js';

const EMERALD = '#4edea3';
const EMERALD_DIM = 'rgba(78,222,163,0.12)';
const EMERALD_GLOW = 'rgba(78,222,163,0.20)';

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

export default function RoadmapPage() {
  const navigate = useNavigate();

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
    const updated = {
      ...active,
      enrichedMissing: active.enrichedMissing.map(s =>
        s.name === skillName ? { ...s, completed: true } : s
      ),
    };
    const all = getAnalyses().map(a => (a.id === updated.id ? updated : a));
    localStorage.setItem('sga_analyses', JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddCustomSkill = () => {
    if (!customSkillName.trim() || !active) return;
    const newSkill = {
      name: customSkillName.trim(),
      category: 'Other',
      roi: 50,
      timeEstimate: '2-3 wks',
      demand: 3,
      difficulty: 3,
      completed: false,
      tasks: [],
      courses: [],
    };
    const updated = {
      ...active,
      enrichedMissing: [...(active.enrichedMissing || []), newSkill],
    };
    const all = getAnalyses().map(a => (a.id === updated.id ? updated : a));
    localStorage.setItem('sga_analyses', JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
    setCustomSkillName('');
    setShowAddModal(false);
  };

  if (!active) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '16px', boxSizing: 'border-box' }}>
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
      </div>
    );
  }

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
      
      {/* HEADER */}
      <div style={{ ...glassCard({ padding: '28px' }), display: 'flex', flexDirection: 'column', gap: '16px', flexWrap: 'wrap', justifyContent: 'spaceBetween', alignItems: 'flexStart' }}>
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

      {/* KANBAN COLUMNS */}
      <div className="rd-kanban" style={{
        display: 'flex',
        gap: '20px',
        overflowX: 'auto',
        paddingBottom: '24px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {columns.map((col) => (
          <div key={col.id} className="rd-col" style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween', paddingBottom: '12px', borderBottom: `2px solid ${col.accentColor}50` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: col.accentColor,
                  boxShadow: `0 0 8px rgba(${col.rgb}, 0.6)`,
                }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#d4e4fa', letterSpacing: '-0.01em' }}>
                  {col.title}
                </h3>
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'rgba(187,202,191,0.50)',
              }}>
                {col.skills.length}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {col.skills.map((skill) => (
                <SkillCard
                  key={skill.name}
                  skill={skill}
                  col={col}
                  onComplete={() => markSkillComplete(skill.name)}
                  isLocked={col.id === 'niceToHave'}
                />
              ))}

              {col.id === 'highImpact' && (
                <button
                  onClick={() => { setShowAddModal(true); setCustomSkillName(''); }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px dashed rgba(255,255,255,0.10)',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'rgba(187,202,191,0.45)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${EMERALD}80`; e.currentTarget.style.color = EMERALD; e.currentTarget.style.background = EMERALD_DIM; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'rgba(187,202,191,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <Plus size={16} />
                  <span>Add Custom Skill</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Nice-to-Have (Locked) Column */}
        {niceToHave.length > 0 && (
          <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween', paddingBottom: '12px', borderBottom: '2px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  boxShadow: '0 0 8px rgba(255,255,255,0.1)',
                }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(187,202,191,0.50)', letterSpacing: '-0.01em' }}>
                  Nice-to-Have
                </h3>
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'rgba(187,202,191,0.30)',
              }}>
                {niceToHave.length}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {niceToHave.map((skill) => (
                <SkillCard
                  key={skill.name}
                  skill={skill}
                  col={{ accentColor: 'rgba(255,255,255,0.2)', rgb: '255,255,255' }}
                  onComplete={() => {}}
                  isLocked={true}
                />
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
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
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
      <style>{`
        @media (max-width:768px){
          .rd-kanban{gap:16px!important;padding-bottom:16px!important}
          .rd-col{flex:0 0 300px!important}
          .rd-card{padding:12px!important}
          .rd-title{font-size:18px!important}
        }
        @media (max-width:640px){
          .rd-kanban{gap:12px!important;padding-bottom:12px!important;overflow-x:auto!important;flex-direction:row!important}
          .rd-col{flex:0 0 280px!important;min-width:280px!important}
          .rd-card{padding:10px!important;border-radius:10px!important;font-size:12px!important}
          .rd-title{font-size:16px!important;line-height:1.2!important}
          .rd-btn{width:100%!important;padding:8px 12px!important;font-size:11px!important}
          .rd-modal{width:calc(100% - 32px)!important;max-width:100%!important;margin:0 16px!important}
        }
        @media (max-width:480px){
          .rd-col{flex:0 0 260px!important;min-width:260px!important}
          .rd-card{padding:8px!important;gap:6px!important;font-size:11px!important}
          .rd-title{font-size:14px!important}
        }
      `}</style>
    </div>
  );
}