import { useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Code2,
  Server,
  Database,
  Cloud,
  Brain,
  Smartphone,
  Layers,
} from 'lucide-react';
import { getSkills, saveSkills, addActivity } from '../utils/storage.js';

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Database', 'AI-ML', 'Mobile', 'Other'];

const CAT_META = {
  Frontend: { icon: <Code2 size={14} />,     color: '#6C5DD3' },
  Backend:  { icon: <Server size={14} />,     color: '#8b5cf6' },
  DevOps:   { icon: <Cloud size={14} />,      color: '#06b6d4' },
  Database: { icon: <Database size={14} />,   color: '#10b981' },
  'AI-ML':  { icon: <Brain size={14} />,      color: '#f59e0b' },
  Mobile:   { icon: <Smartphone size={14} />, color: '#ec4899' },
  Other:    { icon: <Layers size={14} />,     color: '#6b7280' },
};

export default function SkillTrackerPage() {
  const [skills, setSkills] = useState(() => getSkills());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Frontend');
  const [newStat, setNewStat] = useState('Learning');

  const sync = (arr) => { saveSkills(arr); setSkills(arr); };

  const addSkill = () => {
    if (!newName.trim()) return;
    const skill = {
      id: Date.now(),
      name: newName.trim(),
      category: newCat,
      status: newStat,
      progress: newStat === 'Learned' ? 100 : 10,
      addedAt: Date.now(),
    };
    sync([...skills, skill]);
    addActivity(`Added skill: ${skill.name}`);
    setNewName(''); setNewCat('Frontend'); setNewStat('Learning'); setModal(false);
  };

  const deleteSkill = (id) => sync(skills.filter((s) => s.id !== id));

  const updateProgress = (id, val) => {
    const next = skills.map((s) =>
      s.id === id ? { ...s, progress: val, status: val >= 100 ? 'Learned' : 'Learning' } : s
    );
    sync(next);
  };

  const filtered = skills
    .filter((s) => filter === 'All' || s.status === filter)
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const inp = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '14px',
    boxSizing: 'border-box',
    transition: 'border-color var(--dur-med) ease, box-shadow var(--dur-med) ease',
  };

  const learnedCount = skills.filter((s) => s.status === 'Learned').length;
  const learningCount = skills.filter((s) => s.status === 'Learning').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', boxSizing: 'border-box' }} className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Skill Tracker
            </div>
            <span className="pill pill-indigo">{skills.length} skills</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-faint)' }}>
            <span style={{ color: 'var(--green)' }}>✓ {learnedCount} learned</span>
            <span style={{ color: '#fbbf24' }}>⟳ {learningCount} in progress</span>
          </div>
        </div>
        <button
          onClick={() => setModal(true)}
          className="btn-primary"
          style={{
            padding: '9px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            minHeight: '44px',
            borderRadius: '10px',
          }}
        >
          <Plus size={14} /> Add Skill
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
        <div className="relative flex items-center w-full sm:w-auto">
          <Search
            size={14}
            color="var(--text-faint)"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full sm:w-[200px]"
            style={{
              paddingLeft: '34px',
              paddingRight: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '10px',
              paddingTop: '10px',
              paddingBottom: '10px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              minHeight: '44px',
              transition: 'border-color var(--dur-med) ease, box-shadow var(--dur-med) ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.09)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Learning', 'Learned'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '9px 16px',
                borderRadius: '9999px',
                border: `1px solid ${filter === f ? 'rgba(108,93,211,0.30)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                background: filter === f ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? 'var(--accent-bright)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: filter === f ? 700 : 400,
                fontFamily: 'inherit',
                transition: 'background var(--dur-med) ease, color var(--dur-med) ease, border-color var(--dur-med) ease',
                minHeight: '44px',
                boxShadow: filter === f ? '0 0 10px rgba(108,93,211,0.20)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="card"
          style={{
            borderRadius: '18px',
            padding: '60px 24px',
            textAlign: 'center',
            color: 'var(--text-faint)',
            fontSize: '14px',
          }}
        >
          {skills.length === 0 ? 'No skills yet. Add your first skill!' : 'No skills match your filters.'}
        </div>
      ) : (
        <div
          className="stagger-children"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '14px' }}
        >
          {filtered.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onDelete={() => deleteSkill(skill.id)}
              onProgress={(v) => updateProgress(skill.id, v)}
            />
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}
        >
          <div className="modal-box w-full h-full max-w-full max-h-full sm:w-[400px] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl flex flex-col justify-center sm:justify-start">
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '22px', letterSpacing: '-0.01em' }}>
              Add New Skill
            </div>
            <label className="label">Skill Name</label>
            <input
              style={{ ...inp, minHeight: '44px' }}
              placeholder="e.g. React, Docker, Python..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              autoFocus
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
            />
            <label className="label">Category</label>
            <select
              style={{ ...inp, minHeight: '44px', marginBottom: '14px' }}
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="label">Status</label>
            <select
              style={{ ...inp, minHeight: '44px' }}
              value={newStat}
              onChange={(e) => setNewStat(e.target.value)}
            >
              <option value="Learning">Learning</option>
              <option value="Learned">Learned</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setModal(false)}
                className="btn-outline"
                style={{ flex: 1, padding: '13px', minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={addSkill}
                className="btn-primary"
                style={{ flex: 1, padding: '13px', minHeight: '44px' }}
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillCard({ skill, onDelete, onProgress }) {
  const meta = CAT_META[skill.category] || CAT_META['Other'];

  return (
    <div
      className="card card-interactive"
      style={{ borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '0' }}
    >
      {/* Row 1 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              flexShrink: 0,
              background: `${meta.color}18`,
              border: `1px solid ${meta.color}28`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: meta.color,
            }}
          >
            {meta.icon}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {skill.name}
          </div>
        </div>
        <span className={`pill ${skill.status === 'Learned' ? 'pill-green' : 'pill-yellow'}`}>
          {skill.status}
        </span>
      </div>

      {/* Progress */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Progress</span>
          <span style={{ fontSize: '11px', color: 'var(--accent-bright)', fontWeight: 700 }}>
            {skill.progress}%
          </span>
        </div>
        <div
          className="py-3 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.min(100, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
            onProgress(pct);
          }}
        >
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${skill.progress}%` }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-faint)',
            fontWeight: 600,
          }}
        >
          {skill.category}
        </span>
        <button
          onClick={onDelete}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '36px',
            minWidth: '36px',
            margin: '-8px -8px -8px 0',
            borderRadius: '8px',
            transition: 'color var(--dur-med) ease, background var(--dur-med) ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--red)';
            e.currentTarget.style.background = 'rgba(248,113,113,0.10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-faint)';
            e.currentTarget.style.background = 'none';
          }}
          aria-label="Delete skill"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
