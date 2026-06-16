import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Plus, Trash2 } from 'lucide-react';
import { getAnalyses, deleteAnalysis, setActiveAnalysis, addActivity } from '../utils/storage.js';

export default function AnalysesPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState(() => getAnalyses());

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

  const fmtDate = (ts) =>
    new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>My Analyses</div>
          <div className="pill pill-indigo">{analyses.length} saved</div>
        </div>
        <button
          onClick={() => navigate('/new-analysis')}
          className="btn-primary"
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            minHeight: '44px', // ensure 44px target
          }}
        >
          <Plus size={14} /> New Analysis
        </button>
      </div>

      {analyses.length === 0 ? (
        <EmptyState onNew={() => navigate('/new-analysis')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {analyses.map((a) => (
            <AnalysisCard
              key={a.id}
              analysis={a}
              onDelete={() => handleDelete(a.id)}
              onActivate={() => handleSetActive(a.id)}
              fmtDate={fmtDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ analysis: a, onDelete, onActivate, fmtDate }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start gap-4 p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* Left */}
      <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '260px',
            }}
          >
            {a.role}
          </div>
          {a.isActive ? (
            <span className="pill pill-green">● Active</span>
          ) : (
            <span className="pill pill-muted">Archived</span>
          )}
        </div>

        {/* Row 2 */}
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
          {fmtDate(a.createdAt)} ·{' '}
          <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{a.matchPct}% match</span>
        </div>

        {/* Missing skills pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {(a.missingSkills || []).slice(0, 8).map((s) => (
            <span key={s} className="pill pill-muted">
              {s}
            </span>
          ))}
          {(a.missingSkills || []).length > 8 && (
            <span className="pill pill-muted">+{a.missingSkills.length - 8} more</span>
          )}
        </div>
      </div>

      {/* Right */}
      <div
        className="flex flex-row items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t border-white/5 sm:border-0"
      >
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#a5b4fc', lineHeight: 1 }}>
          {a.matchPct}%
        </div>
        <div className="flex items-center gap-3">
          {!a.isActive && (
            <button
              onClick={onActivate}
              style={{
                border: '1px solid rgba(99,102,241,0.3)',
                background: 'transparent',
                color: '#a5b4fc',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 500,
                minHeight: '44px', // 44px tap target
              }}
            >
              Set Active
            </button>
          )}
          <button
            onClick={onDelete}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              minWidth: '44px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
            aria-label="Delete analysis"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BarChart2 size={36} color="#6366f1" />
      </div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>No analyses yet</div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
        Upload your resume to get started
      </div>
      <button
        onClick={onNew}
        className="btn-primary"
        style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Plus size={14} /> New Analysis
      </button>
    </div>
  );
}
