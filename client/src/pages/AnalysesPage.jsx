import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle2, BarChart2, Zap, TrendingUp, Clock, Target } from 'lucide-react';
import { getAnalyses, deleteAnalysis, setActiveAnalysis, addActivity } from '../utils/storage.js';

/* ─── design tokens matching SKILL_CORE dashboard ─── */
const EMERALD = '#4edea3';
const EMERALD_DIM = 'rgba(78,222,163,0.12)';
const EMERALD_GLOW = 'rgba(78,222,163,0.20)';
const OBSIDIAN = '#051424';
const SURFACE = 'rgba(5,20,36,0.85)';

/* ─── tiny helpers ─── */
const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const matchTier = (pct) => {
  if (pct >= 85) return { label: 'ELITE', color: EMERALD, bg: EMERALD_DIM };
  if (pct >= 65) return { label: 'ADVANCED', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
  if (pct >= 40) return { label: 'DEVELOPING', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  return { label: 'ENTRY', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
};

/* ─── shared glass card style ─── */
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

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function AnalysesPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState(() => getAnalyses());
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const refresh = () => setAnalyses(getAnalyses());
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const handleDelete = (id) => {
    if (!confirm('Delete this analysis?')) return;
    deleteAnalysis(id);
    setAnalyses(getAnalyses());
  };

  const handleSetActive = (id) => {
    setActiveAnalysis(id);
    setAnalyses(getAnalyses());
    addActivity('Switched active analysis');
  };

  const active = analyses.find((a) => a.isActive);
  const archived = analyses.filter((a) => !a.isActive);

  return (
    <div
      className="fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '24px' }}
    >
      {/* ── Page header ── */}
      <PageHeader count={analyses.length} onNew={() => navigate('/new-analysis')} />

      {/* ── Summary stats bar ── */}
      {analyses.length > 0 && <StatsBar analyses={analyses} />}

      {analyses.length === 0 ? (
        <EmptyState onNew={() => navigate('/new-analysis')} />
      ) : (
        <>
          {/* ── Active analysis (hero card) ── */}
          {active && (
            <section>
              <SectionLabel icon={<Zap size={13} />} text="ACTIVE ANALYSIS" />
              <HeroCard
                analysis={active}
                onDelete={() => handleDelete(active.id)}
                hovered={hoveredId === active.id}
                onMouseEnter={() => setHoveredId(active.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </section>
          )}

          {/* ── Archived analyses grid ── */}
          {archived.length > 0 && (
            <section>
              <SectionLabel icon={<Clock size={13} />} text={`ARCHIVED  ·  ${archived.length}`} />
              <div
                className="stagger-children"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '16px',
                }}
              >
                {archived.map((a) => (
                  <ArchiveCard
                    key={a.id}
                    analysis={a}
                    onDelete={() => handleDelete(a.id)}
                    onActivate={() => handleSetActive(a.id)}
                    hovered={hoveredId === a.id}
                    onMouseEnter={() => setHoveredId(a.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE HEADER
══════════════════════════════════════════════════════ */
function PageHeader({ count, onNew }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: 800,
              color: '#d4e4fa',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            My Analyses
          </h1>
          {count > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: EMERALD,
                background: EMERALD_DIM,
                border: `1px solid rgba(78,222,163,0.25)`,
                borderRadius: '999px',
                padding: '3px 10px',
                letterSpacing: '0.05em',
              }}
            >
              {count} SAVED
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(187,202,191,0.70)', lineHeight: 1.5 }}>
          Manage and compare your skill gap analyses
        </p>
      </div>

      <button
        onClick={onNew}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '11px 22px',
          background: `linear-gradient(135deg, ${EMERALD} 0%, #10b981 100%)`,
          border: 'none',
          borderRadius: '12px',
          color: '#003824',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: `0 0 20px ${EMERALD_GLOW}, 0 4px 12px rgba(0,0,0,0.40)`,
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          flexShrink: 0,
          letterSpacing: '0.02em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = `0 0 30px rgba(78,222,163,0.35), 0 8px 20px rgba(0,0,0,0.40)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = `0 0 20px ${EMERALD_GLOW}, 0 4px 12px rgba(0,0,0,0.40)`;
        }}
      >
        <Plus size={15} />
        New Analysis
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════ */
function StatsBar({ analyses }) {
  const avg = Math.round(analyses.reduce((s, a) => s + (a.matchPct || 0), 0) / analyses.length);
  const best = Math.max(...analyses.map((a) => a.matchPct || 0));
  const active = analyses.filter((a) => a.isActive).length;

  const stats = [
    { label: 'Avg. Match', value: `${avg}%`, icon: <BarChart2 size={15} /> },
    { label: 'Best Score', value: `${best}%`, icon: <TrendingUp size={15} /> },
    { label: 'Active', value: active, icon: <Zap size={15} /> },
    { label: 'Total', value: analyses.length, icon: <Target size={15} /> },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            ...glassCard({ borderRadius: '14px', padding: '16px 18px' }),
          }}
        >
          {/* rim glow */}
          <RimGlow />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(187,202,191,0.60)', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: EMERALD, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
            <div style={{ color: EMERALD, opacity: 0.5 }}>{s.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO CARD (active analysis)
══════════════════════════════════════════════════════ */
function HeroCard({ analysis: a, onDelete, hovered, onMouseEnter, onMouseLeave }) {
  const tier = matchTier(a.matchPct);
  const missing = a.missingSkills || [];

  return (
    <div
      style={{
        ...glassCard({
          borderRadius: '22px',
          border: `1px solid rgba(78,222,163,0.30)`,
          boxShadow: `0 4px 6px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.10), 0 0 40px rgba(78,222,163,0.08)`,
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          borderLeft: `4px solid ${EMERALD}`,
        }),
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <RimGlow />

      {/* Pulse rings backdrop */}
      <div style={{ position: 'absolute', right: '-40px', top: '-40px', pointerEvents: 'none', zIndex: 0 }}>
        <PulseRings />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '28px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

          {/* Left: role info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span
                style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                  color: tier.color, background: tier.bg,
                  border: `1px solid ${tier.color}33`,
                  borderRadius: '999px', padding: '3px 10px',
                }}
              >
                {tier.label}
              </span>
              <span
                style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                  color: EMERALD, background: EMERALD_DIM,
                  border: `1px solid rgba(78,222,163,0.22)`,
                  borderRadius: '999px', padding: '3px 10px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: EMERALD, display: 'inline-block', boxShadow: `0 0 6px ${EMERALD}` }} />
                ACTIVE
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#d4e4fa', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {a.role}
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(187,202,191,0.60)', marginBottom: '18px' }}>
              Analysed {fmtDate(a.createdAt)}
            </p>

            {/* Missing skills */}
            {missing.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(187,202,191,0.50)', letterSpacing: '0.07em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  SKILL GAPS IDENTIFIED
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {missing.slice(0, 10).map((s) => (
                    <SkillPill key={s} label={s} />
                  ))}
                  {missing.length > 10 && (
                    <SkillPill label={`+${missing.length - 10} more`} muted />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: score ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <ScoreRing pct={a.matchPct} />

            <button
              onClick={onDelete}
              title="Delete analysis"
              style={{
                background: 'transparent',
                border: '1px solid rgba(248,113,113,0.15)',
                borderRadius: '10px',
                color: 'rgba(248,113,113,0.50)',
                cursor: 'pointer',
                padding: '8px 14px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease',
                minHeight: '36px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(248,113,113,0.10)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(248,113,113,0.50)';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)';
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(187,202,191,0.60)', marginBottom: '6px' }}>
            <span>Market Match Progress</span>
            <span style={{ color: EMERALD, fontWeight: 700 }}>{a.matchPct}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${a.matchPct}%`,
                background: `linear-gradient(90deg, #10b981, ${EMERALD})`,
                borderRadius: '999px',
                boxShadow: `0 0 8px ${EMERALD_GLOW}`,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ARCHIVE CARD (grid item)
══════════════════════════════════════════════════════ */
function ArchiveCard({ analysis: a, onDelete, onActivate, hovered, onMouseEnter, onMouseLeave }) {
  const tier = matchTier(a.matchPct);
  const missing = a.missingSkills || [];

  return (
    <div
      style={{
        ...glassCard({
          cursor: 'pointer',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered
            ? `0 4px 6px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.10), 0 0 30px rgba(78,222,163,0.10)`
            : `0 4px 6px rgba(0,0,0,0.40), 0 16px 32px rgba(0,0,0,0.50), inset 0 1px 1px rgba(255,255,255,0.06)`,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          borderColor: hovered ? 'rgba(78,222,163,0.25)' : 'rgba(78,222,163,0.12)',
        }),
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <RimGlow />
      <div style={{ position: 'relative', zIndex: 1, padding: '22px 24px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em',
                  color: tier.color, background: tier.bg,
                  border: `1px solid ${tier.color}33`,
                  borderRadius: '999px', padding: '2px 8px',
                }}
              >
                {tier.label}
              </span>
            </div>
            <div
              style={{
                fontSize: '15px', fontWeight: 700, color: '#d4e4fa',
                letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {a.role}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(187,202,191,0.50)', marginTop: '4px' }}>
              {fmtDate(a.createdAt)}
            </div>
          </div>

          {/* Score badge */}
          <div
            style={{
              flexShrink: 0,
              fontSize: '28px', fontWeight: 800,
              color: EMERALD, lineHeight: 1,
              letterSpacing: '-0.03em',
              textShadow: `0 0 20px ${EMERALD_GLOW}`,
            }}
          >
            {a.matchPct}<span style={{ fontSize: '14px', fontWeight: 600 }}>%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
          <div
            style={{
              height: '100%',
              width: `${a.matchPct}%`,
              background: `linear-gradient(90deg, #10b981, ${EMERALD})`,
              borderRadius: '999px',
            }}
          />
        </div>

        {/* Skill pills */}
        {missing.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
            {missing.slice(0, 5).map((s) => (
              <SkillPill key={s} label={s} />
            ))}
            {missing.length > 5 && <SkillPill label={`+${missing.length - 5}`} muted />}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={onActivate}
            style={{
              flex: 1,
              background: EMERALD_DIM,
              border: `1px solid rgba(78,222,163,0.22)`,
              borderRadius: '10px',
              color: EMERALD,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.18s ease',
              minHeight: '36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(78,222,163,0.20)';
              e.currentTarget.style.boxShadow = `0 0 12px rgba(78,222,163,0.15)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = EMERALD_DIM;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <CheckCircle2 size={13} /> Set Active
          </button>

          <button
            onClick={onDelete}
            title="Delete"
            style={{
              background: 'transparent',
              border: '1px solid rgba(248,113,113,0.12)',
              borderRadius: '10px',
              color: 'rgba(248,113,113,0.45)',
              cursor: 'pointer',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.18s ease',
              minHeight: '36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(248,113,113,0.10)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.borderColor = 'rgba(248,113,113,0.30)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(248,113,113,0.45)';
              e.currentTarget.style.borderColor = 'rgba(248,113,113,0.12)';
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════ */
function EmptyState({ onNew }) {
  return (
    <div
      style={{
        ...glassCard({ padding: '72px 32px', textAlign: 'center' }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <RimGlow />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Animated icon */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', border: `1px solid rgba(78,222,163,0.20)`, animation: 'pulse-ring-ani 3s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: `1px solid rgba(78,222,163,0.35)`, animation: 'pulse-ring-ani 3s ease-in-out infinite 0.5s' }} />
          <div
            style={{
              width: '72px', height: '72px',
              borderRadius: '20px',
              background: EMERALD_DIM,
              border: `1px solid rgba(78,222,163,0.30)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 24px rgba(78,222,163,0.15)`,
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <BarChart2 size={32} color={EMERALD} />
          </div>
        </div>

        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#d4e4fa', letterSpacing: '-0.01em', marginBottom: '8px' }}>
            No Analyses Yet
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(187,202,191,0.60)', maxWidth: '300px', lineHeight: 1.6 }}>
            Upload your resume to get personalized skill gap insights and market match scores
          </div>
        </div>

        <button
          onClick={onNew}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px',
            background: `linear-gradient(135deg, ${EMERALD} 0%, #10b981 100%)`,
            border: 'none', borderRadius: '12px',
            color: '#003824', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 0 20px ${EMERALD_GLOW}, 0 4px 12px rgba(0,0,0,0.40)`,
            transition: 'transform 0.18s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus size={15} /> Start First Analysis
        </button>
      </div>

      <style>{`
        @keyframes pulse-ring-ani {
          0%, 100% { transform: scale(1); opacity: 0.30; }
          50%       { transform: scale(1.12); opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════ */

/** Animated rim border glow on glass cards */
function RimGlow() {
  return (
    <>
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      <style>{`
        @keyframes rim-pulse-pg {
          0%, 100% { opacity: 0.30; }
          50%       { opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(78,222,163,0.70) 0%, rgba(78,222,163,0) 40%, rgba(78,222,163,0) 70%, rgba(78,222,163,0.55) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          animation: 'rim-pulse-pg 4s ease-in-out infinite',
          zIndex: 0,
        }}
      />
    </>
  );
}

/** Circular pulse rings for hero card */
function PulseRings() {
  return (
    <>
      <style>{`
        @keyframes pulse-ring-hero {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50%       { transform: scale(1.08); opacity: 0.40; }
        }
      `}</style>
      {[100, 72, 44].map((size, i) => (
        <div
          key={size}
          style={{
            width: `${size}px`, height: `${size}px`,
            borderRadius: '50%',
            border: `1px solid rgba(78,222,163,${0.25 + i * 0.15})`,
            animation: `pulse-ring-hero 4s ease-in-out infinite ${i}s`,
          }}
        />
      ))}
    </>
  );
}

/** Circular score ring (SVG) */
function ScoreRing({ pct }) {
  const R = 44;
  const circ = 2 * Math.PI * R;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ position: 'relative', width: '112px', height: '112px' }}>
      <svg width="112" height="112" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="56" cy="56" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="56" cy="56" r={R} fill="none"
          stroke={EMERALD} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${EMERALD})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '22px', fontWeight: 800, color: EMERALD, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {pct}<span style={{ fontSize: '12px' }}>%</span>
        </span>
        <span style={{ fontSize: '9px', color: 'rgba(187,202,191,0.55)', letterSpacing: '0.07em', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
          Match
        </span>
      </div>
    </div>
  );
}

/** Skill gap pill badge */
function SkillPill({ label, muted = false }) {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: '999px',
        background: muted ? 'rgba(255,255,255,0.05)' : 'rgba(78,222,163,0.08)',
        color: muted ? 'rgba(187,202,191,0.55)' : 'rgba(78,222,163,0.85)',
        border: `1px solid ${muted ? 'rgba(255,255,255,0.08)' : 'rgba(78,222,163,0.18)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/** Section label header */
function SectionLabel({ icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
      color: 'rgba(187,202,191,0.50)', textTransform: 'uppercase',
      marginBottom: '12px',
    }}>
      <span style={{ color: EMERALD }}>{icon}</span>
      {text}
    </div>
  );
}
