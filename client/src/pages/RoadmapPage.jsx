import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { getAnalyses } from '../utils/storage.js';

const PHASES = [
  {
    id: 1,
    label: 'Phase 1',
    title: 'High-Impact',
    weeks: 'Weeks 1–4',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.2)',
  },
  {
    id: 2,
    label: 'Phase 2',
    title: 'Growth Skills',
    weeks: 'Weeks 5–8',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
  },
  {
    id: 3,
    label: 'Phase 3',
    title: 'Nice-to-Have',
    weeks: 'Weeks 9–12',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.2)',
  },
];

const groupByPhase = (skills) => ({
  1: skills.filter((s) => (s.roi ?? 0) >= 50),
  2: skills.filter((s) => (s.roi ?? 0) >= 20 && (s.roi ?? 0) < 50),
  3: skills.filter((s) => (s.roi ?? 0) < 20),
});

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState(() => getAnalyses());
  const [completed, setCompleted] = useState(() =>
    JSON.parse(localStorage.getItem('sga_roadmap_done') || '[]')
  );

  useEffect(() => {
    const r = () => setAnalyses(getAnalyses());
    window.addEventListener('storage', r);
    return () => window.removeEventListener('storage', r);
  }, []);

  const latest = analyses.find((a) => a.isActive) || analyses[0] || null;
  const skills = latest?.enrichedMissing || [];
  const grouped = groupByPhase(skills);

  const toggleDone = (name) => {
    const next = completed.includes(name)
      ? completed.filter((n) => n !== name)
      : [...completed, name];
    setCompleted(next);
    localStorage.setItem('sga_roadmap_done', JSON.stringify(next));
  };

  // Week progress (pretend based on completed)
  const totalSkills = skills.length;
  const doneCount = completed.length;
  const weekNum =
    totalSkills > 0 ? Math.min(12, Math.ceil((doneCount / Math.max(totalSkills, 1)) * 12)) : 1;

  if (!latest) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '16px',
        }}
      >
        <Map size={48} color="rgba(99,102,241,0.3)" />
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>No active analysis</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          Run an analysis first to generate your roadmap
        </div>
        <button
          onClick={() => navigate('/new-analysis')}
          className="btn-primary"
          style={{ padding: '10px 20px' }}
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>Learning Roadmap</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
            Week {weekNum}/12
          </span>
          <div
            style={{
              width: '120px',
              height: '6px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(weekNum / 12) * 100}%`,
                height: '100%',
                background: '#6366f1',
                borderRadius: '9999px',
                maxWidth: '100%',
              }}
            />
          </div>
        </div>
      </div>

      {/* 3-column board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start w-full">
        {PHASES.map((phase) => {
          const phaseSkills = grouped[phase.id] || [];
          const phaseDone = phaseSkills.filter((s) => completed.includes(s.name)).length;
          const phasePct = phaseSkills.length > 0 ? (phaseDone / phaseSkills.length) * 100 : 0;

          return (
            <div
              key={phase.id}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}
            >
              {/* Column header */}
              <div
                style={{
                  background: phase.bg,
                  border: `1px solid ${phase.border}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: phase.color,
                  }}
                >
                  {phase.label}
                </div>
                <div
                  style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginTop: '2px' }}
                >
                  {phase.title}
                </div>
                <div
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}
                >
                  {phase.weeks} · {phaseSkills.length} skills
                </div>
                <div
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${phasePct}%`,
                      height: '100%',
                      background: phase.color,
                      borderRadius: '9999px',
                      maxWidth: '100%',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>

              {/* Skill cards */}
              {phaseSkills.length > 0 ? (
                phaseSkills.map((skill) => (
                  <SkillCard
                    key={skill.name}
                    skill={skill}
                    phase={phase}
                    completed={completed.includes(skill.name)}
                    onToggle={() => toggleDone(skill.name)}
                  />
                ))
              ) : (
                <div
                  style={{
                    border: '1px dashed rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '12px',
                  }}
                >
                  No skills in this phase
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillCard({ skill, phase, completed, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        overflow: 'hidden',
        width: '100%',
        minWidth: 0,
        opacity: completed ? 0.7 : 1,
      }}
    >
      {/* Row 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {/* Checkbox with 44px tap target */}
          <button
            onClick={onToggle}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: '44px',
              height: '44px',
              margin: '-14px 0 -14px -14px', // negative margin to maintain layout position
              background: 'none',
              border: 'none',
              flexShrink: 0,
            }}
            aria-label="Toggle completed status"
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: completed ? 'none' : '1px solid rgba(255,255,255,0.2)',
                background: completed ? '#10b981' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {completed && (
                <span style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>✓</span>
              )}
            </div>
          </button>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: completed ? 'rgba(255,255,255,0.5)' : 'white',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {skill.name}
          </div>
        </div>
        <div
          style={{
            background: 'rgba(99,102,241,0.15)',
            color: '#a5b4fc',
            fontSize: '10px',
            padding: '2px 7px',
            borderRadius: '9999px',
            flexShrink: 0,
            fontWeight: 600,
          }}
        >
          ROI {skill.roi}
        </div>
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '6px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        <span>⏱ {skill.timeEstimate || '2-4 weeks'}</span>
        <span>★ {skill.difficulty || 3}/5</span>
      </div>

      {/* Course links */}
      {skill.courses?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {skill.courses.map((c, i) => (
            <a
              key={i}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '11px', color: phase.color, textDecoration: 'none', padding: '6px 0' }} // touch targets for links
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              ↗ {c.label}
            </a>
          ))}
        </div>
      )}

      {/* Collapsible tasks */}
      {skill.tasks?.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              padding: '12px 0', // Vertical padding to hit 44px tap target height
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'inherit',
            }}
          >
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {open ? 'Hide tasks' : 'Show tasks'}
          </button>
          {open && (
            <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {skill.tasks.map((t, i) => (
                <div
                  key={i}
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', paddingLeft: '8px' }}
                >
                  · {t}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
