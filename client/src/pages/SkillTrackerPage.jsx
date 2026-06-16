import { useState, useEffect } from 'react';
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

const CAT_ICONS = {
  Frontend: <Code2 size={13} color="#6366f1" />,
  Backend: <Server size={13} color="#8b5cf6" />,
  DevOps: <Cloud size={13} color="#06b6d4" />,
  Database: <Database size={13} color="#10b981" />,
  'AI-ML': <Brain size={13} color="#f59e0b" />,
  Mobile: <Smartphone size={13} color="#ec4899" />,
  Other: <Layers size={13} color="#6b7280" />,
};

export default function SkillTrackerPage() {
  const [skills, setSkills] = useState(() => getSkills());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Frontend');
  const [newStat, setNewStat] = useState('Learning');

  const sync = (arr) => {
    saveSkills(arr);
    setSkills(arr);
  };

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
    setNewName('');
    setNewCat('Frontend');
    setNewStat('Learning');
    setModal(false);
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
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '9px',
    padding: '9px 13px',
    color: 'white',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '14px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>Skill Tracker</div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
            {skills.length} skills
          </span>
        </div>
        <button
          onClick={() => setModal(true)}
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
          <Plus size={14} /> Add Skill
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
        <div className="relative flex items-center w-full sm:w-auto">
          <Search
            size={14}
            color="rgba(255,255,255,0.3)"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full sm:w-[200px]"
            style={{
              paddingLeft: '32px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9px',
              paddingTop: '10px',
              paddingBottom: '10px',
              color: 'white',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              minHeight: '44px', // ensure 44px target
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Learning', 'Learned'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 16px', // larger tap target on mobile
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                background: filter === f ? '#6366f1' : 'rgba(255,255,255,0.06)',
                color: filter === f ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontWeight: filter === f ? 600 : 400,
                fontFamily: 'inherit',
                transition: 'background 0.15s, color 0.15s',
                minHeight: '44px',
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
          style={{
            padding: '60px 0',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '14px',
          }}
        >
          {skills.length === 0
            ? 'No skills yet. Add your first skill!'
            : 'No skills match your filters.'}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))',
            gap: '14px',
          }}
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

      {/* Modal */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <div className="modal-box w-full h-full max-w-full max-h-full sm:w-[380px] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl flex flex-col justify-center sm:justify-start">
            <div
              style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '20px' }}
            >
              Add New Skill
            </div>
            <label className="label">Skill Name</label>
            <input
              style={{ ...inp, minHeight: '44px', padding: '10px 14px' }}
              placeholder="e.g. React, Docker, Python..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              autoFocus
            />
            <label className="label">Category</label>
            <select
              style={{ ...inp, marginBottom: '14px', minHeight: '44px' }}
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={() => setModal(false)}
                className="btn-outline"
                style={{ flex: 1, padding: '12px', minHeight: '44px' }} // 44px tap target
              >
                Cancel
              </button>
              <button
                onClick={addSkill}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', minHeight: '44px' }} // 44px tap target
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
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '18px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
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
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              flexShrink: 0,
              background: 'rgba(99,102,241,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {CAT_ICONS[skill.category] || CAT_ICONS['Other']}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'white',
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
      <div style={{ marginTop: '4px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2px',
          }}
        >
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Progress</span>
          <span style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>
            {skill.progress}%
          </span>
        </div>
        <div
          className="py-3 cursor-pointer" // larger interactive touch area
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.min(
              100,
              Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100))
            );
            onProgress(pct);
          }}
        >
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${skill.progress}%` }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.2)',
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
            color: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '44px',
            minWidth: '44px',
            margin: '-12px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
          aria-label="Delete skill"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
