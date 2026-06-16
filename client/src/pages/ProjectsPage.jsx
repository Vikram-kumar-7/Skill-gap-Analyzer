import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, FolderOpen, ExternalLink } from 'lucide-react';
import { getProjects, saveProjects, addActivity, getSkills } from '../utils/storage.js';
import ProjectRecommendations from '../components/ProjectRecommendations';

const STATUS_STYLE = {
  'In Progress': 'pill-yellow',
  Done: 'pill-green',
  Paused: 'pill-muted',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  techStack: [],
  skills: [],
  status: 'In Progress',
  github: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(() => getProjects());
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [techInput, setTechInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const sync = (arr) => {
    saveProjects(arr);
    setProjects(arr);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setModal(true);
  };
  const openEdit = (p) => {
    setForm({ ...p });
    setEditing(p.id);
    setModal(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      sync(projects.map((p) => (p.id === editing ? { ...form, id: editing } : p)));
      addActivity(`Updated project: ${form.name}`);
    } else {
      sync([{ ...form, id: Date.now(), createdAt: Date.now() }, ...projects]);
      addActivity(`Added project: ${form.name}`);
    }
    setModal(false);
  };

  const remove = (id) => {
    if (!confirm('Delete this project?')) return;
    sync(projects.filter((p) => p.id !== id));
  };

  const addTag = (field, value, setter) => {
    if (!value.trim()) return;
    setForm((f) => ({ ...f, [field]: [...(f[field] || []), value.trim()] }));
    setter('');
  };

  const removeTag = (field, idx) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

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
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>Projects</div>
          <div className="pill pill-indigo">{projects.length}</div>
        </div>
        <button
          onClick={openAdd}
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
          <Plus size={14} /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
            <FolderOpen size={36} color="#6366f1" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>No projects yet</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            Showcase your work by adding projects
          </div>
          <button
            onClick={openAdd}
            className="btn-primary"
            style={{
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
            }}
          >
            <Plus size={14} /> Add Project
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', // better on 375px mobile
            gap: '16px',
          }}
        >
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={() => openEdit(p)}
              onDelete={() => remove(p.id)}
            />
          ))}
        </div>
      )}

      {/* ── AI Project Recommendations ── */}
      <div style={{ marginTop: '8px' }}>
        <ProjectRecommendations
          userSkills={getSkills().map((s) => s.name.toLowerCase())}
          onAddToProjects={(project) => {
            const next = [{ ...project, id: Date.now(), createdAt: Date.now() }, ...projects];
            sync(next);
            addActivity(`Added recommended project: ${project.name}`);
          }}
        />
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <div className="modal-box w-full h-full max-w-full max-h-full sm:w-[480px] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl flex flex-col justify-center sm:justify-start">
            <div
              style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '20px' }}
            >
              {editing ? 'Edit Project' : 'Add Project'}
            </div>

            <label className="label">Project Name *</label>
            <input
              style={{ ...inp, minHeight: '44px', padding: '10px 14px' }}
              placeholder="e.g. Portfolio Website"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />

            <label className="label">Description</label>
            <textarea
              style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
              placeholder="What does this project do?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />

            <label className="label">Tech Stack (press Enter to add)</label>
            <input
              style={{ ...inp, marginBottom: '6px', minHeight: '44px', padding: '10px 14px' }}
              placeholder="e.g. React, Node.js, MongoDB"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('techStack', techInput, setTechInput);
                }
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {(form.techStack || []).map((t, i) => (
                <span
                  key={i}
                  className="pill pill-muted"
                  style={{ cursor: 'pointer', padding: '8px 12px', minHeight: '32px' }}
                  onClick={() => removeTag('techStack', i)}
                >
                  {t} ×
                </span>
              ))}
            </div>

            <label className="label">Skills Used (press Enter to add)</label>
            <input
              style={{ ...inp, marginBottom: '6px', minHeight: '44px', padding: '10px 14px' }}
              placeholder="e.g. React, REST API"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('skills', skillInput, setSkillInput);
                }
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {(form.skills || []).map((s, i) => (
                <span
                  key={i}
                  className="pill pill-indigo"
                  style={{ cursor: 'pointer', padding: '8px 12px', minHeight: '32px' }}
                  onClick={() => removeTag('skills', i)}
                >
                  {s} ×
                </span>
              ))}
            </div>

            <label className="label">Status</label>
            <select
              style={{ ...inp, minHeight: '44px' }}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Paused">Paused</option>
            </select>

            <label className="label">GitHub URL</label>
            <input
              style={{ ...inp, minHeight: '44px', padding: '10px 14px' }}
              placeholder="https://github.com/..."
              value={form.github || ''}
              onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={() => setModal(false)}
                className="btn-outline"
                style={{ flex: 1, padding: '12px', minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', minHeight: '44px' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project: p, onEdit, onDelete }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Row 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'white',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {p.name}
        </div>
        <span className={`pill ${STATUS_STYLE[p.status] || 'pill-muted'}`}>{p.status}</span>
      </div>

      {/* Description */}
      {p.description && (
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {p.description}
        </div>
      )}

      {/* Tech stack */}
      {(p.techStack || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {p.techStack.map((t, i) => (
            <span key={i} className="pill pill-muted">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Skills */}
      {(p.skills || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {p.skills.map((s, i) => (
            <span key={i} className="pill pill-indigo">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '4px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {p.github ? (
          <a
            href={p.github}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              transition: 'color 0.15s',
              minHeight: '44px', // 44px tap target height
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <ExternalLink size={12} /> GitHub
          </a>
        ) : (
          <div />
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onEdit}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              margin: '-12px 0 -12px -12px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            aria-label="Edit project"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              margin: '-12px -12px -12px 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            aria-label="Delete project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
